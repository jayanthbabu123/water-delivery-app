import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has completed onboarding
    const checkStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const communitySelected =
          await AsyncStorage.getItem("selectedCommunity");
        const role = await AsyncStorage.getItem("userRole");

        setIsAuthenticated(!!token);
        setHasCompletedOnboarding(!!communitySelected);
        setUserRole(role);
      } catch (error) {
        console.log("Error checking status:", error);
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  // Determine the redirection path based on authentication, onboarding, and role
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  } else if (isAuthenticated && !hasCompletedOnboarding) {
    return <Redirect href="/select-community" />;
  } else if (isAuthenticated && hasCompletedOnboarding && !userRole) {
    return <Redirect href="/role-select" />;
  } else if (userRole === "customer") {
    return <Redirect href="/(customer)/(tabs)/home" />;
  } else if (userRole === "admin") {
    return <Redirect href="/(admin)/(tabs)/dashboard" />;
  } else if (userRole === "delivery") {
    return <Redirect href="/(delivery)/(tabs)/assigned" />;
  } else {
    // Fallback to role selection if role is invalid
    return <Redirect href="/role-select" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
