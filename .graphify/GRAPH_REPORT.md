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
- Built from Git commit: `43a0e04`
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

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (39): AddIngredientModal(), AddIngredientModalProps, blankDraft(), IngredientModalMode, localStyles, BarcodeScannerModalProps, styles, FoodSearchInputProps (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (35): countRecentReports(), EntryRange, fetchBowelEntries(), fetchFoodEntries(), fetchWaterEntries(), buildPrompt(), GeminiResponse, generateReportText() (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (19): days, { getByText }, mockFoodEntries, mockWaterEntries, MacroBarProps, styles, ProgressChartProps, ActivityEntry (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (27): CategoryModalProps, emptyMealInfo, { getByDisplayValue }, { getByTestId }, { getByText }, { getByText, getByDisplayValue }, mockMealInfo, mockProps (+19 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (15): styles, Collapsible(), styles, HealthReportGeneratorProps, REPORT_PERIODS, ReportPeriod, styles, ThemedText() (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (21): DEFAULT_USER_PROFILE, EMPTY_DATA, TrackingContext, TrackingContextValue, ExpoSecureStoreAdapter, supabase, deleteFoodEntry(), deleteWaterEntry() (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (12): formatPeriod(), HealthReportsListProps, ReportCard(), useHealthReports(), fetchHealthReports(), baseReport, BarChartProps, BRISTOL_COLORS (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (23): addButton, amountInput, breakfastOption, calendarToggle, caloriesInput, categoryButton, closeButton, datePickerButton (+15 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (22): RecentActivities, WaterEntriesList, WaterIngredientsForm, WaterVolumeSelector, BRISTOL_DESCRIPTIONS, FOOD_CATEGORIES, VOLUME_PRESETS, useWaterEntryForm (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (12): BowelEntriesListProps, BRISTOL_TYPES, PAIN_LEVELS, Props, URGENCY_OPTIONS, BowelFormState, defaultFormState(), useBowelEntryForm() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (16): addButton, amountInput, datePickerButton, entryNameInput, { getByPlaceholderText }, { getByPlaceholderText, getByTestId }, { getByPlaceholderText, getByTestId, getByText }, { getByTestId } (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (7): DatePickerModalProps, localStyles, Props, TimePickerModalProps, useWaterEntryForm(), styles, formatDisplayTime()

### Community 12 - "Community 12"
Cohesion: 0.20
Nodes (8): localStyles, Props, MealInfoData, MealInfoFormProps, useTracking(), defaultMealInfo(), entryToMealInfo(), useFoodEntryForm()

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (8): WaterEntriesListProps, WaterInfoData, WaterInfoFormProps, WaterVolumeSelectorProps, entryToWaterInfo(), VOLUME_PRESETS, VolumePreset, VolumePresetId

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (16): DB: bowel_entries, DB: food_entries, DB: food_ingredients, DB: health_reports, Storage: user-photos, DB: user_profiles, DB: water_entries, DB: water_ingredients (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.23
Nodes (11): entry1, entry2, formData, ingredients, result, Ingredient, IngredientFormData, Unit (+3 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (14): FoodEntriesList, IngredientForm, PhotoInput, useFoodEntryForm, screen/food, test/FoodEntriesList, test/FoodIntake screen, test/IngredientForm (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.21
Nodes (4): AuthContext, AuthContextValue, AuthProvider(), useAuth()

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (11): emptyIngredients, { getByDisplayValue, getByText }, { getByPlaceholderText, getByText }, { getByTestId, getByText }, { getByText }, { getByText, getByDisplayValue }, mlButton, mockIngredients (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (8): TrackingProvider(), { getByDisplayValue }, mockEntry, { queryByText }, { getByDisplayValue }, mockEntry, { queryByText }, { getByTestId }

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (12): BowelEntriesList, BowelEntryForm, HealthReportGenerator, useBowelEntryForm, useSignedPhotoUrl, Pattern: ID generation, Pattern: Standalone data hook, screen/bowel (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.23
Nodes (9): encAb, nodeCrypto, original, originalAb, payload, secureStore, decryptPhoto(), encryptPhoto() (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.20
Nodes (11): CategoryModal, DatePickerModal, MealInfoForm, TimePickerModal, WaterInfoForm, test/CategoryModal, test/DatePickerModal, test/MealInfoForm (+3 more)

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (8): ProfileFormProps, defaultProfile, { getByDisplayValue }, { getByTestId }, { getByTestId, queryByTestId }, mockOnSave, populatedProfile, UserProfile

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (9): { getAllByText }, { getByDisplayValue }, { getByTestId }, { getByText }, { getByText, getByDisplayValue }, mockIngredients, mockProps, multipleIngredients (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.20
Nodes (9): btn, defaultProps, expectedPreset, { getByTestId }, { getByTestId, getAllByText, getByText }, { getByTestId, getByText }, { getByTestId, queryByText }, { getByText } (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.20
Nodes (9): alertSpy, { getByTestId }, { getByText }, { getByText, getAllByText }, mockFoodEntries, onDelete, onEdit, { queryByTestId } (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.20
Nodes (9): alertSpy, { getByTestId }, { getByText }, { getByText, getAllByText }, mockWaterEntries, onDelete, onEdit, { queryByTestId } (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (9): HealthReportsList, useAuth, useHealthReports, screen/sign-in, screen/sign-up, screen/stats, test/HealthReportsList, test/useHealthReports (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (9): ProfileForm, ProgressChart, useTracking, screen/home (index), screen/profile, test/HomeScreen, test/ProfileForm, test/ProgressChart (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (8): emptyWaterInfo, { getByDisplayValue }, { getByPlaceholderText }, { getByTestId }, { getByText, getByDisplayValue }, mockProps, mockWaterInfo, { queryByText }

### Community 31 - "Community 31"
Cohesion: 0.47
Nodes (8): auth.users, on_auth_user_created, public.food_entries, public.food_ingredients, public.handle_new_user(), public.user_profiles, public.water_entries, public.water_ingredients

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (8): fs, indexPath, layoutPath, newAppDirPath, newDirPath, oldDirPath, path, root

### Community 33 - "Community 33"
Cohesion: 0.32
Nodes (8): AuthContext, TrackingContext, Pattern: Context-only state, Pattern: File-based routing, app/_layout.tsx, lib/supabase.ts, test/TrackingContext, TrackingData

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (8): generate-health-report/gemini.ts, Pattern: AI/deterministic compute boundary, Pattern: Cross-runtime shared module, test/ingredientTags, test/insightsEngine, BristolType, lib/ingredientTags.ts, lib/insightsEngine.ts

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (7): alertActions, { getByTestId }, { getByText }, libraryAction, mockOnPhotoRemove, mockOnPhotoSelect, { queryByTestId }

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (7): { getAllByText }, { getByTestId }, { getByText }, { getByText, queryByText }, mockProps, { queryByText }, timeOptions

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (6): { getByTestId }, { getByTestId, getByText }, { getByTestId, queryByTestId }, { getByText }, mockProps, { queryByText }

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (1): PhotoInputProps

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (4): createTimestamp(), formatDisplayDate(), getPeriodDateRange(), toDateOnly()

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (2): { getByTestId }, WaterEntry

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (4): { getByTestId }, { getByText }, { getByText, getByTestId }, mockPush

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (4): ThemedText, ThemedView, constants/Colors.ts, useThemeColor

### Community 43 - "Community 43"
Cohesion: 0.50
Nodes (1): styles

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (1): FoodEntriesListProps

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (2): { defineConfig }, expoConfig

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (1): getDecryptedPhotoUri()

### Community 47 - "Community 47"
Cohesion: 1.00
Nodes (2): config, { getDefaultConfig }

### Community 48 - "Community 48"
Cohesion: 1.00
Nodes (2): auth.users, public.bowel_entries

### Community 49 - "Community 49"
Cohesion: 1.00
Nodes (2): auth.users, public.health_reports

### Community 53 - "Community 53"
Cohesion: 1.00
Nodes (2): generateHealthReport(), mapHealthReportRow()

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

### Community 61 - "Community 61"
Cohesion: 1.00
Nodes (1): Collapsible

### Community 62 - "Community 62"
Cohesion: 1.00
Nodes (1): PlaceholderCircle

### Community 63 - "Community 63"
Cohesion: 1.00
Nodes (1): TabBarIcon

### Community 64 - "Community 64"
Cohesion: 1.00
Nodes (1): AGENTS.md

### Community 65 - "Community 65"
Cohesion: 1.00
Nodes (1): docs/ARCHITECTURE.md

### Community 66 - "Community 66"
Cohesion: 1.00
Nodes (1): docs/TECHNICAL_DECISIONS.md

### Community 67 - "Community 67"
Cohesion: 1.00
Nodes (1): useColorScheme

### Community 75 - "Community 75"
Cohesion: 1.00
Nodes (1): app/(auth)/_layout.tsx

### Community 76 - "Community 76"
Cohesion: 1.00
Nodes (1): app/(tabs)/_layout.tsx

## Knowledge Gaps
- **279 isolated node(s):** `Period`, `BRISTOL_COLORS`, `SHORT_DAYS`, `BarChartProps`, `styles` (+274 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 38`** (1 nodes): `PhotoInputProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (2 nodes): `{ getByTestId }`, `WaterEntry`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `styles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `FoodEntriesListProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (2 nodes): `{ defineConfig }`, `expoConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `getDecryptedPhotoUri()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (2 nodes): `config`, `{ getDefaultConfig }`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (2 nodes): `auth.users`, `public.bowel_entries`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (2 nodes): `auth.users`, `public.health_reports`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (2 nodes): `generateHealthReport()`, `mapHealthReportRow()`
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
- **Thin community `Community 61`** (1 nodes): `Collapsible`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `PlaceholderCircle`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `TabBarIcon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `AGENTS.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `docs/ARCHITECTURE.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (1 nodes): `docs/TECHNICAL_DECISIONS.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (1 nodes): `useColorScheme`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `app/(auth)/_layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (1 nodes): `app/(tabs)/_layout.tsx`
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
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05725490196078432 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07102040816326531 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._