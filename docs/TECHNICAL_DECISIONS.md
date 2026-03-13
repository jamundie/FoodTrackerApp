# Technical Decision Records (TDRs)

This document tracks major technical decisions made during the development of the Food Tracker App.

## TDR-001: Expo Router over React Navigation

**Date**: August 2025  
**Status**: Accepted  
**Context**: Need for navigation system in React Native app

### Decision
Use Expo Router (v5.1.3) for navigation instead of React Navigation.

### Alternatives Considered
- React Navigation v7
- Manual navigation implementation

### Rationale
- **File-based routing**: More intuitive project structure
- **Type safety**: Automatic TypeScript integration
- **Deep linking**: Built-in support with minimal configuration
- **Code splitting**: Automatic with Expo Router
- **Developer experience**: Familiar to web developers

### Consequences
- **Positive**: Better DX, type safety, automatic route generation
- **Negative**: Newer technology, smaller community than React Navigation
- **Mitigation**: Well-documented by Expo team, active development

---

## TDR-002: React Context API for State Management

**Date**: August 2025  
**Status**: Accepted  
**Context**: Need for global state management for tracking data

### Decision
Use React Context API with custom hooks instead of Redux or other state management libraries.

### Alternatives Considered
- Redux Toolkit
- Zustand
- Jotai
- Local state only

### Rationale
- **Simplicity**: Built into React, no additional dependencies
- **Scale appropriate**: Current app scope doesn't require Redux complexity
- **Performance**: Adequate for current data flow patterns
- **Learning curve**: Team familiar with React patterns

### Consequences
- **Positive**: Smaller bundle, simpler debugging, native React patterns
- **Negative**: May need refactoring if app grows significantly
- **Mitigation**: Context can be migrated to other solutions if needed

---

## TDR-003: React Native Skia for Charts

**Date**: August 2025  
**Status**: Accepted  
**Context**: Need for high-performance charts and data visualization

### Decision
Use @shopify/react-native-skia for charts and data visualization.

### Alternatives Considered
- Victory Native
- React Native Chart Kit
- D3 with react-native-svg
- Custom canvas implementation

### Rationale
- **Performance**: 60fps animations, GPU acceleration
- **Flexibility**: Full control over graphics rendering
- **Future-proof**: Shopify's active development and maintenance
- **Capabilities**: Supports complex visualizations needed for health data

### Consequences
- **Positive**: Excellent performance, unlimited customization
- **Negative**: Requires native builds, larger bundle size, steeper learning curve
- **Mitigation**: Development builds required, but acceptable trade-off for UX

---

## TDR-004: TypeScript Strict Mode

**Date**: August 2025  
**Status**: Accepted  
**Context**: Code quality and maintainability requirements

### Decision
Use TypeScript in strict mode across the entire application.

### Alternatives Considered
- JavaScript with JSDoc
- TypeScript with loose configuration
- Gradual TypeScript adoption

### Rationale
- **Error prevention**: Catch errors at compile time
- **Developer experience**: Better IDE support, autocomplete
- **Maintainability**: Self-documenting code, easier refactoring
- **Team productivity**: Clearer interfaces and contracts

### Consequences
- **Positive**: Fewer runtime errors, better code quality, improved DX
- **Negative**: Initial learning curve, more verbose code
- **Mitigation**: Team training, gradual adoption of advanced features

---

## TDR-005: Native Builds Required

**Date**: August 2025  
**Status**: Accepted  
**Context**: Skia dependency requires native compilation

### Decision
Require development builds instead of supporting Expo Go for development.

### Alternatives Considered
- Use Expo Go-compatible chart library
- Conditional rendering for development vs production
- Web-only development with mobile testing later

### Rationale
- **Feature requirements**: Skia charts are core to the app experience
- **Testing accuracy**: Development builds closer to production
- **Performance**: Native builds perform better than Expo Go

### Consequences
- **Positive**: Better development/production parity, access to native features
- **Negative**: Longer development setup, slower iteration cycle
- **Mitigation**: Clear setup documentation, CI/CD for automated builds

---

## TDR-006: Styles Directory Structure

**Date**: August 2025  
**Status**: Accepted  
**Context**: Expo Router treating styles as routes when in app/ directory

### Decision
Move styles directory from `app/styles/` to root-level `styles/` directory.

### Alternatives Considered
- Rename files with underscore prefix (app/styles/_index.styles.ts)
- Use .styles suffix in component directories
- Inline styles only

### Rationale
- **Routing conflicts**: Expo Router treats all app/ files as potential routes
- **Organization**: Central location for global styles
- **Imports**: Clear distinction between routes and styles

### Consequences
- **Positive**: No routing conflicts, clearer project structure
- **Negative**: Import paths need updating
- **Mitigation**: IDE-assisted refactoring, updated documentation

---

## TDR-007: Split Date/Time Picker with Calendar Interface

**Date**: August 2025  
**Status**: Accepted  
**Context**: Users need intuitive date/time selection for meal logging with both quick access and precise control

### Decision
Implement a dual-picker system with separate date and time selectors, featuring an expandable calendar interface for date selection.

### Alternatives Considered
- **Single ISO timestamp input**: Manual entry of full ISO format
- **Native date/time pickers**: Platform-specific date/time components
- **Third-party date picker library**: External dependency like react-native-date-picker
- **Simple dropdown lists**: Basic day/time selection without calendar

### Rationale
- **User Experience**: Split interface is more intuitive than single timestamp input
- **Quick Access**: "Today"/"Yesterday" options for common use cases
- **Precision Control**: Full calendar allows selection of any past date
- **Visual Clarity**: Calendar grid provides clear date context and navigation
- **Consistent Styling**: Custom implementation matches app design system
- **No Dependencies**: Avoids external libraries and platform inconsistencies

### Implementation Details
```typescript
// Dual state management
const [selectedDate, setSelectedDate] = useState(new Date());
const [selectedTime, setSelectedTime] = useState({ 
  hours: new Date().getHours(), 
  minutes: 0 
});

// Calendar generation with metadata
const generateCalendarDays = (year: number, month: number) => {
  // 42-day grid with isSelectable, isToday, isCurrentMonth flags
};

// Smart time intervals
const timeOptions = Array.from({ length: 24 }, (_, hour) =>
  [0, 15, 30, 45].map(minute => ({ hour, minute }))
);
```

### Date Picker Features
- **Quick Selection**: Today/Yesterday buttons for common scenarios
- **Expandable Calendar**: Traditional month grid with navigation
- **Smart Restrictions**: Only past dates selectable, future dates disabled
- **Visual Indicators**: Today highlighted, selected date emphasized
- **Month Navigation**: Previous/next with intelligent boundary handling

### Time Picker Features
- **Structured Intervals**: 15-minute increments (00, 15, 30, 45)
- **Complete Coverage**: All 24 hours × 4 intervals = 96 time slots
- **User-Friendly Display**: 12-hour AM/PM format in UI
- **ISO Timestamp Output**: Combined date/time for consistent storage

### Consequences
- **Positive**: 
  - Intuitive user experience with both quick and precise options
  - No external dependencies or platform-specific behavior
  - Consistent visual design with app theme
  - Comprehensive test coverage possible with testID attributes
  - Flexible architecture for future enhancements
- **Negative**: 
  - Custom implementation requires more initial development time
  - Additional state management complexity
  - Larger component file size
- **Mitigation**: 
  - Well-structured helper functions keep code maintainable
  - Comprehensive test suite ensures reliability
  - Clear documentation for future developers

### Testing Strategy
- Unit tests for calendar generation logic
- Integration tests for date/time selection flow
- Accessibility testing for keyboard navigation
- Visual regression testing for calendar display

---

## TDR-008: Meal Photo Feature with expo-image-picker

**Date**: 2026-03-13
**Status**: Accepted
**Context**: Users want to attach a photo to a meal entry for reference. A future goal is to run AI analysis on the photo to auto-populate estimated ingredients, so the architecture must support that hook without requiring a redesign.

**Decision**: Add an optional `photoUri?: string` field to `FoodEntry`. Introduce a `MealPhotoInput` presentational component that uses `expo-image-picker` to let the user take a photo or pick from the library (one photo per meal). Photo state is kept separate from ingredient state in `useFoodEntryForm` so AI analysis can overwrite ingredients without touching the photo. The photo is rendered in `MealInfoForm` between the Date & Time and Ingredients sections.

**Alternatives considered**:
- `expo-camera` directly — more control but higher complexity; `expo-image-picker` covers both camera and library with one API
- Storing photos in the Context/global state — rejected; photo URI lives only in form state until the entry is submitted, keeping global state minimal
- Embedding the photo in `MealInfoData` — rejected; photo is independent of meal metadata and must survive ingredient resets from AI analysis

**Consequences**:
- `expo-image-picker` is now a runtime dependency (requires camera and media library permissions on device)
- `FoodEntry.photoUri` is optional — existing entries without photos are unaffected
- AI analysis hook: call `analyzePhoto(entry.photoUri)` post-submit and pipe result to `setIngredients()`; no architectural change needed
- Tests mock `expo-image-picker` globally in `jest.setup.ts`

---

## TDR-009: User Profile Tab and Volume Preset Feature

**Date**: 2026-03-13
**Status**: Accepted
**Context**: Water entries had no way to record volume, and there was no persistent user identity or per-user defaults. Two related features were added together: a drink-size preset selector on the water entry form, and a new Profile tab where users configure personal details and their default glass size.

**Decision**:
1. Add `VolumePresetId`, `VolumePreset`, and `VOLUME_PRESETS` to `types/tracking.ts`. Extend `WaterEntry` with `volumePresetId`, `volumeMl`, and `totalVolume` (always set = preset ml + ingredient ml).
2. Add `UserProfile` type to `types/tracking.ts` (display name, age, weight, height, daily water goal, default volume preset ID).
3. Add `userProfile` state and `updateUserProfile` action to `TrackingContext`. Default preset is `'glass'` (250 ml).
4. Create `WaterVolumeSelector` — a modal dropdown component — used inline on the water entry form alongside the entry name field.
5. Create `ProfileForm` component (wraps `WaterVolumeSelector` for default glass selection) and `profile.tsx` screen.
6. Add "Profile" tab (Ionicons `person` icon) between Water and Stats in `_layout.tsx`.
7. `useWaterEntryForm` seeds its initial `volumePresetId` from `userProfile.defaultVolumePresetId` and resets to it on `resetForm()`.

**Alternatives considered**:
- Custom ml entry field instead of presets — rejected for simplicity; presets cover common cases
- Storing `UserProfile` outside Context (e.g. AsyncStorage only) — rejected; in-memory Context is consistent with existing state strategy; persistence can be added later
- Inline unit picker instead of modal for volume — rejected; modal keeps the name-row uncluttered on small screens

**Consequences**:
- `WaterEntry` now always carries `totalVolume`; existing mock entries updated accordingly
- `TrackingContext` shape expanded — any snapshot tests on raw context value would need updating (none exist currently)
- `useWaterEntryForm` now reads from context at hook init; tests that render the hook must wrap with `TrackingProvider`
- `stats.tsx` remains a stub — the Profile tab is inserted before it, shifting its tab index

---

## Decision Template

For future decisions, use this template:

```markdown
## TDR-XXX: [Decision Title]

**Date**: [Date]  
**Status**: [Proposed/Accepted/Rejected/Superseded]  
**Context**: [What situation requires a decision?]

### Decision
[What is the decision?]

### Alternatives Considered
- Option 1
- Option 2
- Option 3

### Rationale
- Reason 1
- Reason 2
- Reason 3

### Consequences
- **Positive**: [Benefits]
- **Negative**: [Drawbacks]
- **Mitigation**: [How to address drawbacks]
```
