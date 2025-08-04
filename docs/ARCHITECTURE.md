# Architecture Documentation

## Overview
Food Tracker App is a React Native application built with Expo, designed for tracking nutritional intake with a focus on performance, user experience, and maintainability.

## Core Technologies

### Frontend Stack
- **React Native 0.79.5**: Cross-platform mobile development
- **Expo SDK 53**: Development tooling and managed workflow
- **TypeScript 5.8.3**: Static typing for better code quality
- **Expo Router 5.1.3**: File-based navigation system

### UI & Graphics
- **@shopify/react-native-skia**: High-performance 2D graphics for charts
- **@expo/vector-icons**: Icon library
- **React Native StyleSheet**: Styling with performance optimizations

### State Management
- **React Context API**: Global state management
- **Custom Hooks**: Encapsulated business logic
- **Local Component State**: For UI-specific state

## Architecture Patterns

### 1. File-Based Routing
```
app/
├── (tabs)/           # Tab navigation group
│   ├── index.tsx     # Home/Dashboard
│   ├── food.tsx      # Food tracking
│   ├── water.tsx     # Water tracking
│   └── stats.tsx     # Statistics
├── _layout.tsx       # Root layout with providers
└── +not-found.tsx    # 404 handling
```

**Benefits:**
- Intuitive navigation structure
- Automatic route generation
- Type-safe navigation
- Easy deep linking setup

### 2. Component Architecture
```
components/
├── navigation/       # Navigation-specific components
├── PlaceholderCircle/ # Feature-specific components
├── Themed*/          # Design system components
└── __tests__/        # Component tests
```

**Design Principles:**
- Single Responsibility Principle
- Composition over inheritance
- Reusable and testable components
- Consistent theming system

### 3. State Management Strategy

#### Global State (TrackingContext)
- User tracking data (food, water intake)
- Application preferences
- Cross-screen shared state

#### Local State
- Form inputs
- UI toggles
- Component-specific data

#### Benefits of This Approach:
- Lightweight compared to Redux
- Built-in React patterns
- Easy to understand and maintain
- No additional dependencies

### 4. Styling Architecture
```
styles/
├── index.styles.ts   # Home screen styles
└── layout.styles.ts  # Layout styles
```

**Strategy:**
- Centralized styling files
- StyleSheet.create() for performance
- Consistent spacing and colors via constants
- Platform-specific styles when needed

### 5. Type Safety
```
types/
└── tracking.ts       # Domain-specific type definitions
```

**Implementation:**
- Strict TypeScript configuration
- Interface definitions for all data structures
- Typed navigation parameters
- Generic hooks for reusability

## Performance Considerations

### 1. React Native Skia for Charts
- **Why**: 60fps animations, complex graphics capability
- **Alternative considered**: Victory Native (chose Skia for performance)
- **Trade-off**: Larger bundle size for better UX

### 2. Native Builds Required
- Skia requires native compilation
- Cannot use Expo Go for development
- Development builds necessary for testing

### 3. Memory Management
- StyleSheet.create() for style caching
- Memoized components where appropriate
- Lazy loading for heavy screens

## Development Workflow

### Testing Strategy
- **Unit Tests**: Jest with React Native Testing Library
- **Component Tests**: Snapshot testing for UI consistency
- **Manual Testing**: Development builds on real devices

### Code Quality
- **Husky**: Pre-commit hooks
- **TypeScript**: Compile-time error checking
- **Expo Lint**: Code style consistency

### Build Process
- **Development**: `expo start` with development build
- **Android**: `expo run:android` for local builds
- **iOS**: Future setup with Xcode required

## Scalability Considerations

### Current Architecture Supports:
- Adding new tracking categories (exercise, sleep, etc.)
- Multiple user profiles
- Offline data storage (future enhancement)
- Push notifications (future enhancement)

### Future Enhancements:
- AI-driven insights integration
- Cloud sync capabilities
- Social features
- Advanced analytics

## Security & Privacy
- Local data storage (no cloud by default)
- Type-safe data handling
- Future: encryption for sensitive data

## Decision Log

### Major Architectural Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Expo Router | React Navigation | File-based routing, better DX, type safety |
| Context API | Redux, Zustand | Simpler for current scope, built-in React |
| React Native Skia | Victory Native, D3 | Performance for complex charts |
| TypeScript | JavaScript | Better maintainability, fewer runtime errors |
| Native builds | Expo Go | Required for Skia, better for production |

### File Organization Decisions

| Decision | Issue | Resolution |
|----------|--------|------------|
| Moved styles/ out of app/ | Expo Router treating styles as routes | Relocated to root level to avoid routing conflicts |
| Separate navigation components | Code organization | Better separation of concerns |
| Custom hooks for business logic | State management | Reusable logic, easier testing |

## Getting Started for Contributors

1. **Prerequisites**: Node.js 20, Android Studio, Java 17
2. **Setup**: `npm install` → `npm run android`
3. **Development**: Use development builds, not Expo Go
4. **Testing**: `npm test` for unit tests
5. **Architecture**: Follow existing patterns, update this doc for major changes

## Contributing Guidelines

- Follow TypeScript strict mode
- Add tests for new components
- Update documentation for architectural changes
- Use conventional commit messages
- Run linting before commits
