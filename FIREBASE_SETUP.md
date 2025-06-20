# Firebase Setup Guide for React Native Water Delivery App

This guide will help you set up Firebase Authentication with phone number verification for the Water Delivery App using React Native Firebase.

## Prerequisites

- React Native development environment set up
- Firebase project created
- Android Studio (for Android) or Xcode (for iOS)

## 1. Install Dependencies

First, install the React Native Firebase packages:

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/functions
```

Or with yarn:

```bash
yarn add @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage @react-native-firebase/functions
```

## 2. Firebase Console Setup

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Phone Authentication:
   - Go to Authentication → Sign-in method
   - Enable Phone provider
   - Add your phone number for testing (optional)

### 2.2 Add Apps to Firebase Project

#### For Android:
1. Click "Add app" → Android
2. Enter your package name (e.g., `com.waterdelivery.app`)
3. Download `google-services.json`
4. Place it in `android/app/` directory

#### For iOS:
1. Click "Add app" → iOS
2. Enter your bundle ID
3. Download `GoogleService-Info.plist`
4. Add it to your iOS project in Xcode

## 3. Android Configuration

### 3.1 Update android/build.gradle
```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### 3.2 Update android/app/build.gradle
```gradle
apply plugin: 'com.android.application'
// Add this line
apply plugin: 'com.google.gms.google-services'

dependencies {
    implementation 'com.google.firebase:firebase-auth'
    // Add other Firebase dependencies as needed
}
```

### 3.3 Update MainApplication.java
```java
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;
import io.invertase.firebase.auth.ReactNativeFirebaseAuthPackage;

public class MainApplication extends Application implements ReactApplication {
    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
            new ReactNativeFirebaseAppPackage(),
            new ReactNativeFirebaseAuthPackage(),
            // Add other packages
        );
    }
}
```

### 3.4 Add SHA-1 Certificate
1. Generate SHA-1 certificate:
   ```bash
   cd android
   ./gradlew signingReport
   ```
2. Copy the SHA-1 hash from the output
3. Go to Firebase Console → Project Settings → Your Apps → Android app
4. Add the SHA-1 certificate fingerprint

## 4. iOS Configuration

### 4.1 Install Pods
```bash
cd ios
pod install
```

### 4.2 Update ios/Podfile
```ruby
platform :ios, '11.0'

target 'YourAppName' do
  use_react_native!

  # Firebase
  pod 'Firebase/Auth'
  pod 'Firebase/Core'
  
  # If using React Native Firebase v6+
  pod 'RNFBApp', :path => '../node_modules/@react-native-firebase/app'
  pod 'RNFBAuth', :path => '../node_modules/@react-native-firebase/auth'
end
```

### 4.3 Update AppDelegate.m
```objc
#import <Firebase.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  // Rest of your code
}

@end
```

### 4.4 Add URL Scheme
1. In Xcode, open your project
2. Go to your target's Info tab
3. Add a URL scheme with your reversed client ID from `GoogleService-Info.plist`

## 5. Phone Authentication Setup

### 5.1 Enable Phone Authentication
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Phone provider
3. Add authorized domains if needed

### 5.2 Configure reCAPTCHA (iOS)
For iOS, you need to configure reCAPTCHA:
1. Add your bundle ID to authorized domains in Firebase Console
2. Ensure your app can handle the reCAPTCHA flow

## 6. Testing Phone Authentication

### 6.1 Add Test Phone Numbers (Optional)
For testing without SMS charges:
1. Go to Firebase Console → Authentication → Sign-in method → Phone
2. Add test phone numbers with verification codes
3. Use these numbers during development

### 6.2 Test Numbers Format
- Phone: +91 9876543210
- Code: 123456

## 7. Indian Phone Number Validation

The app includes validation for Indian mobile numbers:
- Must be 10 digits
- Must start with 6, 7, 8, or 9
- Accepts formats: 9876543210, 09876543210, +919876543210, 919876543210

## 8. Usage Examples

### 8.1 Send OTP
```javascript
import { sendOTP } from './src/services/auth';

const handleSendOTP = async () => {
  try {
    const confirmation = await sendOTP('9876543210');
    // Store confirmation for later use
  } catch (error) {
    console.error('Send OTP Error:', error);
  }
};
```

### 8.2 Verify OTP
```javascript
import { verifyOTP } from './src/services/auth';

const handleVerifyOTP = async (confirmation, otp) => {
  try {
    const user = await verifyOTP(confirmation, otp);
    console.log('User signed in:', user);
  } catch (error) {
    console.error('Verify OTP Error:', error);
  }
};
```

## 9. Common Issues and Solutions

### 9.1 Android Build Issues
- Ensure `google-services.json` is in the correct location
- Check that Google Services plugin is applied
- Verify SHA-1 certificate is added to Firebase

### 9.2 iOS Build Issues
- Run `pod install` after adding Firebase dependencies
- Ensure `GoogleService-Info.plist` is added to Xcode project
- Check that Firebase is configured in AppDelegate

### 9.3 reCAPTCHA Issues
- For testing on simulator, reCAPTCHA will always appear
- On real devices, silent verification might work
- Ensure URL scheme is correctly configured

### 9.4 SMS Not Received
- Check phone number format
- Verify Firebase project has billing enabled
- Check Firebase Console for error logs
- Ensure the phone number is not blacklisted

## 10. Security Considerations

1. **Never expose API keys** in client-side code
2. **Use Firebase Security Rules** to protect data
3. **Implement rate limiting** to prevent abuse
4. **Validate phone numbers** on both client and server
5. **Monitor authentication attempts** in Firebase Console

## 11. Production Checklist

- [ ] Enable phone authentication in Firebase Console
- [ ] Add production SHA-1/SHA-256 certificates
- [ ] Remove test phone numbers
- [ ] Set up Firebase Security Rules
- [ ] Enable Firebase billing
- [ ] Configure authorized domains
- [ ] Test on real devices
- [ ] Set up monitoring and analytics

## 12. Troubleshooting

### Debug Mode
Enable debug mode to see detailed logs:

```javascript
// For debugging
import { firebase } from '@react-native-firebase/app';

if (__DEV__) {
  firebase.auth().settings.appVerificationDisabledForTesting = true;
}
```

### Check Firebase Connection
```javascript
import firebase from '@react-native-firebase/app';

console.log('Firebase Apps:', firebase.apps);
console.log('Firebase Auth:', firebase.auth());
```

## Support

For additional help:
- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support)