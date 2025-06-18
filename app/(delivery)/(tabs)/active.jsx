import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function ActiveDeliveries() {
  const router = useRouter();

  // Mock data for active deliveries
  const [deliveries, setDeliveries] = useState([
    {
      id: "DEL005",
      customer: "Robert Wilson",
      address: "567 Green Valley Complex, Unit 505",
      products: "2x 10L Water Bottles",
      status: "On the Way",
      startTime: "11:15 AM",
      eta: "11:45 AM",
      progress: 60,
      image: "https://randomuser.me/api/portraits/men/91.jpg",
    },
    {
      id: "DEL006",
      customer: "Jennifer Lopez",
      address: "890 Mountain Heights, Building C",
      products: "1x 20L Water Bottle",
      status: "Arrived",
      startTime: "10:30 AM",
      eta: "11:00 AM",
      progress: 90,
      image: "https://randomuser.me/api/portraits/women/65.jpg",
    },
  ]);

  // Navigate to delivery details
  const handleDeliveryPress = (delivery) => {
    router.push("/(delivery)/delivery-details");
  };

  // Mark a delivery as complete
  const handleCompleteDelivery = (deliveryId) => {
    setDeliveries(deliveries.filter((delivery) => delivery.id !== deliveryId));
    // In a real app, you would update the server and move this to completed deliveries
  };

  // Render each delivery item
  const renderDeliveryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={() => handleDeliveryPress(item)}
    >
      <View style={styles.deliveryHeader}>
        <View style={styles.customerInfo}>
          <Image source={{ uri: item.image }} style={styles.customerImage} />
          <View>
            <Text style={styles.customerName}>{item.customer}</Text>
            <Text style={styles.deliveryId}>Order #{item.id}</Text>
          </View>
        </View>
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

      <View style={styles.deliveryDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={18} color="#757575" />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="water-outline" size={18} color="#757575" />
          <Text style={styles.detailText}>{item.products}</Text>
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeInfo}>
            <Ionicons name="time-outline" size={16} color="#757575" />
            <Text style={styles.timeText}>Started: {item.startTime}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Ionicons name="flag-outline" size={16} color="#757575" />
            <Text style={styles.timeText}>ETA: {item.eta}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${item.progress}%`,
                backgroundColor: getStatusColor(item.status),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{item.progress}% Complete</Text>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
          onPress={() => handleCompleteDelivery(item.id)}
        >
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Mark as Delivered</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleDeliveryPress(item)}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Deliveries</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="refresh-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {deliveries.length > 0 ? (
        <FlatList
          data={deliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>
            You have no active deliveries at the moment.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Helper function to determine status color
function getStatusColor(status) {
  switch (status) {
    case "On the Way":
      return "#2196F3";
    case "Arrived":
      return "#FF9800";
    case "Delivering":
      return "#9C27B0";
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
  listContainer: {
    padding: 16,
  },
  deliveryCard: {
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
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  deliveryId: {
    fontSize: 13,
    color: "#757575",
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "500",
  },
  deliveryDetails: {
    marginBottom: 16,
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
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 13,
    color: "#757575",
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#757575",
    textAlign: "right",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsButtonText: {
    color: "#2196F3",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
});
