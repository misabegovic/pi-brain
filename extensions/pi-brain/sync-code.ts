import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { requireBrain } from "./context.ts";
import { collectBlocks } from "./intent-blocks.ts";
import { parseTypeScriptInterfaces, diffInterfaces, type DriftItem, type TsInterface } from "./diff.ts";
import { randomUUID } from "node:crypto";

interface DataModelField {
  name: string;
  type: string;
  optional?: boolean;
}

interface DataModel {
  name: string;
  fields?: DataModelField[];
}

function normalizeType(type: string): string {
  const map: Record<string, string> = {
    string: "string",
    integer: "number",
    number: "number",
    boolean: "boolean",
    date: "Date",
    json: "unknown",
  };
  return map[type] ?? type;
}

function getGeneratedPath(home: { path: string }, scope: string, target: string): string {
  return join(home.path, "wiki", scope, "ai-suggestions", "build", target, "generated.ts");
}

function getProposalsDir(home: { path: string }, scope: string, target: string): string {
  return join(home.path, "wiki", scope, "ai-suggestions", "sync-code", target);
}

function generateProposalMarkdown(item: DriftItem): string {
  const lines: string[] = [`# Sync proposal — ${item.interfaceName}`, ""];
  lines.push(`## Drift`, "", item.message, "");
  lines.push(`## Options`, "");

  if (item.kind === "missing_in_code") {
    if (item.fieldName) {
      lines.push(`### Option A — Update intent`);
      lines.push(`Remove field \`${item.fieldName}\` from the intent block if it is no longer needed.`);
      lines.push("");
      lines.push(`### Option B — Regenerate code`);
      lines.push(`Regenerate code from intent so that \`${item.fieldName}\` is included.`);
    } else {
      lines.push(`### Option A — Update intent`);
      lines.push(`Remove the \`${item.interfaceName}\` intent block if it is no longer needed.`);
      lines.push("");
      lines.push(`### Option B — Regenerate code`);
      lines.push(`Regenerate code from intent so that \`${item.interfaceName}\` is included.`);
    }
  } else if (item.kind === "extra_in_code") {
    if (item.fieldName) {
      lines.push(`### Option A — Update intent`);
      lines.push(`Add field \`${item.fieldName}\` to the intent block.`);
      lines.push("");
      lines.push(`### Option B — Update code`);
      lines.push(`Remove field \`${item.fieldName}\` from the generated interface.`);
    } else {
      lines.push(`### Option A — Update intent`);
      lines.push(`Add an intent block for \`${item.interfaceName}\`.`);
      lines.push("");
      lines.push(`### Option B — Update code`);
      lines.push(`Remove the \`${item.interfaceName}\` interface from the generated file.`);
    }
  } else if (item.kind === "type_mismatch") {
    lines.push(`### Option A — Update intent`);
    lines.push(`Change the intent block field type from \`${item.intentType}\` to \`${item.codeType}\`.`);
    lines.push("");
    lines.push(`### Option B — Update code`);
    lines.push(`Change the generated code field type from \`${item.codeType}\` to \`${item.intentType}\`.`);
  } else if (item.kind === "optional_mismatch") {
    lines.push(`### Option A — Update intent`);
    lines.push(`Align field optionality in the intent block with the code.`);
    lines.push("");
    lines.push(`### Option B — Update code`);
    lines.push(`Align field optionality in the generated code with the intent.`);
  }

  lines.push("", "## Recommended", "", "Option B (regenerate/update code) when intent is authoritative. Option A when code has evolved.", "");
  return lines.join("\n");
}

export async function generateSyncProposals(
  home: { path: string },
  scope: string,
  target: string,
): Promise<{ items: DriftItem[]; proposalPaths: string[] }> {
  const blocks = await collectBlocks(home, scope, ["data_model"]);
  const intentInterfaces = blocks.map((block) => {
    const data = block.data as DataModel;
    return {
      name: data.name,
      fields: (data.fields ?? []).map((f) => ({
        name: f.name,
        type: normalizeType(f.type),
        optional: f.optional ?? false,
      })),
    } as TsInterface;
  });

  const generatedPath = getGeneratedPath(home, scope, target);
  let codeInterfaces: TsInterface[] = [];
  if (existsSync(generatedPath)) {
    const codeText = await readFile(generatedPath, "utf-8");
    codeInterfaces = parseTypeScriptInterfaces(codeText);
  }

  const items = diffInterfaces(intentInterfaces, codeInterfaces);
  const proposalsDir = getProposalsDir(home, scope, target);
  await mkdir(proposalsDir, { recursive: true });

  const proposalPaths: string[] = [];
  for (const item of items) {
    const id = randomUUID();
    const filePath = join(proposalsDir, `${id}.md`);
    await writeFile(filePath, generateProposalMarkdown(item), "utf-8");
    proposalPaths.push(filePath);
  }

  return { items, proposalPaths };
}

async function applyCodeChange(generatedPath: string, item: DriftItem): Promise<void> {
  if (!existsSync(generatedPath)) return;
  let text = await readFile(generatedPath, "utf-8");

  if (item.kind === "missing_in_code" && !item.fieldName) {
    // Cannot regenerate full interface from drift item alone; skip
    return;
  }

  if (item.kind === "extra_in_code" && !item.fieldName) {
    // Remove entire interface
    const re = new RegExp(`export\\s+interface\\s+${item.interfaceName}\\s*\\{[^}]*\\}`, "g");
    text = text.replace(re, "// Removed interface " + item.interfaceName);
  } else if (item.fieldName) {
    // Field-level changes
    const interfaceRe = new RegExp(`(export\\s+interface\\s+${item.interfaceName}\\s*\\{)([^}]*)\\}`, "g");
    text = text.replace(interfaceRe, (match, header, body) => {
      const fieldRe = new RegExp(`\\b${item.fieldName}\\b(?:\\?)?:?[^;]*;`, "g");

      if (item.kind === "missing_in_code") {
        // Add field from intent; we know the intent type from the diff internals is not stored,
        // so use a placeholder. In practice the user should regenerate from intent.
        return `${header}${body}  ${item.fieldName}: ${item.intentType ?? "unknown"};\n}`;
      }

      if (item.kind === "extra_in_code") {
        return `${header}${body.replace(fieldRe, "")}}`;
      }

      if (item.kind === "type_mismatch") {
        return `${header}${body.replace(fieldRe, `${item.fieldName}${body.match(new RegExp(`\\b${item.fieldName}\\b(\\?)?:?[^;]*;`))?.[1] ?? ""}: ${item.intentType ?? "unknown"};`)}`;
      }

      if (item.kind === "optional_mismatch") {
        return `${header}${body.replace(fieldRe, (line: string) => {
          if (line.includes("?")) return line.replace("?", "");
          return line.replace(":", "?:");
        })}`;
      }

      return match;
    });
  }

  await writeFile(generatedPath, text, "utf-8");
}

export function registerSyncCode(pi: ExtensionAPI) {
  pi.registerCommand("brain:sync-code", {
    description: "Reconcile drift between intent and code (usage: /brain:sync-code <scope> <target> [--apply])",
    handler: async (args, ctx) => {
      const trimmed = args.trim();
      if (!trimmed) {
        ctx.ui.notify("Usage: /brain:sync-code <scope> <target> [--apply]", "warning");
        return;
      }

      const tokens = trimmed.split(/\s+/);
      const apply = tokens.includes("--apply");
      const filtered = tokens.filter((t) => t !== "--apply");
      if (filtered.length !== 2) {
        ctx.ui.notify("Usage: /brain:sync-code <scope> <target> [--apply]", "warning");
        return;
      }

      const [scope, target] = filtered;
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }

      if (apply && !ctx.hasUI) {
        ctx.ui.notify("--apply requires interactive mode.", "error");
        return;
      }

      const { items, proposalPaths } = await generateSyncProposals(home, scope, target);

      if (items.length === 0) {
        ctx.ui.notify("No drift detected. Nothing to sync.", "success");
        return;
      }

      if (apply) {
        const confirmed = await ctx.ui.confirm(
          "Apply code changes?",
          `This will update ${items.length} declaration(s) in the generated code. Intent changes will be proposed separately, not applied.`,
        );
        if (!confirmed) {
          ctx.ui.notify("Apply cancelled. Proposals are in ai-suggestions/sync-code/.", "info");
          return;
        }

        const generatedPath = getGeneratedPath(home, scope, target);
        for (const item of items) {
          await applyCodeChange(generatedPath, item);
        }
        ctx.ui.notify(`Applied ${items.length} code change(s). Proposals remain in ai-suggestions/sync-code/.`, "success");
      } else {
        ctx.ui.notify(
          `Generated ${proposalPaths.length} proposal(s) in ai-suggestions/sync-code/${target}/. Use --apply to update code.`,
          "info",
        );
      }
    },
  });
}
