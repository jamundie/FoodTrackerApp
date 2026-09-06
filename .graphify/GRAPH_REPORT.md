# Graph Report - .  (2026-09-06)

## Corpus Check
- 165 files · ~87,690 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 725 nodes · 1236 edges · 65 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: contains: 480 · imports: 300 · imports_from: 233 · related_to: 177 · calls: 35 · references: 9 · reads_from: 1 · triggers: 1


## Input Scope
- Requested: all
- Resolved: all (source: cli)
- Included files: 165 · Candidates: recursive
- Excluded: 0 untracked · 0 ignored · 0 sensitive · 0 missing committed

## Graph Freshness
- Built from Git commit: `6f7a37a`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `ThemedText()` - 20 edges
2. `FoodEntry` - 18 edges
3. `WaterEntry` - 18 edges
4. `useTracking()` - 13 edges
5. `IngredientFormData` - 13 edges
6. `aggregateDailyStats()` - 11 edges
7. `ThemedView()` - 9 edges
8. `TrackingProvider()` - 9 edges
9. `Ingredient` - 8 edges
10. `BowelEntry` - 8 edges

## Surprising Connections (you probably didn't know these)
- `useWaterEntryForm()` --calls--> `entryToWaterInfo()`  [EXTRACTED]
  hooks/useWaterEntryForm.ts → hooks/useWaterEntryForm.ts  _Bridges community 11 → community 13_
- `FoodEntriesList` ----> `useSignedPhotoUrl`  [EXTRACTED]
   →   _Bridges community 16 → community 20_
- `FoodEntriesList` ----> `FoodEntry`  [EXTRACTED]
   →   _Bridges community 16 → community 14_
- `ProfileForm` ----> `WaterVolumeSelector`  [EXTRACTED]
   →   _Bridges community 29 → community 8_
- `RecentActivities` ----> `FoodEntry`  [EXTRACTED]
   →   _Bridges community 8 → community 14_

## Communities

### Community 17 - "Community 17"
Cohesion: 0.21
Nodes (4): AuthContextValue, AuthContext, AuthProvider(), useAuth()

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (16): { getByText, getByPlaceholderText }, { getByTestId }, { queryByText }, { getByPlaceholderText }, entryNameInput, datePickerButton, timePickerButton, { getByText, getByTestId } (+8 more)

### Community 43 - "Community 43"
Cohesion: 0.50
Nodes (1): styles

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (12): BowelEntriesListProps, BRISTOL_TYPES, URGENCY_OPTIONS, PAIN_LEVELS, Props, BowelFormState, defaultFormState(), useBowelEntryForm() (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (8): Props, localStyles, MealInfoData, MealInfoFormProps, useTracking(), defaultMealInfo(), entryToMealInfo(), useFoodEntryForm()

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (19): MacroBarProps, styles, PlaceholderCircleProps, ProgressChartProps, ActivityEntry, RecentActivitiesProps, mockFoodEntries, mockWaterEntries (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (15): styles, Collapsible(), styles, ReportPeriod, REPORT_PERIODS, HealthReportGeneratorProps, ThemedTextProps, ThemedText() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (12): Period, BRISTOL_COLORS, SHORT_DAYS, BarChartProps, HealthReportsListProps, formatPeriod(), ReportCard(), baseReport (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (7): DatePickerModalProps, Props, localStyles, TimePickerModalProps, useWaterEntryForm(), styles, formatDisplayTime()

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (39): IngredientModalMode, AddIngredientModalProps, blankDraft(), AddIngredientModal(), localStyles, BarcodeScannerModalProps, styles, FoodSearchInputProps (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (27): CategoryModalProps, mockMealInfo, mockProps, { getByText, getByDisplayValue }, { getByDisplayValue }, { getByText }, { getByTestId }, emptyMealInfo (+19 more)

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (1): FoodEntriesListProps

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (1): PhotoInputProps

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (8): ProfileFormProps, mockOnSave, defaultProfile, populatedProfile, { getByTestId }, { getByDisplayValue }, { getByTestId, queryByTestId }, UserProfile

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (8): WaterEntriesListProps, WaterInfoData, WaterInfoFormProps, WaterVolumeSelectorProps, entryToWaterInfo(), VolumePresetId, VolumePreset, VOLUME_PRESETS

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (9): mockIngredients, mockProps, { getByText, getByDisplayValue }, { getByTestId }, { getByDisplayValue }, multipleIngredients, { queryByText }, { getAllByText } (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (7): mockOnPhotoSelect, mockOnPhotoRemove, { getByTestId }, { queryByTestId }, { getByText }, alertActions, libraryAction

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (8): mockWaterInfo, mockProps, { getByText, getByDisplayValue }, { getByTestId }, { queryByText }, { getByDisplayValue }, emptyWaterInfo, { getByPlaceholderText }

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (11): mockIngredients, mockProps, { getByText, getByDisplayValue }, emptyIngredients, { getByPlaceholderText, getByText }, { getByTestId, getByText }, { getByDisplayValue, getByText }, { getByText } (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.20
Nodes (9): mockOnSelect, defaultProps, { getByText }, { getByTestId }, btn, { getByTestId, getByText }, { getByTestId, getAllByText, getByText }, { getByTestId, queryByText } (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.20
Nodes (9): mockFoodEntries, { queryByText }, { getByText }, { getByText, getAllByText }, { queryByTestId }, onEdit, { getByTestId }, alertSpy (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.20
Nodes (9): mockWaterEntries, { queryByText }, { getByText }, { getByText, getAllByText }, { queryByTestId }, onEdit, { getByTestId }, alertSpy (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.23
Nodes (11): Unit, Ingredient, IngredientFormData, ingredients, formData, result, entry1, entry2 (+3 more)

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (6): mockProps, { getByText }, { queryByText }, { getByTestId }, { getByTestId, getByText }, { getByTestId, queryByTestId }

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (8): mockEntry, { getByDisplayValue }, { queryByText }, mockEntry, { getByDisplayValue }, { queryByText }, TrackingProvider(), { getByTestId }

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (7): mockProps, { getByText }, { queryByText }, { getByTestId }, { getAllByText }, timeOptions, { getByText, queryByText }

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (23): { getByText, getByPlaceholderText }, { getByTestId }, { getByPlaceholderText }, mealNameInput, datePickerButton, timePickerButton, calendarToggle, ingredientNameInput (+15 more)

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (4): mockPush, { getByText, getByTestId }, { getByTestId }, { getByText }

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (2): { defineConfig }, expoConfig

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (21): DEFAULT_USER_PROFILE, EMPTY_DATA, TrackingContextValue, TrackingContext, ExpoSecureStoreAdapter, supabase, toISOString(), fetchUserProfile() (+13 more)

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (2): { getByTestId }, WaterEntry

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (1): getDecryptedPhotoUri()

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (35): IngredientTag, ALL_TAGS, TAG_RULES, tagIngredient(), buildDateRange(), computeDailyCalories(), computeDailyWater(), computeAverage() (+27 more)

### Community 53 - "Community 53"
Cohesion: 1.00
Nodes (2): generateHealthReport(), mapHealthReportRow()

### Community 47 - "Community 47"
Cohesion: 1.00
Nodes (2): { getDefaultConfig }, config

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (8): fs, path, root, oldDirPath, newDirPath, newAppDirPath, indexPath, layoutPath

### Community 55 - "Community 55"
Cohesion: 1.00
Nodes (1): authStyles

### Community 56 - "Community 56"
Cohesion: 1.00
Nodes (1): bowelStyles

### Community 57 - "Community 57"
Cohesion: 1.00
Nodes (1): profileStyles

### Community 58 - "Community 58"
Cohesion: 1.00
Nodes (1): statsStyles

### Community 59 - "Community 59"
Cohesion: 1.00
Nodes (1): waterStyles

### Community 31 - "Community 31"
Cohesion: 0.47
Nodes (8): public.user_profiles, auth.users, public.food_entries, public.food_ingredients, public.water_entries, public.water_ingredients, on_auth_user_created, public.handle_new_user()

### Community 48 - "Community 48"
Cohesion: 1.00
Nodes (2): public.bowel_entries, auth.users

### Community 49 - "Community 49"
Cohesion: 1.00
Nodes (2): public.health_reports, auth.users

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (4): formatDisplayDate(), createTimestamp(), toDateOnly(), getPeriodDateRange()

### Community 21 - "Community 21"
Cohesion: 0.23
Nodes (9): nodeCrypto, secureStore, original, encAb, originalAb, payload, getOrCreateEncryptionKey(), encryptPhoto() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (16): FoodEntry, lib/trackingService.ts, utils/photoEncryption.ts, DB: food_entries, DB: food_ingredients, DB: water_entries, DB: water_ingredients, DB: bowel_entries (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (22): WaterEntry, VolumePreset, VolumePresetId, BowelUrgency, types/tracking.ts, useWaterEntryForm, screen/water, WaterEntriesList (+14 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (12): BowelEntry, useBowelEntryForm, useSignedPhotoUrl, screen/bowel, BowelEntriesList, BowelEntryForm, utils/dateUtils.ts, Pattern: ID generation (+4 more)

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (9): UserProfile, useTracking, screen/home (index), screen/profile, ProfileForm, ProgressChart, test/ProfileForm, test/HomeScreen (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (14): Ingredient, IngredientFormData, Unit, types/ingredient.ts, useFoodEntryForm, screen/food, FoodEntriesList, IngredientForm (+6 more)

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (11): FoodCategory, MealInfoForm, WaterInfoForm, CategoryModal, DatePickerModal, TimePickerModal, test/MealInfoForm, test/WaterInfoForm (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (8): BristolType, lib/insightsEngine.ts, lib/ingredientTags.ts, generate-health-report/gemini.ts, Pattern: AI/deterministic compute boundary, Pattern: Cross-runtime shared module, test/insightsEngine, test/ingredientTags

### Community 33 - "Community 33"
Cohesion: 0.32
Nodes (8): TrackingData, AuthContext, TrackingContext, lib/supabase.ts, app/_layout.tsx, Pattern: File-based routing, Pattern: Context-only state, test/TrackingContext

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (9): useAuth, screen/sign-in, screen/sign-up, screen/stats, HealthReport, useHealthReports, HealthReportsList, test/useHealthReports (+1 more)

### Community 67 - "Community 67"
Cohesion: 1.00
Nodes (1): useColorScheme

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (4): useThemeColor, ThemedText, ThemedView, constants/Colors.ts

### Community 75 - "Community 75"
Cohesion: 1.00
Nodes (1): app/(auth)/_layout.tsx

### Community 76 - "Community 76"
Cohesion: 1.00
Nodes (1): app/(tabs)/_layout.tsx

### Community 61 - "Community 61"
Cohesion: 1.00
Nodes (1): Collapsible

### Community 63 - "Community 63"
Cohesion: 1.00
Nodes (1): TabBarIcon

### Community 62 - "Community 62"
Cohesion: 1.00
Nodes (1): PlaceholderCircle

### Community 65 - "Community 65"
Cohesion: 1.00
Nodes (1): docs/ARCHITECTURE.md

### Community 66 - "Community 66"
Cohesion: 1.00
Nodes (1): docs/TECHNICAL_DECISIONS.md

### Community 64 - "Community 64"
Cohesion: 1.00
Nodes (1): AGENTS.md

## Knowledge Gaps
- **279 isolated node(s):** `Period`, `BRISTOL_COLORS`, `SHORT_DAYS`, `BarChartProps`, `styles` (+274 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 43`** (1 nodes): `styles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `FoodEntriesListProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `PhotoInputProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `{ defineConfig }`, `expoConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (2 nodes): `{ getByTestId }`, `WaterEntry`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `getDecryptedPhotoUri()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (2 nodes): `generateHealthReport()`, `mapHealthReportRow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (2 nodes): `{ getDefaultConfig }`, `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `authStyles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `bowelStyles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `profileStyles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `statsStyles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `waterStyles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (2 nodes): `public.bowel_entries`, `auth.users`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (2 nodes): `public.health_reports`, `auth.users`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `useColorScheme`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `app/(auth)/_layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `app/(tabs)/_layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `Collapsible`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `TabBarIcon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `PlaceholderCircle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `docs/ARCHITECTURE.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `docs/TECHNICAL_DECISIONS.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `AGENTS.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FoodEntry` connect `Community 1` to `Community 2`, `Community 12`, `Community 44`, `Community 5`, `Community 26`, `Community 19`, `Community 40`, `Community 15`, `Community 3`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `WaterEntry` connect `Community 40` to `Community 2`, `Community 11`, `Community 13`, `Community 1`, `Community 5`, `Community 27`, `Community 19`, `Community 15`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `ThemedText()` connect `Community 4` to `Community 0`, `Community 9`, `Community 44`, `Community 6`, `Community 12`, `Community 38`, `Community 23`, `Community 13`, `Community 11`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `Period`, `BRISTOL_COLORS`, `SHORT_DAYS` to the rest of the system?**
  _279 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 10` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.11264367816091954 - nodes in this community are weakly interconnected._