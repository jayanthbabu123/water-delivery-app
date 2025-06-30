import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboard() {
  // High-level metrics (mock data for now)
  const metrics = [
    {
      title: "Total Orders",
      value: "2,456",
      icon: "cart-outline",
      color: "#4CAF50",
    },
    {
      title: "Total Revenue",
      value: "$12,435",
      icon: "cash-outline",
      color: "#FFC107",
    },
    {
      title: "Total Delivery Boys",
      value: "34",
      icon: "bicycle-outline",
      color: "#2196F3",
    },
    {
      title: "Total Admins",
      value: "5",
      icon: "person-circle-outline",
      color: "#9C27B0",
    },
    {
      title: "Total Products",
      value: "18",
      icon: "cube-outline",
      color: "#FF5722",
    },
  ];

  // Communities (mock data for now)
  const communities = [
    { id: "1", name: "Sunset Gardens" },
    { id: "2", name: "Ocean View Apartments" },
    { id: "3", name: "Mountain Heights" },
    { id: "4", name: "Riverside Residences" },
  ];

  // Tab options (for future implementation)
  const adminTabs = [
    { key: "delivery_boys", label: "Delivery Boys", icon: "bicycle-outline" },
    { key: "orders", label: "Orders", icon: "cart-outline" },
    { key: "communities", label: "Communities", icon: "business-outline" },
    { key: "admins", label: "Admins", icon: "person-circle-outline" },
  ];

  // Manage section cards
  const manageCards = [
    {
      key: 'communities',
      label: 'Communities',
      icon: 'business-outline',
      color: '#1976D2',
    },
    {
      key: 'delivery_boys',
      label: 'Delivery Boys',
      icon: 'bicycle-outline',
      color: '#2196F3',
    },
    {
      key: 'admins',
      label: 'Admins',
      icon: 'person-circle-outline',
      color: '#9C27B0',
    },
    {
      key: 'products',
      label: 'Products',
      icon: 'cube-outline',
      color: '#FF5722',
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
        {/* High-level Metrics */}
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: metric.color + "20" },
                ]}
              >
                <Ionicons name={metric.icon} size={24} color={metric.color} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricTitle}>{metric.title}</Text>
            </View>
          ))}
        </View>

        {/* Manage Section (Grid Cards) */}
        <View style={styles.manageSection}>
          <Text style={styles.manageTitle}>Manage</Text>
          <View style={styles.manageGrid}>
            {manageCards.map((card) => (
              <TouchableOpacity key={card.key} style={styles.manageCard} activeOpacity={0.85}>
                <View style={[styles.manageIconContainer, { backgroundColor: card.color + '15' }] }>
                  <Ionicons name={card.icon} size={28} color={card.color} />
                </View>
                <Text style={styles.manageLabel}>{card.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Communities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Communities</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Manage</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.communitiesList}>
            {communities.map((community) => (
              <View key={community.id} style={styles.communityCard}>
                <Ionicons name="business-outline" size={18} color="#1976D2" style={{ marginRight: 8 }} />
                <Text style={styles.communityName}>{community.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Admin Tabs (future implementation) */}
        <View style={styles.tabsContainer}>
          {adminTabs.map((tab) => (
            <View key={tab.key} style={styles.tabPill}>
              <Ionicons name={tab.icon} size={16} color="#1976D2" style={{ marginRight: 6 }} />
              <Text style={styles.tabLabel}>{tab.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 80,
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
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  metricTitle: {
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
  communitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  communityName: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
    marginTop: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    marginRight: 8,
    marginBottom: 8,
  },
  tabLabel: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  manageSection: {
    marginBottom: 24,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  manageTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    marginLeft: 2,
  },
  manageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  manageCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  manageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  manageLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
    letterSpacing: 0.1,
  },
});
