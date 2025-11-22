# High Spirit Grant Assistant - Native Mobile Apps

This document explains how to build and deploy the native iOS and Android apps for High Spirit Grant Assistant.

## 📱 Overview

The mobile apps use **Capacitor** to wrap the existing web app in a native container. The app loads your web application in a WebView while providing native features like:
- Native app icons and splash screens
- Status bar customization
- Android back button handling
- Offline detection
- Push notifications (ready to implement)
- Deep linking support (ready to implement)

## 🔧 Prerequisites

### For Both Platforms
- Node.js 18+ and npm
- Git

### For iOS (Mac only)
- macOS 12+ (Monterey or later)
- Xcode 14+ (from Mac App Store)
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer Account ($99/year for App Store)

### For Android
- Java JDK 17+
- Android Studio (latest version)
- Android SDK 33+
- Google Play Console account ($25 one-time fee)

## 🚀 Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone your repository
git clone <your-repo-url>
cd <your-repo-name>

# Install dependencies
npm install

# Build the web app
npm run build
```

### 2. Initialize Capacitor

```bash
# Initialize Capacitor (only needed once)
npx cap init

# When prompted, accept the defaults:
# App name: High Spirit Grant Assistant
# App ID: com.highspirit.grantassistant
# Web Dir: dist
```

### 3. Add Native Platforms

```bash
# Add iOS (Mac only)
npx cap add ios

# Add Android
npx cap add android
```

### 4. Configure Your Production URL

**IMPORTANT:** Before building for production, update the server URL in `capacitor.config.ts`:

```typescript
server: {
  url: 'https://your-production-domain.com',  // Update this!
  cleartext: true,
  androidScheme: 'https'
}
```

Current development URL: `https://68d3aecb-93c8-4e4e-898d-3882414185c4.lovableproject.com`

## 🎨 Customizing Branding

### App Icons & Splash Screen

1. Replace the default icon and splash screen:
   - Place your app icon (1024x1024) at `public/icon.png`
   - Place your splash screen at `public/splash.png`

2. Generate all required sizes:
```bash
# Install icon generator
npm install -g @capacitor/assets

# Generate all icons and splash screens
npx capacitor-assets generate
```

This will create all required icons for:
- iOS: App Icon, Notification Icon
- Android: Adaptive Icons, Notification Icon, Splash Screen

### App Name
To change the app name, edit `capacitor.config.ts`:
```typescript
appName: 'Your New App Name'
```

### Bundle IDs
- iOS: Edit `ios/App/App/Info.plist` → CFBundleIdentifier
- Android: Edit `android/app/build.gradle` → applicationId

## 📱 Running on iOS

### Development (Simulator)

```bash
# Sync code to iOS project
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios
```

In Xcode:
1. Select a simulator (e.g., iPhone 15 Pro)
2. Click the Play button ▶️
3. The app will build and launch in the simulator

### Testing on Physical Device

1. Connect your iPhone via USB
2. In Xcode, select your device from the device dropdown
3. Sign the app with your Apple Developer account:
   - Select the project in Xcode
   - Go to "Signing & Capabilities"
   - Choose your Team
4. Click Play ▶️

### Building for App Store

1. **Archive the app:**
   - In Xcode: Product → Archive
   - Wait for the build to complete
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow the upload wizard

2. **App Store Connect:**
   - Log in to [App Store Connect](https://appstoreconnect.apple.com)
   - Create a new app listing
   - Fill in metadata (description, screenshots, etc.)
   - Submit for review

## 🤖 Running on Android

### Development (Emulator)

```bash
# Sync code to Android project
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Create an emulator (Tools → Device Manager) if needed
3. Select the emulator from the device dropdown
4. Click Run ▶️

### Testing on Physical Device

1. Enable Developer Options on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
3. Connect device via USB
4. Select your device in Android Studio
5. Click Run ▶️

### Building for Google Play

1. **Generate a signed APK/AAB:**

```bash
cd android
./gradlew bundleRelease
```

2. **Sign the bundle:**
   - Create a keystore (first time only):
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

   - Edit `android/app/build.gradle` to add signing config:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'your-password'
            keyAlias 'my-key-alias'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. **Upload to Play Console:**
   - Log in to [Google Play Console](https://play.google.com/console)
   - Create a new app
   - Upload the AAB file from `android/app/build/outputs/bundle/release/`
   - Fill in store listing details
   - Submit for review

## 🔄 Development Workflow

### Making Changes

Every time you update the web app:

```bash
# 1. Build the web app
npm run build

# 2. Sync changes to native projects
npx cap sync

# 3. Re-run the app
# iOS: npx cap open ios (then run in Xcode)
# Android: npx cap open android (then run in Android Studio)
```

### Live Reload During Development

For faster development, you can use hot-reload:

1. Start the web dev server:
```bash
npm run dev
```

2. Update `capacitor.config.ts`:
```typescript
server: {
  url: 'http://localhost:8080',  // Your local dev server
  cleartext: true
}
```

3. Sync and run:
```bash
npx cap sync
# Then run in Xcode or Android Studio
```

**Remember:** Change the URL back to production before building release versions!

## 🔔 Future Features

### Push Notifications

To implement push notifications:

1. **Install plugin:**
```bash
npm install @capacitor/push-notifications
```

2. **Uncomment push notification code in `src/mobile/MobileApp.tsx`**

3. **iOS Setup:**
   - Enable Push Notifications capability in Xcode
   - Create APNs key in Apple Developer Portal
   - Configure in your push notification service (Firebase, OneSignal, etc.)

4. **Android Setup:**
   - Add `google-services.json` to `android/app/`
   - Configure Firebase Cloud Messaging

### Deep Linking

To implement deep links (e.g., `highspirit://grant/abc123`):

1. **iOS:**
   - Edit `ios/App/App/Info.plist`
   - Add URL scheme: `highspirit`

2. **Android:**
   - Edit `android/app/src/main/AndroidManifest.xml`
   - Add intent filter for your domain

3. **Uncomment deep linking code in `src/mobile/MobileApp.tsx`**

## 🐛 Troubleshooting

### iOS Build Fails
- Run `pod install` in the `ios/App` directory
- Clean build folder: Product → Clean Build Folder in Xcode
- Update CocoaPods: `sudo gem install cocoapods`

### Android Build Fails
- Sync Gradle: File → Sync Project with Gradle Files
- Invalidate caches: File → Invalidate Caches / Restart
- Check Java version: `java -version` (should be 17+)

### App Shows White Screen
- Check the URL in `capacitor.config.ts`
- Verify `npm run build` completed successfully
- Check browser console in Chrome DevTools (for Android) or Safari Web Inspector (for iOS)

### Network Errors
- Ensure `cleartext: true` is set in `capacitor.config.ts`
- For iOS: Check `NSAppTransportSecurity` in Info.plist
- For Android: Check `android:usesCleartextTraffic` in AndroidManifest.xml

## 📦 Project Structure

```
high-spirit-grant-assistant/
├── capacitor.config.ts          # Capacitor configuration
├── ios/                         # iOS native project (generated)
│   └── App/
│       ├── App/
│       │   ├── Info.plist       # iOS app configuration
│       │   └── Assets.xcassets  # App icons, splash screens
│       └── App.xcodeproj        # Xcode project
├── android/                     # Android native project (generated)
│   └── app/
│       ├── src/main/
│       │   ├── AndroidManifest.xml
│       │   └── res/             # App icons, splash screens
│       └── build.gradle         # Android build config
├── src/mobile/
│   └── MobileApp.tsx            # Mobile-specific features
├── public/
│   ├── icon.png                 # Source app icon (1024x1024)
│   └── splash.png               # Source splash screen
└── dist/                        # Built web app (Capacitor loads this)
```

## 📚 Useful Commands

```bash
# Build web app
npm run build

# Sync web app to native projects
npx cap sync

# Open native IDEs
npx cap open ios
npx cap open android

# Update Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# View native logs
npx cap run ios --livereload
npx cap run android --livereload
```

## 🔗 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Developer Program](https://developer.apple.com/programs/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Human Interface Guidelines (iOS)](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design (Android)](https://material.io/design)

## 🆘 Support

For issues specific to this mobile wrapper:
1. Check the troubleshooting section above
2. Review Capacitor logs: `npx cap doctor`
3. Check Capacitor community forum: https://forum.ionicframework.com/c/capacitor

---

**Ready to ship!** 🚀 Follow the steps above to build and deploy your native apps to the App Store and Google Play.
