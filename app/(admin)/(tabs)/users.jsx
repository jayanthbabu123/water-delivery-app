import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AdminUsers() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // Mock data
  const users = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      community: 'Sunset Gardens',
      apartment: 'Unit 101',
      status: 'Active',
      orders: 12,
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 987-6543',
      community: 'Ocean View Apartments',
      apartment: 'Unit 301',
      status: 'Active',
      orders: 8,
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phone: '+1 (555) 456-7890',
      community: 'Mountain Heights',
      apartment: 'Building B',
      status: 'Inactive',
      orders: 3,
      image: 'https://randomuser.me/api/portraits/men/67.jpg',
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '+1 (555) 234-5678',
      community: 'Riverside Residences',
      apartment: 'Unit 202',
      status: 'Active',
      orders: 5,
      image: 'https://randomuser.me/api/portraits/women/22.jpg',
    },
    {
      id: '5',
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      phone: '+1 (555) 345-6789',
      community: 'Green Valley Complex',
      apartment: 'Unit 505',
      status: 'Pending',
      orders: 0,
      image: 'https://randomuser.me/api/portraits/men/91.jpg',
    },
  ];

  const tabs = [
    { id: 'all', label: 'All Users' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'pending', label: 'Pending' },
  ];

  const filteredUsers = activeTab === 'all'
    ? users
    : users.filter(user =>
        user.status.toLowerCase() === activeTab.toLowerCase());

  const handleUserPress = (user) => {
    // Navigate to user details
    console.log('Navigate to user details:', user.id);
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.userHeader}>
        <Image source={{ uri: item.image }} style={styles.userImage} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.phoneContainer}>
            <Ionicons name="call-outline" size={14} color="#757575" />
            <Text style={styles.userPhone}>{item.phone}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getUserStatusColor(item.status) + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getUserStatusColor(item.status) }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color="#757575" />
          <Text style={styles.detailText}>{item.community}, {item.apartment}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cart-outline" size={16} color="#757575" />
          <Text style={styles.detailText}>{item.orders} orders</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color="#2196F3" />
          <Text style={[styles.actionText, { color: '#2196F3' }]}>Edit</Text>
        </TouchableOpacity>
        {item.status !== 'Inactive' ? (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="close-circle-outline" size={20} color="#F44336" />
            <Text style={[styles.actionText, { color: '#F44336' }]}>Deactivate</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
            <Text style={[styles.actionText, { color: '#4CAF50' }]}>Activate</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="filter-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.addButton]}
            onPress={() => console.log('Add new user')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={tabs}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === item.id && styles.activeTab,
              ]}
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
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.usersContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Helper function to determine user status color
function getUserStatusColor(status) {
  switch (status) {
    case 'Active':
      return '#4CAF50';
    case 'Inactive':
      return '#F44336';
    case 'Pending':
      return '#FFC107';
    default:
      return '#757575';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginLeft: 8,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    elevation: 1,
    shadowColor: '#000',
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
    backgroundColor: '#1976D2',
  },
  tabText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  usersContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPhone: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});
