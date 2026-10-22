import { useState } from "react";
import {
  BadgeCheck,
  CircleCheck,
  DollarSign,
  Fuel,
  Gauge,
  ListChecks,
  Package,
  Route,
  Search,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import type { DiagnosisResult, Recommendation } from "../lib/types";
import { benchmarkPhrase, formatAud, formatPercent } from "../lib/staticData";
import { Badge, Card, Checklist, Chip, Meter, SectionHeading } from "./ui";

function recommendationMeta(rec: Recommendation) {
  switch (rec) {
    case "diy":
      return {
        label: "DIY friendly",
        tone: "success" as const,
        icon: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
      };
    case "shop":
      return {
        label: "Use a workshop",
        tone: "danger" as const,
        icon: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
      };
    default:
      return {
        label: "Either works",
        tone: "warning" as const,
        icon: <Wrench className="h-4 w-4" aria-hidden="true" />,
      };
  }
}

function difficultyTone(percent: number) {
  if (percent < 35) return "success" as const;
  if (percent <= 65) return "warning" as const;
  return "danger" as const;
}

function CostItem({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        emphasis ? "border-accent/40 bg-accent/10" : "border-border bg-surface-2/50"
      }`}
    >
      <div className="text-xs font-medium text-muted">{label}</div>
      <div
        className={`text-base font-bold ${emphasis ? "text-accent" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

function ToolsReadiness({ tools }: { tools: string[] }) {
  const [have, setHave] = useState<Set<string>>(new Set());

  if (!tools.length) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">Special tools / software</span>
        <span className="text-xs font-medium text-muted" aria-live="polite">
          {have.size} of {tools.length} ready
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => (
          <Chip
            key={tool}
            selected={have.has(tool)}
            onClick={() =>
              setHave((prev) => {
                const next = new Set(prev);
                if (next.has(tool)) next.delete(tool);
                else next.add(tool);
                return next;
              })
            }
          >
            {tool}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function BulletList({ items, firstBold }: { items: string[]; firstBold?: boolean }) {
  if (!items.length) {
    return <p className="text-sm text-muted">Nothing listed.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
          <span className={i === 0 && firstBold ? "font-semibold" : undefined}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function AnswerCard({ result }: { result: DiagnosisResult }) {
  const rec = recommendationMeta(result.recommendation);
  const safetyCritical =
    result.requiresPhysicalInspection || Boolean(result.safetyWarning.trim());

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Search className="h-5 w-5 text-accent" aria-hidden="true" />
            Likely cause
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {formatPercent(result.confidence)} confident
            </Badge>
            <Badge tone={rec.tone}>
              {rec.icon}
              {rec.label}
            </Badge>
          </div>
        </div>

        {safetyCritical && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {result.safetyWarning ||
                "Safety-critical — get this physically inspected before relying on this estimate."}
            </span>
          </div>
        )}

        <div className="mt-4">
          <BulletList items={result.causes} firstBold />
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-accent" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="font-heading text-base font-bold">{rec.label}</h3>
            <p className="text-sm text-muted">
              {formatPercent(result.difficultyPercent)} difficulty ·{" "}
              {benchmarkPhrase(result.difficultyPercent)}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <Meter
            value={result.difficultyPercent}
            tone={difficultyTone(result.difficultyPercent)}
            label="Repair difficulty"
          />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-foreground">
          {result.recommendationReason}
        </p>
      </Card>

      <Card className="p-4 sm:p-6">
        <SectionHeading
          icon={<Wrench className="h-5 w-5 text-accent" aria-hidden="true" />}
          title="Repair required"
        />
        <p className="text-sm leading-relaxed text-foreground">{result.repair}</p>
      </Card>

      <Card className="p-4 sm:p-6">
        <SectionHeading
          icon={<DollarSign className="h-5 w-5 text-accent" aria-hidden="true" />}
          title="Estimated costs"
          description="Approximate, in AUD — labour rates vary by workshop."
        />
        <div className="grid grid-cols-2 gap-3">
          <CostItem label="Parts" value={formatAud(result.costs.parts)} />
          <CostItem label="Labour" value={formatAud(result.costs.labour)} />
          <CostItem label="Diagnostic" value={formatAud(result.costs.diagnostic)} />
          <CostItem label="Total" value={formatAud(result.costs.total)} emphasis />
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <SectionHeading
          icon={<Package className="h-5 w-5 text-accent" aria-hidden="true" />}
          title="Parts needed"
        />
        <BulletList items={result.parts} />
      </Card>

      <Card className="p-4 sm:p-6">
        <SectionHeading
          icon={<Fuel className="h-5 w-5 text-accent" aria-hidden="true" />}
          title="Consumables"
          description="Coolant, clamps, grease, sealant, clips, bolts, brake cleaner — the bits you'll also need."
        />
        <BulletList items={result.consumables} />
      </Card>

      <Card className="p-4 sm:p-6">
        <ToolsReadiness tools={result.tools} />
      </Card>

      <Card className="p-4 sm:p-6">
        <SectionHeading
          icon={<ListChecks className="h-5 w-5 text-accent" aria-hidden="true" />}
          title="Procedure checklist"
          description="Tick off each step as you go."
        />
        <Checklist items={result.procedureChecklist} />
      </Card>

      <Card className="p-4 sm:p-6">
        <SectionHeading
          icon={<CircleCheck className="h-5 w-5 text-accent" aria-hidden="true" />}
          title="After-repair checks"
        />
        <Checklist items={result.afterRepairChecks} />
      </Card>

      <Card className="p-4 sm:p-6">
        <SectionHeading
          icon={<Route className="h-5 w-5 text-accent" aria-hidden="true" />}
          title="Road test"
          description="Confirm the fix before you call it done."
        />
        <Checklist items={result.roadTest} />
      </Card>
    </div>
  );
}
