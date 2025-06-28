import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "../src/services/authService";

export default function RoleSelectScreen() {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: "customer",
      title: "Customer",
      description: "Order water and manage your deliveries",
      icon: "person-outline",
      route: "/(customer)/(tabs)/home",
    },
    {
      id: "admin",
      title: "Administrator",
      description: "Manage orders, customers, and inventory",
      icon: "settings-outline",
      route: "/(admin)/(tabs)/dashboard",
    },
    {
      id: "delivery",
      title: "Delivery Person",
      description: "Manage and complete deliveries",
      icon: "bicycle-outline",
      route: "/(delivery)/(tabs)/assigned",
    },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
  };

  const handleContinue = async () => {
    try {
      // Update role using enhanced AuthService
      await AuthService.updateUserRole(selectedRole);

      // Get updated auth state to determine redirect
      const authState = await AuthService.getAuthState();

      // Navigate to the appropriate section based on auth state
      router.replace(authState.redirectTo);
    } catch (error) {
      console.error("Error saving role:", error);
      // Fallback to direct navigation if auth service fails
      const roleObject = roles.find((role) => role.id === selectedRole);
      router.replace(roleObject.route);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="water" size={60} color="#1976D2" />
          </View>
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>
            Choose how you want to use the Water Delivery app
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.selectedRoleCard,
              ]}
              onPress={() => handleRoleSelect(role)}
            >
              <View
                style={[
                  styles.iconContainer,
                  selectedRole === role.id && styles.selectedIconContainer,
                ]}
              >
                <Ionicons
                  name={role.icon}
                  size={28}
                  color={selectedRole === role.id ? "#ffffff" : "#1976D2"}
                />
              </View>
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedRole === role.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  rolesContainer: {
    marginBottom: 48,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedRoleCard: {
    borderColor: "#1976D2",
    borderWidth: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  selectedIconContainer: {
    backgroundColor: "#1976D2",
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: "#666",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1976D2",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1976D2",
  },
  continueButton: {
    backgroundColor: "#1976D2",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  disabledButton: {
    backgroundColor: "#bdbdbd",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});
