# Firebase Console Setup Instructions

This guide will help you set up Firebase Console for the Water Delivery App authentication and database functionality.

## 🚀 **Step 1: Firebase Authentication Setup**

### 1.1 Enable Phone Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `water-delivery-app-92ba4`
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Phone** provider
5. Click **Enable** toggle
6. Save the changes

### 1.2 Add Test Phone Numbers (Optional)
1. In the Phone authentication settings
2. Scroll down to **Phone numbers for testing**
3. Add test numbers for development:
   ```
   Phone Number: +91 9876543210
   SMS Code: 123456
   
   Phone Number: +91 8765432109
   SMS Code: 654321
   ```
4. Click **Save**

### 1.3 Configure Authorized Domains
1. In Authentication → **Settings** → **Authorized domains**
2. Ensure these domains are added:
   - `localhost` (for development)
   - Your production domain (when deploying)

## 🗄️ **Step 2: Firestore Database Setup**

### 2.1 Create Firestore Database
1. Navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for now)
4. Select your preferred location (e.g., `asia-south1` for India)
5. Click **Done**

### 2.2 Create Collections Structure
Create the following collections manually or they will be created automatically when first data is written:

#### Users Collection
1. Go to Firestore → **Data**
2. Click **Start collection**
3. Collection ID: `users`
4. Add first document with ID: `sample_user`
5. Add fields:
   ```
   userId: "sample_user"
   phoneNumber: "+919876543210"
   role: "customer"
   profile: {
     name: "",
     email: "",
     communityId: "",
     apartmentNumber: "",
     isProfileComplete: false
   }
   createdAt: "2024-01-01T00:00:00Z"
   updatedAt: "2024-01-01T00:00:00Z"
   lastLoginAt: "2024-01-01T00:00:00Z"
   ```

#### Communities Collection
1. Click **Start collection**
2. Collection ID: `communities`
3. Add document with ID: `sunset_gardens`
4. Add fields:
   ```
   id: "sunset_gardens"
   name: "Sunset Gardens"
   address: {
     street: "123 Sunset Street",
     city: "Mumbai",
     state: "Maharashtra",
     pincode: "400001"
   }
   apartments: ["101", "102", "201", "202", "301", "302"]
   isActive: true
   createdAt: "2024-01-01T00:00:00Z"
   ```

5. Add more community documents:
   - `ocean_view` - Ocean View Apartments
   - `mountain_heights` - Mountain Heights
   - `riverside` - Riverside Residences

### 2.3 Set Up Indexes (Auto-created when needed)
The following indexes will be created automatically when queries are run:
- `users` collection: `phoneNumber` (ascending)
- `communities` collection: `isActive` (ascending)

## 🔐 **Step 3: Security Rules Setup**

### 3.1 Update Firestore Rules
1. Go to **Firestore Database** → **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserId() {
      return request.auth.uid;
    }
    
    function isOwner(userId) {
      return getUserId() == userId;
    }
    
    // Users Collection Rules
    match /users/{userId} {
      // Users can read and write their own data
      allow read, write: if isOwner(userId);
    }
    
    // Communities Collection Rules
    match /communities/{communityId} {
      // Anyone authenticated can read communities
      allow read: if isAuthenticated();
      
      // Only admins can write (for now, allow all authenticated users)
      allow write: if isAuthenticated();
    }
    
    // Default deny rule
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

## 📱 **Step 4: Platform Configuration**

### 4.1 Android Configuration
1. Go to **Project Settings** (gear icon)
2. Under **Your apps**, click on your Android app
3. Download `google-services.json`
4. Place it in `android/app/` directory
5. In **App integrity** section, add your SHA-1 certificate:
   ```bash
   cd android
   ./gradlew signingReport
   ```
   Copy the SHA1 from debug keystore and add it to Firebase

### 4.2 iOS Configuration
1. Under **Your apps**, click on your iOS app
2. Download `GoogleService-Info.plist`
3. Add it to your Xcode project
4. Ensure the file is added to the target

## 🧪 **Step 5: Test the Setup**

### 5.1 Test Authentication
1. Run your app: `npm run android` or `npm run ios`
2. Enter a phone number: `9876543210`
3. Enter OTP: `123456` (if using test numbers)
4. Should navigate to select-community screen

### 5.2 Verify Database Creation
1. Check Firestore console for new user document
2. Verify user data is stored correctly
3. Check that communities are loaded in the app

## 🔧 **Step 6: Initial Data Setup**

### 6.1 Add Sample Communities
If communities are not automatically created, add them manually:

1. **Sunset Gardens** (`sunset_gardens`)
   ```json
   {
     "id": "sunset_gardens",
     "name": "Sunset Gardens",
     "address": {
       "street": "123 Sunset Street",
       "city": "Mumbai",
       "state": "Maharashtra",
       "pincode": "400001"
     },
     "apartments": ["101", "102", "201", "202", "301", "302"],
     "isActive": true,
     "createdAt": "2024-01-01T00:00:00Z"
   }
   ```

2. **Ocean View Apartments** (`ocean_view`)
   ```json
   {
     "id": "ocean_view",
     "name": "Ocean View Apartments",
     "address": {
       "street": "456 Ocean Drive",
       "city": "Mumbai",
       "state": "Maharashtra",
       "pincode": "400002"
     },
     "apartments": ["A101", "A102", "B101", "B102", "C101", "C102"],
     "isActive": true,
     "createdAt": "2024-01-01T00:00:00Z"
   }
   ```

3. **Mountain Heights** (`mountain_heights`)
   ```json
   {
     "id": "mountain_heights",
     "name": "Mountain Heights",
     "address": {
       "street": "789 Mountain Road",
       "city": "Mumbai",
       "state": "Maharashtra",
       "pincode": "400003"
     },
     "apartments": ["1A", "1B", "2A", "2B", "3A", "3B"],
     "isActive": true,
     "createdAt": "2024-01-01T00:00:00Z"
   }
   ```

4. **Riverside Residences** (`riverside`)
   ```json
   {
     "id": "riverside",
     "name": "Riverside Residences",
     "address": {
       "street": "321 River Lane",
       "city": "Mumbai",
       "state": "Maharashtra",
       "pincode": "400004"
     },
     "apartments": ["101", "102", "201", "202", "301", "302"],
     "isActive": true,
     "createdAt": "2024-01-01T00:00:00Z"
   }
   ```

## ✅ **Step 7: Verification Checklist**

- [ ] Phone authentication is enabled
- [ ] Test phone numbers are configured (optional)
- [ ] Firestore database is created
- [ ] Security rules are updated
- [ ] `google-services.json` is in place (Android)
- [ ] `GoogleService-Info.plist` is in place (iOS)
- [ ] SHA-1 certificate is added (Android)
- [ ] Communities collection has sample data
- [ ] App can authenticate users
- [ ] User data is saved to Firestore
- [ ] Community selection works

## 🚨 **Common Issues**

### Authentication Issues
- **reCAPTCHA not working**: Ensure SHA-1 is added and app is rebuilt
- **SMS not received**: Check billing is enabled in Firebase project
- **Invalid phone number**: Ensure phone authentication is enabled

### Database Issues
- **Permission denied**: Check Firestore security rules
- **Collection not found**: Create collections manually if auto-creation fails
- **Data not saving**: Verify authentication is working

### Build Issues
- **Android**: Ensure `google-services.json` is in correct location
- **iOS**: Ensure `GoogleService-Info.plist` is added to Xcode project

## 📞 **Support**

If you encounter issues:
1. Check Firebase Console logs
2. Review app console logs
3. Verify all configuration files are in place
4. Test with different phone numbers

Your Firebase setup is now complete and ready for the Water Delivery App!