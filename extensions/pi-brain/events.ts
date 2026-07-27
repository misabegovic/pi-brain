import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export type BrainEvent =
  | { type: "brain:stateChanged"; payload: { pages: number; sources: number; inbox: number } }
  | { type: "brain:inboxUpdated"; payload: { count: number } };

export function emitBrainEvent(pi: ExtensionAPI, event: BrainEvent) {
  pi.events.emit(event.type, event.payload);
}
