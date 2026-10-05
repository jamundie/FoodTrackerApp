import { buildExportSheets, buildExportFilename } from '../../lib/exportBuilder';
import { getExportRange } from '../dateUtils';
import type { FoodEntry, WaterEntry, BowelEntry, TrackingData, UserProfile } from '../../types/tracking';
import type { Ingredient } from '../../types/ingredient';

// ── helpers ────────────────────────────────────────────────────────────────

const NOW = new Date(2026, 9, 5, 12, 0, 0); // 2026-10-05 12:00 local

/** Local-time ISO timestamp `daysAgo` days before NOW at the given hour. */
const at = (daysAgo: number, hour = 9, minute = 0): string => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const ing = (name: string, amount = 100): Ingredient => ({ id: `i-${name}`, name, amount, unit: 'g' });

const food = (timestamp: string, ingredients: string[] = ['rice'], calories = 500): FoodEntry => ({
  id: `f-${timestamp}`,
  mealName: 'Meal',
  category: 'Lunch',
  timestamp,
  ingredients: ingredients.map((n) => ing(n)),
  totalCalories: calories,
  totalProtein: 20,
  totalCarbs: 60,
  totalFat: 10,
});

const water = (timestamp: string, ml = 250): WaterEntry => ({
  id: `w-${timestamp}`,
  entryName: 'Drink',
  timestamp,
  ingredients: [],
  volumePresetId: 'glass',
  volumeMl: ml,
  totalVolume: ml,
});

const bowel = (timestamp: string, overrides: Partial<BowelEntry> = {}): BowelEntry => ({
  id: `b-${timestamp}`,
  timestamp,
  falseAlarm: false,
  bristolType: 4,
  urgency: 'none',
  hasBlood: false,
  painLevel: 0,
  ...overrides,
});

const data = (parts: Partial<TrackingData>): TrackingData => ({
  foodEntries: [],
  waterEntries: [],
  bowelEntries: [],
  ...parts,
});

const range7 = () => getExportRange('7d', [], NOW);

// ── getExportRange ─────────────────────────────────────────────────────────

describe('getExportRange', () => {
  it('7d spans 7 local days ending today', () => {
    const r = getExportRange('7d', [], NOW);
    expect(r.start).toEqual(new Date(2026, 9, (5 - 6), 0, 0, 0, 0));
    expect(r.end.getDate()).toBe(5);
    expect(r.end.getHours()).toBe(23);
  });

  it('30d spans 30 local days', () => {
    const r = getExportRange('30d', [], NOW);
    expect(r.start).toEqual(new Date(2026, 8, 6, 0, 0, 0, 0));
  });

  it('all starts at the earliest timestamp, at local midnight', () => {
    const r = getExportRange('all', [at(40, 15), at(3), at(100, 18)], NOW);
    const expected = new Date(at(100, 18));
    expected.setHours(0, 0, 0, 0);
    expect(r.start).toEqual(expected);
  });

  it('all with no entries collapses to today', () => {
    const r = getExportRange('all', [], NOW);
    expect(r.start).toEqual(new Date(2026, 9, 5, 0, 0, 0, 0));
  });

  it('all ignores invalid timestamps', () => {
    const r = getExportRange('all', ['not-a-date', at(2)], NOW);
    expect(r.start.getDate()).toBe(3);
  });
});

// ── buildExportSheets ──────────────────────────────────────────────────────

describe('buildExportSheets', () => {
  it('produces header-only sheets for empty data', () => {
    const s = buildExportSheets(data({}), null, range7());
    expect(s.food).toHaveLength(1);
    expect(s.water).toHaveLength(1);
    expect(s.bowel).toHaveLength(1);
    expect(s.food[0][0]).toBe('Date');
  });

  it('includes only entries within the range, oldest first', () => {
    const s = buildExportSheets(
      data({
        foodEntries: [food(at(1, 18)), food(at(20)), food(at(3, 8))],
      }),
      null,
      range7(),
    );
    expect(s.food).toHaveLength(3); // header + 2
    expect(String(s.food[1][0]) < String(s.food[2][0])).toBe(true);
  });

  it('formats ingredients and trigger tags on the Food sheet', () => {
    const s = buildExportSheets(
      data({ foodEntries: [food(at(1), ['cheese', 'bread'])] }),
      null,
      range7(),
    );
    const row = s.food[1];
    expect(row[9]).toBe('cheese (100 g); bread (100 g)');
    expect(row[10]).toBe('dairy, gluten');
  });

  it('writes blank cells (null) for missing macros', () => {
    const entry: FoodEntry = { ...food(at(1)), totalProtein: undefined, totalFiber: undefined };
    const s = buildExportSheets(data({ foodEntries: [entry] }), null, range7());
    expect(s.food[1][5]).toBeNull();
    expect(s.food[1][8]).toBeNull();
  });

  it('maps the water preset to its label and uses total volume', () => {
    const entry: WaterEntry = { ...water(at(1), 250), totalVolume: 300 };
    const s = buildExportSheets(data({ waterEntries: [entry] }), null, range7());
    expect(s.water[1][3]).toBe('1 Glass');
    expect(s.water[1][4]).toBe(250);
    expect(s.water[1][5]).toBe(300);
  });

  it('exports false alarms with a blank Bristol type', () => {
    const s = buildExportSheets(
      data({ bowelEntries: [bowel(at(1), { falseAlarm: true, bristolType: undefined })] }),
      null,
      range7(),
    );
    expect(s.bowel[1][2]).toBe('Yes');
    expect(s.bowel[1][3]).toBeNull();
  });

  describe('Daily Summary', () => {
    it('has one row per day including days with no entries', () => {
      const s = buildExportSheets(data({ foodEntries: [food(at(1))] }), null, range7());
      expect(s.dailySummary).toHaveLength(8); // header + 7 days
      const empty = s.dailySummary.find((r) => r[1] === 0);
      expect(empty).toBeDefined();
    });

    it('sums per-day values and flags goals', () => {
      const profile = { dailyCalorieGoal: 800, dailyWaterGoalMl: 1000 } as UserProfile;
      const s = buildExportSheets(
        data({
          foodEntries: [food(at(1, 8), ['rice'], 500), food(at(1, 19), ['rice'], 400)],
          waterEntries: [water(at(1, 9), 500), water(at(1, 15), 400)],
        }),
        profile,
        range7(),
      );
      const row = s.dailySummary[s.dailySummary.length - 2]; // yesterday
      expect(row[1]).toBe(900);
      expect(row[5]).toBe(900);
      expect(row[6]).toBe('Yes'); // 900 >= 800
      expect(row[7]).toBe('No'); // 900 < 1000
    });

    it('leaves goal columns blank when no goals are set', () => {
      const s = buildExportSheets(data({ foodEntries: [food(at(1))] }), null, range7());
      expect(s.dailySummary[1][6]).toBeNull();
      expect(s.dailySummary[1][7]).toBeNull();
    });

    it('summarises bowel stats per day', () => {
      const s = buildExportSheets(
        data({
          bowelEntries: [
            bowel(at(1, 8), { bristolType: 6, painLevel: 3 }),
            bowel(at(1, 20), { bristolType: 4, painLevel: 7, hasBlood: true }),
          ],
        }),
        null,
        range7(),
      );
      const row = s.dailySummary[s.dailySummary.length - 2];
      expect(row[8]).toBe(2);
      expect(row[9]).toBe(5);
      expect(row[10]).toBe(7);
      expect(row[11]).toBe('Yes');
    });
  });

  describe('Patterns', () => {
    const flatten = (rows: unknown[][]) => rows.flat().filter((c) => typeof c === 'string') as string[];

    it('reports overview counts', () => {
      const s = buildExportSheets(
        data({
          bowelEntries: [
            bowel(at(1), { falseAlarm: true, bristolType: undefined }),
            bowel(at(2), { hasBlood: true, painLevel: 6 }),
          ],
        }),
        null,
        range7(),
      );
      const get = (label: string) => s.patterns.find((r) => r[0] === label)?.[1];
      expect(get('Bowel entries')).toBe(2);
      expect(get('False alarms')).toBe(1);
      expect(get('Entries with blood')).toBe(1);
      expect(get('Entries with pain >= 5')).toBe(1);
    });

    it('explains the minimum sample size when no correlations surface', () => {
      const s = buildExportSheets(data({ bowelEntries: [bowel(at(1))] }), null, range7());
      expect(flatten(s.patterns).some((c) => c.startsWith('No correlations surfaced'))).toBe(true);
    });

    it('surfaces a correlation when enough exposed events exist', () => {
      // 6 days of: dairy meal, then a loose stool 2h later; plus unexposed normal stools.
      const foods: FoodEntry[] = [];
      const bowels: BowelEntry[] = [];
      for (let d = 0; d < 6; d++) {
        foods.push(food(at(d, 8), ['milk']));
        bowels.push(bowel(at(d, 10), { bristolType: 7 }));
      }
      const s = buildExportSheets(
        data({ foodEntries: foods, bowelEntries: bowels }),
        null,
        range7(),
      );
      const header = s.patterns.findIndex((r) => r[0] === 'Trigger');
      expect(header).toBeGreaterThan(0);
      expect(s.patterns[header + 1][0]).toBe('dairy');
    });

    it('omits correlations where no adverse outcome followed exposure', () => {
      const foods: FoodEntry[] = [];
      const bowels: BowelEntry[] = [];
      for (let d = 0; d < 6; d++) {
        foods.push(food(at(d, 8), ['milk']));
        bowels.push(bowel(at(d, 10), { bristolType: 4, painLevel: 0 })); // exposed but never adverse
      }
      const s = buildExportSheets(data({ foodEntries: foods, bowelEntries: bowels }), null, range7());
      const header = s.patterns.findIndex((r) => r[0] === 'Trigger');
      expect(s.patterns[header + 1][0]).toMatch(/^No correlations surfaced/);
    });

    it('sorts the strongest signals first', () => {
      const foods: FoodEntry[] = [];
      const bowels: BowelEntry[] = [];
      for (let d = 0; d < 7; d++) {
        foods.push(food(at(d, 8), ['milk']));
        bowels.push(bowel(at(d, 10), { bristolType: 7 })); // exposed + adverse
        bowels.push(bowel(at(d, 22), { bristolType: 4 })); // unexposed in the 6h window
      }
      const s = buildExportSheets(data({ foodEntries: foods, bowelEntries: bowels }), null, range7());
      const header = s.patterns.findIndex((r) => r[0] === 'Trigger');
      const lifts = s.patterns.slice(header + 1).filter((r) => r.length === 8).map((r) => r[6]);
      expect(lifts[0]).toBe('n/a (no baseline)');
    });

    it('labels infinite lift instead of writing Infinity', () => {
      const foods: FoodEntry[] = [];
      const bowels: BowelEntry[] = [];
      for (let d = 0; d < 6; d++) {
        foods.push(food(at(d, 8), ['milk']));
        bowels.push(bowel(at(d, 10), { bristolType: 7 })); // exposed + adverse
        bowels.push(bowel(at(d, 22), { bristolType: 4 })); // outside the 6h window, never adverse
      }
      const s = buildExportSheets(
        data({ foodEntries: foods, bowelEntries: bowels }),
        null,
        range7(),
      );
      const cells = s.patterns.flat();
      expect(cells).not.toContain(Infinity);
      expect(cells).toContain('n/a (no baseline)');
    });

    it('counts food eaten just before the range start as exposure, without exporting it', () => {
      const range = getExportRange('7d', [], NOW);
      const hour = 60 * 60 * 1000;
      const preRangeMilk = new Date(range.start.getTime() - hour).toISOString();
      // 5 loose stools in the first hours of the range: enough to pass the min sample size,
      // and only exposed to dairy via the pre-range meal.
      const bowels = [1, 2, 3, 4, 5].map((h) =>
        bowel(new Date(range.start.getTime() + h * hour - 60_000).toISOString(), { bristolType: 7 }),
      );
      const s = buildExportSheets(
        data({ foodEntries: [food(preRangeMilk, ['milk'])], bowelEntries: bowels }),
        null,
        range,
      );
      expect(s.food).toHaveLength(1); // header only: the buffered meal is not exported
      const header = s.patterns.findIndex((r) => r[0] === 'Trigger');
      expect(s.patterns[header + 1][0]).toBe('dairy');
    });

    it('ignores food older than the 48h buffer', () => {
      const range = getExportRange('7d', [], NOW);
      const hour = 60 * 60 * 1000;
      const tooOld = new Date(range.start.getTime() - 49 * hour).toISOString();
      const bowels = [1, 2, 3, 4, 5].map((h) =>
        bowel(new Date(range.start.getTime() + h * hour).toISOString(), { bristolType: 7 }),
      );
      const s = buildExportSheets(
        data({ foodEntries: [food(tooOld, ['milk'])], bowelEntries: bowels }),
        null,
        range,
      );
      expect(s.patterns.flat().some((c) => typeof c === 'string' && c.startsWith('No correlations'))).toBe(true);
    });
  });
});

describe('buildExportFilename', () => {
  it('uses the local start and end dates', () => {
    expect(buildExportFilename(getExportRange('7d', [], NOW))).toBe(
      'health-export-2026-09-29-to-2026-10-05.xlsx',
    );
  });
});
