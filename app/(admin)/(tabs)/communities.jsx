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

export default function AdminInventory() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");

  // Mock data for inventory items
  const inventoryItems = [
    {
      id: "1",
      name: "20L Water Bottle",
      sku: "WB-20L",
      price: 20.0,
      stock: 245,
      unit: "bottles",
      category: "bottles",
      image: "https://example.com/water-bottle-20l.jpg",
      status: "In Stock",
    },
    {
      id: "2",
      name: "10L Water Bottle",
      sku: "WB-10L",
      price: 12.5,
      stock: 187,
      unit: "bottles",
      category: "bottles",
      image: "https://example.com/water-bottle-10l.jpg",
      status: "In Stock",
    },
    {
      id: "3",
      name: "5L Water Bottle",
      sku: "WB-5L",
      price: 7.75,
      stock: 326,
      unit: "bottles",
      category: "bottles",
      image: "https://example.com/water-bottle-5l.jpg",
      status: "In Stock",
    },
    {
      id: "4",
      name: "Water Dispenser (Hot & Cold)",
      sku: "WD-HC",
      price: 89.99,
      stock: 42,
      unit: "units",
      category: "dispensers",
      image: "https://example.com/water-dispenser.jpg",
      status: "In Stock",
    },
    {
      id: "5",
      name: "Water Dispenser Stand",
      sku: "WD-STD",
      price: 24.99,
      stock: 18,
      unit: "units",
      category: "accessories",
      image: "https://example.com/dispenser-stand.jpg",
      status: "Low Stock",
    },
    {
      id: "6",
      name: "Dispenser Cleaning Kit",
      sku: "DCK-01",
      price: 15.5,
      stock: 0,
      unit: "kits",
      category: "accessories",
      image: "https://example.com/cleaning-kit.jpg",
      status: "Out of Stock",
    },
  ];

  const categories = [
    { id: "all", label: "All Items" },
    { id: "bottles", label: "Bottles" },
    { id: "dispensers", label: "Dispensers" },
    { id: "accessories", label: "Accessories" },
  ];

  const filteredItems =
    activeCategory === "all"
      ? inventoryItems
      : inventoryItems.filter((item) => item.category === activeCategory);

  const handleItemPress = (item) => {
    // Navigate to item details
    console.log("Navigate to item details:", item.id);
  };

  const renderInventoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemIconContainer}>
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={24}
            color="#1976D2"
          />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSku}>SKU: {item.sku}</Text>
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

      <View style={styles.itemDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Stock:</Text>
          <Text style={styles.detailValue}>
            {item.stock} {item.unit}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color="#2196F3" />
          <Text style={[styles.actionText, { color: "#2196F3" }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="refresh-outline" size={20} color="#FF9800" />
          <Text style={[styles.actionText, { color: "#FF9800" }]}>Restock</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="filter-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.addButton]}
            onPress={() => console.log("Add new inventory item")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                activeCategory === item.id && styles.activeTab,
              ]}
              onPress={() => setActiveCategory(item.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeCategory === item.id && styles.activeTabText,
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

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>818</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>6</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#FFEBEE" }]}>
          <Text style={[styles.statValue, { color: "#F44336" }]}>2</Text>
          <Text style={[styles.statLabel, { color: "#F44336" }]}>
            Low Stock
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.inventoryContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Helper function to determine item status color
function getStatusColor(status) {
  switch (status) {
    case "In Stock":
      return "#4CAF50";
    case "Low Stock":
      return "#FF9800";
    case "Out of Stock":
      return "#F44336";
    default:
      return "#757575";
  }
}

// Helper function to get category icon
function getCategoryIcon(category) {
  switch (category) {
    case "bottles":
      return "water-outline";
    case "dispensers":
      return "cube-outline";
    case "accessories":
      return "construct-outline";
    default:
      return "apps-outline";
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
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
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
  statsContainer: {
    flexDirection: "row",
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
  },
  inventoryContainer: {
    padding: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  itemIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  itemSku: {
    fontSize: 13,
    color: "#757575",
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
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 12,
    marginBottom: 12,
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    color: "#757575",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
});
