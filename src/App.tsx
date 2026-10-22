import { useState } from "react";
import { CarFront, RotateCcw } from "lucide-react";
import { runDiagnosis } from "./lib/api";
import { supabase } from "./lib/supabase";
import type { DiagnosisInput, DiagnosisResult } from "./lib/types";
import { DiagnosisForm } from "./components/DiagnosisForm";
import { AnswerCard } from "./components/AnswerCard";
import { FixOrSell } from "./components/FixOrSell";
import { ShopScript } from "./components/ShopScript";
import { ProcedureLibrary } from "./components/ProcedureLibrary";
import { Button } from "./components/ui";

type Phase = "form" | "loading" | "result";

export default function App() {
  const [phase, setPhase] = useState<Phase>("form");
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState("");

  const configError = supabase
    ? null
    : "Diagnosis isn't wired up yet — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Environment settings, then reload.";

  async function handleSubmit(input: DiagnosisInput) {
    setPhase("loading");
    setError(null);
    setSummary(`${input.year} ${input.make} ${input.model}`);
    try {
      const res = await runDiagnosis(input);
      setResult(res);
      setPhase("result");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please try again.",
      );
      setPhase("form");
    }
  }

  function reset() {
    setPhase("form");
    setResult(null);
    setError(null);
    setSummary("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/70 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-on-accent">
            <CarFront className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold leading-tight">
              Car Decider
            </h1>
            <p className="text-xs text-muted">
              Diagnose it, then decide: fix it or sell it
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {phase === "result" && result ? (
          <div className="animate-fade-up space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Diagnosis
                </p>
                <h2 className="truncate font-heading text-xl font-bold">{summary}</h2>
              </div>
              <Button variant="secondary" onClick={reset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                New diagnosis
              </Button>
            </div>

            <AnswerCard result={result} />
            <FixOrSell result={result} />
            <ShopScript />
            <ProcedureLibrary />
          </div>
        ) : (
          <div className="animate-fade-up space-y-4">
            <div className="pb-1">
              <h2 className="font-heading text-2xl font-bold">
                What's wrong with your car?
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Tell us what you're noticing and we'll estimate the likely cause, the
                fix, the cost — and whether it's actually worth fixing.
              </p>
            </div>

            <DiagnosisForm
              onSubmit={handleSubmit}
              loading={phase === "loading"}
              error={error}
              configError={configError}
            />
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-2xl px-4 py-8 text-center text-xs leading-relaxed text-muted">
        Car Decider is AI guidance, not a substitute for a qualified mechanic.
        Safety-critical repairs always need a physical inspection.
      </footer>
    </div>
  );
}
