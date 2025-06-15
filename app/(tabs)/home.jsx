import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ui/ScreenHeader";

export default function CustomerHomeScreen() {
  const [greeting, setGreeting] = useState("");
  const [userName, setUserName] = useState("John Doe");
  const fadeAnim = React.useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
    };

    setGreeting(getTimeBasedGreeting());

    // Fade in animation with a slight delay for sections
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Fetch user data here in a real app
    // For now we'll use a mock name
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{userName}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/(customer)/profile")}
          >
            <View style={styles.profileImage}>
              <FontAwesome name="user" size={28} color="#1976D2" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Location Card */}
        <Animated.View
          style={[
            styles.locationCard,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.locationInfo}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={20} color="#007AFF" />
            </View>
            <View style={styles.locationText}>
              <Text style={styles.locationTitle}>Current Location</Text>
              <Text style={styles.locationAddress}>
                Sunset Gardens, Unit 101
              </Text>
            </View>
          </View>
          {/* <TouchableOpacity style={styles.changeLocationButton}>
            <Text style={styles.changeLocationText}>Change</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </TouchableOpacity> */}
        </Animated.View>

        {/* Quick Order Card */}
        <Animated.View
          style={[
            styles.quickOrderCard,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.quickOrderContent}>
            <View>
              <Text style={styles.quickOrderTitle}>Need Water?</Text>
              <Text style={styles.quickOrderSubtitle}>
                Get your 5-gallon bottle delivered today
              </Text>
              <View style={styles.deliveryInfoContainer}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#FFFFFF"
                  style={{ opacity: 0.9 }}
                />
                <Text style={styles.deliveryInfoText}>
                  Delivery within 2-3 hours
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => router.push("/order")}
            >
              <Text style={styles.orderButtonText}>Order Now</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#007AFF"
                style={{ marginLeft: 5 }}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.waterIconContainer}>
            <MaterialCommunityIcons name="water-pump" size={80} color="#fff" />
          </View>
        </Animated.View>

        {/* Features Grid */}
        <Text style={[styles.sectionTitle, { marginHorizontal: 16 }]}>
          Quick Actions
        </Text>
        <Animated.View
          style={[
            styles.featuresGrid,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push("/(tabs)/payments")}
          >
            <View style={[styles.featureIcon, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="card-outline" size={24} color="#007AFF" />
            </View>
            <Text style={styles.featureTitle}>Payments</Text>
            <Text style={styles.featureSubtitle}>Manage payment methods</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => router.push("/support")}
          >
            <View style={[styles.featureIcon, { backgroundColor: "#F3E5F5" }]}>
              <Ionicons name="help-circle-outline" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.featureTitle}>Support</Text>
            <Text style={styles.featureSubtitle}>Get assistance</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Orders */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.recentOrdersTitle}>Recent Orders</Text>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="chevron-forward" size={14} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <Animated.View
          style={[
            styles.recentOrders,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <View style={styles.orderInfo}>
              <View style={styles.orderDateContainer}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#666"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.orderDate}>Today, 2:30 PM</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.orderStatus}>Delivered</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color="#4CAF50"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </View>
            <View style={styles.orderDetails}>
              <View style={styles.orderQuantityContainer}>
                <Ionicons
                  name="water-outline"
                  size={16}
                  color="#1976D2"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.orderQuantity}>2 x 5-gallon bottles</Text>
              </View>
              <Text style={styles.orderPrice}>$12.00</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.orderCard, styles.orderCardSecondary]}
            onPress={() => router.push("/(tabs)/orders")}
          >
            <View style={styles.orderInfo}>
              <View style={styles.orderDateContainer}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#666"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.orderDate}>Yesterday, 10:15 AM</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.orderStatus}>Delivered</Text>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color="#4CAF50"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </View>
            <View style={styles.orderDetails}>
              <View style={styles.orderQuantityContainer}>
                <Ionicons
                  name="water-outline"
                  size={16}
                  color="#1976D2"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.orderQuantity}>1 x 5-gallon bottle</Text>
              </View>
              <Text style={styles.orderPrice}>$6.00</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === "ios" ? 90 : 70, // Fixed padding for static tab bar
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "500",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 4,
  },
  profileButton: {
    padding: 0,
    borderRadius: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 14,
    color: "#666",
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  changeLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0, 122, 255, 0.08)",
    borderRadius: 16,
  },
  changeLocationText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
    marginRight: 4,
  },
  quickOrderCard: {
    backgroundColor: "#007AFF",
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  quickOrderContent: {
    flex: 1,
  },
  quickOrderTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  quickOrderSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 10,
    lineHeight: 22,
  },
  deliveryInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  deliveryInfoText: {
    fontSize: 12,
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "500",
  },
  orderButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  waterIconContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
    marginLeft: 10,
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 25,
  },
  featureCard: {
    width: "48%",
    padding: 15,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
    textAlign: "center",
  },
  featureSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 25,
    marginBottom: 15,
    marginLeft: 20,
  },
  recentOrdersTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  sectionHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  recentOrders: {
    paddingHorizontal: 20,
    paddingTop: 0,
    marginBottom: 20,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 122, 255, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
    marginRight: 4,
  },
  orderCard: {
    backgroundColor: "#f8f9fa",
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
    marginHorizontal: 0,
  },
  orderCardSecondary: {
    backgroundColor: "#fafafa",
  },
  orderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  orderDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minWidth: 70,
  },
  orderStatus: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderQuantity: {
    fontSize: 15,
    color: "#1a1a1a",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
});
