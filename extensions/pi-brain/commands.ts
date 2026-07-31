import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerCollaboration } from "./collaboration.ts";
import { registerBuild } from "./build.ts";
import { registerDiff } from "./diff.ts";
import { registerRevise } from "./revise.ts";
import { registerTasks } from "./tasks.ts";
import { registerEnolaCommands } from "./enola.ts";
import { registerSyncCode } from "./sync-code.ts";
import { registerRfcContribute } from "./rfc-contribute.ts";
import { registerCoreCommands } from "./commands/core.ts";
import { registerSyncCommands } from "./commands/sync.ts";
import { registerShapeCommands } from "./commands/shape.ts";
import { registerViewCommands } from "./commands/views.ts";
import { registerIngestCommands } from "./commands/ingest.ts";
import { registerAutonomyCommands } from "./commands/autonomy.ts";
import { registerMiscCommands } from "./commands/misc.ts";

export function registerCommands(pi: ExtensionAPI, lastSystemPrompt: { current: string }) {
  registerCollaboration(pi);
  registerBuild(pi);
  registerDiff(pi);
  registerRevise(pi);
  registerTasks(pi);
  registerEnolaCommands(pi);
  registerSyncCode(pi);
  registerRfcContribute(pi);

  registerCoreCommands(pi);
  registerSyncCommands(pi);
  registerShapeCommands(pi);
  registerViewCommands(pi);
  registerIngestCommands(pi);
  registerAutonomyCommands(pi);
  registerMiscCommands(pi, lastSystemPrompt);
}
