import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function AdminOrders() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  // Mock data
  const orders = [
    {
      id: "ORD001",
      customer: "John Smith",
      address: "Sunset Gardens, Unit 101",
      date: "2023-05-12",
      amount: "$25.00",
      status: "Delivered",
      items: "2x 20L Water Bottles",
    },
    {
      id: "ORD002",
      customer: "Sarah Johnson",
      address: "Ocean View Apartments, Unit 301",
      date: "2023-05-11",
      amount: "$35.50",
      status: "Processing",
      items: "1x 20L Water Bottle, 2x 5L Bottles",
    },
    {
      id: "ORD003",
      customer: "Michael Brown",
      address: "Mountain Heights, Building B",
      date: "2023-05-11",
      amount: "$15.00",
      status: "Pending",
      items: "3x 10L Water Bottles",
    },
    {
      id: "ORD004",
      customer: "Emily Davis",
      address: "Riverside Residences, Unit 202",
      date: "2023-05-10",
      amount: "$42.75",
      status: "Delivered",
      items: "1x 20L Water Bottle",
    },
    {
      id: "ORD005",
      customer: "Robert Johnson",
      address: "Green Valley Complex, Unit 505",
      date: "2023-05-09",
      amount: "$30.25",
      status: "Cancelled",
      items: "2x 10L Water Bottles",
    },
  ];

  const tabs = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "processing", label: "Processing" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter(
          (order) => order.status.toLowerCase() === activeTab.toLowerCase(),
        );

  const handleOrderPress = (order) => {
    // Navigate to order details
    router.push("/(admin)/order-details");
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={18} color="#757575" />
          <Text style={styles.detailText}>{item.customer}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={18} color="#757575" />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="water-outline" size={18} color="#757575" />
          <Text style={styles.detailText}>{item.items}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color="#757575" />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.amountText}>{item.amount}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="filter-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={tabs}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item.id && styles.activeTab]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item.id && styles.activeTabText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Helper function to determine status color
function getStatusColor(status) {
  switch (status) {
    case "Delivered":
      return "#4CAF50";
    case "Processing":
      return "#2196F3";
    case "Pending":
      return "#FFC107";
    case "Cancelled":
      return "#F44336";
    default:
      return "#757575";
  }
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
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabsContainer: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#1976D2",
  },
  tabText: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  ordersContainer: {
    padding: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: "#757575",
    marginLeft: 6,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
