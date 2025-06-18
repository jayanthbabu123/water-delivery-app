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

export default function CompletedDeliveries() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("today");

  // Mock data for completed deliveries
  const [deliveries, setDeliveries] = useState([
    {
      id: "DEL007",
      customer: "David Thompson",
      address: "123 Sunset Gardens, Unit 205",
      products: "2x 20L Water Bottles",
      completedAt: "10:45 AM",
      date: "Today",
      amount: "$40.00",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/78.jpg",
    },
    {
      id: "DEL008",
      customer: "Amanda Garcia",
      address: "456 Ocean View Apartments, Unit 302",
      products: "1x 20L Water Bottle, 1x 10L Bottle",
      completedAt: "9:30 AM",
      date: "Today",
      amount: "$32.50",
      rating: 4,
      image: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    {
      id: "DEL004",
      customer: "Emily Davis",
      address: "234 Riverside Residences, Unit 202",
      products: "1x 20L Water Bottle",
      completedAt: "4:15 PM",
      date: "Yesterday",
      amount: "$20.00",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/22.jpg",
    },
    {
      id: "DEL003",
      customer: "Michael Brown",
      address: "789 Mountain Heights, Building B",
      products: "3x 10L Water Bottles",
      completedAt: "2:45 PM",
      date: "Yesterday",
      amount: "$37.50",
      rating: 3,
      image: "https://randomuser.me/api/portraits/men/67.jpg",
    },
  ]);

  const filters = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
  ];

  // Filter deliveries based on active filter
  const filteredDeliveries = deliveries.filter((delivery) => {
    if (activeFilter === "today") return delivery.date === "Today";
    if (activeFilter === "yesterday") return delivery.date === "Yesterday";
    return true; // For 'week' and 'month', show all (this is just a mock)
  });

  // Navigate to delivery details
  const handleDeliveryPress = (delivery) => {
    router.push("/(delivery)/delivery-details");
  };

  // Render stars for rating
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#FFC107" : "#bdbdbd"}
          style={{ marginRight: 2 }}
        />,
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
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
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.completedText}>Completed</Text>
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
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color="#757575" />
          <Text style={styles.detailText}>
            Completed at {item.completedAt} ({item.date})
          </Text>
        </View>
      </View>

      <View style={styles.deliveryFooter}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount:</Text>
          <Text style={styles.amountValue}>{item.amount}</Text>
        </View>
        {renderRatingStars(item.rating)}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Completed Deliveries</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="calendar-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === item.id && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === item.id && styles.activeFilterText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {filteredDeliveries.length > 0 ? (
        <FlatList
          data={filteredDeliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={64} color="#bdbdbd" />
          <Text style={styles.emptyTitle}>No Completed Deliveries</Text>
          <Text style={styles.emptyText}>
            You haven't completed any deliveries during this period.
          </Text>
        </View>
      )}
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
  filtersContainer: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  activeFilterButton: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
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
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4CAF50",
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
  deliveryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    color: "#757575",
    marginRight: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
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
