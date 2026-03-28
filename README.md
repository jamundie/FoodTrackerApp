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
- **Backend**: Supabase (Postgres + RLS + private object storage + Auth)
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
6. **Persistence via Supabase**: All data stored in Postgres with RLS; meal photos in a private storage bucket

📖 **For detailed architecture documentation, see [docs/](./docs/)**

## 📚 Documentation

- **[Architecture Overview](./docs/ARCHITECTURE.md)** - Complete technical architecture with diagrams
- **[Feature Documentation](./docs/FEATURES.md)** - Comprehensive user-facing feature guide
- **[Technical Decisions](./docs/TECHNICAL_DECISIONS.md)** - Decision records and rationale  
- **[Component Diagrams](./docs/COMPONENT_DIAGRAMS.md)** - Visual component structure and roadmap
- **[Documentation Index](./docs/README.md)** - Navigation guide for all docs

---

## 🚀 Get Started

### ⚙️ Requirements

- Node.js 18 or 20
- Android Studio with emulator configured (for Android builds)
- Java 17 on your PATH
- Expo CLI (bundled via `npx expo`)
- A [Supabase](https://supabase.com) project (free tier is sufficient)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are available in your Supabase project under **Settings → API**.

### 3. Run the Database Migration

In your Supabase project, open the **SQL Editor** and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates the `food_entries`, `water_entries`, and `user_profiles` tables, enables RLS, and creates the private `meal-photos` storage bucket.

### 4. Dev Auto-Sign-In (optional but recommended)

To skip the sign-in screen on every dev build, create a Supabase Auth user once (via the Supabase Dashboard → Authentication → Users → Invite user), then add their credentials to `.env.local`:

```
EXPO_PUBLIC_DEV_EMAIL=dev@example.com
EXPO_PUBLIC_DEV_PASSWORD=your-dev-password
```

When `__DEV__` is `true` and these vars are set, `AuthContext` signs in automatically on startup — `npm run android` opens straight to the app tabs.

> These vars are ignored in production builds. Never commit `.env.local`.

### 5. Run the App

```bash
# Android (emulator must be running)
npm run android

# Start Metro bundler only
npm run start
```

### 6. Troubleshooting

```bash
npx expo-doctor
```

### 🛠 Additional Notes

- Native `android/` folder is included for local Android builds
- Charts use `react-native-skia`, requiring native builds — not supported in Expo Go
- For iOS development, Xcode setup is required
- `.nvmrc` pins Node 20; CI currently uses Node 18 — align before changing CI
