import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ScreenHeader({ title, showBackButton, onBackPress }) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine if back button should be shown based on pathname
  const shouldShowBackButton =
    showBackButton !== undefined
      ? showBackButton
      : pathname === "/(tabs)/profile" ||
        pathname === "/(tabs)/orders" ||
        pathname === "/(tabs)/payments";

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (pathname.startsWith("/(tabs)")) {
      // Navigate to home tab from other tabs
      router.push("/(tabs)/home");
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {shouldShowBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{title || "AquaFlow"}</Text>
        </View>
        {/* Empty view to balance the back button for centered title */}
        {shouldShowBackButton && <View style={styles.emptySpace} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  backButton: {
    padding: 4,
    marginRight: 4,
    zIndex: 10,
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1976D2",
    textAlign: "center",
  },
  emptySpace: {
    width: 32,
    height: 24,
    zIndex: 10,
  },
});
