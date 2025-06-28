import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "../../../src/services/authService";

export default function DeliveryProfile() {
  const router = useRouter();

  // Mock profile data
  const [profile, setProfile] = useState({
    name: "Alex Rivera",
    phone: "+1 (555) 123-4567",
    email: "alex.rivera@example.com",
    vehicleType: "Motorcycle",
    vehicleNumber: "ABC-123",
    joiningDate: "Jan 15, 2023",
    completedDeliveries: 128,
    avgRating: 4.8,
    status: "Active",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  });

  // Handle sign out
  const handleSignOut = async () => {
    try {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: async () => {
            try {
              // Use enhanced AuthService to sign out
              await AuthService.signOut();

              // Navigate to login after successful logout
              router.replace("/login");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Error", "Could not log out. Please try again.");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Toggle availability status
  const [isAvailable, setIsAvailable] = useState(true);
  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: profile.image }} style={styles.profileImage} />
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>
                {profile.avgRating} • {profile.completedDeliveries} deliveries
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isAvailable ? "#E8F5E9" : "#FFEBEE" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isAvailable ? "#4CAF50" : "#F44336" },
              ]}
            >
              {isAvailable ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>

        <View style={styles.availabilitySection}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.availabilityToggle}>
            <Text style={styles.availabilityText}>
              I am currently {isAvailable ? "available" : "unavailable"} for
              deliveries
            </Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { backgroundColor: isAvailable ? "#4CAF50" : "#bdbdbd" },
              ]}
              onPress={toggleAvailability}
            >
              <View
                style={[
                  styles.toggleCircle,
                  isAvailable
                    ? styles.toggleCircleRight
                    : styles.toggleCircleLeft,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#757575" />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profile.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#757575" />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#757575" />
            <Text style={styles.infoLabel}>Joined</Text>
            <Text style={styles.infoValue}>{profile.joiningDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="bicycle-outline" size={20} color="#757575" />
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{profile.vehicleType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={20} color="#757575" />
            <Text style={styles.infoLabel}>Number</Text>
            <Text style={styles.infoValue}>{profile.vehicleNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={20} color="#757575" />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#bdbdbd" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="language-outline" size={20} color="#757575" />
            <Text style={styles.menuItemText}>Language</Text>
            <Ionicons name="chevron-forward" size={20} color="#bdbdbd" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={20} color="#757575" />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#bdbdbd" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={20} color="#757575" />
            <Text style={styles.menuItemText}>Terms & Policies</Text>
            <Ionicons name="chevron-forward" size={20} color="#bdbdbd" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Water Delivery App v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 80, // Add padding to avoid content being hidden behind the tab bar
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  nameContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  availabilitySection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  availabilityToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  availabilityText: {
    fontSize: 15,
    color: "#333",
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  toggleCircleLeft: {
    alignSelf: "flex-start",
  },
  toggleCircleRight: {
    alignSelf: "flex-end",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 15,
    color: "#757575",
    marginLeft: 10,
    width: 80,
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  signOutButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  versionText: {
    fontSize: 12,
    color: "#757575",
  },
});
