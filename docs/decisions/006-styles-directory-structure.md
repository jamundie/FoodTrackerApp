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
