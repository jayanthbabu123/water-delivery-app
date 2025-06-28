# Enhanced Authentication System

This document describes the comprehensive authentication system implemented for the Water Delivery App, which provides persistent login functionality following industry standards.

## Overview

The authentication system has been completely redesigned to provide:
- **Persistent Login**: Users stay logged in until they explicitly log out
- **Session Management**: Automatic session validation and refresh
- **Role-based Navigation**: Automatic redirection based on user role and profile completion status
- **Security**: Session expiration, inactivity logout, and secure data storage
- **State Synchronization**: Syncs local storage with Firebase auth state

## Architecture

### Core Components

1. **AuthService** (`src/services/authService.js`)
   - Central authentication management
   - Persistent storage handling
   - Session validation and refresh
   - Role and profile management

2. **useAuth Hook** (`src/hooks/useAuth.js`)
   - React hook for authentication state
   - Provides authentication actions and state
   - Automatic session monitoring

3. **ActivityMonitor** (`src/components/ActivityMonitor.js`)
   - Monitors user activity
   - Auto-logout on inactivity
   - App state change handling

4. **Enhanced User Service** (`src/services/user.js`)
   - User data management with defensive coding
   - Profile structure validation
   - Firestore integration

## Authentication Flow

### 1. App Startup
```
App Start → Check AuthService.initializeAuth() → Determine Navigation Route
```

### 2. Login Process
```
Phone Number → OTP Verification → Complete Authentication → Store Session → Navigate
```

### 3. Automatic Navigation
The system automatically navigates users based on their authentication state:

- **Unauthenticated**: `/login`
- **Needs Community Selection**: `/select-community`
- **Needs Role Selection**: `/role-select`
- **Customer**: `/(customer)/(tabs)/home`
- **Admin**: `/(admin)/(tabs)/dashboard`
- **Delivery**: `/(delivery)/(tabs)/assigned`

## Key Features

### Persistent Login
- Users remain logged in across app restarts
- 24-hour session validity
- Automatic token refresh
- Firebase auth state synchronization

### Session Security
- Automatic logout after 30 minutes of inactivity
- Session validation on app resume
- Secure token storage in AsyncStorage
- Background/foreground state monitoring

### Role Management
- Dynamic role assignment
- Role-based navigation
- Profile completion tracking
- Community selection persistence

## Storage Keys

The system uses standardized storage keys:
- `userToken`: Firebase user UID
- `userData`: Complete user profile data
- `userPhone`: User's phone number
- `userRole`: User's assigned role
- `selectedCommunity`: Selected community ID
- `authState`: Current authentication state
- `loginTimestamp`: Login time for session validation

## Usage Examples

### Using the useAuth Hook
```javascript
import { useAuth } from '../src/hooks/useAuth';

function MyComponent() {
  const {
    isAuthenticated,
    userData,
    userRole,
    signOut,
    refreshAuth
  } = useAuth();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <AuthenticatedContent user={userData} />;
}
```

### Direct AuthService Usage
```javascript
import { AuthService } from '../src/services/authService';

// Check authentication status
const authState = await AuthService.getAuthState();

// Complete authentication after OTP
const result = await AuthService.completeAuthentication(phone, firebaseUser);

// Sign out user
await AuthService.signOut();

// Update user role
await AuthService.updateUserRole('customer');
```

### Activity Monitoring
```javascript
import { ActivityMonitor } from '../src/components/ActivityMonitor';

function App() {
  return (
    <ActivityMonitor inactivityTimeout={30 * 60 * 1000}>
      <YourAppContent />
    </ActivityMonitor>
  );
}
```

## Authentication States

The system defines several authentication states:

- `AUTHENTICATED`: Fully authenticated with complete profile
- `UNAUTHENTICATED`: Not logged in
- `NEEDS_COMMUNITY_SELECTION`: Needs to select community
- `NEEDS_ROLE_SELECTION`: Needs to select role
- `PROFILE_INCOMPLETE`: Profile needs completion

## Security Features

### Session Validation
- Validates Firebase auth state on app resume
- Checks token expiration (24 hours)
- Automatic session refresh
- Clears invalid sessions

### Inactivity Monitoring
- 30-minute inactivity timeout (configurable)
- Tracks user interactions via PanResponder
- App state change monitoring
- Graceful logout with reason tracking

### Data Protection
- Encrypted AsyncStorage (platform dependent)
- Secure token handling
- Automatic data cleanup on logout
- Protection against session hijacking

## Error Handling

The system includes comprehensive error handling:

### Authentication Errors
- Invalid credentials
- Expired sessions
- Network failures
- Firebase auth errors

### Profile Errors
- Missing profile data
- Invalid role assignments
- Community selection errors
- Profile completion failures

### Session Errors
- Token expiration
- Invalid session state
- Firebase sync failures
- Storage corruption

## Debugging

### Debug Information
```javascript
const debugInfo = await AuthService.getDebugInfo();
console.log('Auth Debug Info:', debugInfo);
```

### Common Issues
1. **Profile undefined errors**: Fixed with defensive coding in UserService
2. **Session sync issues**: Handled by Firebase auth state synchronization
3. **Navigation loops**: Prevented by proper state checking
4. **Storage corruption**: Handled with try-catch and data validation

## Migration from Old System

The enhanced system is backward compatible but provides these improvements:

### Before
- Manual AsyncStorage management
- No session validation
- Basic logout functionality
- No inactivity monitoring

### After
- Centralized authentication service
- Automatic session management
- Comprehensive logout handling
- Activity monitoring and auto-logout

## Configuration

### Timeout Settings
- Session expiry: 24 hours (configurable in AuthService)
- Inactivity timeout: 30 minutes (configurable in ActivityMonitor)
- Auto-refresh interval: 1 hour (configurable in AuthService)

### Storage Settings
- All authentication data stored in AsyncStorage
- Automatic cleanup on logout
- Secure key management

## Testing

To test the authentication system:

1. **Login Flow**: Test phone number → OTP → authentication
2. **Persistent Login**: Close and reopen app, should stay logged in
3. **Role Navigation**: Test different roles navigate to correct screens
4. **Logout**: Test logout clears all data and redirects to login
5. **Inactivity**: Leave app idle for 30+ minutes, should auto-logout
6. **Session Expiry**: Test session expiry after 24 hours

## Future Enhancements

Potential improvements:
- Biometric authentication
- Multi-factor authentication
- Social login integration
- Advanced session analytics
- Push notification integration
- Offline authentication support

## Troubleshooting

### Common Problems and Solutions

1. **"Cannot read property 'profile' of undefined"**
   - Fixed with defensive coding in UserService and AuthService
   - Ensures profile object always exists

2. **Navigation loops**
   - Check authentication state before navigation
   - Ensure proper state initialization

3. **Session not persisting**
   - Verify AsyncStorage permissions
   - Check token storage and retrieval

4. **Auto-logout not working**
   - Ensure ActivityMonitor is properly integrated
   - Check inactivity timeout configuration

## Support

For issues or questions about the authentication system:
1. Check debug information using `AuthService.getDebugInfo()`
2. Review console logs for authentication errors
3. Verify Firebase configuration
4. Check AsyncStorage data integrity