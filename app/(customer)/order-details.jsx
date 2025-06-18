import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const { orderId } = params;

  // Mock order data (in a real app, fetch from API based on orderId)
  const order = {
    id: orderId || "ORD12345",
    status: "Processing",
    date: "May 15, 2023",
    time: "10:30 AM",
    deliveryAddress: "123 Palm Street, Sunset Gardens, Unit 101",
    paymentMethod: "Credit Card (ending in 4242)",
    items: [
      {
        id: "item1",
        name: "20L Water Bottle",
        quantity: 2,
        price: 20.0,
      },
    ],
    subtotal: 40.0,
    deliveryFee: 5.0,
    total: 45.0,
    tracking: [
      { status: "Order Placed", completed: true, time: "10:30 AM" },
      { status: "Processing", completed: true, time: "10:45 AM" },
      { status: "Out for Delivery", completed: false },
      { status: "Delivered", completed: false },
    ],
  };

  // Function to handle cancellation
  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes, Cancel",
        onPress: () => {
          // In a real app, send cancellation request to backend
          Alert.alert(
            "Order Cancelled",
            "Your order has been cancelled successfully.",
          );
          router.back();
        },
        style: "destructive",
      },
    ]);
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#4CAF50";
      case "Processing":
        return "#2196F3";
      case "Out for Delivery":
        return "#FF9800";
      case "Cancelled":
        return "#F44336";
      default:
        return "#757575";
    }
  };

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

      <ScrollView style={styles.content}>
        <View style={styles.orderStatusCard}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {order.status}
              </Text>
            </View>
          </View>
          <View style={styles.orderTimeRow}>
            <Ionicons name="calendar-outline" size={16} color="#757575" />
            <Text style={styles.orderTimeText}>
              {order.date} at {order.time}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#1976D2"
              style={styles.addressIcon}
            />
            <Text style={styles.addressText}>{order.deliveryAddress}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.productImageContainer}>
                <Ionicons name="water-outline" size={24} color="#2196F3" />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
              </View>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>x{item.quantity}</Text>
                <Text style={styles.itemTotalText}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentRow}>
            <Ionicons name="card-outline" size={20} color="#1976D2" />
            <Text style={styles.paymentText}>{order.paymentMethod}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ${order.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              ${order.deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Tracking</Text>
          <View style={styles.trackingContainer}>
            {order.tracking.map((step, index) => (
              <View key={index} style={styles.trackingStep}>
                <View style={styles.trackingIconContainer}>
                  <View
                    style={[
                      styles.trackingIcon,
                      step.completed
                        ? styles.completedIcon
                        : styles.pendingIcon,
                    ]}
                  >
                    {step.completed && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  {index < order.tracking.length - 1 && (
                    <View
                      style={[
                        styles.trackingLine,
                        order.tracking[index + 1].completed
                          ? styles.completedLine
                          : styles.pendingLine,
                      ]}
                    />
                  )}
                </View>
                <View style={styles.trackingInfo}>
                  <Text style={styles.trackingStatus}>{step.status}</Text>
                  {step.time && (
                    <Text style={styles.trackingTime}>{step.time}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {order.status === "Processing" && (
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderTimeText: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 6,
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
    color: "#1a1a1a",
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  itemDetails: {
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
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#757575",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976D2",
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
  cancelButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomSpace: {
    height: 80,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  supportButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  supportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
