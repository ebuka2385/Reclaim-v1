# Reclaim Mobile

Minimal React Native mobile app for Reclaim lost-and-found platform, built with Expo.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```
   Or press `i` in the Metro console.

4. **Run on Android:**
   ```bash
   npm run android
   ```
   Or press `a` in the Metro console.

## Project Structure

```
mobile/
├── App.tsx           # Main app component with all screens
├── index.js          # Entry point
├── app.json          # Expo configuration
├── package.json      # Dependencies
└── tsconfig.json     # TypeScript config
```

## Features

- 🏠 Home screen with navigation
- 📝 Report item screen (placeholder)
- 📋 View items screen with mock data
- 🎨 Clean, minimalist UI with native styles

## Screens

All screens are in `App.tsx` using simple state-based navigation:
- **Home** - Landing page with action buttons
- **Report** - Placeholder for reporting items
- **Items** - List of lost/found items

## Next Steps

- Add React Navigation for better routing
- Connect to backend API
- Add camera functionality
- Implement real-time updates
- Add push notifications
