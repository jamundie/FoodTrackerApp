/**
 * Pure builder turning tracking data into spreadsheet rows (one array per sheet).
 * No RN/native imports so it can be unit tested under plain Jest; the xlsx
 * writing and file sharing live in utils/exportWorkbook.ts.
 */
import {
  buildDateRange,
  aggregateDailyStats,
  computeCorrelations,
  extractTriggerExposures,
  MIN_EXPOSED_SAMPLE_SIZE,
} from './insightsEngine';
import { tagIngredient } from './ingredientTags';
import { toDateOnly } from '../utils/dateUtils';
import type { ExportRange } from '../utils/dateUtils';
import type {
  TrackingData,
  UserProfile,
  FoodEntry,
  WaterEntry,
  BowelEntry,
  Ingredient,
} from '../types/tracking';
import { BOWEL_URGENCY_LABELS, VOLUME_PRESETS } from '../types/tracking';

export type Cell = string | number | boolean | null;
export type SheetRows = Cell[][];

export type ExportSheets = {
  food: SheetRows;
  water: SheetRows;
  bowel: SheetRows;
  dailySummary: SheetRows;
  patterns: SheetRows;
};

// Matches LOOKBACK_BUFFER_DAYS in the generate-health-report Edge Function.
const LOOKBACK_BUFFER_MS = 2 * 24 * 60 * 60 * 1000;

const MAX_DAYS = 3660; // guards against absurd all-time ranges from bad timestamps

const pad = (n: number) => n.toString().padStart(2, '0');
const timeOnly = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const round1 = (n: number) => Math.round(n * 10) / 10;

const inRange = (timestamp: string, range: ExportRange) => {
  const t = new Date(timestamp).getTime();
  return !Number.isNaN(t) && t >= range.start.getTime() && t <= range.end.getTime();
};

const byTimestamp = <T extends { timestamp: string }>(a: T, b: T) =>
  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();

const formatIngredients = (ingredients: Ingredient[]): string =>
  ingredients.map((i) => `${i.name} (${i.amount} ${i.unit})`).join('; ');

const ingredientTags = (ingredients: Ingredient[]): string => {
  const tags = new Set<string>();
  ingredients.forEach((i) => tagIngredient(i.name).forEach((t) => tags.add(t)));
  return Array.from(tags).join(', ');
};

const yesNo = (v: boolean) => (v ? 'Yes' : 'No');

function buildFoodSheet(entries: FoodEntry[]): SheetRows {
  const header: Cell[] = [
    'Date', 'Time', 'Meal', 'Category', 'Calories (kcal)', 'Protein (g)',
    'Carbs (g)', 'Fat (g)', 'Fibre (g)', 'Ingredients', 'Trigger tags',
  ];
  const rows = entries.map((e): Cell[] => {
    const d = new Date(e.timestamp);
    return [
      toDateOnly(d), timeOnly(d), e.mealName, e.category,
      e.totalCalories ?? null, e.totalProtein ?? null, e.totalCarbs ?? null,
      e.totalFat ?? null, e.totalFiber ?? null,
      formatIngredients(e.ingredients), ingredientTags(e.ingredients),
    ];
  });
  return [header, ...rows];
}

function buildWaterSheet(entries: WaterEntry[]): SheetRows {
  const header: Cell[] = [
    'Date', 'Time', 'Entry', 'Container', 'Preset volume (ml)', 'Total volume (ml)', 'Extra ingredients',
  ];
  const rows = entries.map((e): Cell[] => {
    const d = new Date(e.timestamp);
    const preset = VOLUME_PRESETS.find((p) => p.id === e.volumePresetId);
    return [
      toDateOnly(d), timeOnly(d), e.entryName, preset?.label ?? e.volumePresetId,
      e.volumeMl ?? null, e.totalVolume ?? e.volumeMl ?? null,
      formatIngredients(e.ingredients),
    ];
  });
  return [header, ...rows];
}

function buildBowelSheet(entries: BowelEntry[]): SheetRows {
  const header: Cell[] = [
    'Date', 'Time', 'False alarm', 'Bristol type', 'Urgency', 'Blood present', 'Pain (0-10)', 'Notes',
  ];
  const rows = entries.map((e): Cell[] => {
    const d = new Date(e.timestamp);
    return [
      toDateOnly(d), timeOnly(d), yesNo(e.falseAlarm), e.bristolType ?? null,
      BOWEL_URGENCY_LABELS[e.urgency] ?? e.urgency, yesNo(e.hasBlood),
      e.painLevel, e.notes ?? null,
    ];
  });
  return [header, ...rows];
}

function buildDailySummarySheet(
  dates: Date[],
  food: FoodEntry[],
  water: WaterEntry[],
  bowel: BowelEntry[],
  profile: UserProfile | null | undefined,
): SheetRows {
  const header: Cell[] = [
    'Date', 'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Water (ml)',
    'Calorie goal met', 'Water goal met', 'Bowel entries', 'Avg Bristol', 'Max pain', 'Blood present',
  ];

  const rows = dates.map((day): Cell[] => {
    const key = toDateOnly(day);
    const dayFood = food.filter((e) => toDateOnly(new Date(e.timestamp)) === key);
    const dayWater = water.filter((e) => toDateOnly(new Date(e.timestamp)) === key);
    const dayBowel = bowel.filter((e) => toDateOnly(new Date(e.timestamp)) === key);

    const sum = (pick: (e: FoodEntry) => number | undefined) =>
      dayFood.reduce((s, e) => s + (pick(e) ?? 0), 0);
    const calories = sum((e) => e.totalCalories);
    const waterMl = dayWater.reduce((s, e) => s + (e.totalVolume ?? e.volumeMl ?? 0), 0);

    const typed = dayBowel.filter((e) => e.bristolType != null);
    const avgBristol = typed.length
      ? round1(typed.reduce((s, e) => s + (e.bristolType as number), 0) / typed.length)
      : null;

    const calorieGoal = profile?.dailyCalorieGoal;
    const waterGoal = profile?.dailyWaterGoalMl;

    return [
      key, calories, round1(sum((e) => e.totalProtein)), round1(sum((e) => e.totalCarbs)),
      round1(sum((e) => e.totalFat)), waterMl,
      calorieGoal ? yesNo(calories >= calorieGoal) : null,
      waterGoal ? yesNo(waterMl >= waterGoal) : null,
      dayBowel.length, avgBristol,
      dayBowel.length ? Math.max(...dayBowel.map((e) => e.painLevel)) : null,
      dayBowel.length ? yesNo(dayBowel.some((e) => e.hasBlood)) : null,
    ];
  });

  return [header, ...rows];
}

/** Infinite lift (no baseline events) can't be stored in a cell, so label it. */
const formatLift = (lift: number): Cell => (Number.isFinite(lift) ? round1(lift) : 'n/a (no baseline)');
const pct = (rate: number): number => Math.round(rate * 1000) / 10;

function buildPatternsSheet(
  dates: Date[],
  data: TrackingData,
  bufferedFood: FoodEntry[],
  bufferedWater: WaterEntry[],
  food: FoodEntry[],
  bowel: BowelEntry[],
): SheetRows {
  const stats = aggregateDailyStats(dates, {
    foodEntries: food,
    waterEntries: data.waterEntries,
    bowelEntries: bowel,
  });

  const rows: SheetRows = [];

  rows.push(['OVERVIEW', null, null]);
  rows.push(['Metric', 'Value', null]);
  rows.push(['Days in period', dates.length, null]);
  rows.push(['Avg calories per logged day (kcal)', stats.avgCalories, null]);
  rows.push(['Avg water per logged day (ml)', stats.avgWater, null]);
  rows.push(['Avg protein per logged day (g)', round1(stats.macroAvgs.protein), null]);
  rows.push(['Avg carbs per logged day (g)', round1(stats.macroAvgs.carbs), null]);
  rows.push(['Avg fat per logged day (g)', round1(stats.macroAvgs.fat), null]);
  rows.push(['Bowel entries', bowel.length, null]);
  rows.push(['False alarms', bowel.filter((e) => e.falseAlarm).length, null]);
  rows.push(['Entries with blood', bowel.filter((e) => e.hasBlood).length, null]);
  rows.push(['Entries with pain >= 5', bowel.filter((e) => e.painLevel >= 5).length, null]);
  rows.push(['Avg Bristol type', stats.avgBristol, null]);
  rows.push([]);

  rows.push(['BRISTOL DISTRIBUTION', null, null]);
  rows.push(['Type', 'Count', null]);
  ([1, 2, 3, 4, 5, 6, 7] as const).forEach((t) => rows.push([`Type ${t}`, stats.bristolDist[t], null]));
  rows.push([]);

  const exposures = extractTriggerExposures(bufferedFood, bufferedWater);
  // Rows with no adverse outcome after exposure carry no signal and would bury the findings.
  const correlations = computeCorrelations(bowel, exposures)
    .filter((c) => c.observedRate > 0)
    .sort((a, b) => {
      // Infinity - Infinity is NaN, so compare explicitly.
      if (a.lift !== b.lift) return b.lift > a.lift ? 1 : -1;
      return b.observedRate - a.observedRate || b.exposedCount - a.exposedCount;
    });

  rows.push(['TRIGGER CORRELATIONS', null, null, null, null, null, null, null]);
  rows.push([
    'Trigger', 'Outcome', 'Lookback (h)', 'Exposed events', 'Rate when exposed (%)',
    'Baseline rate (%)', 'Lift', 'Source',
  ]);
  if (correlations.length) {
    correlations.forEach((c) =>
      rows.push([
        c.tag, c.outcomeLabel, c.windowHours, c.exposedCount, pct(c.observedRate),
        pct(c.baselineRate), formatLift(c.lift), c.entryType,
      ]),
    );
  } else {
    rows.push([
      `No correlations surfaced: each trigger needs at least ${MIN_EXPOSED_SAMPLE_SIZE} bowel events following it, and an adverse outcome after it. Try a longer period.`,
    ]);
  }
  rows.push([]);
  rows.push([
    'Lift = rate when exposed / baseline rate. Correlation is not causation; discuss persistent symptoms with a clinician.',
  ]);

  return rows;
}

/** Builds every sheet for the chosen range from in-memory tracking data. */
export function buildExportSheets(
  data: TrackingData,
  userProfile: UserProfile | null | undefined,
  range: ExportRange,
): ExportSheets {
  const food = data.foodEntries.filter((e) => inRange(e.timestamp, range)).sort(byTimestamp);
  const water = data.waterEntries.filter((e) => inRange(e.timestamp, range)).sort(byTimestamp);
  const bowel = data.bowelEntries.filter((e) => inRange(e.timestamp, range)).sort(byTimestamp);

  const dayCount = Math.min(
    MAX_DAYS,
    Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000)),
  );
  const dates = buildDateRange(dayCount, range.end);

  // Food/water widened before the range start so early bowel events still see their lookback window.
  const bufferStart = range.start.getTime() - LOOKBACK_BUFFER_MS;
  const inBuffer = (ts: string) => {
    const t = new Date(ts).getTime();
    return !Number.isNaN(t) && t >= bufferStart && t <= range.end.getTime();
  };
  const bufferedFood = data.foodEntries.filter((e) => inBuffer(e.timestamp));
  const bufferedWater = data.waterEntries.filter((e) => inBuffer(e.timestamp));

  return {
    food: buildFoodSheet(food),
    water: buildWaterSheet(water),
    bowel: buildBowelSheet(bowel),
    dailySummary: buildDailySummarySheet(dates, food, water, bowel, userProfile),
    patterns: buildPatternsSheet(dates, data, bufferedFood, bufferedWater, food, bowel),
  };
}

/** Filename like health-export-2026-09-29-to-2026-10-05.xlsx */
export function buildExportFilename(range: ExportRange): string {
  return `health-export-${toDateOnly(range.start)}-to-${toDateOnly(range.end)}.xlsx`;
}
