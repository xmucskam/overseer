# 🚀 Expo React Native Setup Guide

> A comprehensive guide to get your Expo React Native project up and running quickly

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your system:

### Required Tools

| Tool | Description | Installation |
|------|-------------|--------------|
| **Node.js** | JavaScript runtime (LTS version recommended) | [Download here](https://nodejs.org/) |
| **npm/yarn** | Package manager (npm comes with Node.js) | Included with Node.js |
| **Expo CLI** | Command line tool for Expo development | See installation below |

### 🛠 Install Expo CLI

Choose one of the following methods:

**Global Installation (Traditional):**
```bash
npm install -g expo-cli
```

**Modern Approach (Recommended):**
```bash
# No global installation needed - use npx
npx expo --version
```

---

## 🏗 Project Setup

### 1. Navigate to Project Directory

```bash
cd your-project-folder
```

### 2. Install Dependencies

**Using npm:**
```bash
npm install
```

**Using Yarn:**
```bash
yarn install
```

> 💡 **Tip:** Check your `package.json` to see which package manager the project was configured with.

---

## 🎯 Running Your Project

### Start the Development Server

Choose the appropriate command based on your setup:

```bash
# Modern Expo CLI (Recommended)
npx expo start

# Traditional method
npm start

# If using Yarn
yarn start
```

This will:
- ✅ Start the Metro bundler
- 🌐 Open Expo Developer Tools in your browser  
- 📱 Display a QR code for device testing

---

## 📱 Testing Your App

### Option 1: Physical Device (Not Implemented)

1. **Install Expo Go: **
   - 📱 **iOS:** Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - 🤖 **Android:** Download from [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to your app:**
   - Open Expo Go app
   - Scan the QR code displayed in your terminal/browser
   - Your app will load automatically!

### Option 2: Simulator/Emulator

**iOS Simulator (macOS only):**
- Ensure Xcode is installed
- Press `i` in the terminal after running `expo start`

**Android Emulator:**
- Ensure Android Studio is installed with an AVD
- Press `a` in the terminal after running `expo start`

---

## 🔧 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Missing Dependencies** | Check `package.json` for correct versions and run `npm install` |
| **Cache Issues** | Clear Expo cache: `npx expo start -c` |
| **Port Conflicts** | Kill other Metro processes or specify a different port |
| **QR Code Not Working** | Ensure your phone and computer are on the same network |

### Additional Commands

```bash
# Clear cache and restart
npx expo start -c

# Start with specific options
npx expo start --tunnel  # Use tunnel connection
npx expo start --lan     # Use LAN connection
npx expo start --localhost  # Use localhost only
```

---

## 🎨 Development Workflow

### Hot Reloading
- **Fast Refresh:** Automatically enabled - your changes appear instantly
- **Manual Reload:** Shake your device or press `Cmd+R` (iOS) / `Ctrl+M` (Android)

### Debugging
- **Remote Debugging:** Available through Expo Dev Tools
- **Flipper Integration:** Supported for advanced debugging
- **Console Logs:** Visible in Metro bundler terminal

---

## 📦 Package Manager Detection

> **Need help determining your package manager?**
> 
> Check your project root for:
> - `package-lock.json` → Use **npm**
> - `yarn.lock` → Use **yarn**

Would you like me to analyze your `package.json` to recommend the best setup approach for your specific project?

---

## 🤝 Need Help?

- 📚 **Expo Documentation:** [docs.expo.dev](https://docs.expo.dev)
- 💬 **Expo Discord:** [chat.expo.dev](https://chat.expo.dev)
- 🐛 **Report Issues:** [GitHub Issues](https://github.com/expo/expo/issues)
- 📖 **React Native Docs:** [reactnative.dev](https://reactnative.dev)

---

## ⚡ Quick Start Checklist

- [ ] Node.js installed (LTS version)
- [ ] Project dependencies installed (`npm install` or `yarn install`)
- [ ] Expo Go app installed on phone (optional)
- [ ] Development server started (`npx expo start`)
- [ ] App running on device or simulator

---

<div align="center">

**Happy Coding!** 🎉

*Made with ❤️ using Expo and React Native*
