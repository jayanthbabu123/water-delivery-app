import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from "react-native-safe-area-context";

import { OrderService } from "../../../src/services/order";
import { DeliveryTimeUtils } from "../../../src/utils/deliveryTime";

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
  const [visibleCount, setVisibleCount] = useState(10);
  const MAX_VISIBLE = 50;
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState('from');

  // Filter options
  const tabCounts = {
    all: orders.length,
    placed: orders.filter(order => ["placed", "confirmed", "preparing", "out_for_delivery"].includes(order.status)).length,
    delivered: orders.filter(order => order.status === "delivered").length,
    cancelled: orders.filter(order => order.status === "cancelled").length,
  };

  const filterOptions = [
    { key: "all", label: `All Orders (${tabCounts.all})`, icon: "receipt-outline" },
    { key: "placed", label: `Active (${tabCounts.placed})`, icon: "time-outline" },
    { key: "delivered", label: `Delivered (${tabCounts.delivered})`, icon: "checkmark-circle-outline" },
    { key: "cancelled", label: `Cancelled (${tabCounts.cancelled})`, icon: "close-circle-outline" },
  ];

  useEffect(() => {
    loadUserDataAndOrders();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    setVisibleCount(10);
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

      // Date range filter
      let dateMatch = true;
      if (dateFrom) {
        dateMatch = new Date(order.createdAt) >= new Date(dateFrom);
      }
      if (dateTo && dateMatch) {
        // Add 1 day to include the end date
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        dateMatch = new Date(order.createdAt) <= endDate;
      }

      return statusMatch && communityMatch && apartmentMatch && searchMatch && dateMatch;
    });
  };

  const resetFilters = () => {
    setSelectedCommunity(null);
    setSelectedApartment(null);
    setSearchQuery("");
    setDateFrom(null);
    setDateTo(null);
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

  const formatDeliveryTime = (order) => {
    if (order.deliverySchedule?.estimatedDelivery) {
      return order.deliverySchedule.estimatedDelivery;
    }
    
    // Fallback calculation if not stored
    return DeliveryTimeUtils.calculateEstimatedDelivery(order.createdAt);
  };

  const handleOrderPress = (order) => {
    console.log("📱 Order pressed:", order.orderId);
    router.push(`/(customer)/order-details?orderId=${order.orderId}`);
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
          activeOpacity={0.8}
        >
          {/* Header: Order ID and Status */}
          <View style={styles.orderHeaderRow}>
            <Text style={styles.orderIdLabel}>#{order.orderId.slice(-6)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '22' }]}> 
              <Ionicons
                name={getStatusIcon(order.status)}
                size={14}
                color={getStatusColor(order.status)}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}> 
                {OrderService.getStatusDisplay(order.status)}
              </Text>
            </View>
          </View>

          {/* Date */}
          <Text style={styles.orderDateElegant}>{formatDate(order.createdAt)}</Text>

          {/* Product summary */}
          <View style={styles.productSummaryRow}>
            <Ionicons name="cube-outline" size={16} color="#1976D2" style={{ marginRight: 6 }} />
            <Text style={styles.productSummaryText} numberOfLines={1}>
              {order.products.length === 1
                ? `${order.products[0].quantity} x ${order.products[0].name}`
                : `${order.products.length} items`}
            </Text>
          </View>

          {/* Delivery address */}
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color="#666" style={{ marginRight: 4 }} />
            <Text style={styles.addressTextElegant} numberOfLines={1}>
              {order.deliveryAddress.communityName}, Unit {order.deliveryAddress.apartmentNumber}
            </Text>
          </View>

          {/* Footer: Total and Chevron */}
          <View style={styles.orderCardFooter}>
            <Text style={styles.totalLabelElegant}>Total</Text>
            <Text style={styles.totalAmountElegant}>{formatOrderAmount(order.totalAmount)}</Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="chevron-forward" size={22} color="#1976D2" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // --- Date picker handlers ---
  const openCalendar = (mode) => {
    setCalendarMode(mode);
    setShowCalendar(true);
  };
  const handleCalendarDayPress = (day) => {
    if (calendarMode === 'from') setDateFrom(day.dateString);
    else setDateTo(day.dateString);
    setShowCalendar(false);
  };
  const handleCancelCalendar = () => setShowCalendar(false);

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

  const filteredOrders = getFilteredOrders().slice(0, visibleCount);
  const canShowMore = getFilteredOrders().length > visibleCount && visibleCount < MAX_VISIBLE;

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
        <View style={{ backgroundColor: '#e2e1eb', paddingVertical: 6, paddingHorizontal: 4, borderRadius: 10, marginHorizontal: 12, marginTop: 6, marginBottom: 2 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: selectedFilter === option.key ? '#fff' : 'transparent',
                    borderWidth: selectedFilter === option.key ? 1.2 : 1,
                    borderColor: selectedFilter === option.key ? '#1976D2' : 'transparent',
                    shadowColor: selectedFilter === option.key ? '#1976D2' : 'transparent',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: selectedFilter === option.key ? 0.07 : 0,
                    shadowRadius: selectedFilter === option.key ? 3 : 0,
                    elevation: selectedFilter === option.key ? 1 : 0,
                  },
                ]}
                onPress={() => setSelectedFilter(option.key)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={option.icon}
                  size={15}
                  color={selectedFilter === option.key ? '#1976D2' : '#888'}
                />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 14,
                    fontWeight: selectedFilter === option.key ? '700' : '500',
                    color: selectedFilter === option.key ? '#1976D2' : '#888',
                    letterSpacing: 0.1,
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Active Filters Display */}
          {(selectedCommunity || selectedApartment || searchQuery || dateFrom || dateTo) && (
            <View style={styles.activeFiltersContainer}>
              {selectedCommunity && (
                <View style={styles.activeFilterChip}>
                  <Ionicons name="business-outline" size={14} color="#2E7D32" style={{ marginRight: 4 }} />
                  <Text style={styles.activeFilterChipText}>
                    {selectedCommunity}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedCommunity(null)}>
                    <Ionicons name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              {selectedApartment && (
                <View style={styles.activeFilterChip}>
                  <Ionicons name="home-outline" size={14} color="#2E7D32" style={{ marginRight: 4 }} />
                  <Text style={styles.activeFilterChipText}>
                    Unit {selectedApartment}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedApartment(null)}>
                    <Ionicons name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              {searchQuery && (
                <View style={styles.activeFilterChip}>
                  <Ionicons name="search-outline" size={14} color="#2E7D32" style={{ marginRight: 4 }} />
                  <Text style={styles.activeFilterChipText}>
                    "{searchQuery}"
                  </Text>
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}

              {(dateFrom || dateTo) && (
                <View style={styles.activeFilterChip}>
                  <Ionicons name="calendar-outline" size={14} color="#2E7D32" style={{ marginRight: 4 }} />
                  <Text style={styles.activeFilterChipText}>
                    {dateFrom && dateTo 
                      ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
                      : dateFrom 
                        ? `From ${new Date(dateFrom).toLocaleDateString()}`
                        : `To ${new Date(dateTo).toLocaleDateString()}`
                    }
                  </Text>
                  <TouchableOpacity onPress={() => { setDateFrom(null); setDateTo(null); }}>
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

            {/* Date Range Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => openCalendar('from')}
                >
                  <Ionicons name="calendar-outline" size={18} color="#1976D2" />
                  <Text style={styles.datePickerText}>
                    {dateFrom ? new Date(dateFrom).toLocaleDateString() : 'From'}
                  </Text>
                </TouchableOpacity>
                <Text style={{ color: '#888', fontSize: 16 }}>to</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => openCalendar('to')}
                >
                  <Ionicons name="calendar-outline" size={18} color="#1976D2" />
                  <Text style={styles.datePickerText}>
                    {dateTo ? new Date(dateTo).toLocaleDateString() : 'To'}
                  </Text>
                </TouchableOpacity>
                {(dateFrom || dateTo) && (
                  <TouchableOpacity onPress={() => { setDateFrom(null); setDateTo(null); }}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
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

      {/* Calendar Modal (outside modal, at root of component) */}
      {showCalendar && (
        <Modal
          visible={showCalendar}
          transparent
          animationType="fade"
          onRequestClose={handleCancelCalendar}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, width: 340, maxWidth: '90%' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1976D2' }}>
                Select {calendarMode === 'from' ? 'Start' : 'End'} Date
              </Text>
              <Calendar
                onDayPress={handleCalendarDayPress}
                markedDates={
                  (calendarMode === 'from' && dateFrom) ? { [dateFrom]: { selected: true, selectedColor: '#1976D2' } } :
                  (calendarMode === 'to' && dateTo) ? { [dateTo]: { selected: true, selectedColor: '#1976D2' } } : {}
                }
                maxDate={calendarMode === 'from' && dateTo ? dateTo : undefined}
                minDate={calendarMode === 'to' && dateFrom ? dateFrom : undefined}
              />
              <TouchableOpacity onPress={handleCancelCalendar} style={{ marginTop: 16, alignSelf: 'flex-end' }}>
                <Text style={{ color: '#1976D2', fontWeight: '600', fontSize: 15 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

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

      {canShowMore && (
        <TouchableOpacity
          style={{ alignSelf: 'center', marginVertical: 16, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24, backgroundColor: '#1976D2' }}
          onPress={() => setVisibleCount(v => Math.min(v + 10, MAX_VISIBLE))}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            Show More
          </Text>
        </TouchableOpacity>
      )}
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 22,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#E3F2FD",
    minWidth: 80,
    minHeight: 40,
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFilterTab: {
    backgroundColor: "#1976D2",
    borderColor: "#1976D2",
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#1976D2",
    letterSpacing: 0.1,
  },
  activeFilterText: {
    color: "#fff",
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
    paddingBottom: 80,
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
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  orderDateElegant: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
    marginLeft: 2,
  },
  productSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 2,
  },
  productSummaryText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 2,
  },
  addressTextElegant: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  orderCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 6,
    gap: 8,
  },
  totalLabelElegant: {
    fontSize: 13,
    color: '#888',
    marginRight: 4,
  },
  totalAmountElegant: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
    marginRight: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 4,
  },
  datePickerText: {
    marginLeft: 6,
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 14,
  },
});
