import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AdminOrderDetails() {
  const router = useRouter();

  // Mock data for a specific order
  const order = {
    id: 'ORD002',
    customer: {
      name: 'Sarah Johnson',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@example.com',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    address: 'Ocean View Apartments, Unit 301',
    date: '2023-05-11',
    deliveryTime: '12:00 PM - 1:00 PM',
    amount: '$35.50',
    status: 'Processing',
    paymentMethod: 'Credit Card (ending in 4567)',
    paymentStatus: 'Paid',
    deliveryPerson: 'Alex Rivera',
    items: [
      { id: 1, name: '20L Water Bottle', quantity: 1, price: '$20.00' },
      { id: 2, name: '5L Water Bottle', quantity: 2, price: '$7.75 each' },
    ],
    timeline: [
      { status: 'Order Placed', time: '2023-05-11, 09:15 AM' },
      { status: 'Payment Confirmed', time: '2023-05-11, 09:17 AM' },
      { status: 'Processing', time: '2023-05-11, 09:30 AM' },
      { status: 'Out for Delivery', time: null },
      { status: 'Delivered', time: null },
    ],
  };

  const handleStatusChange = (newStatus) => {
    // In a real app, this would update the order status in the database
    console.log(`Changing order status to: ${newStatus}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.printButton}>
          <Ionicons name="print-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) + '20' }
          ]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerCard}>
            <Image source={{ uri: order.customer.image }} style={styles.customerImage} />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{order.customer.name}</Text>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color="#757575" />
                <Text style={styles.infoText}>{order.customer.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={16} color="#757575" />
                <Text style={styles.infoText}>{order.customer.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#757575" />
            <Text style={styles.infoText}>{order.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color="#757575" />
            <Text style={styles.infoText}>{order.deliveryTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="bicycle-outline" size={18} color="#757575" />
            <Text style={styles.infoText}>Delivery Person: {order.deliveryPerson}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemIconContainer}>
                <Ionicons name="water-outline" size={20} color="#2196F3" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={18} color="#757575" />
            <Text style={styles.infoText}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
            <Text style={styles.infoText}>{order.paymentStatus}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>{order.amount}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timeline}>
            {order.timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  <View
                    style={[
                      styles.timelineDot,
                      event.time ? styles.timelineDotCompleted : styles.timelineDotPending
                    ]}
                  />
                  {index < order.timeline.length - 1 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        event.time ? styles.timelineConnectorCompleted : styles.timelineConnectorPending
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{event.status}</Text>
                  {event.time && <Text style={styles.timelineTime}>{event.time}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Update Order Status</Text>
          <View style={styles.statusButtonsContainer}>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#2196F3' }]}
              onPress={() => handleStatusChange('Processing')}
            >
              <Text style={styles.statusButtonText}>Processing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#FF9800' }]}
              onPress={() => handleStatusChange('Out for Delivery')}
            >
              <Text style={styles.statusButtonText}>Out for Delivery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => handleStatusChange('Delivered')}
            >
              <Text style={styles.statusButtonText}>Delivered</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, { backgroundColor: '#F44336' }]}
              onPress={() => handleStatusChange('Cancelled')}
            >
              <Text style={styles.statusButtonText}>Cancel</Text>
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
    case 'Delivered':
      return '#4CAF50';
    case 'Processing':
      return '#2196F3';
    case 'Pending':
      return '#FFC107';
    case 'Cancelled':
      return '#F44336';
    case 'Out for Delivery':
      return '#FF9800';
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  printButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#757575',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#757575',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  timelineDotCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  timelineDotPending: {
    backgroundColor: '#fff',
    borderColor: '#bdbdbd',
  },
  timelineConnector: {
    width: 2,
    height: 30,
    marginTop: 4,
  },
  timelineConnectorCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineConnectorPending: {
    backgroundColor: '#bdbdbd',
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    marginTop: -4,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 13,
    color: '#757575',
  },
  actionSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusButton: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
