import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ui/ScreenHeader";

// Mock data for orders
const ORDERS_DATA = {
  "1": {
    id: "1",
    date: "Today, 2:30 PM",
    status: "Delivered",
    items: [{ name: "5-gallon bottles", quantity: 2, price: 6.00 }],
    price: "$12.00",
    deliveryAddress: "123 Main St, Apt 101, San Francisco, CA 94105",
    paymentMethod: "Visa ending in 4242",
    deliveryPerson: "John Smith",
    orderNumber: "ORD10023457",
    estimatedDelivery: "Delivered today at 2:30 PM",
    notes: "Leave at the door",
  },
  "2": {
    id: "2",
    date: "Yesterday, 10:15 AM",
    status: "Delivered",
    items: [{ name: "5-gallon bottle", quantity: 1, price: 6.00 }],
    price: "$6.00",
    deliveryAddress: "123 Main St, Apt 101, San Francisco, CA 94105",
    paymentMethod: "Visa ending in 4242",
    deliveryPerson: "Maria Rodriguez",
    orderNumber: "ORD10023442",
    estimatedDelivery: "Delivered yesterday at 10:15 AM",
    notes: "",
  },
  "3": {
    id: "3",
    date: "Mar 15, 2024",
    status: "Delivered",
    items: [{ name: "5-gallon bottles", quantity: 3, price: 6.00 }],
    price: "$18.00",
    deliveryAddress: "123 Main St, Apt 101, San Francisco, CA 94105",
    paymentMethod: "Mastercard ending in 5678",
    deliveryPerson: "David Johnson",
    orderNumber: "ORD10023421",
    estimatedDelivery: "Delivered on Mar 15, 2024",
    notes: "Call upon arrival",
  }
};

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id } = params;

  // Get order details from mock data
  const order = ORDERS_DATA[id] || {};

  const handleReorder = () => {
    // Navigate to new order page with pre-filled details
    router.push({
      pathname: "/order",
      params: {
        quantity: order.items[0].quantity.toString(),
        reorder: "true"
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "#4CAF50";
      case "In Progress":
        return "#FF9800";
      case "Cancelled":
        return "#F44336";
      default:
        return "#4CAF50";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <ScreenHeader title="Order Details" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderNumberRow}>
            <Text style={styles.orderNumberLabel}>Order Number</Text>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          </View>

          <View style={styles.dateStatusRow}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.dateText}>{order.date}</Text>
            </View>

            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(order.status)}15` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(order.status) }
              ]}>
                {order.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {order.items && order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemDetails}>
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>{item.quantity}x</Text>
                </View>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.quantity * item.price).toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{order.price}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location-outline" size={18} color="#1976D2" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Delivery Address</Text>
              <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="person-outline" size={18} color="#1976D2" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Delivery Person</Text>
              <Text style={styles.infoValue}>{order.deliveryPerson}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="time-outline" size={18} color="#1976D2" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Delivery Time</Text>
              <Text style={styles.infoValue}>{order.estimatedDelivery}</Text>
            </View>
          </View>

          {order.notes && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="document-text-outline" size={18} color="#1976D2" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Delivery Notes</Text>
                <Text style={styles.infoValue}>{order.notes}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="card-outline" size={18} color="#1976D2" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <Text style={styles.infoValue}>{order.paymentMethod}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.reorderButton}
          onPress={handleReorder}
        >
          <Ionicons name="repeat" size={18} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.reorderButtonText}>Reorder</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportButton}>
          <Ionicons name="help-circle-outline" size={18} color="#1976D2" style={styles.buttonIcon} />
          <Text style={styles.supportButtonText}>Need Help With This Order?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 90 : 70,
  },
  orderHeader: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderNumberRow: {
    marginBottom: 12,
  },
  orderNumberLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityBadge: {
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1976D2",
  },
  itemName: {
    fontSize: 15,
    color: "#333",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976D2",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
  },
  reorderButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  reorderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  supportButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1976D2",
    marginBottom: 24,
  },
  supportButtonText: {
    color: "#1976D2",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonIcon: {
    marginRight: 8,
  },
});
