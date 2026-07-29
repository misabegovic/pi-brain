import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getPackageRoot } from "./resources.ts";
import { parseFrontmatter, extractSimpleYamlValue, isValidIdentifier } from "./utils.ts";

const MAX_PARALLEL = 4;
const MAX_OUTPUT = 50 * 1024;

export interface AgentConfig {
  name: string;
  description: string;
  tools?: string[];
  model?: string;
  systemPrompt: string;
}

interface AgentResult {
  agent: string;
  task: string;
  output: string;
  exitCode: number;
  error?: string;
}

function getPiInvocation(args: string[]): { command: string; args: string[] } {
  const currentScript = process.argv[1];
  const isBunVirtualScript = currentScript?.startsWith("/$bunfs/root/");
  if (currentScript && !isBunVirtualScript && fs.existsSync(currentScript)) {
    return { command: process.execPath, args: [currentScript, ...args] };
  }
  const execName = path.basename(process.execPath).toLowerCase();
  const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);
  if (!isGenericRuntime) {
    return { command: process.execPath, args };
  }
  return { command: "pi", args };
}

async function writeTempPrompt(agentName: string, prompt: string): Promise<string> {
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pi-brain-agent-"));
  const safeName = agentName.replace(/[^\w.-]+/g, "_");
  const filePath = path.join(tmpDir, `prompt-${safeName}.md`);
  await fs.promises.writeFile(filePath, prompt, { encoding: "utf-8", mode: 0o600 });
  return filePath;
}

async function runAgent(
  agent: AgentConfig,
  task: string,
  cwd: string,
  signal?: AbortSignal,
): Promise<AgentResult> {
  const args: string[] = ["--mode", "json", "-p", "--no-session"];
  if (agent.model) args.push("--model", agent.model);
  if (agent.tools && agent.tools.length > 0) args.push("--tools", agent.tools.join(","));

  let tmpPromptPath: string | null = null;
  const result: AgentResult = {
    agent: agent.name,
    task,
    output: "",
    exitCode: 0,
  };

  try {
    tmpPromptPath = await writeTempPrompt(agent.name, agent.systemPrompt);
    args.push("--append-system-prompt", tmpPromptPath);
    args.push(`Task: ${task}`);

    const invocation = getPiInvocation(args);
    const exitCode = await new Promise<number>((resolve) => {
      const proc = spawn(invocation.command, invocation.args, {
        cwd,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
      let buffer = "";
      let stderr = "";

      const processLine = (line: string) => {
        if (!line.trim()) return;
        let event: any;
        try {
          event = JSON.parse(line);
        } catch {
          return;
        }
        if (event.type === "message_end" && event.message?.role === "assistant") {
          for (const part of event.message.content ?? []) {
            if (part.type === "text") result.output += part.text;
          }
        }
      };

      proc.stdout.on("data", (data) => {
        buffer += data.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) processLine(line);
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        if (buffer.trim()) processLine(buffer);
        if (!result.output && stderr) result.error = stderr;
        resolve(code ?? 0);
      });

      proc.on("error", (err) => {
        result.error = err.message;
        resolve(1);
      });

      if (signal) {
        const kill = () => {
          proc.kill("SIGTERM");
          setTimeout(() => proc.kill("SIGKILL"), 5000);
        };
        if (signal.aborted) kill();
        else signal.addEventListener("abort", kill, { once: true });
      }
    });

    result.exitCode = exitCode;
  } finally {
    if (tmpPromptPath) {
      try {
        await fs.promises.unlink(tmpPromptPath);
        await fs.promises.rmdir(path.dirname(tmpPromptPath));
      } catch {
        /* ignore */
      }
    }
  }

  if (Buffer.byteLength(result.output, "utf8") > MAX_OUTPUT) {
    let truncated = result.output.slice(0, MAX_OUTPUT);
    while (Buffer.byteLength(truncated, "utf8") > MAX_OUTPUT) truncated = truncated.slice(0, -1);
    result.output = `${truncated}\n\n[Output truncated]`;
  }

  return result;
}

async function mapWithConcurrency<TIn, TOut>(
  items: TIn[],
  concurrency: number,
  fn: (item: TIn, index: number) => Promise<TOut>,
): Promise<TOut[]> {
  if (items.length === 0) return [];
  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results: TOut[] = new Array(items.length);
  let nextIndex = 0;
  const workers = new Array(limit).fill(null).map(async () => {
    while (true) {
      const current = nextIndex++;
      if (current >= items.length) return;
      results[current] = await fn(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

export { runAgent };

export async function loadBrainAgent(name: string): Promise<AgentConfig | null> {
  const pkgRoot = getPackageRoot();
  const filePath = path.join(pkgRoot, "personas", "agents", `${name}.md`);
  if (!fs.existsSync(filePath)) return null;
  const content = await fs.promises.readFile(filePath, "utf-8");
  const { frontmatter, body, valid } = parseFrontmatter(content);
  if (!valid) return null;
  const agentName = extractSimpleYamlValue(frontmatter, "name");
  const description = extractSimpleYamlValue(frontmatter, "description");
  if (!agentName || !description) return null;
  const toolsRaw = extractSimpleYamlValue(frontmatter, "tools");
  const tools = toolsRaw
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    name: agentName,
    description,
    tools: tools && tools.length > 0 ? tools : undefined,
    model: extractSimpleYamlValue(frontmatter, "model"),
    systemPrompt: body,
  };
}

export async function runParallel(
  agents: AgentConfig[],
  task: string,
  cwd: string,
  signal?: AbortSignal,
): Promise<AgentResult[]> {
  return mapWithConcurrency(agents, MAX_PARALLEL, (agent) => runAgent(agent, task, cwd, signal));
}

export async function runChain(
  agents: AgentConfig[],
  task: string,
  cwd: string,
  signal?: AbortSignal,
): Promise<AgentResult[]> {
  const results: AgentResult[] = [];
  let previousOutput = "";
  for (const agent of agents) {
    const taskWithContext = task.replace(/\{previous\}/g, previousOutput);
    const result = await runAgent(agent, taskWithContext, cwd, signal);
    results.push(result);
    if (result.exitCode !== 0) break;
    previousOutput = result.output;
  }
  return results;
}

export function formatResults(results: AgentResult[]): string {
  const lines: string[] = [];
  for (const r of results) {
    const status = r.exitCode === 0 ? "completed" : `failed (exit ${r.exitCode})`;
    lines.push(`## ${r.agent} — ${status}`, "");
    if (r.error) lines.push(`**Error:** ${r.error}`, "");
    lines.push(r.output || "(no output)", "");
  }
  return lines.join("\n");
}

const DEFAULT_AGENTS = ["brain-pm", "brain-tech-lead", "brain-developer", "brain-security-reviewer"];

export function registerCollaboration(pi: ExtensionAPI) {
  pi.registerCommand("brain:collaborate", {
    description: "Run pi-brain agents on an intent artifact (usage: /brain:collaborate <scope> <task>)",
    handler: async (args, ctx) => {
      const trimmed = args.trim();
      if (!trimmed) {
        ctx.ui.notify("Usage: /brain:collaborate <scope> <task>", "warning");
        return;
      }

      const parts = trimmed.split(/\s+/);
      const scope = parts[0];
      const task = parts.slice(1).join(" ");
      if (!task) {
        ctx.ui.notify("Usage: /brain:collaborate <scope> <task>", "warning");
        return;
      }
      if (!isValidIdentifier(scope)) {
        ctx.ui.notify("Scope must be a simple identifier (letters, numbers, -, _).", "warning");
        return;
      }

      const agents: AgentConfig[] = [];
      for (const name of DEFAULT_AGENTS) {
        const agent = await loadBrainAgent(name);
        if (agent) agents.push(agent);
      }

      if (agents.length === 0) {
        ctx.ui.notify("No pi-brain agents found.", "error");
        return;
      }

      ctx.ui.notify(`Running ${agents.length} agents on "${task}"...`, "info");
      const results = await runParallel(agents, `[${scope}] ${task}`, ctx.cwd);
      const text = formatResults(results);

      ctx.ui.notify(text.slice(0, 1500), "info");
    },
  });
}
