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

export default function AssignedDeliveries() {
  const router = useRouter();

  // Mock data for assigned deliveries
  const [deliveries, setDeliveries] = useState([
    {
      id: "DEL001",
      customer: "John Smith",
      address: "123 Palm Street, Sunset Gardens",
      products: "2x 20L Water Bottles",
      scheduledTime: "10:30 AM - 11:30 AM",
      distance: "3.2 km",
      status: "Assigned",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "DEL002",
      customer: "Sarah Johnson",
      address: "456 Ocean View Apartments, Unit 301",
      products: "1x 20L Water Bottle, 2x 5L Bottles",
      scheduledTime: "12:00 PM - 1:00 PM",
      distance: "5.7 km",
      status: "Assigned",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: "DEL003",
      customer: "Michael Brown",
      address: "789 Mountain Heights, Building B",
      products: "3x 10L Water Bottles",
      scheduledTime: "2:30 PM - 3:30 PM",
      distance: "4.5 km",
      status: "Assigned",
      image: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    {
      id: "DEL004",
      customer: "Emily Davis",
      address: "234 Riverside Residences, Unit 202",
      products: "1x 20L Water Bottle",
      scheduledTime: "4:00 PM - 5:00 PM",
      distance: "2.9 km",
      status: "Assigned",
      image: "https://randomuser.me/api/portraits/women/22.jpg",
    },
  ]);

  // Navigate to delivery details
  const handleDeliveryPress = (delivery) => {
    // In a real app, you would navigate to the delivery details screen
    // router.push(`/delivery-details/${delivery.id}`);
    router.push("/(delivery)/delivery-details");
  };

  // Accept a delivery
  const handleAcceptDelivery = (deliveryId) => {
    setDeliveries(
      deliveries.map((delivery) =>
        delivery.id === deliveryId
          ? { ...delivery, status: "Accepted" }
          : delivery,
      ),
    );
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
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={16} color="#4CAF50" />
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>
      </View>

      <View style={styles.deliveryDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color="#757575" />
          <Text style={styles.detailText}>{item.scheduledTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={18} color="#757575" />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="water-outline" size={18} color="#757575" />
          <Text style={styles.detailText}>{item.products}</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        {item.status === "Assigned" ? (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleAcceptDelivery(item.id)}
          >
            <Text style={styles.acceptButtonText}>Accept Delivery</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.acceptedContainer}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.acceptedText}>Accepted</Text>
          </View>
        )}

        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assigned Deliveries</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="filter-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
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
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "500",
    marginLeft: 4,
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
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  acceptedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  acceptedText: {
    color: "#4CAF50",
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
});
