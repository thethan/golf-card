# Golf Scorecard App 🏌️

A React Native/Expo golf scorecard application with voice input support.

## 🚀 Quick Start with GitHub Codespaces

The easiest way to develop this app is using GitHub Codespaces:

1. Click the **Code** button on the repository
2. Select **Codespaces** tab
3. Click **Create codespace on main**

The environment will automatically set up with all dependencies installed.

### Running the App

Once your Codespace is ready, run the web version:

```bash
cd golf-scorecard
npm run web
```

The app will open automatically in your browser (port 19006).

## 📱 Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: macOS with Xcode
- For Android: Android Studio with SDK

### Installation

```bash
cd golf-scorecard
npm install
```

### Running Locally

```bash
# Web (works everywhere)
npm run web

# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Start Expo dev server
npm start
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Database**: expo-sqlite for local storage
- **Voice Input**: @jamsch/expo-speech-recognition

## 📁 Project Structure

```
golf-scorecard/
├── App.tsx              # Main app entry point
├── src/
│   ├── db/              # Database layer (SQLite)
│   ├── input/           # Voice input parsing
│   ├── screens/         # Screen components
│   └── ui/              # Reusable UI components
├── assets/              # Images and icons
├── ios/                 # iOS native code
└── android/             # Android native code
```

## 🌐 Deploying to Web

To create a production web build:

```bash
cd golf-scorecard
npx expo export --platform web
```

The output will be in the `dist/` folder, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## 🔧 Environment Variables

For production deployments, you may need to configure:

- `EXPO_PUBLIC_*` - Public environment variables

## 📝 Development in Codespaces

### Useful Commands

```bash
# Install dependencies
npm install

# Start web development server
npm run web

# Check TypeScript types
npx tsc --noEmit

# Format code
npx prettier --write .
```

### Port Forwarding

The Codespace automatically forwards these ports:
- **8081**: Metro Bundler
- **19000-19002**: Expo Dev Server
- **19006**: Expo Web App (auto-opens in browser)

## 📄 License

Private project.
