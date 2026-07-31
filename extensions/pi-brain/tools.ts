import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerCoreTools } from "./tools/core.ts";
import { registerUpdateTools } from "./tools/update.ts";
import { registerAutonomyTools } from "./tools/autonomy.ts";
import { registerProjectTools } from "./tools/projects.ts";
import { registerStateTools } from "./tools/state.ts";
import { registerDeepdiveTool } from "./tools/deepdive.ts";
import { registerIngestTools } from "./tools/ingest.ts";
import { registerEnolaTools } from "./tools/enola.ts";

export function registerTools(pi: ExtensionAPI) {
  registerCoreTools(pi);
  registerUpdateTools(pi);
  registerAutonomyTools(pi);
  registerProjectTools(pi);
  registerStateTools(pi);
  registerDeepdiveTool(pi);
  registerIngestTools(pi);
  registerEnolaTools(pi);
}

export { findRecentSources } from "./tools/update.ts";
