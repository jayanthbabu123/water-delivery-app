import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import Select from "../../../components/ui/Select";
import { AuthService } from "../../../src/services/authService";
import { CommunityService } from "../../../src/services/community";
import { OrderService } from "../../../src/services/order";
import { UserService } from "../../../src/services/user";

export default function ProfileScreen() {
  // State for address modal
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Animation value for scale effect
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log("📱 Loading user data for profile...");

      // Get user data from AsyncStorage
      const storedUserData = await AsyncStorage.getItem("userData");
      if (!storedUserData) {
        console.log("❌ No user data found");
        Alert.alert("Error", "Please login first");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(storedUserData);
      console.log("👤 User data loaded:", user.userId);
      setUserData(user);

      // Load fresh user data from Firestore
      const freshUserData = await UserService.getUserById(user.userId);
      if (freshUserData) {
        setUserData(freshUserData);
        setName(freshUserData.profile?.name || "");
        setEmail(freshUserData.profile?.email || "");
        setSelectedCommunity(freshUserData.profile?.communityId || "");
        setSelectedApartment(freshUserData.profile?.apartmentNumber || "");
      }

      // Load order statistics
      const stats = await OrderService.getUserOrderStats(user.userId);
      setOrderStats(stats);

      // Load communities
      const communitiesData = await CommunityService.getCommunities();
      const formattedCommunities = CommunityService.formatCommunitiesForSelect(communitiesData);
      setCommunities(formattedCommunities);

      // Load apartments if community is selected
      if (freshUserData?.profile?.communityId) {
        const apartmentsData = await CommunityService.getApartments(freshUserData.profile.communityId);
        const formattedApartments = CommunityService.formatApartmentsForSelect(apartmentsData);
        setApartments(formattedApartments);
      }

    } catch (error) {
      console.error("❌ Error loading user data:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load apartments when community changes
  const handleCommunityChange = async (communityId) => {
    try {
      setSelectedCommunity(communityId);
      if (communityId) {
        const apartmentsData = await CommunityService.getApartments(communityId);
        const formattedApartments = CommunityService.formatApartmentsForSelect(apartmentsData);
        setApartments(formattedApartments);
        // Reset apartment selection
        setSelectedApartment("");
      } else {
        setApartments([]);
        setSelectedApartment("");
      }
    } catch (error) {
      console.error("❌ Error loading apartments:", error);
      Alert.alert("Error", "Failed to load apartments for this community.");
    }
  };

  // Get community and apartment labels
  const getCommunityLabel = () => {
    if (!userData?.profile?.communityId) return "Not set";
    const community = communities.find(c => c.value === userData.profile.communityId);
    return community ? community.label : "Unknown Community";
  };

  const getApartmentLabel = () => {
    if (!userData?.profile?.apartmentNumber) return "Not set";
    return `Unit ${userData.profile.apartmentNumber}`;
  };

  const menuItems = [
    {
      icon: "card-outline",
      title: "Payment Methods",
      subtitle: "Add or remove payment options",
      onPress: () => router.push("/(customer)/payments"),
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get assistance with your orders",
      onPress: () => router.push("/(customer)/support"),
    },
  ];

  // Handle saving the address
  const handleSaveAddress = async () => {
    try {
      setSaving(true);

      // Validate input
      if (!name.trim()) {
        Alert.alert("Missing Information", "Please enter your name");
        return;
      }

      if (!email.trim()) {
        Alert.alert("Missing Information", "Please enter your email");
        return;
      }

      if (!UserService.isValidEmail(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email address");
        return;
      }

      if (!selectedCommunity || !selectedApartment) {
        Alert.alert("Missing Information", "Please select both community and apartment");
        return;
      }

      // Update user profile in Firestore
      const profileData = {
        name: name.trim(),
        email: email.trim(),
        communityId: selectedCommunity,
        apartmentNumber: selectedApartment,
      };

      await UserService.updateUserProfile(userData.userId, profileData);

      // Update local state
      setUserData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...profileData,
          isProfileComplete: true,
        }
      }));

      setAddressModalVisible(false);
      Alert.alert("Success", "Your delivery information has been updated successfully");

    } catch (error) {
      console.error("❌ Error saving address:", error);
      Alert.alert("Error", "Failed to update delivery information. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            // Animate the button press
            animateScale(0.95);

            // Use enhanced AuthService to sign out
            await AuthService.signOut();

            // Navigate to login after successful logout
            setTimeout(() => {
              animateScale(1);
              router.replace("/login");
            }, 150);
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Could not log out. Please try again.");
          }
        },
      },
    ]);
  };

  // Animation for button press
  const animateScale = (toValue) => {
    Animated.spring(scaleAnim, {
      toValue,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar style="dark" backgroundColor="#fff" />
        <ScreenHeader title="Profile" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <ScreenHeader title="Profile" showBackButton={true} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={32} color="#1976D2" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{userData?.profile?.name || "Not set"}</Text>
              <Text style={styles.phone}>{userData?.phoneNumber || "Not set"}</Text>
              <View style={styles.memberSince}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.memberSinceText}>
                  Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Unknown"}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.ordersText}>
            <Text style={styles.ordersNumber}>{orderStats?.totalOrders || 0}</Text>{" "}
            orders placed
          </Text>
        </View>

        {/* Address Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="location-outline" size={22} color="#1976D2" />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
          </View>

          <View style={styles.addressCard}>
            <View style={styles.addressContent}>
              <Text style={styles.addressLine}>{getCommunityLabel()}</Text>
              <Text style={styles.addressLine}>{getApartmentLabel()}</Text>
            </View>
            <TouchableOpacity
              style={styles.editAddressButton}
              onPress={() => setAddressModalVisible(true)}
            >
              <Ionicons name="create-outline" size={18} color="#1976D2" />
              <Text style={styles.editAddressText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuHeading}>Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon} size={22} color="#1976D2" />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            onPressIn={() => animateScale(0.95)}
            onPressOut={() => animateScale(1)}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0</Text>

        {/* Address Modal */}
        <Modal
          visible={addressModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddressModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Delivery Information</Text>
                <TouchableOpacity
                  onPress={() => setAddressModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email address"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <Select
                  label="Select Community"
                  value={selectedCommunity}
                  options={communities}
                  onSelect={handleCommunityChange}
                  placeholder="Choose your community"
                  searchable
                />

                <Select
                  label="Select Apartment"
                  value={selectedApartment}
                  options={apartments}
                  onSelect={(value) => setSelectedApartment(value)}
                  placeholder="Choose your apartment"
                  disabled={!selectedCommunity}
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setAddressModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSaveAddress}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Information</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 80, // Add padding to avoid content being hidden behind the tab bar
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === "ios" ? 90 : 70, // Fixed padding for static tab bar
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  userInfo: {
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  memberSince: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberSinceText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  ordersText: {
    fontSize: 14,
    color: "#666",
  },
  ordersNumber: {
    fontWeight: "600",
    color: "#1976D2",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  addressCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#1976D2",
  },
  addressContent: {
    flex: 1,
  },
  addressLine: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  editAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  editAddressText: {
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 4,
    fontWeight: "500",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF3B30",
    shadowColor: "#FF3B30",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  version: {
    textAlign: "center",
    fontSize: 13,
    color: "#999",
    marginBottom: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#1976D2",
    fontSize: 18,
    fontWeight: "500",
    marginTop: 20,
  },
});
