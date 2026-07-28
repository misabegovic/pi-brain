import type { IntentBlock } from "./intent-blocks.ts";

interface DataModelField {
  name: string;
  type: string;
  optional?: boolean;
  description?: string;
}

interface DataModel {
  name: string;
  fields?: DataModelField[];
}

function mapType(type: string): string {
  switch (type) {
    case "string": return "string";
    case "integer": return "number";
    case "number": return "number";
    case "boolean": return "boolean";
    case "date": return "Date";
    case "json": return "unknown";
    default: return type;
  }
}

function renderDataModel(block: IntentBlock): string {
  const data = block.data as DataModel;
  const lines: string[] = [];
  lines.push(`export interface ${data.name} {`);
  for (const field of data.fields ?? []) {
    const optional = field.optional ? "?" : "";
    const comment = field.description ? ` // ${field.description}` : "";
    lines.push(`  ${field.name}${optional}: ${mapType(field.type)};${comment}`);
  }
  lines.push("}");
  return lines.join("\n");
}

export function renderTypescriptTypes(blocks: IntentBlock[]): string {
  const dataModels = blocks.filter((b) => b.type === "data_model");
  if (dataModels.length === 0) {
    return "// No data_model blocks found.";
  }

  const sections: string[] = [];
  for (const block of dataModels) {
    sections.push(`// Source: ${block.source} (block: ${block.name})`);
    sections.push(renderDataModel(block));
    sections.push("");
  }

  return sections.join("\n").trim();
}

export function renderTarget(blocks: IntentBlock[], target: string): string | null {
  switch (target) {
    case "types":
      return renderTypescriptTypes(blocks);
    default:
      return null;
  }
}
