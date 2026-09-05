/**
 * Deterministic statistics/correlation layer — shared between the client
 * (Stats screen) and the `generate-health-report` Supabase Edge Function
 * (Deno runtime, see #4).
 *
 * Plain, dependency-free TypeScript — no React Native or Deno-specific
 * APIs — so it can be unit tested under plain Jest (like utils/foodHelpers.ts)
 * and imported unmodified from Deno.
 *
 * The AI report generator must never receive raw entry logs: it only ever
 * sees the compact output of the functions below.
 */
import { isSameDay } from '../utils/dateUtils';
import { tagIngredient, IngredientTag } from './ingredientTags';
import type { FoodEntry, WaterEntry, BowelEntry, BristolType } from '../types/tracking';

// ── Daily aggregation ─────────────────────────────────────────────────────────
// Same shape previously computed inline in app/(tabs)/stats.tsx — extracted
// here so the Stats screen and the report engine share one implementation.

/** Past `days` calendar days ending on `referenceDate`, oldest first, each at midnight local time. */
export function buildDateRange(days: number, referenceDate: Date = new Date()): Date[] {
  const end = new Date(referenceDate);
  end.setHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (days - 1 - i));
    return d;
  });
}

/** Total calories per day across `dates`, in order. */
export function computeDailyCalories(dates: Date[], foodEntries: FoodEntry[]): number[] {
  return dates.map((d) =>
    foodEntries
      .filter((e) => isSameDay(new Date(e.timestamp), d))
      .reduce((sum, e) => sum + (e.totalCalories ?? 0), 0),
  );
}

/** Total water volume (ml) per day across `dates`, in order. */
export function computeDailyWater(dates: Date[], waterEntries: WaterEntry[]): number[] {
  return dates.map((d) =>
    waterEntries
      .filter((e) => isSameDay(new Date(e.timestamp), d))
      .reduce((sum, e) => sum + (e.totalVolume ?? e.volumeMl ?? 0), 0),
  );
}

/** Mean of the non-zero values in `dailyValues`, rounded to the nearest integer (0 if none). */
export function computeAverage(dailyValues: number[]): number {
  const days = dailyValues.filter((v) => v > 0);
  return days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0;
}

export type MacroAverages = { protein: number; carbs: number; fat: number };

/** Average daily protein/carbs/fat across food entries falling within `dates`. */
export function computeMacroAverages(dates: Date[], foodEntries: FoodEntry[]): MacroAverages {
  const entries = foodEntries.filter((e) => dates.some((d) => isSameDay(new Date(e.timestamp), d)));
  const daysWithData = new Set(entries.map((e) => new Date(e.timestamp).toDateString())).size || 1;
  const totals = entries.reduce(
    (acc, e) => ({
      protein: acc.protein + (e.totalProtein ?? 0),
      carbs: acc.carbs + (e.totalCarbs ?? 0),
      fat: acc.fat + (e.totalFat ?? 0),
    }),
    { protein: 0, carbs: 0, fat: 0 },
  );
  return {
    protein: totals.protein / daysWithData,
    carbs: totals.carbs / daysWithData,
    fat: totals.fat / daysWithData,
  };
}

/** Bowel entries whose timestamp falls on one of `dates`. */
export function filterEntriesInRange(dates: Date[], bowelEntries: BowelEntry[]): BowelEntry[] {
  return bowelEntries.filter((e) => dates.some((d) => isSameDay(new Date(e.timestamp), d)));
}

/** Count of bowel entries per Bristol type (1–7) within `bowelEntries`. */
export function computeBristolDistribution(bowelEntries: BowelEntry[]): Record<BristolType, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  bowelEntries.forEach((e) => {
    if (e.bristolType != null) counts[e.bristolType]++;
  });
  return counts as Record<BristolType, number>;
}

/** Mean Bristol type across entries that recorded one, to 1 decimal place. Null when none did. */
export function computeAverageBristol(bowelEntries: BowelEntry[]): number | null {
  const withType = bowelEntries.filter((e) => e.bristolType != null);
  if (!withType.length) return null;
  const sum = withType.reduce((acc, e) => acc + (e.bristolType as number), 0);
  return Math.round((sum / withType.length) * 10) / 10;
}

export type DailyAggregates = {
  dates: Date[];
  dailyCalories: number[];
  avgCalories: number;
  dailyWater: number[];
  avgWater: number;
  macroAvgs: MacroAverages;
  bowelInPeriod: BowelEntry[];
  bristolDist: Record<BristolType, number>;
  avgBristol: number | null;
};

/** Convenience wrapper computing every daily-aggregate stat for a date range in one call. */
export function aggregateDailyStats(
  dates: Date[],
  data: { foodEntries: FoodEntry[]; waterEntries: WaterEntry[]; bowelEntries: BowelEntry[] },
): DailyAggregates {
  const dailyCalories = computeDailyCalories(dates, data.foodEntries);
  const dailyWater = computeDailyWater(dates, data.waterEntries);
  const bowelInPeriod = filterEntriesInRange(dates, data.bowelEntries);

  return {
    dates,
    dailyCalories,
    avgCalories: computeAverage(dailyCalories),
    dailyWater,
    avgWater: computeAverage(dailyWater),
    macroAvgs: computeMacroAverages(dates, data.foodEntries),
    bowelInPeriod,
    bristolDist: computeBristolDistribution(bowelInPeriod),
    avgBristol: computeAverageBristol(bowelInPeriod),
  };
}

// ── Correlation engine ────────────────────────────────────────────────────────
// AI never computes correlations — it only narrates the compact output below.

/** Source of a tagged ingredient exposure. Generic so sleep/activity can plug in later. */
export type EntryType = 'food' | 'water';

export type TriggerExposure = {
  entryType: EntryType;
  tag: IngredientTag;
  timestamp: string; // ISO date-time the ingredient was consumed
};

/**
 * Flattens food/water entries into one tagged exposure per (entry, tag) pair.
 * Multiple ingredients in the same entry sharing a tag collapse to a single
 * exposure — presence, not count, is what correlation windows test.
 */
export function extractTriggerExposures(
  foodEntries: Pick<FoodEntry, 'timestamp' | 'ingredients'>[],
  waterEntries: Pick<WaterEntry, 'timestamp' | 'ingredients'>[],
): TriggerExposure[] {
  const exposures: TriggerExposure[] = [];

  const collect = (entryType: EntryType, entries: Pick<FoodEntry | WaterEntry, 'timestamp' | 'ingredients'>[]) => {
    entries.forEach((entry) => {
      const tags = new Set<IngredientTag>();
      entry.ingredients.forEach((ing) => tagIngredient(ing.name).forEach((t) => tags.add(t)));
      tags.forEach((tag) => exposures.push({ entryType, tag, timestamp: entry.timestamp }));
    });
  };

  collect('food', foodEntries);
  collect('water', waterEntries);

  return exposures;
}

export type OutcomeDefinition = {
  id: string;
  label: string;
  predicate: (entry: BowelEntry) => boolean;
};

/** The three adverse outcomes defined in the correlation-engine decision record (#1). */
export const DEFAULT_OUTCOMES: readonly OutcomeDefinition[] = [
  {
    id: 'bristol_urgent',
    label: 'Bristol Type 6–7 (loose/watery)',
    predicate: (e) => e.bristolType != null && e.bristolType >= 6,
  },
  {
    id: 'high_pain',
    label: 'Pain level ≥ 5',
    predicate: (e) => e.painLevel >= 5,
  },
  {
    id: 'has_blood',
    label: 'Blood present',
    predicate: (e) => e.hasBlood === true,
  },
];

/** Lag/lookback windows tested per tag/outcome pair, in hours (proposed in #1). */
export const LOOKBACK_WINDOWS_HOURS: readonly number[] = [6, 12, 24, 48];

/** Minimum number of exposed events required before a correlation is surfaced (proposed in #1). */
export const MIN_EXPOSED_SAMPLE_SIZE = 5;

export type CorrelationResult = {
  entryType: EntryType;
  tag: IngredientTag;
  outcomeId: string;
  outcomeLabel: string;
  windowHours: number;
  exposedCount: number;      // bowel events with the tag present in the lookback window
  unexposedCount: number;    // bowel events without it
  observedRate: number;      // adverse-outcome rate when exposed
  baselineRate: number;      // adverse-outcome rate when not exposed
  /**
   * observedRate / baselineRate. When baselineRate is 0 and observedRate > 0
   * the ratio is undefined (division by zero) but the signal is real, so we
   * return Number.POSITIVE_INFINITY rather than NaN. Callers that serialize
   * to JSON (e.g. the Edge Function's jsonb payload) should clamp this.
   * When both rates are 0 there is no signal either way, so lift is 0.
   */
  lift: number;
};

/** Was there a tagged exposure of `tag` in the `windowHours` before `timestamp`? */
function wasExposedInWindow(
  exposures: TriggerExposure[],
  tag: IngredientTag,
  timestamp: string,
  windowHours: number,
): boolean {
  const t = new Date(timestamp).getTime();
  const windowMs = windowHours * 60 * 60 * 1000;
  return exposures.some(
    (ex) =>
      ex.tag === tag &&
      new Date(ex.timestamp).getTime() < t &&
      new Date(ex.timestamp).getTime() >= t - windowMs,
  );
}

/**
 * Builds a 2×2 contingency table (trigger present/absent × adverse/not) for
 * every tag present in `exposures`, crossed with every outcome and lookback
 * window, and computes observed/baseline rates and lift.
 *
 * Results below `minSampleSize` exposed events are discarded — the primary
 * guard against reporting noise as signal.
 */
export function computeCorrelations(
  bowelEntries: BowelEntry[],
  exposures: TriggerExposure[],
  options?: {
    outcomes?: readonly OutcomeDefinition[];
    windows?: readonly number[];
    minSampleSize?: number;
  },
): CorrelationResult[] {
  const outcomes = options?.outcomes ?? DEFAULT_OUTCOMES;
  const windows = options?.windows ?? LOOKBACK_WINDOWS_HOURS;
  const minSampleSize = options?.minSampleSize ?? MIN_EXPOSED_SAMPLE_SIZE;

  // Only bowel entries with a valid timestamp participate; each carries its
  // own exposure tag map (entryType, since a tag might come from food or
  // water — recorded on the exposure, not the outcome).
  const tagsByEntryType = new Map<IngredientTag, EntryType>();
  exposures.forEach((ex) => {
    if (!tagsByEntryType.has(ex.tag)) tagsByEntryType.set(ex.tag, ex.entryType);
  });

  const results: CorrelationResult[] = [];

  for (const [tag, entryType] of tagsByEntryType) {
    for (const outcome of outcomes) {
      for (const windowHours of windows) {
        let exposedAdverse = 0;
        let exposedTotal = 0;
        let unexposedAdverse = 0;
        let unexposedTotal = 0;

        for (const entry of bowelEntries) {
          const adverse = outcome.predicate(entry);
          const exposed = wasExposedInWindow(exposures, tag, entry.timestamp, windowHours);
          if (exposed) {
            exposedTotal++;
            if (adverse) exposedAdverse++;
          } else {
            unexposedTotal++;
            if (adverse) unexposedAdverse++;
          }
        }

        if (exposedTotal < minSampleSize) continue; // guard against noise

        const observedRate = exposedTotal > 0 ? exposedAdverse / exposedTotal : 0;
        const baselineRate = unexposedTotal > 0 ? unexposedAdverse / unexposedTotal : 0;
        const lift = baselineRate > 0 ? observedRate / baselineRate : observedRate > 0 ? Number.POSITIVE_INFINITY : 0;

        results.push({
          entryType,
          tag,
          outcomeId: outcome.id,
          outcomeLabel: outcome.label,
          windowHours,
          exposedCount: exposedTotal,
          unexposedCount: unexposedTotal,
          observedRate,
          baselineRate,
          lift,
        });
      }
    }
  }

  return results;
}
