import { useState } from "react";
import { Info, Scale } from "lucide-react";
import type { DiagnosisResult } from "../lib/types";
import {
  formatAud,
  formatPercent,
  getFixOrSellBand,
} from "../lib/staticData";
import { Badge, Card, Meter, SectionHeading, inputClass } from "./ui";

export function FixOrSell({ result }: { result: DiagnosisResult }) {
  const midpoint = (result.estimatedValue.min + result.estimatedValue.max) / 2;
  const [manualValue, setManualValue] = useState("");
  const manual = Number(manualValue);
  const effectiveValue =
    manualValue.trim() && Number.isFinite(manual) && manual > 0 ? manual : midpoint;

  const percent = (result.costs.total / Math.max(effectiveValue, 1)) * 100;
  const band = getFixOrSellBand(percent);

  return (
    <Card className="p-4 sm:p-6">
      <SectionHeading
        icon={<Scale className="h-5 w-5 text-accent" aria-hidden="true" />}
        title="Fix it or sell it?"
        description="Repair cost vs your car's approximate value."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Rough value:</span>
        <span className="text-sm font-bold text-foreground">
          {formatAud(result.estimatedValue.min)} – {formatAud(result.estimatedValue.max)}
        </span>
        <Badge tone="neutral">
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
          Estimate only
        </Badge>
      </div>

      <div className="mb-4">
        <label htmlFor="manual-value" className="mb-1.5 block text-sm font-semibold">
          Know your car's value? Enter it for a better answer
        </label>
        <input
          id="manual-value"
          value={manualValue}
          onChange={(e) => setManualValue(e.target.value)}
          placeholder={`e.g. ${Math.round(midpoint)}`}
          inputMode="numeric"
          className={`${inputClass} max-w-xs`}
        />
        {result.estimatedValue.note ? (
          <p className="mt-1.5 text-xs text-muted">{result.estimatedValue.note}</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-border bg-surface-2/50 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm text-muted">
            Repair ({formatAud(result.costs.total)}) is
          </span>
          <span className="font-heading text-2xl font-bold text-foreground">
            {formatPercent(percent)}
          </span>
        </div>
        <div className="my-3">
          <Meter value={percent} tone={band.tone} label="Repair cost as a share of value" />
        </div>
        <p
          className={`text-base font-bold ${
            band.tone === "success"
              ? "text-success"
              : band.tone === "warning"
                ? "text-warning"
                : "text-danger"
          }`}
        >
          {band.label}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted">{band.guidance}</p>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        Valuation is an AI estimate — verify against RedBook or carsales before making
        a decision.
      </p>
    </Card>
  );
}
