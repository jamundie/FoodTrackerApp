import { tagIngredient, TAG_RULES } from '../../lib/ingredientTags';

describe('ingredientTags', () => {
  describe('tagIngredient', () => {
    test('tags dairy ingredients', () => {
      expect(tagIngredient('Whole Milk')).toEqual(['dairy']);
      expect(tagIngredient('Cheddar cheese')).toEqual(['dairy']);
      expect(tagIngredient('Greek yoghurt')).toEqual(['dairy']);
    });

    test('tags caffeine ingredients', () => {
      expect(tagIngredient('Black coffee')).toEqual(['caffeine']);
      expect(tagIngredient('Energy drink')).toEqual(['caffeine']);
    });

    test('tags gluten ingredients', () => {
      expect(tagIngredient('White bread')).toEqual(['gluten']);
      expect(tagIngredient('Wheat pasta')).toEqual(['gluten']);
    });

    test('is case-insensitive', () => {
      expect(tagIngredient('MILK')).toEqual(['dairy']);
      expect(tagIngredient('milk')).toEqual(['dairy']);
    });

    test('matches substrings within longer ingredient names', () => {
      expect(tagIngredient('Semi-skimmed milk (2 pints)')).toEqual(['dairy']);
    });

    test('returns multiple tags when an ingredient matches multiple patterns', () => {
      // "cream" -> dairy, "fried" -> fried
      expect(tagIngredient('Fried cream')).toEqual(expect.arrayContaining(['dairy', 'fried']));
    });

    test('dedupes tags when multiple rules produce the same tag', () => {
      // "cheese" and "cream" both map to dairy alone
      const tags = tagIngredient('Cheese and cream sauce');
      expect(tags.filter((t) => t === 'dairy')).toHaveLength(1);
    });

    test('returns empty array for unmatched ingredient names', () => {
      expect(tagIngredient('Chicken breast')).toEqual([]);
      expect(tagIngredient('')).toEqual([]);
    });
  });

  describe('TAG_RULES', () => {
    test('every rule has at least one tag', () => {
      TAG_RULES.forEach((rule) => {
        expect(rule.tags.length).toBeGreaterThan(0);
      });
    });
  });
});
