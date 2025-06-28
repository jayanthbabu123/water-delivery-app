import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { OrderService } from "../../../src/services/order";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Filter options
  const filterOptions = [
    { key: "all", label: "All Orders", icon: "receipt-outline" },
    { key: "placed", label: "Active", icon: "time-outline" },
    { key: "delivered", label: "Delivered", icon: "checkmark-circle-outline" },
    { key: "cancelled", label: "Cancelled", icon: "close-circle-outline" },
  ];

  useEffect(() => {
    loadUserDataAndOrders();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUserDataAndOrders = async () => {
    try {
      setLoading(true);
      console.log("📱 Loading user data and orders...");

      // Get user data from AsyncStorage
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        console.log("👤 User data loaded:", user.userId);
        setUserData(user);
        await loadOrders(user.userId);
        await loadCommunitiesAndApartments();
      } else {
        console.log("❌ No user data found");
        Alert.alert("Error", "Please login first");
        router.replace("/login");
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
      Alert.alert("Error", "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadOrders = async (userId) => {
    try {
      console.log("📦 Loading orders for user:", userId);
      const userOrders = await OrderService.getUserOrders(userId, 50);
      console.log("📦 Orders loaded:", userOrders.length);

      // Sort orders by creation date (newest first)
      const sortedOrders = userOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      console.log("📦 Setting orders in state:", sortedOrders.length);
      setOrders(sortedOrders);
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      // Set empty array on error
      setOrders([]);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (userData?.userId) {
      setRefreshing(true);
      try {
        await loadOrders(userData.userId);
      } catch (error) {
        console.error("❌ Error refreshing orders:", error);
      } finally {
        setRefreshing(false);
      }
    }
  }, [userData]);

  // Load communities and apartments for filtering
  const loadCommunitiesAndApartments = async () => {
    try {
      // This is a placeholder - in a real app, you would fetch from your API
      // For demo purposes, we'll extract them from orders
      const uniqueCommunities = [
        ...new Set(orders.map((order) => order.deliveryAddress.communityName)),
      ];
      const uniqueApartments = [
        ...new Set(
          orders.map((order) => order.deliveryAddress.apartmentNumber),
        ),
      ];

      setCommunities(uniqueCommunities.map((name) => ({ name, id: name })));
      setApartments(uniqueApartments.map((number) => ({ number, id: number })));
    } catch (error) {
      console.error("❌ Error loading filters:", error);
    }
  };

  const getFilteredOrders = () => {
    return orders.filter((order) => {
      // Status filter
      const statusMatch =
        selectedFilter === "all" ||
        (selectedFilter === "placed"
          ? ["placed", "confirmed", "preparing", "out_for_delivery"].includes(
              order.status,
            )
          : order.status === selectedFilter);

      // Community filter
      const communityMatch =
        !selectedCommunity ||
        order.deliveryAddress.communityName === selectedCommunity;

      // Apartment filter
      const apartmentMatch =
        !selectedApartment ||
        order.deliveryAddress.apartmentNumber === selectedApartment;

      // Search query filter
      const searchMatch =
        !searchQuery ||
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.deliveryAddress.communityName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return statusMatch && communityMatch && apartmentMatch && searchMatch;
    });
  };

  const resetFilters = () => {
    setSelectedCommunity(null);
    setSelectedApartment(null);
    setSearchQuery("");
  };

  const getStatusColor = (status) => {
    const statusColors = {
      placed: "#FF9800",
      confirmed: "#2196F3",
      preparing: "#FF9800",
      out_for_delivery: "#9C27B0",
      delivered: "#4CAF50",
      cancelled: "#F44336",
      failed: "#F44336",
    };
    return statusColors[status] || "#666";
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      placed: "receipt-outline",
      confirmed: "checkmark-outline",
      preparing: "restaurant-outline",
      out_for_delivery: "car-outline",
      delivered: "checkmark-circle",
      cancelled: "close-circle",
      failed: "alert-circle",
    };
    return statusIcons[status] || "help-circle-outline";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const formatOrderAmount = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const handleOrderPress = (order) => {
    console.log("📱 Order pressed:", order.orderId);
    router.push(`/orders/${order.orderId}`);
  };

  const handleReorder = async (order) => {
    Alert.alert(
      "Reorder Items",
      `Would you like to reorder the same items from order #${order.orderId.slice(-6)}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reorder",
          onPress: () => {
            // Navigate to order page with pre-filled data
            router.push("/(customer)/order");
          },
        },
      ],
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="receipt-outline" size={80} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your order history will appear here once you place your first order.
      </Text>
      <TouchableOpacity
        style={styles.orderNowButton}
        onPress={() => router.push("/(customer)/order")}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.orderNowButtonText}>Order Now</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderOrderCard = (order, index) => {
    const isDelivered = order.status === "delivered";
    const isCancelled =
      order.status === "cancelled" || order.status === "failed";
    const isActive = [
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
    ].includes(order.status);

    return (
      <Animated.View
        key={order.orderId}
        style={[
          styles.orderCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50 * (index + 1), 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.orderCardContent}
          onPress={() => handleOrderPress(order)}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <Text style={styles.orderIdLabel}>
                Order #{order.orderId.slice(-6)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) + "20" },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(order.status)}
                  size={12}
                  color={getStatusColor(order.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {OrderService.getStatusDisplay(order.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>

          {/* Products */}
          <View style={styles.productsContainer}>
            {order.products.map((product, idx) => (
              <View key={idx} style={styles.productRow}>
                <View style={styles.productIcon}>
                  <Ionicons name="water" size={16} color="#1976D2" />
                </View>
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.productQuantity}>x{product.quantity}</Text>
              </View>
            ))}
          </View>

          {/* Delivery Address */}
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.addressText} numberOfLines={1}>
              {order.deliveryAddress.communityName}, Unit{" "}
              {order.deliveryAddress.apartmentNumber}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.orderFooter}>
            <View style={styles.amountContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                {formatOrderAmount(order.totalAmount)}
              </Text>
            </View>

            <View style={styles.actionsContainer}>
              {isDelivered && (
                <TouchableOpacity
                  style={styles.reorderButton}
                  onPress={() => handleReorder(order)}
                >
                  <Ionicons name="refresh-outline" size={16} color="#1976D2" />
                  <Text style={styles.reorderText}>Reorder</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleOrderPress(order)}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#1976D2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Order Progress */}
          {isActive && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        order.status === "placed"
                          ? 25
                          : order.status === "confirmed"
                            ? 50
                            : order.status === "preparing"
                              ? 75
                              : 100
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {order.status === "placed" && "Order received"}
                {order.status === "confirmed" && "Order confirmed"}
                {order.status === "preparing" && "Preparing your order"}
                {order.status === "out_for_delivery" && "Out for delivery"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("📱 Rendering orders page with", orders.length, "orders");

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color="#1976D2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/(customer)/order")}
          >
            <Ionicons name="add" size={24} color="#1976D2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterTab,
                  selectedFilter === option.key && styles.activeFilterTab,
                ]}
                onPress={() => setSelectedFilter(option.key)}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={selectedFilter === option.key ? "#1976D2" : "#666"}
                />
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === option.key && styles.activeFilterText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Active Filters Display */}
          {(selectedCommunity || selectedApartment || searchQuery) && (
            <View style={styles.activeFiltersContainer}>
              {selectedCommunity && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>
                    Community: {selectedCommunity}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedCommunity(null)}>
                    <Ionicons name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              {selectedApartment && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>
                    Apartment: {selectedApartment}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedApartment(null)}>
                    <Ionicons name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              {searchQuery && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>
                    Search: {searchQuery}
                  </Text>
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={resetFilters}
              >
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Orders</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by order ID or community"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {/* Community Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Community</Text>
              <ScrollView style={styles.filterOptionsList}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedCommunity === null && styles.selectedFilterOption,
                  ]}
                  onPress={() => setSelectedCommunity(null)}
                >
                  <Text style={styles.filterOptionText}>All Communities</Text>
                  {selectedCommunity === null && (
                    <Ionicons name="checkmark" size={18} color="#1976D2" />
                  )}
                </TouchableOpacity>

                {communities.map((community) => (
                  <TouchableOpacity
                    key={community.id}
                    style={[
                      styles.filterOption,
                      selectedCommunity === community.name &&
                        styles.selectedFilterOption,
                    ]}
                    onPress={() => setSelectedCommunity(community.name)}
                  >
                    <Text style={styles.filterOptionText}>
                      {community.name}
                    </Text>
                    {selectedCommunity === community.name && (
                      <Ionicons name="checkmark" size={18} color="#1976D2" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Apartment Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Apartment</Text>
              <ScrollView style={styles.filterOptionsList}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedApartment === null && styles.selectedFilterOption,
                  ]}
                  onPress={() => setSelectedApartment(null)}
                >
                  <Text style={styles.filterOptionText}>All Apartments</Text>
                  {selectedApartment === null && (
                    <Ionicons name="checkmark" size={18} color="#1976D2" />
                  )}
                </TouchableOpacity>

                {apartments.map((apartment) => (
                  <TouchableOpacity
                    key={apartment.id}
                    style={[
                      styles.filterOption,
                      selectedApartment === apartment.number &&
                        styles.selectedFilterOption,
                    ]}
                    onPress={() => setSelectedApartment(apartment.number)}
                  >
                    <Text style={styles.filterOptionText}>
                      Unit {apartment.number}
                    </Text>
                    {selectedApartment === apartment.number && (
                      <Ionicons name="checkmark" size={18} color="#1976D2" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#1976D2"]}
            tintColor="#1976D2"
          />
        }
      >
        {filteredOrders.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.ordersContainer}>
            {filteredOrders.map((order, index) =>
              renderOrderCard(order, index),
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eeeeee",
  },
  activeFilterTab: {
    backgroundColor: "#E3F2FD",
    borderColor: "#BBDEFB",
  },
  filterText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  activeFilterText: {
    color: "#1976D2",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  activeFilterChipText: {
    fontSize: 12,
    color: "#2E7D32",
  },
  clearFiltersButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#FFEBEE",
  },
  clearFiltersText: {
    fontSize: 12,
    color: "#C62828",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  filterOptionsList: {
    maxHeight: 150,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedFilterOption: {
    backgroundColor: "#E3F2FD",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#1976D2",
    flex: 2,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  orderNowButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1976D2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  orderNowButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  ordersContainer: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  orderCardContent: {
    padding: 16,
  },
  orderHeader: {
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  orderIdLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  productsContainer: {
    marginBottom: 12,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  productIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  productQuantity: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976D2",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
  },
  reorderText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1976D2",
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1976D2",
    marginRight: 4,
  },
  progressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1976D2",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
