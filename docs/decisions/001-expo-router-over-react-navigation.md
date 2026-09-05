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
