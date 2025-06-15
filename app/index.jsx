import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has completed onboarding
    const checkStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const communitySelected =
          await AsyncStorage.getItem("selectedCommunity");

        setIsAuthenticated(!!token);
        setHasCompletedOnboarding(!!communitySelected);
      } catch (error) {
        console.log("Error checking status:", error);
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
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

  // Determine the redirection path based on authentication and onboarding status
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  } else if (isAuthenticated && !hasCompletedOnboarding) {
    return <Redirect href="/select-community" />;
  } else {
    return <Redirect href="/(tabs)/home" />;
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
