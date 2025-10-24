# GitHub Copilot Instructions

## Overview
This is a React Native food tracking app built with Expo Router, TypeScript, and Context API. Focus on type safety, performance, and consistent patterns when contributing.

## Architecture Patterns

### File-Based Routing with Expo Router
- Routes live in `app/` directory with automatic generation
- Tab navigation in `app/(tabs)/` - don't modify file structure without understanding routing implications
- Use `@/` path alias for imports (configured in `tsconfig.json`)

### State Management Strategy
- **Global state**: Use `TrackingContext` in `hooks/TrackingContext.tsx` for cross-screen data
- **Local state**: Use React's `useState` for component-specific UI state
- **Form state**: Use custom hooks like `useFoodEntryForm` for complex form logic
- Never introduce Redux or other state libraries - stick to React Context pattern

### TypeScript Conventions
- All types live in `types/` directory - import from `types/tracking.ts`
- Use strict typing with `const` assertions for readonly arrays (see `FOOD_CATEGORIES`)
- Custom hooks must have proper return types and error boundaries
- Form data interfaces separate from domain types (e.g., `IngredientFormData` vs `Ingredient`)

## Component Patterns

### Themed Components
- Use `ThemedText` and `ThemedView` instead of raw React Native components
- Theme components accept `lightColor`/`darkColor` props for manual overrides
- Use `useThemeColor` hook for custom themed components

### Modal Patterns
- Modals follow naming convention: `*Modal.tsx` (e.g., `CategoryModal`, `DatePickerModal`)
- Always include backdrop press handling and proper state management
- Use consistent animation patterns across modals

### Form Component Architecture
```typescript
// Separate form data types from domain types
export type IngredientFormData = {
  name: string;
  amount: string; // Always string in forms
  unit: Unit;
  caloriesPer100g: string; // String until parsed
};

// Domain types use proper types
export type Ingredient = {
  id: string;
  name: string;
  amount: number; // Parsed number
  unit: Unit;
  caloriesPer100g?: number; // Optional parsed number
};
```

## Development Workflows

### Key Commands
```bash
npm run start          # Development server
npm run test           # Run Jest tests
npm run test:watch     # Test watch mode
npm run typecheck      # TypeScript checking
npm run lint           # Expo linting
npm run android        # Android build
npm run ios            # iOS build
```

### Testing Patterns
- Tests use `@testing-library/react-native` with Jest
- Mock data patterns established in `__tests__` files
- Some legacy tests use `.skip()` - update when modifying components
- Snapshot tests exist but prefer behavioral testing

### Performance Considerations
- Use `@shopify/react-native-skia` for charts and graphics (already configured)
- StyleSheet objects for styling, not inline styles
- `useCallback` for event handlers in complex forms
- Memoization patterns in `useFoodEntryForm` hook

## Utility Functions

### Date/Time Handling
- Use `utils/dateUtils.ts` for consistent timestamp creation
- Always work with ISO strings for persistence
- Local Date objects only for UI components

### Food Entry Processing
- Use `utils/foodHelpers.ts` for calorie calculations
- `processIngredients()` converts form data to domain objects
- `calculateTotalCalories()` aggregates ingredient calories
- Handle optional calorie data gracefully

## File Organization

### Critical Files
- `app/_layout.tsx` - Root provider setup (don't modify provider order)
- `hooks/TrackingContext.tsx` - Central state management
- `types/tracking.ts` - All domain types
- `docs/ARCHITECTURE.md` - Detailed technical documentation

### Styling Architecture
- Component-specific styles in `styles/` directory
- Use StyleSheet.create() for performance
- Follow existing color theming patterns

## Integration Points

### Expo Router Navigation
- Use file-based routing - don't manually configure routes
- Navigation types auto-generated from file structure
- Deep linking works automatically with proper file naming

### Context Provider Setup
```tsx
// Root layout pattern - maintain this order
<TrackingProvider>
  <ThemeProvider value={theme}>
    <Slot />
  </ThemeProvider>
</TrackingProvider>
```

### External Dependencies
- `@expo/vector-icons` for consistent iconography
- Skia for high-performance graphics (don't add other chart libraries)
- React Navigation automatically integrated via Expo Router

## Common Gotchas

1. **Form validation**: Always validate before calling `processIngredients()`
2. **ID generation**: Use consistent UUID patterns for new entities
3. **Unit handling**: Support g/ml/piece units consistently
4. **Calorie calculations**: Handle missing nutritional data gracefully
5. **Date/time precision**: Use 15-minute intervals for time selections

## Major Architecture Changes

When implementing large architectural changes:

### Documentation Updates Required
1. **Update `docs/ARCHITECTURE.md`** - Modify system diagrams and component hierarchies
2. **Update `docs/TECHNICAL_DECISIONS.md`** - Add new Technical Decision Record (TDR)
3. **Update this file** - Revise patterns and conventions if they change
4. **Update component documentation** - Reflect new integration patterns

### Technical Decision Records (TDRs)
Create a new TDR in `docs/TECHNICAL_DECISIONS.md` following the established format:
```markdown
## TDR-XXX: [Decision Title]
**Date**: YYYY-MM-DD
**Status**: Decided
**Context**: Why this change was needed
**Decision**: What was decided and alternatives considered
**Consequences**: Trade-offs and implications
```

### Examples of Major Changes Requiring TDRs
- Switching state management approaches (Context → Redux, etc.)
- Adding new navigation patterns or screen structures
- Changing data persistence strategies
- Modifying form validation or data processing flows
- Adding external API integrations

When adding features, follow established patterns in existing components and consult `docs/ARCHITECTURE.md` for system-level decisions.