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
