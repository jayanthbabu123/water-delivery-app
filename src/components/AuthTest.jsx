import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

/**
 * Authentication System Test Component
 * This component provides a comprehensive test interface for the authentication system
 */
export default function AuthTest() {
  const {
    isAuthenticated,
    userData,
    userRole,
    authState,
    isLoading,
    error,
    signOut,
    refreshAuth,
    validateSession,
    getCurrentUser,
    refreshUserData,
  } = useAuth();

  const [debugInfo, setDebugInfo] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [testPhone, setTestPhone] = useState('9876543210');
  const [testRole, setTestRole] = useState('customer');
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Load debug info on mount
  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const info = await AuthService.getDebugInfo();
      setDebugInfo(info);
    } catch (error) {
      console.error('Error loading debug info:', error);
    }
  };

  const addTestResult = (test, success, message) => {
    const result = {
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTestResults(prev => [result, ...prev]);
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      // Test 1: Get current auth state
      addTestResult('Get Auth State', true, 'Starting comprehensive tests...');

      const currentAuthState = await AuthService.getAuthState();
      addTestResult(
        'Get Auth State',
        true,
        `Auth State: ${currentAuthState.authState}, Authenticated: ${currentAuthState.isAuthenticated}`
      );

      // Test 2: Validate session
      const sessionValid = await AuthService.validateSession();
      addTestResult(
        'Validate Session',
        sessionValid.isValid,
        sessionValid.isValid ? 'Session is valid' : `Session invalid: ${sessionValid.reason}`
      );

      // Test 3: Get current user
      const currentUser = await AuthService.getCurrentUser();
      addTestResult(
        'Get Current User',
        !!currentUser,
        currentUser ? `User: ${currentUser.phoneNumber}` : 'No current user'
      );

      // Test 4: Check authentication status
      const isAuth = await AuthService.isAuthenticated();
      addTestResult(
        'Check Authentication',
        true,
        `Is Authenticated: ${isAuth}`
      );

      // Test 5: Sync with Firebase
      const syncResult = await AuthService.syncWithFirebaseAuth();
      addTestResult(
        'Firebase Sync',
        syncResult.synced,
        `Sync result: ${JSON.stringify(syncResult)}`
      );

      // Test 6: Test storage operations (if authenticated)
      if (isAuth) {
        try {
          await AuthService.refreshUserData();
          addTestResult('Refresh User Data', true, 'User data refreshed successfully');
        } catch (error) {
          addTestResult('Refresh User Data', false, `Error: ${error.message}`);
        }
      }

      addTestResult('All Tests', true, 'Test suite completed successfully');

    } catch (error) {
      addTestResult('Test Suite', false, `Test suite failed: ${error.message}`);
    } finally {
      setIsRunningTests(false);
      await loadDebugInfo(); // Refresh debug info
    }
  };

  const testRoleUpdate = async () => {
    try {
      await AuthService.updateUserRole(testRole);
      addTestResult('Update Role', true, `Role updated to: ${testRole}`);
      await refreshAuth();
    } catch (error) {
      addTestResult('Update Role', false, `Error: ${error.message}`);
    }
  };

  const testCommunityUpdate = async () => {
    try {
      await AuthService.updateCommunitySelection('test-community-123');
      addTestResult('Update Community', true, 'Community updated successfully');
      await refreshAuth();
    } catch (error) {
      addTestResult('Update Community', false, `Error: ${error.message}`);
    }
  };

  const testProfileUpdate = async () => {
    try {
      await AuthService.updateProfileCompletion({
        name: 'Test User',
        email: 'test@example.com',
        isProfileComplete: true,
      });
      addTestResult('Update Profile', true, 'Profile updated successfully');
      await refreshAuth();
    } catch (error) {
      addTestResult('Update Profile', false, `Error: ${error.message}`);
    }
  };

  const clearAuthData = async () => {
    try {
      await AuthService.clearAuthData();
      addTestResult('Clear Auth Data', true, 'Auth data cleared successfully');
      await refreshAuth();
    } catch (error) {
      addTestResult('Clear Auth Data', false, `Error: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      addTestResult('Sign Out', true, 'User signed out successfully');
    } catch (error) {
      addTestResult('Sign Out', false, `Error: ${error.message}`);
    }
  };

  const renderAuthState = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Authentication State</Text>
      <View style={styles.stateContainer}>
        <View style={styles.stateItem}>
          <Text style={styles.stateLabel}>Status:</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isAuthenticated ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </Text>
          </View>
        </View>

        {userData && (
          <>
            <View style={styles.stateItem}>
              <Text style={styles.stateLabel}>Phone:</Text>
              <Text style={styles.stateValue}>{userData.phoneNumber || 'N/A'}</Text>
            </View>
            <View style={styles.stateItem}>
              <Text style={styles.stateLabel}>Role:</Text>
              <Text style={styles.stateValue}>{userRole || 'N/A'}</Text>
            </View>
            <View style={styles.stateItem}>
              <Text style={styles.stateLabel}>Auth State:</Text>
              <Text style={styles.stateValue}>{authState?.authState || 'N/A'}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderDebugInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Debug Information</Text>
      <ScrollView style={styles.debugContainer} nestedScrollEnabled>
        {debugInfo ? (
          Object.entries(debugInfo).map(([key, value]) => (
            <View key={key} style={styles.debugItem}>
              <Text style={styles.debugKey}>{key}:</Text>
              <Text style={styles.debugValue}>{String(value)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.loadingText}>Loading debug info...</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderTestResults = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Results</Text>
      <ScrollView style={styles.resultsContainer} nestedScrollEnabled>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <View style={styles.resultHeader}>
              <Ionicons
                name={result.success ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={result.success ? '#4CAF50' : '#F44336'}
              />
              <Text style={styles.resultTest}>{result.test}</Text>
              <Text style={styles.resultTime}>{result.timestamp}</Text>
            </View>
            <Text style={styles.resultMessage}>{result.message}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderTestActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Test Actions</Text>

      {/* Main Test Button */}
      <TouchableOpacity
        style={[styles.testButton, styles.primaryButton]}
        onPress={runAllTests}
        disabled={isRunningTests}
      >
        <Ionicons name="play-circle" size={20} color="#FFFFFF" />
        <Text style={styles.buttonText}>
          {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
        </Text>
      </TouchableOpacity>

      {/* Role Test */}
      <View style={styles.testGroup}>
        <TextInput
          style={styles.testInput}
          value={testRole}
          onChangeText={setTestRole}
          placeholder="Enter role (customer, admin, delivery)"
        />
        <TouchableOpacity style={styles.testButton} onPress={testRoleUpdate}>
          <Text style={styles.buttonText}>Test Role Update</Text>
        </TouchableOpacity>
      </View>

      {/* Other test buttons */}
      <TouchableOpacity style={styles.testButton} onPress={testCommunityUpdate}>
        <Text style={styles.buttonText}>Test Community Update</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={testProfileUpdate}>
        <Text style={styles.buttonText}>Test Profile Update</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={refreshAuth}>
        <Text style={styles.buttonText}>Refresh Auth State</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={loadDebugInfo}>
        <Text style={styles.buttonText}>Reload Debug Info</Text>
      </TouchableOpacity>

      {/* Destructive actions */}
      <View style={styles.destructiveActions}>
        <TouchableOpacity
          style={[styles.testButton, styles.warningButton]}
          onPress={clearAuthData}
        >
          <Text style={styles.buttonText}>Clear Auth Data</Text>
        </TouchableOpacity>

        {isAuthenticated && (
          <TouchableOpacity
            style={[styles.testButton, styles.dangerButton]}
            onPress={handleSignOut}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading authentication test...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="bug" size={24} color="#1976D2" />
        <Text style={styles.title}>Authentication System Test</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {renderAuthState()}
      {renderTestActions()}
      {renderTestResults()}
      {renderDebugInfo()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1976D2',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  stateContainer: {
    gap: 8,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  stateValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 16,
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  testGroup: {
    marginVertical: 8,
  },
  testInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
  },
  destructiveActions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resultsContainer: {
    maxHeight: 200,
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTest: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  resultMessage: {
    fontSize: 12,
    color: '#666',
    marginLeft: 24,
  },
  debugContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    padding: 8,
  },
  debugItem: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  debugKey: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  debugValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
});
