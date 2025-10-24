# Food Tracker App

A mobile-first app for tracking food and water intake, with progress snapshots and future AI-driven insights.

## ✨ Key Features

### 🍽️ Advanced Food Entry System
- **Smart Date/Time Selection**: Intuitive dual-picker with expandable calendar interface
- **Quick Access**: "Today" and "Yesterday" shortcuts for rapid meal logging
- **Precise Calendar Control**: Navigate any past date with visual indicators
- **Structured Time Slots**: 15-minute intervals for accurate meal timing
- **Dynamic Ingredient Management**: Add/remove ingredients with unit selection (g, ml, pieces)
- **Automatic Calorie Calculation**: Real-time computation based on nutritional data
- **Category Classification**: Pre-defined meal categories with type safety
- **Form Validation**: Comprehensive input validation with user-friendly error messages

### 🧭 Navigation & UX
- **Tab-Based Navigation**: Intuitive access to Food, Water, Stats, and Dashboard
- **Themed Components**: Consistent design system across the app
- **Recent Entries**: Quick overview of latest meal logs
- **Form Reset**: Clean slate after each successful entry

### 🏗️ Technical Excellence
- **Full TypeScript**: Complete type safety with strict compilation
- **Context API State**: Efficient global state management
- **Custom Hooks**: Reusable business logic encapsulation
- **Comprehensive Testing**: Unit and integration test coverage
- **Performance Optimized**: Native builds with Skia graphics

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API with custom hooks
- **UI Components**: Custom themed components with React Native StyleSheet
- **Charts & Visualization**: @shopify/react-native-skia for high-performance graphics
- **TypeScript**: Full type safety across the application

### Key Design Decisions

1. **File-based Routing**: Using Expo Router for intuitive navigation structure
2. **Context over Redux**: Lightweight state management for this scale of app
3. **Native Performance**: Skia for charts ensures 60fps animations
4. **Type Safety**: Full TypeScript implementation for better developer experience
5. **Component Isolation**: Clear separation between UI, logic, and styling

📖 **For detailed architecture documentation, see [docs/](./docs/)**

## 📚 Documentation

- **[Architecture Overview](./docs/ARCHITECTURE.md)** - Complete technical architecture with diagrams
- **[Feature Documentation](./docs/FEATURES.md)** - Comprehensive user-facing feature guide
- **[Technical Decisions](./docs/TECHNICAL_DECISIONS.md)** - Decision records and rationale  
- **[Component Diagrams](./docs/COMPONENT_DIAGRAMS.md)** - Visual component structure and roadmap
- **[Documentation Index](./docs/README.md)** - Navigation guide for all docs

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

### 3. Mock Data for Development

The app includes permanent mock data (3 food entries, 2 water entries) that loads automatically in development mode to help with testing and feature development.

**Mock data behavior:**
- **Development mode** (`npm start`): Mock data loads automatically
- **Production builds**: No mock data (clean slate)
- **Tests**: No mock data (isolated test environment)

**To control mock data:**
```bash
# Force enable mock data in any environment
EXPO_PUBLIC_USE_MOCK_DATA=true npm start

# Development mode always includes mock data unless explicitly disabled
npm start  # includes mock data
```

### 4. Troubleshooting

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
