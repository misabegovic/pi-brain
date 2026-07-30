export interface BrainHome {
  path: string;
}

export interface AutoIngestBatchEntry {
  source: string;
  targetPath: string;
  date: string;
}

export interface AutoIngestBatch {
  entries: AutoIngestBatchEntry[];
  createdAt: string;
}

export interface AutonomyState {
  enabled: boolean;
}

export type TrustLevel = "silent" | "notify" | "ask" | "blocked";

export interface AutonomyTrustConfig {
  sync: TrustLevel;
  groom: TrustLevel;
  refine: TrustLevel;
  suggest: TrustLevel;
  agent: TrustLevel;
  shelves: TrustLevel;
  commits: TrustLevel;
  code: TrustLevel;
}

export interface CompactionHarvestConfig {
  enabled: boolean;
  maxItems: number;
  minScore: number;
}

export interface ContextInjectionConfig {
  enabled: boolean;
  maxRecords: number;
  minScore: number;
}

export interface ToolResultEnrichmentConfig {
  enabled: boolean;
  maxRelated: number;
  largeOutputThreshold: number;
}

export interface BrainShortcutsConfig {
  enabled: boolean;
}

export interface BrainEventBusConfig {
  enabled: boolean;
}

export interface SessionShutdownConfig {
  enabled: boolean;
}
