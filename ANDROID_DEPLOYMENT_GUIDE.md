# Android Deployment Guide for LabWatch

## Method 1: EAS Build (Current/Recommended)

The EAS build is currently running in the background. This method creates a production-ready APK that can be:
- Directly installed on Android devices
- Distributed through internal channels
- Submitted to Google Play Store

### Build Status
- **Current Build**: Android APK (Preview Profile)
- **Build Type**: Release APK
- **Distribution**: Internal (can be installed directly)

## Method 2: Local Build (If EAS Fails)

If EAS build fails, you can build locally:

### Prerequisites:
1. Install Android Studio
2. Set up Android SDK
3. Configure environment variables

### Commands:
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Generate Android project files
npx expo run:android --device

# Or build APK locally
npx expo build:android --type apk
```

## Method 3: Development Build

For testing and development:

```bash
# Install development client
npm install expo-dev-client

# Create development build
eas build --profile development --platform android
```

## After Build Completion

1. **Download APK**: You'll receive a download link via email or Expo dashboard
2. **Install on Device**: 
   - Enable "Unknown Sources" in Android settings
   - Download and tap the APK file
   - Follow installation prompts

3. **Distribution Options**:
   - **Direct Install**: Share APK file directly
   - **Internal Testing**: Use Google Play Console internal testing
   - **Production**: Submit to Google Play Store

## APK Installation Instructions

### On Android Device:
1. Download the APK file
2. Go to Settings > Security > Unknown Sources (enable)
3. Open file manager and locate the APK
4. Tap the APK file to install
5. Grant necessary permissions when prompted

### Permissions Required:
- Camera (for AI people detection)
- Internet (for real-time data)
- Network State (for connectivity monitoring)
- Vibration (for alert notifications)

## Troubleshooting

### If Build Fails:
1. Check dependency compatibility
2. Verify Android configuration in app.json
3. Try building with different profile
4. Clear EAS cache and retry

### If APK Won't Install:
1. Ensure "Unknown Sources" is enabled
2. Check available storage space
3. Verify APK isn't corrupted
4. Try installing via ADB if needed

## Next Steps After Successful Build

1. **Test Installation**: Install APK on test device
2. **Verify Functionality**: Test all app features
3. **Performance Testing**: Check app performance on target devices
4. **User Acceptance Testing**: Have end users test the app
5. **Production Deployment**: Submit to app store or distribute internally
