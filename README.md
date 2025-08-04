# Food Tracker App

A mobile-first app for tracking food and water intake, with progress snapshots and future AI-driven insights.

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API with custom hooks
- **UI Components**: Custom themed components with React Native StyleSheet
- **Charts & Visualization**: @shopify/react-native-skia for high-performance graphics
- **TypeScript**: Full type safety across the application

### Project Structure
```
app/                    # Expo Router pages
├── (tabs)/            # Tab-based navigation
├── _layout.tsx        # Root layout
└── +html.tsx          # Web-specific layout

components/            # Reusable UI components
├── navigation/        # Navigation-specific components
└── __tests__/         # Component tests

hooks/                 # Custom React hooks
├── TrackingContext.tsx # Global state management
└── useColorScheme.ts  # Theme management

styles/                # Global styles (moved from app/ to avoid routing conflicts)
types/                 # TypeScript type definitions
constants/             # App constants (colors, etc.)
```

### Key Design Decisions

1. **File-based Routing**: Using Expo Router for intuitive navigation structure
2. **Context over Redux**: Lightweight state management for this scale of app
3. **Native Performance**: Skia for charts ensures 60fps animations
4. **Type Safety**: Full TypeScript implementation for better developer experience
5. **Component Isolation**: Clear separation between UI, logic, and styling

---

## 🚀 Get Started

### 1. Install Dependencies

```
npm install
```

### 2. Run the App Locally (Android)

Ensure your Android emulator is running or connect a device via USB

```
npm run build
```

Alternatively to open the project in development mode

```
npm run start
```

### 3. Troubleshooting

If you hit environment or dependency issues:

```
npx expo-doctor
```

### ⚙️ Requirements

Node.js 18 or 20

Android Studio with emulator configured (for Android builds)

Java 17 installed and available on your PATH

Expo CLI (bundled via npx expo)

### 🛠 Additional Notes

Native android/ folder is included for local Android builds

Charts use react-native-skia, requiring native builds — not supported in Expo Go

For iOS development, future setup for Xcode is required
