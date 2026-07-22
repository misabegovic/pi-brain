/**
 * pi-brain extension
 *
 * Gives pi a knowledge home by connecting it to a nearby brain instance.
 *
 * Capabilities:
 * - Auto-discovers the brain home (PI_BRAIN_HOME, .pi/brain-home, sibling brain/)
 * - Registers tools: brain_status, brain_capture, brain_ask, brain_tend
 * - Registers commands: /brain, /brain:capture, /brain:ask, /brain:tend, /brain:sync
 * - Shows a session-start status widget with the brain briefing
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { execFile } from "node:child_process";
import { access, constants, readFile } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";

interface BrainHome {
  path: string;
  exe: string;
  argsPrefix: string[];
}

function execFilePromise(
  file: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = execFile(file, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      maxBuffer: 8 * 1024 * 1024,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => {
      stdout += String(d);
    });
    child.stderr?.on("data", (d) => {
      stderr += String(d);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ stdout, stderr, code: code ?? 0 });
    });
  });
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function canExecute(p: string): Promise<boolean> {
  try {
    await access(p, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function findBrainHome(cwd: string): Promise<BrainHome | null> {
  const envHome = process.env.PI_BRAIN_HOME;
  if (envHome) {
    const resolved = resolve(envHome);
    const home = await resolveBrainExe(resolved);
    if (home) return home;
  }

  const projectHint = resolve(cwd, ".pi/brain-home");
  if (await pathExists(projectHint)) {
    const hinted = (await readFile(projectHint, "utf-8")).trim();
    if (hinted) {
      const resolved = resolve(hinted);
      const home = await resolveBrainExe(resolved);
      if (home) return home;
    }
  }

  const siblingBrain = resolve(dirname(cwd), "brain");
  if (await pathExists(siblingBrain)) {
    const home = await resolveBrainExe(siblingBrain);
    if (home) return home;
  }

  return null;
}

async function resolveBrainExe(home: string): Promise<BrainHome | null> {
  const script = join(home, "tools", "brain.py");
  const bin = join(home, "tools", "brain");

  if (await pathExists(script)) {
    if (await canExecute(bin)) {
      return { path: home, exe: bin, argsPrefix: [] };
    }
    return { path: home, exe: "python3", argsPrefix: [script] };
  }
  return null;
}

function runBrain(
  home: BrainHome,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<{ stdout: string; stderr: string; code: number }> {
  return execFilePromise(home.exe, [...home.argsPrefix, ...args], {
    cwd: options.cwd ?? home.path,
    env: options.env,
  });
}

function formatOutput(result: { stdout: string; stderr: string; code: number }): string {
  const parts: string[] = [];
  if (result.stdout.trim()) parts.push(result.stdout.trim());
  if (result.stderr.trim()) parts.push(`[stderr]\n${result.stderr.trim()}`);
  if (result.code !== 0) parts.push(`[exit code ${result.code}]`);
  return parts.join("\n\n");
}

export default function piBrainExtension(pi: ExtensionAPI) {
  let brainHome: BrainHome | null = null;

  async function requireBrain(cwd?: string, ctx?: ExtensionContext): Promise<BrainHome | null> {
    if (brainHome) return brainHome;
    const root = cwd ?? process.cwd();
    brainHome = await findBrainHome(root);
    if (!brainHome && ctx) {
      ctx.ui.notify("pi-brain: no brain home found", "warning");
    }
    return brainHome;
  }

  function setupHint(): string {
    return [
      "pi-brain could not find a brain home.",
      "",
      "To move pi in, set one of:",
      "  • PI_BRAIN_HOME=/path/to/brain",
      "  • echo /path/to/brain > .pi/brain-home",
      "  • place a brain/ directory next to this project",
      "",
      "Then run `brain setup` inside the brain home.",
    ].join("\n");
  }

  async function loadBriefing(ctx: ExtensionContext) {
    const home = await requireBrain(ctx.cwd, ctx);
    if (!home) {
      ctx.ui.setWidget("pi-brain", [setupHint()]);
      return;
    }

    const status = await runBrain(home, ["status"]);
    const inbox = await runBrain(home, ["inbox", "summary"]);

    const lines = [
      `🧠 brain home: ${home.path}`,
      "",
      status.stdout.trim() || "status unavailable",
      "",
      inbox.stdout.trim() || "inbox empty",
    ];

    ctx.ui.setWidget("pi-brain", lines);
  }

  // Register tools
  pi.registerTool({
    name: "brain_status",
    label: "Brain status",
    description: "Read the brain's status dashboard and inbox summary.",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };
      const status = await runBrain(home, ["status"]);
      const inbox = await runBrain(home, ["inbox", "summary"]);
      return {
        content: [
          {
            type: "text",
            text: `Status:\n${formatOutput(status)}\n\nInbox:\n${formatOutput(inbox)}`,
          },
        ],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_capture",
    label: "Brain capture",
    description: "Capture a note, decision, or observation into the brain inbox.",
    parameters: Type.Object({
      note: Type.String({ description: "The note to capture." }),
      scope: Type.Optional(Type.String({ description: "Optional repo/org/brain scope." })),
      kind: Type.Optional(
        Type.String({
          description: "Optional kind: decision, insight, discussion, task, source.",
        })
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const id = params.note
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 64)
        .replace(/(^-|-$)/g, "");
      const kind = params.kind ?? "custom";
      const args = [
        "inbox",
        "add",
        "--id",
        id || "capture",
        "--kind",
        kind,
        "--summary",
        params.note,
      ];
      if (params.scope) args.push("--route", `/capture ${params.scope}`);

      const result = await runBrain(home, args);
      return {
        content: [{ type: "text", text: formatOutput(result) }],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_ask",
    label: "Brain ask",
    description: "Ask the brain a question over the wiki corpus.",
    parameters: Type.Object({
      question: Type.String({ description: "The question to ask." }),
      scope: Type.Optional(Type.String({ description: "Limit to a repo/org/brain scope." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const args = ["search", params.question];
      if (params.scope) args.push("--repo", params.scope);

      const result = await runBrain(home, args);
      return {
        content: [{ type: "text", text: formatOutput(result) }],
        details: {},
      };
    },
  });

  pi.registerTool({
    name: "brain_tend",
    label: "Brain tend",
    description: "Digest the brain's tend queue. Use when the user asks to tend the brain.",
    parameters: Type.Object({
      budget: Type.Optional(Type.String({ description: "Optional budget: count, time-box, kind, or id." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return { content: [{ type: "text", text: setupHint() }], details: {} };

      const result = await runBrain(home, ["inbox", "list"]);
      return {
        content: [
          {
            type: "text",
            text: `Pending inbox items:\n${formatOutput(result)}\n\nTell the user what is queued and ask which items to tend.`,
          },
        ],
        details: {},
      };
    },
  });

  // Register commands
  pi.registerCommand("brain", {
    description: "Show the brain briefing",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) {
        ctx.ui.notify("No brain home found", "warning");
        return;
      }
      const status = await runBrain(home, ["status"]);
      ctx.ui.notify(formatOutput(status), "info");
    },
  });

  pi.registerCommand("brain:capture", {
    description: "Capture a note into the brain inbox",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) {
        ctx.ui.notify("No brain home found", "warning");
        return;
      }
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:capture <note>", "warning");
        return;
      }
      const result = await runBrain(home, ["inbox", "add", "--", args]);
      ctx.ui.notify(formatOutput(result), result.code === 0 ? "success" : "error");
    },
  });

  pi.registerCommand("brain:ask", {
    description: "Ask the brain a question",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) {
        ctx.ui.notify("No brain home found", "warning");
        return;
      }
      if (!args.trim()) {
        ctx.ui.notify("Usage: /brain:ask <question>", "warning");
        return;
      }
      const result = await runBrain(home, ["search", args]);
      ctx.ui.notify(formatOutput(result), "info");
    },
  });

  pi.registerCommand("brain:tend", {
    description: "Digest the brain tend queue",
    handler: async (args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) {
        ctx.ui.notify("No brain home found", "warning");
        return;
      }
      const result = await runBrain(home, ["inbox", "list"]);
      ctx.ui.notify(formatOutput(result), "info");
    },
  });

  pi.registerCommand("brain:sync", {
    description: "Run a brain health sweep",
    handler: async (_args, ctx) => {
      const home = await requireBrain(ctx.cwd, ctx);
      if (!home) {
        ctx.ui.notify("No brain home found", "warning");
        return;
      }
      const result = await runBrain(home, ["validate"]);
      ctx.ui.notify(formatOutput(result), result.code === 0 ? "success" : "error");
    },
  });

  // Session start widget
  pi.on("session_start", async (_event, ctx) => {
    await loadBriefing(ctx);
  });

  // Refresh widget when navigating the session tree
  pi.on("session_tree", async (_event, ctx) => {
    await loadBriefing(ctx);
  });
}
