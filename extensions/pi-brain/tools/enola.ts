import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { runEnolaCheck, runEnolaBaseline, runEnolaQuery, runEnolaImpact, runEnolaGenerate, runEnolaDiff, runEnolaCitations, runEnolaGovern, formatEnolaResult, captureEnolaRegressions } from "../enola.ts";
import { requireBrain, setupHint } from "../context.ts";

function notFound() {
  return { content: [{ type: "text" as const, text: setupHint() }], details: { ok: false, exitCode: 1 } };
}

export function registerEnolaTools(pi: ExtensionAPI) {
  pi.registerTool({
    name: "brain_enola_capture",
    label: "Brain enola capture",
    description: "Run enola check and capture any structural regressions as an ai-suggestion.",
    parameters: Type.Object({}),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, _params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return notFound();

      const result = await captureEnolaRegressions(home);
      return {
        content: [{ type: "text" as const, text: result.message }],
        details: { ok: result.captured, exitCode: 0 },
      };
    },
  });

  pi.registerTool({
    name: "brain_enola",
    label: "Brain enola",
    description: "Run an optional enola architecture check/baseline/query on the configured target repo.",
    parameters: Type.Object({
      operation: Type.Union(
        [
          Type.Literal("check", { description: "Run enola check and report structural regressions." }),
          Type.Literal("baseline", { description: "Pin the architecture baseline." }),
          Type.Literal("generate", { description: "Generate enola snapshot and record receipt." }),
          Type.Literal("diff", { description: "Compare current snapshot to recorded receipts." }),
          Type.Literal("citations", { description: "Check enola receipt citations in wiki prose." }),
          Type.Literal("query", { description: "Search enola output for a symbol or module." }),
          Type.Literal("impact", { description: "Show impact radius for a symbol or module with context." }),
          Type.Literal("govern", { description: "Which compiled pages govern a file or symbol (with relation trails); for a page path, which code its anchors cover. Answers 'not asked' when no knowledge pages are compiled." }),
        ],
        { description: "Operation to perform." }
      ),
      query: Type.Optional(Type.String({ description: "For operation=query, impact, or govern: the symbol, module, file path, or compiled page path." })),
    }),
    constrainedSampling: { type: "json_schema" as const, strict: "prefer" as const },
    async execute(_toolCallId: string, params: any, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: ExtensionContext) {
      const home = await requireBrain(ctx.cwd);
      if (!home) return notFound();

      if (params.operation === "citations") {
        const citResult = await runEnolaCitations(home);
        return {
          content: [{ type: "text" as const, text: citResult.message }],
          details: { ok: citResult.ok, exitCode: 0 },
        };
      }

      let result;
      if (params.operation === "baseline") {
        result = await runEnolaBaseline(home);
      } else if (params.operation === "generate") {
        result = await runEnolaGenerate(home);
      } else if (params.operation === "diff") {
        result = await runEnolaDiff(home);
      } else if (params.operation === "query") {
        if (!params.query) {
          result = { ok: false, exitCode: 1, stdout: "", stderr: "Query parameter is required for operation=query.", summary: "Missing query parameter." };
        } else {
          result = await runEnolaQuery(home, params.query);
        }
      } else if (params.operation === "impact") {
        if (!params.query) {
          result = { ok: false, exitCode: 1, stdout: "", stderr: "Query parameter is required for operation=impact.", summary: "Missing query parameter." };
        } else {
          result = await runEnolaImpact(home, params.query);
        }
      } else if (params.operation === "govern") {
        if (!params.query) {
          result = { ok: false, exitCode: 1, stdout: "", stderr: "Query parameter is required for operation=govern.", summary: "Missing query parameter." };
        } else {
          result = await runEnolaGovern(home, params.query);
        }
      } else {
        result = await runEnolaCheck(home);
      }

      return {
        content: [{ type: "text" as const, text: formatEnolaResult(result) }],
        details: { ok: result.ok, exitCode: result.exitCode },
      };
    },
  });
}
