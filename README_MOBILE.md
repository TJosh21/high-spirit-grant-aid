# High Spirit Grant Assistant - Native Mobile Apps

🚀 **STORE-READY CONFIGURATION** - Your Capacitor setup is complete and ready to build!

This document provides step-by-step instructions to build and submit native iOS and Android apps to the App Store and Google Play Store.

## 📱 Overview

**App Identity:**
- **App Name**: High Spirit Grant Assistant
- **Display Name**: HS Grant Assistant
- **iOS Bundle ID**: com.highspirit.grantassistant
- **Android Application ID**: com.highspirit.grantassistant
- **Production URL**: https://68d3aecb-93c8-4e4e-898d-3882414185c4.lovableproject.com
- **Category**: Business / Finance

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

## 🚀 Quick Start - Build Your Apps

### Step 1: Export & Clone Project

1. **Export to GitHub**: Click the GitHub button in Lovable (top right)
2. **Clone locally**:
```bash
git clone <your-github-repo-url>
cd high-spirit-grant-assistant
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build Web App

```bash
npm run build
```

### Step 4: Add Native Platforms

```bash
# Add iOS (Mac with Xcode required)
npx cap add ios

# Add Android
npx cap add android

# Sync everything
npx cap sync
```

✅ **Production URL is pre-configured** in `capacitor.config.ts` to point to your live Lovable app.

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

### Building for App Store (.ipa)

1. **Prepare Xcode Project:**
   - In Xcode, select your project in the navigator
   - Go to "Signing & Capabilities"
   - Select your Apple Developer Team
   - Ensure "Automatically manage signing" is checked

2. **Create Archive:**
   - In Xcode menu: **Product → Archive**
   - Wait for build to complete (5-10 minutes)
   - Xcode Organizer will open automatically

3. **Distribute to App Store:**
   - Click **"Distribute App"**
   - Select **"App Store Connect"**
   - Click **"Upload"**
   - Select signing options (automatic is easiest)
   - Click **"Upload"**

4. **App Store Connect Setup:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click **"My Apps"** → **"+"** → **"New App"**
   - Fill in:
     - **Platform**: iOS
     - **Name**: High Spirit Grant Assistant
     - **Primary Language**: English
     - **Bundle ID**: com.highspirit.grantassistant
     - **SKU**: HSGrantAssistant001
   - Add app description, screenshots, and metadata
   - Submit for review (usually 1-3 days)

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

### Building for Google Play (.aab)

1. **Generate Signing Key (First Time Only):**
```bash
cd android/app
keytool -genkey -v -keystore highspirit-release.keystore -alias highspirit -keyalg RSA -keysize 2048 -validity 10000
```
   - Enter a strong password (save it securely!)
   - Fill in your organization details

2. **Configure Signing:**
   - Create `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=highspirit
storeFile=app/highspirit-release.keystore
```

   - Edit `android/app/build.gradle`:
```gradle
// Add at the top
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **Build Release AAB:**
```bash
cd android
./gradlew bundleRelease
```
   - Output: `android/app/build/outputs/bundle/release/app-release.aab`

4. **Test APK (Optional):**
```bash
./gradlew assembleRelease
```
   - Output: `android/app/build/outputs/apk/release/app-release.apk`
   - Install on device: `adb install app-release.apk`

5. **Upload to Google Play Console:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Click **"Create app"**
   - Fill in:
     - **App name**: High Spirit Grant Assistant
     - **Default language**: English
     - **App or game**: App
     - **Free or paid**: Free
   - Complete the setup wizard:
     - **Store listing**: Add description, screenshots, icons
     - **Content rating**: Fill out questionnaire
     - **Target audience**: Select age groups
     - **Privacy policy**: Add your privacy policy URL
   - Go to **"Release" → "Production"**
   - Click **"Create new release"**
   - Upload your `.aab` file
   - Add release notes
   - Click **"Review release"** → **"Start rollout to Production"**
   - Review usually takes 1-3 days

## ✅ Store Submission Checklist

### iOS App Store Requirements

- [ ] Apple Developer Account ($99/year) - [Sign up](https://developer.apple.com/programs/)
- [ ] App Store Connect account set up
- [ ] App icon (1024x1024) - Already created in `public/icon.png`
- [ ] Screenshots for required device sizes:
  - 6.7" iPhone (1290x2796) - iPhone 15 Pro Max
  - 6.5" iPhone (1242x2688) - iPhone 11 Pro Max
  - 5.5" iPhone (1242x2208) - iPhone 8 Plus
- [ ] App description (4000 character max)
- [ ] Keywords (100 character max)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating completed
- [ ] Test the app thoroughly on real devices

### Google Play Store Requirements

- [ ] Google Play Developer account ($25 one-time) - [Sign up](https://play.google.com/console/signup)
- [ ] App icon (512x512) - Already created
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (at least 2):
  - Phone: 16:9 or 9:16 ratio
  - Tablet (optional): 16:9 or 9:16 ratio
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire completed
- [ ] Target audience and content selected
- [ ] Test the app on multiple Android devices

### Both Platforms

- [ ] Create privacy policy (required by both stores)
- [ ] Prepare app description highlighting:
  - Find and apply for business grants
  - AI-powered answer assistance
  - Track application progress
  - Filter grants by category, amount, deadline
- [ ] Test all features:
  - User registration & login
  - Grant browsing and filtering
  - Application creation
  - AI answer polishing
  - Profile management
- [ ] Prepare promotional materials
- [ ] Set up support email/website

## 🔄 Development Workflow

### Making Changes to the Web App

When you update your Lovable web app, the mobile apps automatically get the changes (they load the live URL). However, if you change native features:

```bash
# 1. Pull latest from GitHub
git pull

# 2. Build the web app
npm run build

# 3. Sync changes to native projects
npx cap sync

# 4. Re-run the app
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

# Build for testing
npm run build:mobile         # Build web + sync both platforms

# Run on devices with live reload
npx cap run ios --livereload --external
npx cap run android --livereload --external

# Update Capacitor
npm install @capacitor/core@latest @capacitor/cli@latest @capacitor/ios@latest @capacitor/android@latest

# Check Capacitor setup
npx cap doctor

# View native logs
npx cap run ios
npx cap run android
```

## 🎯 Quick Reference: File Locations

```
Project Structure:
├── capacitor.config.ts              # Main Capacitor config (✅ production URL set)
├── public/
│   ├── icon.png                     # App icon source (1024x1024)
│   └── splash.png                   # Splash screen source
├── src/mobile/
│   └── MobileApp.tsx                # Native features wrapper
├── ios/                             # iOS native project (created after npx cap add ios)
│   └── App/
│       ├── App/
│       │   ├── Info.plist          # iOS app configuration
│       │   └── Assets.xcassets     # App icons, splash screens
│       └── App.xcodeproj           # Xcode project
├── android/                         # Android native project (created after npx cap add android)
│   ├── app/
│   │   ├── build.gradle            # Android build config
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/                # App icons, splash screens
│   └── key.properties              # Signing config (YOU CREATE THIS)
└── dist/                            # Built web app (Capacitor loads this)
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
