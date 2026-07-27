import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export function registerBrainShortcuts(pi: ExtensionAPI) {
  pi.registerShortcut("ctrl+shift+c", {
    description: "Capture a note to the pi-brain inbox",
    handler: async (_args, ctx) => {
      ctx.ui.notify("Use /brain:capture <note> to capture to the inbox.", "info");
    },
  });

  pi.registerShortcut("ctrl+shift+i", {
    description: "Show the pi-brain inbox summary",
    handler: async (_args, ctx) => {
      ctx.ui.notify("Use /brain:tend to review the inbox.", "info");
    },
  });

  pi.registerShortcut("ctrl+shift+a", {
    description: "Ask the pi-brain a question",
    handler: async (_args, ctx) => {
      ctx.ui.notify("Use /brain:ask <question> to query the brain.", "info");
    },
  });

  pi.registerFlag("brain-autonomy", {
    description: "Start sessions with pi-brain autonomy enabled",
    type: "boolean",
    default: false,
  });
}
