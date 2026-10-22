import type { DiagnosisInput, DiagnosisResult, EstimatedValue } from "./types";

/**
 * Built-in, deterministic diagnosis engine.
 *
 * This is the "always works" fallback that needs no API key or network. It
 * matches the user's symptom and warning lights against a small set of common
 * failure categories and returns a full, useful answer card. When an OpenAI
 * key is configured, `runDiagnosis` calls the Edge Function instead and this
 * module is only used if that call fails.
 *
 * It is intentionally conservative: lower confidence, "get it inspected" flags,
 * and honest wording — general guidance, not a car-specific verdict.
 */

type Overrides = Partial<DiagnosisResult>;

const BASE: DiagnosisResult = {
  causes: [],
  repair: "",
  parts: [],
  consumables: [],
  costs: { parts: 0, labour: 0, total: 0, diagnostic: 0 },
  difficultyPercent: 30,
  recommendation: "either",
  recommendationReason: "",
  tools: [],
  procedureChecklist: [],
  afterRepairChecks: [],
  roadTest: [],
  confidence: 55,
  requiresPhysicalInspection: true,
  safetyWarning: "",
  estimatedValue: { min: 0, max: 0, note: "" },
};

function build(overrides: Overrides): DiagnosisResult {
  return {
    ...BASE,
    ...overrides,
    costs: { ...BASE.costs, ...(overrides.costs ?? {}) },
    estimatedValue: {
      ...BASE.estimatedValue,
      ...(overrides.estimatedValue ?? {}),
    },
  };
}

function estimateValue(year: number | null, odometerKm: number | null): EstimatedValue {
  const y = year ?? 2012;
  let min = 0;
  let max = 0;

  if (y >= 2021) {
    min = 22000;
    max = 42000;
  } else if (y >= 2016) {
    min = 13000;
    max = 26000;
  } else if (y >= 2011) {
    min = 8000;
    max = 18000;
  } else if (y >= 2006) {
    min = 4000;
    max = 10000;
  } else if (y >= 2001) {
    min = 2000;
    max = 6000;
  } else {
    min = 1000;
    max = 4000;
  }

  if (odometerKm && odometerKm > 200000) {
    min = Math.round(min * 0.8);
    max = Math.round(max * 0.8);
  }

  return {
    min,
    max,
    note: "Rough age-based estimate — verify against RedBook or carsales.",
  };
}

function has(text: string, words: string[]): boolean {
  const t = text.toLowerCase();
  return words.some((w) => t.includes(w));
}

function matchesAny(input: DiagnosisInput, words: string[]): boolean {
  return has(input.symptom, words) || input.warningLights.some((l) => has(l, words));
}

const value = (i: DiagnosisInput) => estimateValue(i.year, i.odometerKm);

interface Rule {
  match: (i: DiagnosisInput) => boolean;
  build: (i: DiagnosisInput) => DiagnosisResult;
}

const RULES: Rule[] = [
  // Brakes
  {
    match: (i) =>
      matchesAny(i, [
        "brake",
        "braking",
        "squeal",
        "squeak",
        "screech",
        "grind",
        "shudder",
        "rotor",
        "disc",
        "pad",
        "spongy",
        "soft pedal",
        "abs",
      ]) || i.warningLights.some((l) => l.includes("Brake")),
    build: (i) =>
      build({
        causes: [
          "Worn front brake pads",
          "Scored or warped brake rotors",
          "Seized caliper slide pins",
          "Worn wheel bearing (if you feel a rumble/wobble)",
        ],
        repair:
          "Replace the brake pads, and machine or replace the rotors if they're scored. Grease the caliper slide pins so the brakes release evenly, then bed the pads in. If the pedal feels soft or spongy, bleed the brake fluid first.",
        parts: ["Front brake pads", "Brake rotors (if scored or below minimum thickness)"],
        consumables: [
          "Brake cleaner",
          "Caliper pin grease",
          "Copper anti-seize",
          "Brake fluid (if bleeding)",
        ],
        costs: { parts: 120, labour: 180, total: 300, diagnostic: 0 },
        difficultyPercent: 40,
        recommendation: "diy",
        recommendationReason:
          "Front pad replacement is one of the more approachable DIY jobs — no special diagnostics needed, just care with jacking and torquing the wheel bolts.",
        tools: [
          "Jack + axle stands",
          "Wheel brace",
          "Socket set",
          "C-clamp or caliper wind-back tool",
          "Torque wrench",
        ],
        procedureChecklist: [
          "Chock the wheels, jack up and support on axle stands.",
          "Remove the wheel and inspect pad thickness and rotor condition.",
          "Compress the caliper piston, fit new pads and grease the slide pins.",
          "Refit the caliper and wheel, torque the wheel bolts.",
          "Pump the brake pedal until firm before moving the car.",
          "Bed the pads in: brake firmly from ~60 km/h to ~20 km/h, 6–10 times.",
        ],
        afterRepairChecks: [
          "Pedal feels firm and the car stops straight.",
          "No grinding or squeal once bedded.",
          "Wheel bolts re-checked after ~50 km.",
        ],
        roadTest: [
          "Brake gently then firmly from speed — listen for noise.",
          "Confirm the steering wheel doesn't pull under braking.",
          "Check the handbrake still holds on a slope.",
        ],
        confidence: 65,
        requiresPhysicalInspection: true,
        safetyWarning:
          "Brakes are safety-critical — if you're not confident, have a mechanic verify the work.",
        estimatedValue: value(i),
      }),
  },

  // Battery / charging / starting
  {
    match: (i) =>
      matchesAny(i, [
        "won't start",
        "wont start",
        "won't crank",
        "crank",
        "cranks",
        "click",
        "clicks",
        "battery",
        "dead",
        "slow start",
        "starter",
        "alternator",
        "charging",
        "dim",
      ]) || i.warningLights.some((l) => l.includes("Battery")),
    build: (i) =>
      build({
        causes: [
          "Flat or failing 12V battery",
          "Corroded or loose battery terminals",
          "Failing alternator (battery not being charged)",
          "Faulty starter motor (single click, no crank)",
        ],
        repair:
          "Charge and load-test the battery, and clean the terminals. If it starts but the voltage drops at idle or the light stays on, suspect the alternator. A single click with no crank usually points to the starter motor or a bad connection.",
        parts: [
          "12V battery (if it fails a load test)",
          "Alternator (if not charging)",
          "Starter motor (if faulty)",
        ],
        consumables: ["Battery terminal cleaner", "Dielectric grease"],
        costs: { parts: 200, labour: 150, total: 350, diagnostic: 60 },
        difficultyPercent: 20,
        recommendation: "diy",
        recommendationReason:
          "A battery swap and terminal clean is quick and low-risk. Diagnosing the alternator just needs a multimeter across the terminals while it runs.",
        tools: ["Multimeter", "Battery terminal brush", "10mm spanner", "Jump leads"],
        procedureChecklist: [
          "Check battery voltage — ~12.6V engine off, ~13.8–14.4V engine running.",
          "Inspect and clean both terminals and the earth strap.",
          "If it won't hold charge, load-test (or have it tested free at an auto store).",
          "If charging voltage is low with the engine running, suspect the alternator.",
          "Replace the battery and reconnect positive first, then negative.",
        ],
        afterRepairChecks: [
          "Engine starts promptly, hot and cold.",
          "Charging voltage in range with the engine running.",
          "No warning light on the dash.",
        ],
        roadTest: [
          "Restart the engine several times.",
          "Turn on headlights and heater — confirm voltage stays stable.",
        ],
        confidence: 60,
        requiresPhysicalInspection: false,
        safetyWarning: "",
        estimatedValue: value(i),
      }),
  },

  // Overheating / cooling
  {
    match: (i) =>
      matchesAny(i, [
        "overheat",
        "overheating",
        "temperature",
        "coolant",
        "steam",
        "boiling",
        "gauge high",
        "heater cold",
        "running hot",
      ]) || i.warningLights.some((l) => l.includes("Temperature")),
    build: (i) =>
      build({
        causes: [
          "Low coolant level or a leak",
          "Stuck-closed thermostat",
          "Failed cooling fan or its relay",
          "Blocked radiator or failed water pump",
        ],
        repair:
          "When the engine is cold, check the coolant level. Pressure-test for leaks. If the fan never comes on, check its fuse and relay. If it overheats at road speed (not just in traffic), suspect the thermostat or water pump. Never open a hot cooling system.",
        parts: ["Thermostat", "Water pump (if leaking or noisy)", "Radiator cap"],
        consumables: ["Coolant", "Hose clamps", "Distilled water"],
        costs: { parts: 180, labour: 220, total: 400, diagnostic: 80 },
        difficultyPercent: 35,
        recommendation: "either",
        recommendationReason:
          "A coolant top-up or thermostat swap is DIY-able, but a proper pressure test to find the leak is quicker at a workshop if you don't have the gear.",
        tools: ["Funnel", "Catch tray", "Multimeter (fan check)", "Basic spanners"],
        procedureChecklist: [
          "Let the engine cool completely.",
          "Check coolant level in the reservoir and look for stains/leaks.",
          "Top up with the correct coolant mix, or pressure-test for the leak.",
          "Verify the cooling fan runs when the engine is hot.",
          "If persistent, replace the thermostat and re-bleed the system.",
        ],
        afterRepairChecks: [
          "Temperature gauge stays in the normal range.",
          "No coolant puddles after parking.",
          "Heater blows hot (means no air lock).",
        ],
        roadTest: [
          "Idle in traffic until the fan cycles.",
          "Drive at highway speed and watch the gauge.",
          "Recheck coolant level once cold.",
        ],
        confidence: 60,
        requiresPhysicalInspection: true,
        safetyWarning:
          "Don't open the cooling system while it's hot — pressurised steam can cause serious burns.",
        estimatedValue: value(i),
      }),
  },

  // Oil / lubrication
  {
    match: (i) =>
      matchesAny(i, [
        "oil light",
        "oil pressure",
        "tapping",
        "knocking",
        "rattle at idle",
        "low oil",
        "oil leak",
      ]) || i.warningLights.some((l) => l.includes("Oil")),
    build: (i) =>
      build({
        causes: [
          "Low engine oil level",
          "Overdue oil change / degraded oil",
          "Oil leak (seals, sump or gasket)",
          "Worn oil pump or bearings (if knocking persists)",
        ],
        repair:
          "Check the oil level immediately and top up or change the oil and filter. If the pressure light is on, stop driving until it's resolved. If a knock or tap continues with correct oil level, have it inspected — it may be the oil pump or worn bearings.",
        parts: ["Engine oil", "Oil filter", "Oil pump (if faulty)"],
        consumables: ["Engine oil", "Sump plug crush washer"],
        costs: { parts: 80, labour: 60, total: 140, diagnostic: 0 },
        difficultyPercent: 10,
        recommendation: "diy",
        recommendationReason:
          "An oil and filter change is a classic first job — inexpensive, quick, and hard to get wrong if you use the right oil.",
        tools: ["Oil drain pan", "Oil filter wrench", "Socket set", "Funnel"],
        procedureChecklist: [
          "Check the dipstick level on level ground.",
          "Drain the old oil and replace the sump washer.",
          "Fit the new filter, then refill to spec.",
          "Run the engine and check for leaks.",
        ],
        afterRepairChecks: [
          "Oil level correct and warning light out.",
          "No new leaks under the car.",
          "Engine noise quieter.",
        ],
        roadTest: [
          "Listen for tapping/knocking at idle and under load.",
          "Check the oil light stays off.",
        ],
        confidence: 55,
        requiresPhysicalInspection: true,
        safetyWarning:
          "Stop driving if the oil pressure light is on — continued running can destroy the engine.",
        estimatedValue: value(i),
      }),
  },

  // Clutch / transmission
  {
    match: (i) =>
      matchesAny(i, [
        "clutch",
        "slip",
        "slipping",
        "gear",
        "gears",
        "shift",
        "shifting",
        "hard to change",
        "transmission",
        "cvt",
        "dct",
        "dsg",
      ]),
    build: (i) =>
      build({
        causes: [
          "Worn clutch (slips under load)",
          "Failed clutch slave cylinder (soft pedal, fluid loss)",
          "Low or contaminated gearbox fluid",
          "Worn synchros (grinds into a specific gear)",
        ],
        repair:
          "If it slips in gear, the clutch is worn. If the pedal is soft or gears grind when cold, check the clutch slave cylinder and fluid first — it's far cheaper than a clutch. Grinding into one gear points to synchros.",
        parts: [
          "Clutch kit (if slipping)",
          "Clutch slave cylinder (if leaking)",
          "Gearbox fluid",
        ],
        consumables: ["Brake/clutch fluid", "Gearbox oil", "Copper washers"],
        costs: { parts: 450, labour: 400, total: 850, diagnostic: 90 },
        difficultyPercent: 65,
        recommendation: "shop",
        recommendationReason:
          "A clutch or gearbox job needs the gearbox out (or special tools and fluids) — best left to a workshop, though a slave-cylinder replacement is a cheaper first port of call.",
        tools: ["Engine support", "Gearbox jack", "Torque wrench", "Line spanners"],
        procedureChecklist: [
          "Check the clutch fluid level and look for leaks at the slave cylinder.",
          "Confirm whether it slips (clutch) or grinds (synchros/fluid).",
          "If the slave is leaking, replace it and bleed the clutch.",
          "If slipping, have the clutch kit inspected/replaced.",
          "Replace gearbox fluid if it's due or contaminated.",
        ],
        afterRepairChecks: [
          "Clutch pedal firm and gears engage cleanly.",
          "No fluid leaks at the slave or gearbox.",
          "Take-up point feels normal.",
        ],
        roadTest: [
          "Pull away in each gear and accelerate hard — no slip.",
          "Change gear at high revs — no grind.",
          "Confirm smooth engagement when hot.",
        ],
        confidence: 60,
        requiresPhysicalInspection: true,
        safetyWarning: "",
        estimatedValue: value(i),
      }),
  },

  // Suspension / steering
  {
    match: (i) =>
      matchesAny(i, [
        "clunk",
        "knock over bumps",
        "wandering",
        "pull",
        "pulling",
        "steering",
        "tyre",
        "tire",
        "bounce",
        "uneven wear",
        "alignment",
        "vibration at speed",
      ]) || i.warningLights.some((l) => l.includes("Tyre")),
    build: (i) =>
      build({
        causes: [
          "Worn ball joint or tie-rod end",
          "Worn control arm bushes",
          "Wheel alignment out",
          "Uneven tyre pressures or tyre wear",
        ],
        repair:
          "Jack up the suspect corner and check for play in the ball joint and tie-rod ends. Replace the worn joints or bushes, then have a wheel alignment done and reset tyre pressures. A clunk over bumps is usually a joint or bush.",
        parts: ["Ball joint / tie-rod end", "Control arm bush", "Tyres (if worn)"],
        consumables: ["Penetrating oil", "Cotter pins", "Anti-seize"],
        costs: { parts: 180, labour: 200, total: 380, diagnostic: 80 },
        difficultyPercent: 45,
        recommendation: "either",
        recommendationReason:
          "Suspension parts are replaceable at home with care, but the required wheel alignment afterwards needs a workshop anyway.",
        tools: ["Jack + axle stands", "Ball-joint separator", "Socket set", "Torque wrench"],
        procedureChecklist: [
          "Check and equalise tyre pressures first — cheapest fix.",
          "Jack up and feel for play at 12 and 6 o'clock (ball joint) and 3 and 9 o'clock (tie rod).",
          "Replace the worn joint or bush.",
          "Book a wheel alignment.",
        ],
        afterRepairChecks: [
          "No clunks over bumps.",
          "Steering feels tight and centred.",
          "Tyres wearing evenly.",
        ],
        roadTest: [
          "Drive over speed bumps listening for clunks.",
          "Hold a straight line on a flat road — no pull.",
          "Check for vibration at highway speed.",
        ],
        confidence: 55,
        requiresPhysicalInspection: true,
        safetyWarning: "",
        estimatedValue: value(i),
      }),
  },

  // Air conditioning / heating
  {
    match: (i) =>
      matchesAny(i, [
        "aircon",
        "air con",
        "air conditioning",
        "a/c",
        "no cold",
        "no heat",
        "heater",
        "blowing hot",
        "blowing warm",
        "regas",
        "re-gas",
      ]),
    build: (i) =>
      build({
        causes: [
          "Low refrigerant (needs a regas)",
          "Faulty or noisy compressor",
          "Blocked cabin/pollen filter",
          "Blend-door or climate-control fault",
        ],
        repair:
          "Check the cabin filter first (cheap and often the culprit for weak airflow). Then have the refrigerant pressure tested — a regas often fixes weak cooling. A seized or noisy compressor needs replacement.",
        parts: ["Cabin/pollen filter", "Refrigerant", "A/C compressor (if failed)"],
        consumables: ["Refrigerant", "PAG oil"],
        costs: { parts: 120, labour: 150, total: 270, diagnostic: 60 },
        difficultyPercent: 20,
        recommendation: "shop",
        recommendationReason:
          "Recharging refrigerant safely needs recovery gear and a licence in most places, so a regas is best done at a workshop.",
        tools: ["Cabin filter access tools", "A/C manifold gauges (workshop)"],
        procedureChecklist: [
          "Replace the cabin filter if it's clogged.",
          "Have refrigerant pressure tested.",
          "Regas if low, and check for leaks.",
          "If the compressor is noisy or seized, replace it.",
        ],
        afterRepairChecks: [
          "Air blows noticeably colder/hotter.",
          "No strange compressor noises.",
          "No musty smell from the vents.",
        ],
        roadTest: [
          "Run the A/C on cold and confirm it cools at idle.",
          "Run the heater on hot and confirm it warms up.",
        ],
        confidence: 55,
        requiresPhysicalInspection: false,
        safetyWarning: "",
        estimatedValue: value(i),
      }),
  },

  // Check engine / running faults
  {
    match: (i) =>
      matchesAny(i, [
        "check engine",
        "misfire",
        "misfiring",
        "rough idle",
        "stalling",
        "stall",
        "power loss",
        "hesitation",
        "hesitate",
        "fuel smell",
        "emissions",
        "splutter",
      ]) || i.warningLights.some((l) => l.includes("Check engine")),
    build: (i) =>
      build({
        causes: [
          "Failed ignition coil or spark plugs",
          "Vacuum or intake leak",
          "Failing oxygen or MAF sensor",
          "Clogged fuel filter",
        ],
        repair:
          "Read the fault codes first — that tells you which cylinder or sensor to look at. Common fixes are a failed coil pack or spark plugs, a vacuum leak, or an oxygen/MAF sensor. Confirm the code before throwing parts at it.",
        parts: ["Spark plugs", "Ignition coil(s)", "Oxygen / MAF sensor (per fault code)"],
        consumables: ["Dielectric grease", "Intake/MAF cleaner"],
        costs: { parts: 150, labour: 120, total: 270, diagnostic: 100 },
        difficultyPercent: 25,
        recommendation: "shop",
        recommendationReason:
          "You need a diagnostic scan tool to read the fault codes and pinpoint the cylinder or sensor — a quick scan at a workshop is cheaper than guessing.",
        tools: ["OBD2 scan tool", "Socket set", "Spark-plug socket"],
        procedureChecklist: [
          "Scan for fault codes and note which one(s) are stored.",
          "If a misfire, swap the suspect coil to a different cylinder and see if the code follows.",
          "Check for split or loose vacuum hoses.",
          "Replace the confirmed faulty part (plugs, coil, or sensor).",
          "Clear the codes and test again.",
        ],
        afterRepairChecks: [
          "Check-engine light stays off.",
          "Idle is smooth and it pulls cleanly.",
          "Fuel economy returns to normal.",
        ],
        roadTest: [
          "Idle, then accelerate hard — no misfire or hesitation.",
          "Drive at highway speed for a few minutes and re-check for the light.",
        ],
        confidence: 55,
        requiresPhysicalInspection: true,
        safetyWarning: "",
        estimatedValue: value(i),
      }),
  },
];

const GENERIC = (i: DiagnosisInput): DiagnosisResult =>
  build({
    causes: [
      "Needs a diagnostic scan to narrow it down",
      "Possibly a sensor or a wear-and-tear item",
      "Could be an intermittent fault",
    ],
    repair:
      "Book a diagnostic scan and physical inspection. Describe the exact conditions — cold start, at speed, when braking — so the mechanic can reproduce it. This avoids replacing parts on a guess.",
    parts: ["To be confirmed after diagnosis"],
    consumables: [],
    costs: { parts: 0, labour: 0, total: 120, diagnostic: 120 },
    difficultyPercent: 25,
    recommendation: "shop",
    recommendationReason:
      "Without a clearer symptom match, a quick diagnostic scan is the cheapest way to avoid guessing.",
    tools: ["OBD2 scan tool (or a workshop scan)"],
    procedureChecklist: [
      "Note exactly when the fault happens and what it sounds/feels like.",
      "Book a diagnostic scan and ask for the fault codes in writing.",
      "Ask the workshop to show you the fault before approving repairs.",
    ],
    afterRepairChecks: [
      "The original symptom is gone.",
      "No new warning lights.",
    ],
    roadTest: [
      "Reproduce your usual drive and confirm the fault is fixed.",
    ],
    confidence: 40,
    requiresPhysicalInspection: true,
    safetyWarning: "",
    estimatedValue: value(i),
  });

export function buildLocalDiagnosis(input: DiagnosisInput): DiagnosisResult {
  const rule = RULES.find((r) => r.match(input));
  const result = rule ? rule.build(input) : GENERIC(input);
  return { ...result, source: "local" };
}
