// Token Radar's five signals, one function each.
//
// radar-2 scores a launch from the protocol's own record alone: its locked value, its
// seven-day move, how long it has run with no token, how many chains it reaches, and how
// fast it accumulated value. Each signal below is a pure function of those figures plus
// the model's constants, so the dashboard can quote every step and a second run of the
// scorer lands on the same board, byte for byte.
//
// The constants live in lib/model.ts (MODEL); the helpers here take them as an argument
// instead of importing them, so this file can be tested on its own against any tuning.

/** The five constants the signals read: the same shape MODEL has in lib/model.ts. */
export interface SignalConstants {
  base_multiple: number;
  growth_weight: number;
  growth_floor: number;
  growth_cap: number;
  maturity_floor: number;
  maturity_range: number;
  maturity_days: number;
  unknown_age_days: number;
  breadth_per_chain: number;
  breadth_max_chains: number;
  velocity_baseline: number;
  velocity_scale: number;
  velocity_floor: number;
  velocity_cap: number;
  min_age_days: number;
}

/** Keep `value` inside [low, high]. */
export function clamp(value: number, low: number, high: number): number {
  if (value < low) return low;
  if (value > high) return high;
  return value;
}

/** A launch priced at a quarter of locked value: the base every other signal multiplies. */
export function baseValue(tvlUsd: number, constants: SignalConstants): number {
  return tvlUsd * constants.base_multiple;
}

/** The seven-day TVL move, clamped, as a percentage: -60% at the floor, +120% at the cap. */
export function growthPercent(change7d: number | null, constants: SignalConstants): number {
  const raw = typeof change7d === 'number' && Number.isFinite(change7d) ? change7d : 0;
  return clamp(raw, constants.growth_floor, constants.growth_cap);
}

/** Growth's multiplier: a +120% week is worth +60% on the base, a -60% week costs 30%. */
export function growthMultiplier(growthPct: number, constants: SignalConstants): number {
  return 1 + (growthPct / 100) * constants.growth_weight;
}

/** Days since listing, or the unknown-age fallback when the snapshot names no date. */
export function ageForScoring(ageDays: number | null, constants: SignalConstants): number {
  return ageDays ?? constants.unknown_age_days;
}

/**
 * Maturity's multiplier: a protocol that has run three years with no token earns the
 * full range above the floor; a newborn sits at the floor. Age is capped at the range's
 * length, so no protocol can out-age the model.
 */
export function maturityMultiplier(ageDays: number, constants: SignalConstants): number {
  const capped = clamp(Math.max(ageDays, 0), 0, constants.maturity_days);
  return constants.maturity_floor + (capped / constants.maturity_days) * constants.maturity_range;
}

/**
 * Breadth's multiplier: each extra chain past the first adds two percent, up to five
 * chains. A protocol live on more chains reaches more farmers, and the board says so.
 */
export function breadthMultiplier(chainCount: number, constants: SignalConstants): number {
  const extra = clamp(chainCount - 1, 0, constants.breadth_max_chains);
  return 1 + extra * constants.breadth_per_chain;
}

/** Dollars of TVL won per day listed: the accumulator's speed, floored at ninety days. */
export function tvlPerDay(tvlUsd: number, ageDays: number, constants: SignalConstants): number {
  return tvlUsd / Math.max(ageDays, constants.min_age_days);
}

/**
 * Velocity's multiplier: a protocol winning a million dollars a day over the baseline
 * earns up to +10%; a slow one loses up to 5%. The baseline is what an ordinary
 * protocol wins a day, so most of the board sits near 1.00 here.
 */
export function velocityMultiplier(tvlPerDayUsd: number, constants: SignalConstants): number {
  const shift = (tvlPerDayUsd - constants.velocity_baseline) / constants.velocity_scale;
  return 1 + clamp(shift, constants.velocity_floor, constants.velocity_cap);
}

/** The five multipliers and the implied value, from one protocol's own figures. */
export function scoreSignals(
  tvlUsd: number,
  change7d: number | null,
  ageDays: number | null,
  chainCount: number,
  constants: SignalConstants,
): {
  implied: number;
  growthPct: number;
  growthMult: number;
  maturityMult: number;
  breadthMult: number;
  velocityMult: number;
  tvlPerDay: number;
  age: number | null;
} {
  const growthPct = growthPercent(change7d, constants);
  const growthMult = growthMultiplier(growthPct, constants);
  const age = ageForScoring(ageDays, constants);
  const maturityMult = maturityMultiplier(age, constants);
  const breadthMult = breadthMultiplier(chainCount, constants);
  const perDay = tvlPerDay(tvlUsd, age, constants);
  const velocityMult = velocityMultiplier(perDay, constants);
  const base = baseValue(tvlUsd, constants);
  const implied = Math.max(1, Math.round(base * growthMult * maturityMult * breadthMult * velocityMult));
  return {
    implied,
    growthPct,
    growthMult,
    maturityMult,
    breadthMult,
    velocityMult,
    tvlPerDay: Math.round(perDay),
    age: ageDays,
  };
}
