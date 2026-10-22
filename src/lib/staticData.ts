export interface DifficultyBenchmark {
  label: string;
  percent: number;
}

/** Static, deterministic benchmark — never AI-generated. Anchors the difficulty %. */
export const DIFFICULTY_BENCHMARKS: DifficultyBenchmark[] = [
  { label: "Key fob battery", percent: 5 },
  { label: "Headlight replacement", percent: 10 },
  { label: "Cabin filter", percent: 15 },
  { label: "Radiator fan plug reconnected", percent: 20 },
  { label: "Coolant hose + clamp", percent: 35 },
  { label: "Front brake pads", percent: 40 },
  { label: "Clutch slave cylinder", percent: 65 },
  { label: "Clutch replacement", percent: 90 },
];

export const WARNING_LIGHTS: string[] = [
  "Check engine",
  "Oil pressure",
  "Battery / charging",
  "Temperature",
  "Brake / ABS",
  "Airbag",
  "Traction / EPC",
  "Glow plug",
  "Tyre pressure",
  "Other / not sure",
];

export type RiskTone = "success" | "warning" | "danger";

export interface FixOrSellBand {
  /** Lower bound (inclusive). */
  min: number;
  /** Upper bound (exclusive). */
  max: number;
  label: string;
  tone: RiskTone;
  guidance: string;
}

export const FIX_OR_SELL_BANDS: FixOrSellBand[] = [
  {
    min: 0,
    max: 20,
    label: "Great value — fix it",
    tone: "success",
    guidance:
      "The repair is a small fraction of the car's worth. Almost always worth fixing.",
  },
  {
    min: 20,
    max: 40,
    label: "Worth fixing",
    tone: "success",
    guidance:
      "A reasonable repair relative to value. Fix it and keep driving.",
  },
  {
    min: 40,
    max: 60,
    label: "Borderline — weigh it up",
    tone: "warning",
    guidance:
      "Getting expensive relative to value. Factor in the car's overall condition and any other upcoming costs.",
  },
  {
    min: 60,
    max: 100,
    label: "Consider selling as-is",
    tone: "warning",
    guidance:
      "The repair is a large share of the car's value. Selling as-is may make more sense.",
  },
  {
    min: 100,
    max: Infinity,
    label: "Repair exceeds value",
    tone: "danger",
    guidance:
      "The repair costs more than the car is worth. Strongly consider selling or scrapping.",
  },
];

export function getFixOrSellBand(percent: number): FixOrSellBand {
  return (
    FIX_OR_SELL_BANDS.find((b) => percent >= b.min && percent < b.max) ??
    FIX_OR_SELL_BANDS[FIX_OR_SELL_BANDS.length - 1]
  );
}

export function formatAud(value: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Turns a difficulty % into a plain-language comparison against the benchmark table. */
export function benchmarkPhrase(percent: number): string {
  const sorted = [...DIFFICULTY_BENCHMARKS].sort((a, b) => a.percent - b.percent);
  const below = [...sorted].reverse().find((b) => b.percent <= percent);
  const above = sorted.find((b) => b.percent >= percent);

  if (!below) {
    return `Easier than ${sorted[0].label} (${sorted[0].percent}%)`;
  }
  if (!above) {
    const top = sorted[sorted.length - 1];
    return `Harder than ${top.label} (${top.percent}%)`;
  }
  if (below.label === above.label) {
    return `About the same as ${below.label} (${below.percent}%)`;
  }
  return `Harder than ${below.label} (${below.percent}%), easier than ${above.label} (${above.percent}%)`;
}

export interface ShopScriptItem {
  ask: string;
  why: string;
}

/** Static 10-point script for holding a workshop accountable. */
export const SHOP_SCRIPT: ShopScriptItem[] = [
  {
    ask: "Get the diagnosis in writing before approving any work.",
    why: "A written diagnosis is a baseline you can check the work against.",
  },
  {
    ask: "Ask them to show you the actual fault — fault codes, measurements, the leak.",
    why: "Forces proof, not a 'replace parts and hope' guess.",
  },
  {
    ask: "Ask for the exact parts list — brand and part numbers — before they're fitted.",
    why: "You can verify quality and price and refuse unknown parts.",
  },
  {
    ask: "Ask for labour hours and the hourly rate, itemised separately from parts.",
    why: "Reveals what's labour vs parts so you can compare quotes fairly.",
  },
  {
    ask: "Agree they'll call you before exceeding the quoted amount.",
    why: "Prevents the bill from blowing out without your approval.",
  },
  {
    ask: "Ask for your old parts back.",
    why: "Proof the parts were actually replaced.",
  },
  {
    ask: "Ask what warranty covers parts and labour, and for how long.",
    why: "Accountability for the work after you drive away.",
  },
  {
    ask: "Ask them to road-test the repair with you before you pay.",
    why: "Confirms the fault is actually gone, not just billed.",
  },
  {
    ask: "Ask for a before/after photo or video where relevant.",
    why: "A quick visual record of what was done.",
  },
  {
    ask: "Get the quote, diagnosis and warranty in writing (email is fine).",
    why: "A paper trail protects you if the problem returns.",
  },
];

export interface Procedure {
  id: string;
  title: string;
  when: string;
  steps: string[];
}

/** Static procedure checklists — deterministic reference content, not AI-generated. */
export const PROCEDURE_LIBRARY: Procedure[] = [
  {
    id: "coolant-bleed",
    title: "Cooling system bleed",
    when: "After coolant, hose, thermostat or water-pump work",
    steps: [
      "Ensure the engine is cold — never open a hot cooling system.",
      "Park nose-up (or level) and set the parking brake.",
      "Fill the radiator / expansion tank to the max mark with the correct coolant mix.",
      "Set the heater to full hot so the heater core fills.",
      "Start the engine and idle with the cap off, topping up as the level drops.",
      "Squeeze the main hoses gently to release trapped air bubbles.",
      "Watch for a steady stream with no bubbles once the thermostat opens.",
      "Refit the cap, run the engine and confirm the heater blows hot and the gauge stays in range.",
      "After cooling, recheck the level and top up to the max mark.",
    ],
  },
  {
    id: "clutch-slave",
    title: "Clutch slave cylinder",
    when: "Soft/spongy clutch pedal, fluid loss near the gearbox",
    steps: [
      "Jack and support the car safely; remove the wheel if needed for access.",
      "Locate the slave cylinder on the gearbox and clean around the union.",
      "Place a catch tray, crack the fluid line and let the old fluid drain.",
      "Unbolt the old slave cylinder; note any spacer or pushrod.",
      "Bench-bleed the new cylinder (fill with fresh fluid, cycle the pushrod).",
      "Bolt the new cylinder in and reconnect the line with new copper washers.",
      "Bleed the clutch: pump the pedal and crack the bleed nipple until bubble-free.",
      "Check the pedal feels firm and returns fully; check for leaks at the union.",
      "Top up the fluid reservoir, then road test for smooth gear engagement.",
    ],
  },
  {
    id: "brake-bedding",
    title: "Brake pads + rotors bedding",
    when: "After fitting new pads and/or rotors",
    steps: [
      "Safely jack, support and remove the wheels.",
      "Clean the new rotors with brake cleaner to remove the protective coating.",
      "Compress the caliper piston, fit the new pads, and grease slide points (not the pad face).",
      "Refit calipers and wheels and torque to spec.",
      "Before driving, pump the brake pedal until it feels firm.",
      "Bed-in: from ~60 km/h brake firmly to ~20 km/h, repeated 6–10 times without stopping fully.",
      "Avoid hard stops from high speed and avoid holding the brakes while stationary and hot.",
      "Let the brakes cool, then check for noise, pedal feel and even braking.",
    ],
  },
];
