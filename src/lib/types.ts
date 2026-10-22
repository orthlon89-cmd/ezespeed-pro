export type Recommendation = "diy" | "shop" | "either";

export interface DiagnosisCosts {
  parts: number;
  labour: number;
  total: number;
  diagnostic: number;
}

export interface EstimatedValue {
  min: number;
  max: number;
  note: string;
}

/** The structured answer card returned by the `diagnose` Edge Function. */
export interface DiagnosisResult {
  causes: string[];
  repair: string;
  parts: string[];
  consumables: string[];
  costs: DiagnosisCosts;
  /** 0–100, benchmarked against familiar jobs. */
  difficultyPercent: number;
  recommendation: Recommendation;
  recommendationReason: string;
  tools: string[];
  procedureChecklist: string[];
  afterRepairChecks: string[];
  roadTest: string[];
  /** 0–100. */
  confidence: number;
  requiresPhysicalInspection: boolean;
  safetyWarning: string;
  estimatedValue: EstimatedValue;
  /** Where the answer came from: the AI Edge Function or the built-in engine. */
  source?: "ai" | "local";
}

/** Everything the user tells us before running the diagnosis. */
export interface DiagnosisInput {
  make: string;
  model: string;
  year: number | null;
  engine: string;
  transmission: string;
  odometerKm: number | null;
  location: string;
  symptom: string;
  warningLights: string[];
}
