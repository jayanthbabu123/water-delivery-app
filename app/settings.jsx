import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ui/ScreenHeader";

export default function SettingsScreen() {
  // State for settings
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    deliveryReminders: true,
    emailNotifications: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    savePaymentInfo: true,
    autoReorder: false,
  });

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear Order History",
      "Are you sure you want to clear your order history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // Implement clear history logic here
            Alert.alert("Success", "Order history cleared successfully");
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Implement account deletion logic here
            router.push("/login");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <ScreenHeader title="Settings" />

      <ScrollView style={styles.content}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Order Updates</Text>
                <Text style={styles.settingDescription}>
                  Get notified about your order status
                </Text>
              </View>
              <Switch
                value={notifications.orderUpdates}
                onValueChange={() => handleNotificationChange("orderUpdates")}
                trackColor={{ false: "#ddd", true: "#90CAF9" }}
                thumbColor={notifications.orderUpdates ? "#1976D2" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Promotions</Text>
                <Text style={styles.settingDescription}>
                  Receive special offers and discounts
                </Text>
              </View>
              <Switch
                value={notifications.promotions}
                onValueChange={() => handleNotificationChange("promotions")}
                trackColor={{ false: "#ddd", true: "#90CAF9" }}
                thumbColor={notifications.promotions ? "#1976D2" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Delivery Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get reminded about upcoming deliveries
                </Text>
              </View>
              <Switch
                value={notifications.deliveryReminders}
                onValueChange={() => handleNotificationChange("deliveryReminders")}
                trackColor={{ false: "#ddd", true: "#90CAF9" }}
                thumbColor={notifications.deliveryReminders ? "#1976D2" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive updates via email
                </Text>
              </View>
              <Switch
                value={notifications.emailNotifications}
                onValueChange={() => handleNotificationChange("emailNotifications")}
                trackColor={{ false: "#ddd", true: "#90CAF9" }}
                thumbColor={notifications.emailNotifications ? "#1976D2" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Switch between light and dark theme
                </Text>
              </View>
              <Switch
                value={preferences.darkMode}
                onValueChange={() => handlePreferenceChange("darkMode")}
                trackColor={{ false: "#ddd", true: "#90CAF9" }}
                thumbColor={preferences.darkMode ? "#1976D2" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Save Payment Info</Text>
                <Text style={styles.settingDescription}>
                  Securely save payment methods
                </Text>
              </View>
              <Switch
                value={preferences.savePaymentInfo}
                onValueChange={() => handlePreferenceChange("savePaymentInfo")}
                trackColor={{ false: "#ddd", true: "#90CAF9" }}
                thumbColor={preferences.savePaymentInfo ? "#1976D2" : "#f4f3f4"}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Auto Reorder</Text>
                <Text style={styles.settingDescription}>
                  Automatically reorder when running low
                </Text>
              </View>
              <Switch
                value={preferences.autoReorder}
                onValueChange={() => handlePreferenceChange("autoReorder")}
                trackColor={{ false: "#ddd", true: "#90CAF9" }}
                thumbColor={preferences.autoReorder ? "#1976D2" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearHistory}
            >
              <View style={styles.actionButtonContent}>
                <Ionicons name="trash-outline" size={22} color="#666" />
                <Text style={styles.actionButtonText}>Clear Order History</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteAccount}
            >
              <View style={styles.actionButtonContent}>
                <Ionicons name="close-circle-outline" size={22} color="#FF3B30" />
                <Text style={[styles.actionButtonText, styles.deleteText]}>
                  Delete Account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          Privacy Policy • Terms of Service
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  settingDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  deleteText: {
    color: "#FF3B30",
  },
  footer: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    marginVertical: 24,
  },
});
