# 📦 Build Instructions - High Spirit Grant Assistant Mobile Apps

**Your Capacitor setup is complete!** This guide walks you through building store-ready native apps.

## ⚠️ Important: You Must Build Locally

**Lovable cannot build native iOS/Android binaries.** Native compilation requires:
- **iOS**: Xcode (Mac only) + Apple Developer account
- **Android**: Android Studio + Java JDK + signing keys

**Everything is pre-configured** - you just need to run the build commands locally.

---

## 🚀 Step-by-Step Build Process

### Prerequisites

**For Android:**
- ✅ Android Studio installed
- ✅ Java JDK 17+ installed
- ✅ Android SDK 33+ installed
- ✅ Google Play Developer account ($25 one-time)

**For iOS:**
- ✅ Mac with macOS 12+
- ✅ Xcode 14+ installed
- ✅ CocoaPods installed: `sudo gem install cocoapods`
- ✅ Apple Developer account ($99/year)

---

### Step 1: Get the Code Locally

```bash
# 1. Export to GitHub (click GitHub button in Lovable)
# 2. Clone your repo
git clone https://github.com/YOUR_USERNAME/high-spirit-grant-assistant.git
cd high-spirit-grant-assistant

# 3. Install dependencies
npm install

# 4. Build the web app
npm run build
```

---

### Step 2: Add Native Platforms

```bash
# Add iOS (Mac only)
npx cap add ios

# Add Android
npx cap add android

# Sync everything
npx cap sync
```

✅ **Your production URL is already configured** in `capacitor.config.ts`

---

### Step 3A: Build Android App (.aab for Play Store)

#### Create Signing Key (First Time Only)

```bash
cd android/app
keytool -genkey -v -keystore highspirit-release.keystore \
  -alias highspirit -keyalg RSA -keysize 2048 -validity 10000

# Save the password securely!
cd ../..
```

#### Configure Signing

Create `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=highspirit
storeFile=app/highspirit-release.keystore
```

#### Build Release Bundle

```bash
cd android
./gradlew bundleRelease
```

**Output**: `android/app/build/outputs/bundle/release/app-release.aab`

#### Test APK (Optional)

```bash
./gradlew assembleRelease
```

**Output**: `android/app/build/outputs/apk/release/app-release.apk`

Install on device: `adb install app/build/outputs/apk/release/app-release.apk`

---

### Step 3B: Build iOS App (.ipa for App Store)

#### Open in Xcode

```bash
npx cap open ios
```

#### Configure Signing

1. Select the project in Xcode navigator
2. Go to **"Signing & Capabilities"**
3. Select your **Apple Developer Team**
4. Enable **"Automatically manage signing"**

#### Create Archive

1. In Xcode menu: **Product → Archive**
2. Wait for build (5-10 minutes)
3. Xcode Organizer opens automatically

#### Export .ipa

1. Click **"Distribute App"**
2. Select **"App Store Connect"**
3. Click **"Upload"**
4. Follow the wizard
5. .ipa is uploaded to App Store Connect

---

## 📤 Upload to Stores

### Upload to Google Play

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in store listing
4. Go to **"Release" → "Production"**
5. Upload `app-release.aab`
6. Submit for review

### Upload to App Store

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app:
   - Name: **High Spirit Grant Assistant**
   - Bundle ID: **com.highspirit.grantassistant**
3. Fill in app information
4. Add screenshots and description
5. The .ipa is already uploaded from Xcode
6. Submit for review

---

## 🎯 Expected Timeline

- **Android Review**: 1-3 days
- **iOS Review**: 1-3 days (can be longer for first submission)

---

## 🆘 Troubleshooting

### Android Build Fails

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew bundleRelease
```

### iOS Build Fails

```bash
# Update CocoaPods
cd ios/App
pod install
pod update
```

### "Server URL not loading"

The URL is pre-configured to: `https://68d3aecb-93c8-4e4e-898d-3882414185c4.lovableproject.com`

If you need to change it, edit `capacitor.config.ts`:
```typescript
server: {
  url: 'https://your-custom-domain.com',
  cleartext: true,
  androidScheme: 'https'
}
```

Then run: `npx cap sync`

---

## 📞 Need Help?

- **Capacitor Docs**: https://capacitorjs.com/docs
- **iOS Submission**: https://developer.apple.com/app-store/submissions/
- **Android Submission**: https://support.google.com/googleplay/android-developer/answer/9859152

---

**You're ready to build!** Follow the steps above and you'll have store-ready apps in under an hour. 🚀
