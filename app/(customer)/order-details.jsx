import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OrderService } from "../../src/services/order";
import { DeliveryTimeUtils } from "../../src/utils/deliveryTime";

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const { orderId } = params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  // Load order data
  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      
      // Load user data
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }

      // Load order data
      if (orderId) {
        const orderData = await OrderService.getOrderById(orderId);
        if (orderData) {
          setOrder(orderData);
        } else {
          Alert.alert("Error", "Order not found");
          router.back();
        }
      }
    } catch (error) {
      console.error("Error loading order data:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderData();
    setRefreshing(false);
  };

  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes, Cancel",
        onPress: async () => {
          try {
            await OrderService.cancelOrder(orderId, "Cancelled by customer", "customer");
            Alert.alert("Success", "Order cancelled successfully");
            loadOrderData(); // Refresh data
          } catch (error) {
            console.error("Error cancelling order:", error);
            Alert.alert("Error", "Failed to cancel order");
          }
        },
        style: "destructive",
      },
    ]);
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
    return statusColors[status] || "#757575";
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      placed: "receipt-outline",
      confirmed: "checkmark-circle-outline",
      preparing: "construct-outline",
      out_for_delivery: "car-outline",
      delivered: "checkmark-done-circle",
      cancelled: "close-circle",
      failed: "alert-circle",
    };
    return statusIcons[status] || "help-circle-outline";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatOrderAmount = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const getDeliveryStatus = () => {
    if (!order) return { isDelivered: false, isActive: false };
    
    const isDelivered = order.status === "delivered";
    const isActive = ["placed", "confirmed", "preparing", "out_for_delivery"].includes(order.status);
    
    return { isDelivered, isActive };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorText}>The order you're looking for doesn't exist or has been removed.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { isDelivered, isActive } = getDeliveryStatus();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Order Status Card */}
        <View style={styles.orderStatusCard}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>Order #{order.orderId?.slice(-6) || order.id}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + "20" },
              ]}
            >
              <Ionicons
                name={getStatusIcon(order.status)}
                size={16}
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
          <View style={styles.orderTimeRow}>
            <Ionicons name="calendar-outline" size={16} color="#757575" />
            <Text style={styles.orderTimeText}>
              {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#1976D2"
              style={styles.addressIcon}
            />
            <View style={styles.addressDetails}>
              <Text style={styles.addressText}>
                {order.deliveryAddress?.communityName}, Unit {order.deliveryAddress?.apartmentNumber}
              </Text>
              <Text style={styles.contactText}>
                {order.deliveryAddress?.contactName} • {order.deliveryAddress?.contactPhone}
              </Text>
              {order.deliveryAddress?.specialInstructions && (
                <Text style={styles.instructionsText}>
                  Note: {order.deliveryAddress.specialInstructions}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Delivery Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Schedule</Text>
          <View style={styles.deliveryScheduleContainer}>
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleIconContainer}>
                <Ionicons name="time-outline" size={20} color="#1976D2" />
              </View>
              <View style={styles.scheduleDetails}>
                <Text style={styles.scheduleLabel}>Estimated Delivery</Text>
                <Text style={styles.scheduleTime}>
                  {order.deliverySchedule?.estimatedDelivery || 
                   DeliveryTimeUtils.calculateEstimatedDelivery(order.createdAt)}
                </Text>
              </View>
            </View>
            
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleIconContainer}>
                <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
              </View>
              <View style={styles.scheduleDetails}>
                <Text style={styles.scheduleLabel}>Delivery Policy</Text>
                <Text style={styles.schedulePolicy}>
                  {DeliveryTimeUtils.getDeliveryPolicy()}
                </Text>
              </View>
            </View>

            {order.deliverySchedule?.actualDelivery && (
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleIconContainer}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
                <View style={styles.scheduleDetails}>
                  <Text style={styles.scheduleLabel}>Actual Delivery</Text>
                  <Text style={styles.scheduleTime}>
                    {formatDate(order.deliverySchedule.actualDelivery)} at {formatTime(order.deliverySchedule.actualDelivery)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.products?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.productImageContainer}>
                <Ionicons name="water-outline" size={24} color="#2196F3" />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSpecs}>
                  {item.specifications?.volume} • {item.specifications?.type}
                </Text>
                <Text style={styles.itemPrice}>₹{item.unitPrice?.toFixed(2)}</Text>
              </View>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>x{item.quantity}</Text>
                <Text style={styles.itemTotalText}>
                  ₹{item.totalPrice?.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentRow}>
            <Ionicons name="card-outline" size={20} color="#1976D2" />
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentText}>
                {order.paymentMethod?.cardType} •••• {order.paymentMethod?.cardLastFour}
              </Text>
              <Text style={styles.paymentStatus}>
                Status: {OrderService.getPaymentStatusDisplay(order.paymentStatus)}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ₹{order.subtotal?.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee?.toFixed(2)}`}
            </Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -₹{order.discount?.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount?.toFixed(2)}</Text>
          </View>
        </View>

        {/* Order Tracking - Simplified */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Tracking</Text>
          <View style={styles.trackingContainer}>
            <View style={styles.trackingStep}>
              <View style={styles.trackingIconContainer}>
                <View style={[styles.trackingIcon, styles.completedIcon]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
                <View style={styles.completedLine} />
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingStatus}>Order Placed</Text>
                <Text style={styles.trackingTime}>
                  {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                </Text>
              </View>
            </View>

            <View style={styles.trackingStep}>
              <View style={styles.trackingIconContainer}>
                <View style={[
                  styles.trackingIcon, 
                  isDelivered ? styles.completedIcon : styles.pendingIcon
                ]}>
                  {isDelivered && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingStatus}>Delivered</Text>
                <Text style={styles.trackingTime}>
                  {isDelivered 
                    ? `${formatDate(order.deliverySchedule?.actualDelivery || order.updatedAt)} at ${formatTime(order.deliverySchedule?.actualDelivery || order.updatedAt)}`
                    : "In progress..."
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Notes */}
        {order.orderNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesContainer}>
              <Ionicons name="chatbubble-outline" size={16} color="#757575" />
              <Text style={styles.notesText}>{order.orderNotes}</Text>
            </View>
          </View>
        )}

        {/* Cancel Order Button */}
        {isActive && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
          >
            <Ionicons name="close-circle-outline" size={20} color="#fff" />
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Support Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => router.push("/(customer)/support")}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          <Text style={styles.supportButtonText}>Contact Support</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderStatusCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  orderTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderTimeText: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 8,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    lineHeight: 22,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 13,
    color: "#757575",
    fontStyle: "italic",
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemSpecs: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "600",
  },
  quantityContainer: {
    alignItems: "flex-end",
  },
  quantityText: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  paymentStatus: {
    fontSize: 13,
    color: "#757575",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#666",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  discountText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1976D2",
  },
  trackingContainer: {
    paddingVertical: 8,
  },
  trackingStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  trackingIconContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  trackingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  completedIcon: {
    backgroundColor: "#4CAF50",
  },
  pendingIcon: {
    backgroundColor: "#E0E0E0",
    borderWidth: 2,
    borderColor: "#BDBDBD",
  },
  completedLine: {
    width: 2,
    height: 40,
    backgroundColor: "#4CAF50",
  },
  trackingInfo: {
    flex: 1,
    paddingTop: 4,
  },
  trackingStatus: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  trackingTime: {
    fontSize: 14,
    color: "#757575",
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notesText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomSpace: {
    height: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  supportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F44336",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deliveryScheduleContainer: {
    gap: 16,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  scheduleIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  scheduleTime: {
    fontSize: 15,
    color: "#1976D2",
    fontWeight: "600",
  },
  schedulePolicy: {
    fontSize: 13,
    color: "#757575",
    lineHeight: 18,
  },
});
