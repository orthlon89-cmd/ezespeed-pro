import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { DiagnosisInput, DiagnosisResult } from "./types";

/**
 * Runs the diagnosis by calling the Supabase `diagnose` Edge Function, which
 * holds the OpenAI key server-side. The key is never exposed to the browser.
 *
 * The strict JSON schema and the "three-part check" system prompt live inside
 * the Edge Function itself, so they stay server-side and out of the browser
 * bundle (and can use the full strict-mode keyword subset there).
 */
export async function runDiagnosis(input: DiagnosisInput): Promise<DiagnosisResult> {
  if (!supabase) {
    throw new Error(
      "Diagnosis isn't wired up yet — the Supabase connection is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Environment settings.",
    );
  }

  const { data, error } = await supabase.functions.invoke("diagnose", {
    body: input,
  });

  if (error) {
    let message = "We couldn't reach the diagnosis service. Please try again.";
    if (error instanceof FunctionsHttpError) {
      try {
        const body = (await error.context.json()) as { error?: string };
        if (body?.error) message = body.error;
      } catch {
        // The function returned a non-JSON body — keep the friendly default.
      }
    }
    throw new Error(message);
  }

  if (!data) {
    throw new Error("No diagnosis came back. Please try again.");
  }

  return data as DiagnosisResult;
}
