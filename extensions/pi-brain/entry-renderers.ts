import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text, Box, Container } from "@earendil-works/pi-tui";

export function registerBrainEntryRenderers(pi: ExtensionAPI) {
  pi.registerEntryRenderer("pi-brain-briefing", (entry, _options, theme) => {
    const data = entry.data as { content?: string } | undefined;
    const text = data?.content ?? "";
    const container = new Container();
    const box = new Box(1, 1, (s) => theme.bg("customMessageBg", s));
    box.addChild(new Text(theme.fg("accent", text), 0, 0));
    container.addChild(box);
    return container;
  });

  pi.registerEntryRenderer("pi-brain-inbox", (entry, _options, theme) => {
    const data = entry.data as { summary?: string; count?: number } | undefined;
    const summary = data?.summary ?? "";
    const count = data?.count ?? 0;
    const container = new Container();
    const box = new Box(1, 1, (s) => theme.bg("customMessageBg", s));
    box.addChild(new Text(theme.fg("accent", theme.bold("pi-brain inbox")), 0, 0));
    box.addChild(new Text(theme.fg("text", summary), 0, 0));
    if (count > 0) {
      box.addChild(new Text(theme.fg("warning", `${count} item(s) waiting`), 0, 0));
    }
    container.addChild(box);
    return container;
  });
}
