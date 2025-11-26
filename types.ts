export interface FixResult {
  id: string;
  query: string;
  timestamp: number;
  insight: string;
  plan: string;
  actions: string[];
}

export interface FixResponseSchema {
  insight: string;
  plan: string;
  actions: string[];
}

export type Theme = 'light' | 'dark';

export interface SavedFix extends FixResult {}
