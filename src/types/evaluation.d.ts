import type { PageMetadata } from '../services/page.service';

export declare enum Severity {
  NONE = 0,
  COSMETIC = 1,
  MINOR = 2,
  MAJOR = 3,
  CATASTROPHE = 4
}

export interface IHeuristic {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface IEvaluation {
  id: string;
  timestamp: Date;
  url: string;
  elementSelector: string;
  heuristic: IHeuristic;
  severity: Severity;
  notes: string;
  recommendation: string;
  screenshot?: string;
}

export interface IEvaluationSet {
  id: string;
  name: string;
  createdAt: Date;
  evaluations: IEvaluation[];
}

export interface DomainEvaluation {
  domain: string;
  pages: {
    [path: string]: PageEvaluation;
  };
}

export interface PageEvaluation {
  metadata: PageMetadata;
  evaluations: IEvaluation[];
}
