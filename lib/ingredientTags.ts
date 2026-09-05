/**
 * Static, hand-maintained ingredient → trigger-tag lookup.
 *
 * Plain, dependency-free TypeScript — no RN or Deno-specific APIs — so this
 * file can be imported unmodified from both the client (Stats screen /
 * insightsEngine) and the `generate-health-report` Supabase Edge Function
 * (Deno runtime).
 *
 * Tags are derived on the fly from ingredient names at report-generation
 * time; there is no DB schema change or backfill.
 */

export type IngredientTag =
  | 'dairy'
  | 'gluten'
  | 'caffeine'
  | 'alcohol'
  | 'spicy'
  | 'fried'
  | 'high_fat'
  | 'high_fodmap'
  | 'artificial_sweetener'
  | 'citrus';

export const ALL_TAGS: readonly IngredientTag[] = [
  'dairy',
  'gluten',
  'caffeine',
  'alcohol',
  'spicy',
  'fried',
  'high_fat',
  'high_fodmap',
  'artificial_sweetener',
  'citrus',
];

export const TAG_RULES: { pattern: RegExp; tags: IngredientTag[] }[] = [
  { pattern: /milk|cheese|yog(h)?urt|cream|butter|dairy|whey|custard|ice cream/i, tags: ['dairy'] },
  { pattern: /coffee|caffeine|energy drink|cola|espresso|matcha|black tea|green tea/i, tags: ['caffeine'] },
  { pattern: /bread|pasta|wheat|gluten|flour|noodle|cracker|cereal|couscous|barley|rye/i, tags: ['gluten'] },
  { pattern: /beer|wine|vodka|whisky|whiskey|rum|gin|cider|lager|alcohol|prosecco|champagne/i, tags: ['alcohol'] },
  { pattern: /chil(l)?i|hot sauce|jalapen[oó]|cayenne|curry|spicy|sriracha|wasabi/i, tags: ['spicy'] },
  { pattern: /fried|deep-fried|fries|tempura|battered/i, tags: ['fried'] },
  { pattern: /bacon|sausage|fatty|cream cheese|mayo(nnaise)?|lard|ghee/i, tags: ['high_fat'] },
  { pattern: /onion|garlic|beans?|lentil(s)?|cabbage|broccoli|apple|pear|mushroom/i, tags: ['high_fodmap'] },
  { pattern: /aspartame|sucralose|sorbitol|xylitol|maltitol|stevia|sweetener/i, tags: ['artificial_sweetener'] },
  { pattern: /orange|lemon|lime|grapefruit|citrus|tangerine|clementine/i, tags: ['citrus'] },
];

/** Returns all trigger tags whose pattern matches the given ingredient name (deduped). */
export function tagIngredient(name: string): IngredientTag[] {
  const tags = new Set<IngredientTag>();
  for (const rule of TAG_RULES) {
    if (rule.pattern.test(name)) {
      rule.tags.forEach((t) => tags.add(t));
    }
  }
  return Array.from(tags);
}
