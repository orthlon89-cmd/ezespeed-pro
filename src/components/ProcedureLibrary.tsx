import { useState } from "react";
import { ChevronDown, LibraryBig } from "lucide-react";
import { PROCEDURE_LIBRARY } from "../lib/staticData";
import { Card, Checklist, SectionHeading } from "./ui";

export function ProcedureLibrary() {
  const [open, setOpen] = useState<string | null>(PROCEDURE_LIBRARY[0]?.id ?? null);

  return (
    <Card className="p-4 sm:p-6">
      <SectionHeading
        icon={<LibraryBig className="h-5 w-5 text-accent" aria-hidden="true" />}
        title="Procedure library"
        description="Reusable checklists for the jobs that get done wrong the most."
      />
      <div className="space-y-2">
        {PROCEDURE_LIBRARY.map((proc) => {
          const expanded = open === proc.id;
          return (
            <div
              key={proc.id}
              className="overflow-hidden rounded-xl border border-border bg-surface-2/50"
            >
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`procedure-${proc.id}`}
                onClick={() => setOpen(expanded ? null : proc.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer transition-colors duration-150 hover:bg-surface-2"
              >
                <div>
                  <span className="block text-sm font-semibold text-foreground">
                    {proc.title}
                  </span>
                  <span className="block text-xs text-muted">{proc.when}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
                    expanded ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {expanded && (
                <div id={`procedure-${proc.id}`} className="px-4 pb-4">
                  <Checklist items={proc.steps} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
