import {
  buildDateRange,
  computeDailyCalories,
  computeDailyWater,
  computeAverage,
  computeMacroAverages,
  filterEntriesInRange,
  computeBristolDistribution,
  computeAverageBristol,
  aggregateDailyStats,
  extractTriggerExposures,
  computeCorrelations,
  DEFAULT_OUTCOMES,
  MIN_EXPOSED_SAMPLE_SIZE,
} from '../../lib/insightsEngine';
import type { FoodEntry, WaterEntry, BowelEntry } from '../../types/tracking';
import type { Ingredient } from '../../types/ingredient';

// ── test helpers ───────────────────────────────────────────────────────────

const ing = (name: string): Ingredient => ({
  id: `ing-${name}`,
  name,
  amount: 100,
  unit: 'g',
});

const foodEntry = (timestamp: string, ingredients: string[], calories = 0): FoodEntry => ({
  id: `food-${timestamp}`,
  mealName: 'Test meal',
  category: 'Other',
  timestamp,
  ingredients: ingredients.map(ing),
  totalCalories: calories,
});

const waterEntry = (timestamp: string, volumeMl = 250): WaterEntry => ({
  id: `water-${timestamp}`,
  entryName: 'Test drink',
  timestamp,
  ingredients: [],
  volumePresetId: 'glass',
  volumeMl,
  totalVolume: volumeMl,
});

const bowelEntry = (
  timestamp: string,
  overrides: Partial<BowelEntry> = {},
): BowelEntry => ({
  id: `bowel-${timestamp}`,
  timestamp,
  falseAlarm: false,
  bristolType: 4,
  urgency: 'none',
  hasBlood: false,
  painLevel: 0,
  ...overrides,
});

describe('insightsEngine — daily aggregation', () => {
  describe('buildDateRange', () => {
    test('returns `days` dates ending on the reference date, oldest first', () => {
      const ref = new Date('2026-01-10T15:00:00Z');
      const dates = buildDateRange(3, ref);
      expect(dates).toHaveLength(3);
      expect(dates[2].getDate()).toBe(ref.getDate());
      expect(dates[0].getDate()).toBe(ref.getDate() - 2);
    });

    test('each date is normalised to midnight local time', () => {
      const dates = buildDateRange(2, new Date('2026-01-10T15:30:00Z'));
      dates.forEach((d) => {
        expect(d.getHours()).toBe(0);
        expect(d.getMinutes()).toBe(0);
      });
    });
  });

  describe('computeDailyCalories', () => {
    test('sums calories per matching day, 0 for days with no entries', () => {
      const dates = buildDateRange(2, new Date('2026-01-02T00:00:00'));
      const entries = [
        foodEntry(new Date(dates[1].getTime() + 3600_000).toISOString(), ['Chicken'], 500),
        foodEntry(new Date(dates[1].getTime() + 7200_000).toISOString(), ['Rice'], 300),
      ];
      const result = computeDailyCalories(dates, entries);
      expect(result).toEqual([0, 800]);
    });
  });

  describe('computeDailyWater', () => {
    test('prefers totalVolume, falls back to volumeMl', () => {
      const dates = buildDateRange(1, new Date('2026-01-02T00:00:00'));
      const day = dates[0];
      const entries: WaterEntry[] = [
        { ...waterEntry(new Date(day.getTime() + 1000).toISOString(), 250), totalVolume: 300 },
        { ...waterEntry(new Date(day.getTime() + 2000).toISOString(), 150), totalVolume: undefined },
      ];
      expect(computeDailyWater(dates, entries)).toEqual([450]);
    });
  });

  describe('computeAverage', () => {
    test('averages only non-zero days', () => {
      expect(computeAverage([0, 100, 200, 0])).toBe(150);
    });

    test('returns 0 when all days are 0', () => {
      expect(computeAverage([0, 0, 0])).toBe(0);
    });
  });

  describe('computeMacroAverages', () => {
    test('averages macros across days that have food data', () => {
      const dates = buildDateRange(2, new Date('2026-01-02T00:00:00'));
      const entries: FoodEntry[] = [
        { ...foodEntry(new Date(dates[0].getTime() + 1000).toISOString(), ['A']), totalProtein: 10, totalCarbs: 20, totalFat: 5 },
        { ...foodEntry(new Date(dates[1].getTime() + 1000).toISOString(), ['B']), totalProtein: 20, totalCarbs: 40, totalFat: 15 },
      ];
      const result = computeMacroAverages(dates, entries);
      expect(result).toEqual({ protein: 15, carbs: 30, fat: 10 });
    });
  });

  describe('filterEntriesInRange / bristol distribution / average', () => {
    test('filters bowel entries to the date range and computes distribution + average', () => {
      const dates = buildDateRange(1, new Date('2026-01-02T00:00:00'));
      const day = dates[0];
      const inRange = [
        bowelEntry(new Date(day.getTime() + 1000).toISOString(), { bristolType: 4 }),
        bowelEntry(new Date(day.getTime() + 2000).toISOString(), { bristolType: 6 }),
      ];
      const outOfRange = [bowelEntry('2020-01-01T00:00:00.000Z', { bristolType: 1 })];

      const filtered = filterEntriesInRange(dates, [...inRange, ...outOfRange]);
      expect(filtered).toHaveLength(2);

      const dist = computeBristolDistribution(filtered);
      expect(dist[4]).toBe(1);
      expect(dist[6]).toBe(1);
      expect(dist[1]).toBe(0);

      expect(computeAverageBristol(filtered)).toBe(5);
    });

    test('computeAverageBristol returns null when no entries recorded a type', () => {
      const entries = [bowelEntry('2026-01-01T00:00:00.000Z', { falseAlarm: true, bristolType: undefined })];
      expect(computeAverageBristol(entries)).toBeNull();
    });
  });

  describe('aggregateDailyStats', () => {
    test('combines all daily aggregate stats for a date range', () => {
      const dates = buildDateRange(1, new Date('2026-01-02T00:00:00'));
      const day = dates[0];
      const data = {
        foodEntries: [{ ...foodEntry(new Date(day.getTime() + 1000).toISOString(), ['A']), totalCalories: 400 }],
        waterEntries: [waterEntry(new Date(day.getTime() + 1000).toISOString(), 500)],
        bowelEntries: [bowelEntry(new Date(day.getTime() + 1000).toISOString(), { bristolType: 4 })],
      };
      const result = aggregateDailyStats(dates, data);
      expect(result.avgCalories).toBe(400);
      expect(result.avgWater).toBe(500);
      expect(result.bowelInPeriod).toHaveLength(1);
      expect(result.avgBristol).toBe(4);
    });
  });
});

describe('insightsEngine — correlation engine', () => {
  describe('extractTriggerExposures', () => {
    test('produces one exposure per tag per entry, deduping tags within an entry', () => {
      const entries = [foodEntry('2026-01-01T08:00:00.000Z', ['Milk', 'Cheese'])];
      const exposures = extractTriggerExposures(entries, []);
      const dairyExposures = exposures.filter((e) => e.tag === 'dairy');
      expect(dairyExposures).toHaveLength(1);
      expect(dairyExposures[0].entryType).toBe('food');
    });

    test('produces no exposures for untagged ingredients', () => {
      const entries = [foodEntry('2026-01-01T08:00:00.000Z', ['Chicken breast'])];
      expect(extractTriggerExposures(entries, [])).toHaveLength(0);
    });
  });

  describe('computeCorrelations — contingency table + lift', () => {
    // 6 bowel events exposed to "dairy" within 6h, all adverse (bristol >= 6)
    // 4 unexposed bowel events, none adverse.
    function buildDairyScenario() {
      const foodEntries = Array.from({ length: MIN_EXPOSED_SAMPLE_SIZE + 1 }, (_, i) =>
        foodEntry(`2026-01-0${i + 1}T08:00:00.000Z`, ['Milk']),
      );
      const exposedBowel = Array.from({ length: MIN_EXPOSED_SAMPLE_SIZE + 1 }, (_, i) =>
        bowelEntry(`2026-01-0${i + 1}T10:00:00.000Z`, { bristolType: 7 }), // 2h after milk, adverse
      );
      const unexposedBowel = Array.from({ length: 4 }, (_, i) =>
        bowelEntry(`2026-02-0${i + 1}T10:00:00.000Z`, { bristolType: 4 }), // far from any exposure, not adverse
      );
      const exposures = extractTriggerExposures(foodEntries, []);
      return { bowelEntries: [...exposedBowel, ...unexposedBowel], exposures };
    }

    test('meeting minimum sample size surfaces the correlation with correct rates and lift', () => {
      const { bowelEntries, exposures } = buildDairyScenario();
      const results = computeCorrelations(bowelEntries, exposures, { windows: [6] });

      const bristolResult = results.find((r) => r.tag === 'dairy' && r.outcomeId === 'bristol_urgent');
      expect(bristolResult).toBeDefined();
      expect(bristolResult!.exposedCount).toBe(MIN_EXPOSED_SAMPLE_SIZE + 1);
      expect(bristolResult!.unexposedCount).toBe(4);
      expect(bristolResult!.observedRate).toBe(1);
      expect(bristolResult!.baselineRate).toBe(0);
      // baselineRate is 0 and observedRate > 0 -> lift is +Infinity
      expect(bristolResult!.lift).toBe(Number.POSITIVE_INFINITY);
    });

    test('below-minimum-sample-size results are discarded', () => {
      const foodEntries = [foodEntry('2026-01-01T08:00:00.000Z', ['Milk'])]; // only 1 exposure
      const bowelEntries = [bowelEntry('2026-01-01T10:00:00.000Z', { bristolType: 7 })];
      const exposures = extractTriggerExposures(foodEntries, []);

      const results = computeCorrelations(bowelEntries, exposures, { windows: [6] });
      expect(results.find((r) => r.tag === 'dairy')).toBeUndefined();
    });

    test('zero-baseline edge case: both rates 0 yields lift 0, not NaN/Infinity', () => {
      const foodEntries = Array.from({ length: MIN_EXPOSED_SAMPLE_SIZE }, (_, i) =>
        foodEntry(`2026-01-0${i + 1}T08:00:00.000Z`, ['Milk']),
      );
      const exposedBowel = Array.from({ length: MIN_EXPOSED_SAMPLE_SIZE }, (_, i) =>
        bowelEntry(`2026-01-0${i + 1}T10:00:00.000Z`, { bristolType: 4 }), // not adverse
      );
      const unexposedBowel = [bowelEntry('2026-02-01T10:00:00.000Z', { bristolType: 3 })]; // not adverse
      const exposures = extractTriggerExposures(foodEntries, []);

      const results = computeCorrelations([...exposedBowel, ...unexposedBowel], exposures, { windows: [6] });
      const result = results.find((r) => r.tag === 'dairy' && r.outcomeId === 'bristol_urgent');
      expect(result).toBeDefined();
      expect(result!.observedRate).toBe(0);
      expect(result!.baselineRate).toBe(0);
      expect(result!.lift).toBe(0);
    });

    test('multi-window testing: exposures outside the window are excluded from that window', () => {
      const foodEntries = Array.from({ length: MIN_EXPOSED_SAMPLE_SIZE }, (_, i) =>
        foodEntry(`2026-01-0${i + 1}T00:00:00.000Z`, ['Milk']),
      );
      // Bowel events 20h after exposure — inside the 24h window, outside the 6h window
      const bowelEntries = Array.from({ length: MIN_EXPOSED_SAMPLE_SIZE }, (_, i) =>
        bowelEntry(`2026-01-0${i + 1}T20:00:00.000Z`, { bristolType: 7 }),
      );
      const exposures = extractTriggerExposures(foodEntries, []);

      const results = computeCorrelations(bowelEntries, exposures, { windows: [6, 24] });
      const sixHour = results.find((r) => r.tag === 'dairy' && r.windowHours === 6 && r.outcomeId === 'bristol_urgent');
      const twentyFourHour = results.find(
        (r) => r.tag === 'dairy' && r.windowHours === 24 && r.outcomeId === 'bristol_urgent',
      );

      // 6h window: no exposures counted as "exposed" (event is 20h after, outside window) -> below min sample, discarded
      expect(sixHour).toBeUndefined();
      // 24h window: exposures counted, correlation surfaced
      expect(twentyFourHour).toBeDefined();
      expect(twentyFourHour!.exposedCount).toBe(MIN_EXPOSED_SAMPLE_SIZE);
    });

    test('outputs a generic entry_type so future entry sources (sleep/activity) can plug in', () => {
      const foodEntries = Array.from({ length: MIN_EXPOSED_SAMPLE_SIZE }, (_, i) =>
        foodEntry(`2026-01-0${i + 1}T08:00:00.000Z`, ['Milk']),
      );
      const bowelEntries = Array.from({ length: MIN_EXPOSED_SAMPLE_SIZE }, (_, i) =>
        bowelEntry(`2026-01-0${i + 1}T10:00:00.000Z`, { bristolType: 7 }),
      );
      const exposures = extractTriggerExposures(foodEntries, []);
      const results = computeCorrelations(bowelEntries, exposures, { windows: [6] });
      expect(results.every((r) => r.entryType === 'food')).toBe(true);
    });

    test('only tests hasBlood, painLevel, and bristol >= 6 as default outcomes', () => {
      expect(DEFAULT_OUTCOMES.map((o) => o.id).sort()).toEqual(
        ['bristol_urgent', 'has_blood', 'high_pain'].sort(),
      );
    });
  });
});
