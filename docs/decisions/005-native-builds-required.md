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
