import { useState, type FormEvent } from "react";
import { Car, Loader2, Sparkles, TriangleAlert, Wrench } from "lucide-react";
import type { DiagnosisInput } from "../lib/types";
import { WARNING_LIGHTS } from "../lib/staticData";
import { Button, Card, Chip, Field, inputClass } from "./ui";
import { CarDiagram } from "./CarDiagram";

const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "DCT / DSG", "Not sure"];

const CURRENT_YEAR = new Date().getFullYear();

export function DiagnosisForm({
  onSubmit,
  loading,
  error,
  configError,
}: {
  onSubmit: (input: DiagnosisInput) => void;
  loading: boolean;
  error?: string | null;
  configError?: string | null;
}) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [engine, setEngine] = useState("");
  const [transmission, setTransmission] = useState("");
  const [odometerKm, setOdometerKm] = useState("");
  const [location, setLocation] = useState("");
  const [symptom, setSymptom] = useState("");
  const [warningLights, setWarningLights] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleWarningLight(light: string) {
    setWarningLights((prev) =>
      prev.includes(light) ? prev.filter((l) => l !== light) : [...prev, light],
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!make.trim()) next.make = "Tell us the make — e.g. Toyota.";
    if (!model.trim()) next.model = "Tell us the model — e.g. Corolla.";
    const y = Number(year);
    if (!year.trim() || Number.isNaN(y) || y < 1980 || y > CURRENT_YEAR + 1) {
      next.year = `Enter a year between 1980 and ${CURRENT_YEAR + 1}.`;
    }
    if (!symptom.trim()) {
      next.symptom =
        "Describe what's wrong — what you hear, feel, smell or see, and when it happens.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      make: make.trim(),
      model: model.trim(),
      year: y,
      engine: engine.trim(),
      transmission,
      odometerKm: odometerKm ? Number(odometerKm) : null,
      location,
      symptom: symptom.trim(),
      warningLights,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {(error || configError) && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{configError ?? error}</span>
        </div>
      )}

      <Card className="p-4 sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
          <Car className="h-5 w-5 text-accent" aria-hidden="true" />
          Your car
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="make" label="Make" required error={errors.make}>
            <input
              id="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="e.g. Toyota"
              autoComplete="off"
              aria-invalid={!!errors.make}
              aria-describedby={errors.make ? "make-error" : undefined}
              className={inputClass}
            />
          </Field>
          <Field id="model" label="Model" required error={errors.model}>
            <input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Corolla"
              autoComplete="off"
              aria-invalid={!!errors.model}
              aria-describedby={errors.model ? "model-error" : undefined}
              className={inputClass}
            />
          </Field>
          <Field id="year" label="Year" required error={errors.year}>
            <input
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2015"
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={!!errors.year}
              aria-describedby={errors.year ? "year-error" : undefined}
              className={inputClass}
            />
          </Field>
          <Field id="engine" label="Engine" hint="Optional — e.g. 2.0L turbo diesel">
            <input
              id="engine"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              placeholder="e.g. 2.0L petrol"
              autoComplete="off"
              className={inputClass}
            />
          </Field>
          <Field id="transmission" label="Transmission">
            <select
              id="transmission"
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Select (optional)</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field id="odometerKm" label="Kilometres" hint="Optional — helps with wear and value">
            <input
              id="odometerKm"
              value={odometerKm}
              onChange={(e) => setOdometerKm(e.target.value)}
              placeholder="e.g. 145000"
              inputMode="numeric"
              autoComplete="off"
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
          <Wrench className="h-5 w-5 text-accent" aria-hidden="true" />
          The problem
        </h2>

        <div className="mb-5">
          <span className="mb-2 block text-sm font-semibold">
            Where is it coming from?{" "}
            <span className="font-normal text-muted">(optional)</span>
          </span>
          <CarDiagram value={location} onChange={setLocation} />
        </div>

        <Field id="symptom" label="What's wrong?" required error={errors.symptom}>
          <textarea
            id="symptom"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            rows={5}
            placeholder="e.g. A rattling noise from the front-left when I brake, worse at low speed. No warning lights."
            aria-invalid={!!errors.symptom}
            aria-describedby={errors.symptom ? "symptom-error" : undefined}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <div className="mt-4">
          <span className="mb-2 block text-sm font-semibold">
            Warning lights{" "}
            <span className="font-normal text-muted">(select any that are on)</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {WARNING_LIGHTS.map((light) => (
              <Chip
                key={light}
                selected={warningLights.includes(light)}
                onClick={() => toggleWarningLight(light)}
              >
                {light}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 text-base"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Checking your car…
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Get diagnosis
          </>
        )}
      </Button>

      <p className="px-1 text-center text-xs leading-relaxed text-muted">
        AI-generated guidance, not a substitute for a qualified mechanic. Costs and
        value are estimates in AUD. Safety-critical items always need a physical
        inspection.
      </p>
    </form>
  );
}
