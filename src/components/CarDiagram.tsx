import { MapPin } from "lucide-react";

const GRID: Array<[string, string]> = [
  ["front-left", "Front-left"],
  ["engine-bay", "Engine bay"],
  ["front-right", "Front-right"],
  ["left", "Left side"],
  ["cabin", "Cabin / interior"],
  ["right", "Right side"],
  ["rear-left", "Rear-left"],
  ["boot", "Boot / rear"],
  ["rear-right", "Rear-right"],
];

const EXTRA: Array<[string, string]> = [
  ["underneath", "Underneath"],
  ["wheels", "Wheels / brakes"],
  ["exhaust", "Exhaust"],
  ["not-sure", "Not sure"],
];

export function CarDiagram({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        Top view — tap the area
      </div>
      <div
        className="mx-auto grid max-w-xs grid-cols-3 gap-1.5"
        role="group"
        aria-label="Where on the car is the problem?"
      >
        {GRID.map(([id, label]) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? "" : id)}
              className={`flex min-h-[3.25rem] items-center justify-center rounded-lg border px-1.5 py-2 text-center text-[11px] font-medium leading-tight transition-all duration-150 cursor-pointer active:scale-[0.96] sm:text-xs ${
                selected
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border bg-surface-2 text-foreground hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {EXTRA.map(([id, label]) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? "" : id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer active:scale-[0.96] ${
                selected
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border bg-surface-2 text-foreground hover:border-primary/40"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
