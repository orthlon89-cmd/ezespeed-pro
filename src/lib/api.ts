import { supabase } from "./supabase";
import { buildLocalDiagnosis } from "./localDiagnosis";
import type { DiagnosisInput, DiagnosisResult } from "./types";

/**
 * Runs the diagnosis. It first tries the Supabase `diagnose` Edge Function,
 * which holds the OpenAI key server-side (never exposed to the browser). If
 * that isn't reachable or isn't configured yet — no key, no network, function
 * down — it falls back to the built-in local engine so the app always returns
 * a useful answer rather than an error.
 */
export async function runDiagnosis(input: DiagnosisInput): Promise<DiagnosisResult> {
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke("diagnose", {
        body: input,
      });
      if (!error && data) {
        return { ...(data as DiagnosisResult), source: "ai" };
      }
    } catch {
      // The function was unreachable — fall through to the local engine.
    }
  }

  return buildLocalDiagnosis(input);
}
