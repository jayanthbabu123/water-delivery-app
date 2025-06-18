import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Linking, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function DeliveryDetails() {
  const router = useRouter();
  const [deliveryStatus, setDeliveryStatus] = useState('Out for Delivery');

  // Mock data for a delivery
  const delivery = {
    id: 'DEL001',
    customer: {
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    address: {
      full: '123 Palm Street, Sunset Gardens, Unit 101',
      coordinates: {
        latitude: 25.7617,
        longitude: -80.1918,
      },
    },
    scheduledTime: '10:30 AM - 11:30 AM',
    items: [
      { id: 1, name: '20L Water Bottle', quantity: 2, price: '$20.00 each' },
    ],
    totalAmount: '$40.00',
    notes: 'Please call when you arrive at the gate. Security code: 1234',
    paymentStatus: 'Paid (Credit Card)',
  };

  const handleStatusUpdate = (newStatus) => {
    if (newStatus === 'Delivered') {
      Alert.alert(
        'Confirm Delivery',
        'Are you sure you want to mark this order as delivered?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: () => {
              setDeliveryStatus('Delivered');
              // In a real app, update the server with the new status
            },
          },
        ]
      );
    } else {
      setDeliveryStatus(newStatus);
      // In a real app, update the server with the new status
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${delivery.customer.phone}`);
  };

  const handleNavigate = () => {
    const { latitude, longitude } = delivery.address.coordinates;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
    });
    Linking.openURL(url);
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
        <Text style={styles.headerTitle}>Delivery #{delivery.id}</Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.deliveryStatusContainer}>
            <Text style={styles.sectionTitle}>Delivery Status</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(deliveryStatus) + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(deliveryStatus) }
              ]}>
                {deliveryStatus}
              </Text>
            </View>
          </View>

          {deliveryStatus !== 'Delivered' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => handleStatusUpdate('Delivered')}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Mark as Delivered</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                onPress={() => handleStatusUpdate('Failed')}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Mark as Failed</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerCard}>
            <Image source={{ uri: delivery.customer.image }} style={styles.customerImage} />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{delivery.customer.name}</Text>
              <View style={styles.phoneContainer}>
                <Text style={styles.phoneText}>{delivery.customer.phone}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleCall} style={styles.callButton}>
              <Ionicons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <View style={styles.addressContainer}>
            <View style={styles.addressInfo}>
              <Ionicons name="location" size={20} color="#1976D2" style={styles.addressIcon} />
              <Text style={styles.addressText}>{delivery.address.full}</Text>
            </View>
            <TouchableOpacity onPress={handleNavigate} style={styles.navigateButton}>
              <Text style={styles.navigateButtonText}>Navigate</Text>
              <Ionicons name="navigate" size={16} color="#1976D2" />
            </TouchableOpacity>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={18} color="#757575" />
            <Text style={styles.timeText}>Expected: {delivery.scheduledTime}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {delivery.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemIconContainer}>
                <Ionicons name="water" size={20} color="#1976D2" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>{delivery.totalAmount}</Text>
          </View>
        </View>

        {delivery.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{delivery.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentInfoRow}>
            <Ionicons name="card" size={20} color="#757575" />
            <Text style={styles.paymentInfoText}>{delivery.paymentStatus}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton} onPress={handleCall}>
          <Ionicons name="call" size={24} color="#1976D2" />
          <Text style={styles.bottomBarButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton} onPress={handleNavigate}>
          <Ionicons name="navigate" size={24} color="#1976D2" />
          <Text style={styles.bottomBarButtonText}>Navigate</Text>
        </TouchableOpacity>
        {deliveryStatus !== 'Delivered' && (
          <TouchableOpacity
            style={[styles.bottomBarButton, styles.completeButton]}
            onPress={() => handleStatusUpdate('Delivered')}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// Helper function to determine status color
function getStatusColor(status) {
  switch (status) {
    case 'Delivered':
      return '#4CAF50';
    case 'Out for Delivery':
      return '#2196F3';
    case 'Failed':
      return '#F44336';
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpace: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
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
  deliveryStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 14,
    color: '#757575',
  },
  callButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 8,
  },
  addressInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  addressIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  navigateButtonText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
    marginRight: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    marginBottom: 2,
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
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  notesContainer: {
    backgroundColor: '#FFFDE7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  paymentInfoText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 80, // Space for the bottom bar
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  bottomBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  bottomBarButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: '#1976D2',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    flex: 1.5,
    flexDirection: 'row',
    borderRadius: 8,
    marginLeft: 8,
  },
  completeButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
