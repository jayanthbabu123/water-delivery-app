import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ui/ScreenHeader";

const OrderDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock data - In real app, fetch this based on the order ID
  const orderDetails = {
    id: id,
    orderNumber: `#${id}23456`,
    date: "Mar 20, 2024, 2:30 PM",
    status: "Delivered",
    deliveryAddress: "123 Main St, Apt 4B, New York, NY 10001",
    items: [
      {
        id: 1,
        name: "5-Gallon Water Bottle",
        quantity: 2,
        price: "$6.00",
        total: "$12.00",
      },
    ],
    deliveryFee: "$2.00",
    total: "$14.00",
    paymentMethod: "Credit Card (**** 1234)",
    deliveryNotes: "Please leave at the door",
    deliveryPerson: "John Smith",
  };

  const handleReorder = () => {
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
            // Implement reorder logic here
            Alert.alert("Success", "Your order has been placed successfully!");
            router.push("/(tabs)/orders");
          },
        },
      ],
    );
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      Delivered: { bg: "#E8F5E9", text: "#4CAF50" },
      "In Transit": { bg: "#E3F2FD", text: "#2196F3" },
      Processing: { bg: "#FFF3E0", text: "#FF9800" },
      Cancelled: { bg: "#FFEBEE", text: "#F44336" },
    };

    const colors = statusColors[status] || statusColors.Processing;

    return (
      <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>
          {status}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Order Details" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>{orderDetails.orderNumber}</Text>
              <Text style={styles.dateText}>{orderDetails.date}</Text>
            </View>
            {renderStatusBadge(orderDetails.status)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.addressText}>{orderDetails.deliveryAddress}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {orderDetails.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{item.total}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Fee</Text>
            <Text style={styles.totalAmount}>{orderDetails.deliveryFee}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalAmount}>{orderDetails.total}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={styles.paymentText}>{orderDetails.paymentMethod}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.deliveryInfo}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.deliveryText}>
              Delivered by {orderDetails.deliveryPerson}
            </Text>
          </View>
          {orderDetails.deliveryNotes && (
            <View style={[styles.deliveryInfo, { marginTop: 8 }]}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#666"
              />
              <Text style={styles.deliveryText}>
                Note: {orderDetails.deliveryNotes}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  addressText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
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
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  grandTotalAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  reorderButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  reorderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OrderDetailsScreen;
