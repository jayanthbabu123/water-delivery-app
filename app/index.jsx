import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { AuthService } from "../src/services/authService";

export default function Index() {
  const [authState, setAuthState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication status using enhanced AuthService
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentAuthState = await AuthService.initializeAuth();
        console.log("Index.jsx - Auth State:", currentAuthState);

        // Ensure we have a valid redirectTo path
        if (!currentAuthState.redirectTo) {
          console.warn("No redirectTo path found, defaulting to login");
          currentAuthState.redirectTo = "/login";
        }

        setAuthState(currentAuthState);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setError(error.message);
        setAuthState({
          isAuthenticated: false,
          authState: AuthService.AUTH_STATES.UNAUTHENTICATED,
          userData: null,
          redirectTo: "/login",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorText}>Redirecting to login...</Text>
      </View>
    );
  }

  if (!authState || !authState.redirectTo) {
    console.warn("No auth state or redirectTo, defaulting to login");
    return <Redirect href="/login" />;
  }

  console.log("Index.jsx - Redirecting to:", authState.redirectTo);
  // Redirect based on the determined auth state
  return <Redirect href={authState.redirectTo} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 14,
    color: "#F44336",
    textAlign: "center",
    marginHorizontal: 20,
    marginVertical: 8,
  },
});
