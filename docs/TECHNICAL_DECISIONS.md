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
