import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboard() {
  // Mock data
  const stats = [
    {
      title: "Total Orders",
      value: "2,456",
      icon: "cart-outline",
      color: "#4CAF50",
    },
    {
      title: "Active Customers",
      value: "876",
      icon: "people-outline",
      color: "#2196F3",
    },
    {
      title: "Revenue",
      value: "$12,435",
      icon: "cash-outline",
      color: "#FFC107",
    },
    {
      title: "Pending Orders",
      value: "23",
      icon: "time-outline",
      color: "#FF5722",
    },
  ];

  const recentOrders = [
    {
      id: "ORD001",
      customer: "John Smith",
      status: "Delivered",
      date: "2023-05-12",
      amount: "$25.00",
    },
    {
      id: "ORD002",
      customer: "Sarah Johnson",
      status: "Processing",
      date: "2023-05-11",
      amount: "$35.50",
    },
    {
      id: "ORD003",
      customer: "Michael Brown",
      status: "Pending",
      date: "2023-05-11",
      amount: "$15.00",
    },
    {
      id: "ORD004",
      customer: "Emily Davis",
      status: "Delivered",
      date: "2023-05-10",
      amount: "$42.75",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: stat.color + "20" },
                ]}
              >
                <Ionicons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 1 }]}>Order ID</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>Customer</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>Status</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>Amount</Text>
          </View>

          {recentOrders.map((order, index) => (
            <TouchableOpacity key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>{order.id}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>
                {order.customer}
              </Text>
              <View
                style={[
                  styles.statusContainer,
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
              <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                {order.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "#2196F3" + "20" },
                ]}
              >
                <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionText}>Add Product</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "#4CAF50" + "20" },
                ]}
              >
                <Ionicons name="person-add-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText}>Add User</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "#FFC107" + "20" },
                ]}
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={24}
                  color="#FFC107"
                />
              </View>
              <Text style={styles.actionText}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: "#9C27B0" + "20" },
                ]}
              >
                <Ionicons name="settings-outline" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#757575",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sectionLink: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    alignItems: "center",
  },
  tableCell: {
    fontSize: 14,
    color: "#333",
  },
  statusContainer: {
    flex: 1.5,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    alignItems: "center",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
