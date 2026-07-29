// Source: wiki/brain/adrs/structured-intent-and-build.md (block: task)
export interface Task {
  id: string;
}

// Source: wiki/brain/prds/structured-intent-and-build.md (block: task)
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

// Source: wiki/brain/prds/structured-intent-and-build.md (block: intent_block)
export interface IntentBlock {
  type: string; // Block type (data_model, api_surface, behavior, invariant)
  name: string; // Stable identifier for the block
  source: string; // Path to the source PRD/ADR
  data: unknown; // Parsed block payload
}