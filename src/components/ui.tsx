import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import type { RiskTone } from "../lib/staticData";

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 ease-out cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";
  const variants: Record<Variant, string> = {
    primary: "bg-accent text-on-accent shadow-sm hover:brightness-110",
    secondary:
      "border border-border bg-surface text-foreground hover:bg-surface-2",
    ghost: "text-muted hover:text-foreground hover:bg-surface-2",
  };
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

type Tone = RiskTone | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  neutral: "bg-surface-2 text-muted border-border",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-3">
      <h3 className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
        {icon}
        {title}
      </h3>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
    </div>
  );
}

export function Chip({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer active:scale-[0.96] ${
        selected
          ? "border-primary bg-primary text-on-primary"
          : "border-border bg-surface-2 text-foreground hover:border-primary/40"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-foreground"
      >
        {label}
        {required ? (
          <span className="text-accent" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/70 transition-colors duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25";

export function Meter({
  value,
  tone = "neutral",
  label,
}: {
  value: number;
  tone?: Tone;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const color =
    tone === "success"
      ? "var(--c-success)"
      : tone === "warning"
        ? "var(--c-warning)"
        : tone === "danger"
          ? "var(--c-danger)"
          : "var(--c-primary)";
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function Checklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  if (!items.length) {
    return <p className="text-sm text-muted">Nothing listed here.</p>;
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted" aria-live="polite">
        {done.size} of {items.length} done
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const checked = done.has(i);
          return (
            <li key={i}>
              <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-2/50 px-3 py-2.5 cursor-pointer transition-colors duration-150 hover:bg-surface-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setDone((prev) => {
                      const next = new Set(prev);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    })
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 rounded accent-primary"
                />
                <span
                  className={`text-sm leading-snug transition-colors ${
                    checked ? "text-muted line-through" : "text-foreground"
                  }`}
                >
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

