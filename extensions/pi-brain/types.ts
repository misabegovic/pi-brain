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

export interface CompactionHarvestConfig {
  enabled: boolean;
  maxItems: number;
  minScore: number;
}
