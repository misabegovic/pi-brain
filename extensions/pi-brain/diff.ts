import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { requireBrain } from "./context.ts";
import { collectBlocks, type IntentBlock } from "./intent-blocks.ts";
import { isValidIdentifier } from "./utils.ts";

export interface TsInterface {
  name: string;
  fields: Array<{ name: string; type: string; optional: boolean }>;
}

export function parseTypeScriptInterfaces(text: string): TsInterface[] {
  const interfaces: TsInterface[] = [];
  const interfaceRe = /export\s+interface\s+(\w+)\s*\{([^}]*)\}/gs;
  let match: RegExpExecArray | null;
  while ((match = interfaceRe.exec(text)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields: TsInterface["fields"] = [];
    // Split body on semicolons, strip line comments, and parse each field.
    const statements = body.split(";");
    for (const raw of statements) {
      const line = raw.replace(/\/\/[^\n]*/g, "").trim();
      if (!line) continue;
      const fieldMatch = line.match(/^(\w+)(\?)?:\s*(.+)$/);
      if (fieldMatch) {
        fields.push({
          name: fieldMatch[1].trim(),
          optional: fieldMatch[2] === "?",
          type: fieldMatch[3].trim(),
        });
      }
    }
    interfaces.push({ name, fields });
  }
  return interfaces;
}

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

function intentToInterface(block: IntentBlock): TsInterface {
  const data = block.data as DataModel;
  return {
    name: data.name,
    fields: (data.fields ?? []).map((f) => ({
      name: f.name,
      type: normalizeType(f.type),
      optional: f.optional ?? false,
    })),
  };
}

export interface DriftItem {
  kind: "missing_in_code" | "extra_in_code" | "type_mismatch" | "optional_mismatch" | "matched";
  interfaceName: string;
  fieldName?: string;
  intentType?: string;
  codeType?: string;
  message: string;
}

export function diffInterfaces(intent: TsInterface[], code: TsInterface[]): DriftItem[] {
  const items: DriftItem[] = [];
  const codeMap = new Map(code.map((c) => [c.name, c]));

  for (const i of intent) {
    const c = codeMap.get(i.name);
    if (!c) {
      items.push({ kind: "missing_in_code", interfaceName: i.name, message: `Interface ${i.name} is missing in code.` });
      continue;
    }

    const codeFieldMap = new Map(c.fields.map((f) => [f.name, f]));
    for (const ifield of i.fields) {
      const cfield = codeFieldMap.get(ifield.name);
      if (!cfield) {
        items.push({ kind: "missing_in_code", interfaceName: i.name, fieldName: ifield.name, intentType: ifield.type, message: `Field ${i.name}.${ifield.name} is missing in code.` });
        continue;
      }
      if (ifield.type !== cfield.type) {
        items.push({ kind: "type_mismatch", interfaceName: i.name, fieldName: ifield.name, intentType: ifield.type, codeType: cfield.type, message: `Field ${i.name}.${ifield.name} type differs: intent=${ifield.type}, code=${cfield.type}.` });
      }
      if (ifield.optional !== cfield.optional) {
        items.push({ kind: "optional_mismatch", interfaceName: i.name, fieldName: ifield.name, message: `Field ${i.name}.${ifield.name} optionality differs.` });
      }
    }

    const intentFieldNames = new Set(i.fields.map((f) => f.name));
    for (const cfield of c.fields) {
      if (!intentFieldNames.has(cfield.name)) {
        items.push({ kind: "extra_in_code", interfaceName: i.name, fieldName: cfield.name, message: `Field ${i.name}.${cfield.name} exists in code but not in intent.` });
      }
    }
  }

  const intentNames = new Set(intent.map((i) => i.name));
  for (const c of code) {
    if (!intentNames.has(c.name)) {
      items.push({ kind: "extra_in_code", interfaceName: c.name, message: `Interface ${c.name} exists in code but not in intent.` });
    }
  }

  return items;
}

export function formatDriftReport(scope: string, target: string, items: DriftItem[]): string {
  const matched = items.filter((i) => i.kind === "matched");
  const missing = items.filter((i) => i.kind === "missing_in_code");
  const extra = items.filter((i) => i.kind === "extra_in_code");
  const mismatches = items.filter((i) => i.kind === "type_mismatch" || i.kind === "optional_mismatch");

  const lines: string[] = [
    `# Drift report — ${scope}/${target}`,
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Summary",
    `- Matched: ${matched.length}`,
    `- Missing in code: ${missing.length}`,
    `- Extra in code: ${extra.length}`,
    `- Mismatches: ${mismatches.length}`,
    "",
  ];

  if (missing.length > 0) {
    lines.push("## Missing in code", "");
    for (const item of missing) lines.push(`- ${item.message}`);
    lines.push("");
  }

  if (extra.length > 0) {
    lines.push("## Extra in code", "");
    for (const item of extra) lines.push(`- ${item.message}`);
    lines.push("");
  }

  if (mismatches.length > 0) {
    lines.push("## Mismatches", "");
    for (const item of mismatches) lines.push(`- ${item.message}`);
    lines.push("");
  }

  lines.push("## Recommended actions", "", "- Update intent blocks to match code.", "- Regenerate code with `/brain:build`.", "- Capture an inbox task for manual review.", "");

  return lines.join("\n");
}

export function registerDiff(pi: ExtensionAPI) {
  pi.registerCommand("brain:diff", {
    description: "Detect drift between intent blocks and generated/target code (usage: /brain:diff <scope> <target>)",
    handler: async (args, ctx) => {
      const trimmed = args.trim();
      if (!trimmed) {
        ctx.ui.notify("Usage: /brain:diff <scope> <target>", "warning");
        return;
      }

      const parts = trimmed.split(/\s+/);
      if (parts.length !== 2) {
        ctx.ui.notify("Usage: /brain:diff <scope> <target>", "warning");
        return;
      }

      const [scope, target] = parts;
      if (!isValidIdentifier(scope) || !isValidIdentifier(target)) {
        ctx.ui.notify("Scope and target must be simple identifiers (letters, numbers, -, _).", "warning");
        return;
      }
      const home = await requireBrain(ctx.cwd);
      if (!home) {
        ctx.ui.notify("No pi-brain home found.", "error");
        return;
      }

      const blocks = await collectBlocks(home, scope, ["data_model"]);
      const intentInterfaces = blocks.map(intentToInterface);

      const generatedPath = join(home.path, "wiki", scope, "ai-suggestions", "build", target, "generated.ts");
      let codeInterfaces: TsInterface[] = [];
      if (existsSync(generatedPath)) {
        const codeText = await readFile(generatedPath, "utf-8");
        codeInterfaces = parseTypeScriptInterfaces(codeText);
      }

      const items = diffInterfaces(intentInterfaces, codeInterfaces);
      const report = formatDriftReport(scope, target, items);

      const outputDir = join(home.path, "wiki", scope, "ai-suggestions", "drift");
      const outputPath = join(outputDir, `${target}.md`);
      await mkdir(outputDir, { recursive: true });
      await writeFile(outputPath, report, "utf-8");

      ctx.ui.notify(`Drift report: ${outputPath}\n\n${report.slice(0, 1200)}`, items.length === 0 ? "info" : "warning");
    },
  });
}
