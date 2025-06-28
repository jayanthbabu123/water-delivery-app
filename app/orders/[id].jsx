import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { OrderService } from "../../src/services/order";

const OrderDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        console.log("Fetching order with ID:", id);
        if (!id) {
          setError("Invalid order ID");
          setLoading(false);
          return;
        }

        const order = await OrderService.getOrderById(id);
        console.log("Order data:", order);
        if (order) {
          setOrderDetails(order);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Log the ID for debugging purposes
  useEffect(() => {
    console.log("Order ID:", id);
  }, [id]);

  const handleReorder = () => {
    if (!orderDetails || !orderDetails.products) return;

    Alert.alert(
      "Confirm Reorder",
      "Would you like to place the same order again?",
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

  const getStatusColor = (status) => {
    const statusColors = {
      placed: { bg: "#FFF3E0", text: "#FF9800" },
      confirmed: { bg: "#E3F2FD", text: "#2196F3" },
      preparing: { bg: "#FFF3E0", text: "#FF9800" },
      out_for_delivery: { bg: "#E1F5FE", text: "#03A9F4" },
      delivered: { bg: "#E8F5E9", text: "#4CAF50" },
      cancelled: { bg: "#FFEBEE", text: "#F44336" },
      failed: { bg: "#FFEBEE", text: "#F44336" },
    };

    return statusColors[status] || { bg: "#F5F5F5", text: "#757575" };
  };

  const renderStatusBadge = (status) => {
    const colors = getStatusColor(status);

    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
        <Ionicons
          name={
            status === "delivered"
              ? "checkmark-circle"
              : status === "cancelled" || status === "failed"
                ? "close-circle"
                : status === "out_for_delivery"
                  ? "car"
                  : "time"
          }
          size={16}
          color={colors.text}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.statusText, { color: colors.text }]}>
          {OrderService.getStatusDisplay(status)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
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

  if (error || !orderDetails) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#F44336" />
          <Text style={styles.errorText}>{error || "Order not found"}</Text>
          <TouchableOpacity
            style={styles.backToOrdersButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToOrdersText}>Back to Orders</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>
                Order #{orderDetails.id ? orderDetails.id.slice(-6) : "N/A"}
              </Text>
              <Text style={styles.dateText}>
                {orderDetails.createdAt
                  ? new Date(orderDetails.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )
                  : "N/A"}
              </Text>
            </View>
            {renderStatusBadge(orderDetails.status || "placed")}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Schedule</Text>
          <View style={styles.scheduleContainer}>
            <Ionicons name="time-outline" size={20} color="#1976D2" />
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleLabel}>
                Preferred Time:{" "}
                {orderDetails.deliverySchedule?.preferredTime === "asap"
                  ? "As Soon As Possible"
                  : orderDetails.deliverySchedule?.preferredTime}
              </Text>
              <Text style={styles.estimatedTime}>
                Estimated Delivery:{" "}
                {orderDetails.deliverySchedule?.estimatedDelivery
                  ? new Date(
                      orderDetails.deliverySchedule.estimatedDelivery,
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "Not available"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          {orderDetails.deliveryAddress ? (
            <View style={styles.addressContainer}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#1976D2"
                style={styles.addressIcon}
              />
              <View>
                <Text style={styles.communityText}>
                  {orderDetails.deliveryAddress?.communityName || "N/A"}
                </Text>
                <Text style={styles.addressText}>
                  Unit {orderDetails.deliveryAddress?.apartmentNumber || "N/A"}
                </Text>
                <Text style={styles.addressSubtext}>
                  {orderDetails.deliveryAddress?.fullAddress || ""}
                </Text>
                {orderDetails.deliveryAddress?.contactName && (
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Contact:</Text>
                    <Text style={styles.contactText}>
                      {orderDetails.deliveryAddress.contactName}
                    </Text>
                    <Text style={styles.contactPhone}>
                      {orderDetails.deliveryAddress.contactPhone}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>
              No address information available
            </Text>
          )}
          {orderDetails.deliveryAddress?.specialInstructions && (
            <View style={styles.deliveryInstructions}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#666"
              />
              <Text style={styles.instructionsText}>
                {orderDetails.deliveryAddress.specialInstructions}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {orderDetails.products && orderDetails.products.length > 0 ? (
            orderDetails.products.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.productImageContainer}>
                  <Ionicons name="water-outline" size={24} color="#2196F3" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{(item.unitPrice || 0).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityText}>x{item.quantity}</Text>
                  <Text style={styles.itemTotalText}>
                    ₹{(item.totalPrice || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No products in this order</Text>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalAmount}>
              ₹{(orderDetails.subtotal || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalAmount}>
              ₹{(orderDetails.deliveryFee || 0).toFixed(2)}
            </Text>
          </View>
          {orderDetails.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.discountLabel}>Discount</Text>
              <Text style={styles.discountAmount}>
                -₹{(orderDetails.discount || 0).toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalAmount}>
              ₹{(orderDetails.totalAmount || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentRow}>
            <Ionicons
              name={
                orderDetails.paymentMethod?.type === "cash"
                  ? "cash-outline"
                  : "card-outline"
              }
              size={20}
              color="#1976D2"
            />
            <Text style={styles.paymentText}>
              {orderDetails.paymentMethod?.type === "cash"
                ? "Cash on Delivery"
                : orderDetails.paymentMethod?.type === "card"
                  ? `${orderDetails.paymentMethod.cardType} card ending in ${orderDetails.paymentMethod.cardLastFour}`
                  : "Payment method not specified"}
            </Text>
          </View>
          {orderDetails.paymentStatus && (
            <View style={styles.paymentStatusRow}>
              <Text style={styles.paymentStatusLabel}>Payment Status:</Text>
              <View
                style={[
                  styles.paymentStatusBadge,
                  {
                    backgroundColor:
                      orderDetails.paymentStatus === "completed"
                        ? "#E8F5E9"
                        : orderDetails.paymentStatus === "failed"
                          ? "#FFEBEE"
                          : "#FFF3E0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.paymentStatusText,
                    {
                      color:
                        orderDetails.paymentStatus === "completed"
                          ? "#4CAF50"
                          : orderDetails.paymentStatus === "failed"
                            ? "#F44336"
                            : "#FF9800",
                    },
                  ]}
                >
                  {OrderService.getPaymentStatusDisplay(
                    orderDetails.paymentStatus || "pending",
                  )}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Tracking</Text>
          <View style={styles.trackingContainer}>
            {/* Order Placed */}
            <View style={styles.trackingStep}>
              <View style={styles.trackingIconContainer}>
                <View style={[styles.trackingIcon, styles.completedIcon]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
                <View
                  style={[
                    styles.trackingLine,
                    orderDetails.status === "placed"
                      ? styles.pendingLine
                      : styles.completedLine,
                  ]}
                />
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingStatus}>Order Placed</Text>
                <Text style={styles.trackingTime}>
                  {orderDetails.statusHistory?.find(
                    (h) => h.status === "placed",
                  )?.timestamp
                    ? new Date(
                        orderDetails.statusHistory.find(
                          (h) => h.status === "placed",
                        ).timestamp,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </Text>
                {orderDetails.statusHistory?.find((h) => h.status === "placed")
                  ?.note && (
                  <Text style={styles.statusNote}>
                    {
                      orderDetails.statusHistory.find(
                        (h) => h.status === "placed",
                      ).note
                    }
                  </Text>
                )}
              </View>
            </View>

            {/* Confirmed */}
            <View style={styles.trackingStep}>
              <View style={styles.trackingIconContainer}>
                <View
                  style={[
                    styles.trackingIcon,
                    [
                      "confirmed",
                      "preparing",
                      "out_for_delivery",
                      "delivered",
                    ].includes(orderDetails.status)
                      ? styles.completedIcon
                      : styles.pendingIcon,
                  ]}
                >
                  {[
                    "confirmed",
                    "preparing",
                    "out_for_delivery",
                    "delivered",
                  ].includes(orderDetails.status) && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <View
                  style={[
                    styles.trackingLine,
                    ["preparing", "out_for_delivery", "delivered"].includes(
                      orderDetails.status,
                    )
                      ? styles.completedLine
                      : styles.pendingLine,
                  ]}
                />
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingStatus}>Order Confirmed</Text>
                {orderDetails.statusHistory?.find(
                  (h) => h.status === "confirmed",
                )?.timestamp ? (
                  <>
                    <Text style={styles.trackingTime}>
                      {new Date(
                        orderDetails.statusHistory.find(
                          (h) => h.status === "confirmed",
                        ).timestamp,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    {orderDetails.statusHistory.find(
                      (h) => h.status === "confirmed",
                    )?.note && (
                      <Text style={styles.statusNote}>
                        {
                          orderDetails.statusHistory.find(
                            (h) => h.status === "confirmed",
                          ).note
                        }
                      </Text>
                    )}
                  </>
                ) : null}
              </View>
            </View>

            {/* Out for Delivery */}
            <View style={styles.trackingStep}>
              <View style={styles.trackingIconContainer}>
                <View
                  style={[
                    styles.trackingIcon,
                    ["out_for_delivery", "delivered"].includes(
                      orderDetails.status,
                    )
                      ? styles.completedIcon
                      : styles.pendingIcon,
                  ]}
                >
                  {["out_for_delivery", "delivered"].includes(
                    orderDetails.status,
                  ) && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <View
                  style={[
                    styles.trackingLine,
                    orderDetails.status === "delivered"
                      ? styles.completedLine
                      : styles.pendingLine,
                  ]}
                />
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingStatus}>Out for Delivery</Text>
                {orderDetails.statusHistory?.find(
                  (h) => h.status === "out_for_delivery",
                )?.timestamp ? (
                  <>
                    <Text style={styles.trackingTime}>
                      {new Date(
                        orderDetails.statusHistory.find(
                          (h) => h.status === "out_for_delivery",
                        ).timestamp,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    {orderDetails.statusHistory.find(
                      (h) => h.status === "out_for_delivery",
                    )?.note && (
                      <Text style={styles.statusNote}>
                        {
                          orderDetails.statusHistory.find(
                            (h) => h.status === "out_for_delivery",
                          ).note
                        }
                      </Text>
                    )}
                  </>
                ) : null}
              </View>
            </View>

            {/* Delivered */}
            <View style={styles.trackingStep}>
              <View style={styles.trackingIconContainer}>
                <View
                  style={[
                    styles.trackingIcon,
                    orderDetails.status === "delivered"
                      ? styles.completedIcon
                      : styles.pendingIcon,
                  ]}
                >
                  {orderDetails.status === "delivered" && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </View>
              <View style={styles.trackingInfo}>
                <Text style={styles.trackingStatus}>Delivered</Text>
                {orderDetails.statusHistory?.find(
                  (h) => h.status === "delivered",
                )?.timestamp ? (
                  <>
                    <Text style={styles.trackingTime}>
                      {new Date(
                        orderDetails.statusHistory.find(
                          (h) => h.status === "delivered",
                        ).timestamp,
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    {orderDetails.statusHistory.find(
                      (h) => h.status === "delivered",
                    )?.note && (
                      <Text style={styles.statusNote}>
                        {
                          orderDetails.statusHistory.find(
                            (h) => h.status === "delivered",
                          ).note
                        }
                      </Text>
                    )}
                  </>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {orderDetails.status === "placed" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                "Cancel Order",
                "Are you sure you want to cancel this order?",
                [
                  {
                    text: "No",
                    style: "cancel",
                  },
                  {
                    text: "Yes, Cancel",
                    onPress: async () => {
                      try {
                        await OrderService.cancelOrder(orderDetails.id);
                        Alert.alert("Success", "Order cancelled successfully");
                        router.back();
                      } catch (error) {
                        Alert.alert("Error", "Failed to cancel order");
                      }
                    },
                    style: "destructive",
                  },
                ],
              );
            }}
          >
            <Ionicons name="close-circle-outline" size={20} color="#fff" />
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {orderDetails.status === "delivered" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={handleReorder}
          >
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  backToOrdersButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToOrdersText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  section: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  addressIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  communityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  addressSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  deliveryInstructions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  productImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#757575",
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
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
  },
  totalAmount: {
    fontSize: 14,
    color: "#1a1a1a",
  },
  discountLabel: {
    fontSize: 14,
    color: "#F44336",
  },
  discountAmount: {
    fontSize: 14,
    color: "#F44336",
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentText: {
    fontSize: 15,
    color: "#444",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryText: {
    fontSize: 15,
    color: "#444",
    marginLeft: 8,
  },
  paymentStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  paymentStatusLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  trackingContainer: {
    paddingVertical: 8,
  },
  trackingStep: {
    flexDirection: "row",
    marginBottom: 20,
  },
  trackingIconContainer: {
    width: 24,
    alignItems: "center",
  },
  trackingIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  completedIcon: {
    backgroundColor: "#4CAF50",
  },
  pendingIcon: {
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#bdbdbd",
  },
  trackingLine: {
    width: 2,
    height: 30,
    marginTop: 4,
    alignSelf: "center",
  },
  completedLine: {
    backgroundColor: "#4CAF50",
  },
  pendingLine: {
    backgroundColor: "#bdbdbd",
  },
  trackingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  trackingStatus: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  trackingTime: {
    fontSize: 13,
    color: "#757575",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  reorderButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  reorderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  contactInfo: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 8,
  },
  contactLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  contactText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  contactPhone: {
    fontSize: 14,
    color: "#1976D2",
    marginTop: 2,
  },
  scheduleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  scheduleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  estimatedTime: {
    fontSize: 14,
    color: "#666",
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  statusNote: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
    fontStyle: "italic",
  },
});

export default OrderDetailsScreen;
