import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../components/ui/ScreenHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function OrdersScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  // Mock data for orders - In a real app, this would come from an API
  const orders = [
    {
      id: "1",
      orderNumber: "#123456",
      date: "Today, 2:30 PM",
      status: "Delivered",
      items: [
        {
          id: "water_5g",
          name: "5-gallon Water Bottle",
          quantity: 2,
          price: "6.00",
        },
      ],
      deliveryFee: "2.00",
      total: "14.00",
      deliveryAddress: "123 Main St, Apt 4B",
      paymentMethod: "Credit Card (**** 1234)",
      deliveryNotes: "Please leave at the door",
      deliveryPerson: "John Smith",
      timeline: [
        { time: "2:30 PM", status: "Delivered", icon: "checkmark-circle" },
        { time: "2:15 PM", status: "Out for Delivery", icon: "bicycle" },
        { time: "1:45 PM", status: "Processing", icon: "sync" },
        { time: "1:30 PM", status: "Order Placed", icon: "cart" },
      ],
    },
    {
      id: "2",
      orderNumber: "#123457",
      date: "Yesterday, 10:15 AM",
      status: "In Transit",
      items: [
        {
          id: "water_5g",
          name: "5-gallon Water Bottle",
          quantity: 1,
          price: "6.00",
        },
      ],
      deliveryFee: "2.00",
      total: "8.00",
      deliveryAddress: "456 Park Ave, Suite 101",
      paymentMethod: "Credit Card (**** 5678)",
      deliveryNotes: "Call upon arrival",
      deliveryPerson: "Mike Johnson",
      timeline: [
        { time: "10:15 AM", status: "Out for Delivery", icon: "bicycle" },
        { time: "9:45 AM", status: "Processing", icon: "sync" },
        { time: "9:30 AM", status: "Order Placed", icon: "cart" },
      ],
    },
    {
      id: "3",
      orderNumber: "#123458",
      date: "Mar 15, 2024",
      status: "Processing",
      items: [
        {
          id: "water_5g",
          name: "5-gallon Water Bottle",
          quantity: 3,
          price: "6.00",
        },
      ],
      deliveryFee: "2.00",
      total: "20.00",
      deliveryAddress: "789 Broadway, Floor 3",
      paymentMethod: "Credit Card (**** 9012)",
      deliveryNotes: "",
      deliveryPerson: "Pending Assignment",
      timeline: [
        { time: "9:45 AM", status: "Processing", icon: "sync" },
        { time: "9:30 AM", status: "Order Placed", icon: "cart" },
      ],
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleReorder = (order) => {
    // Navigate to order page with pre-filled items
    router.push({
      pathname: "/order",
      params: {
        reorder: "true",
        items: JSON.stringify(order.items),
        address: order.deliveryAddress,
        notes: order.deliveryNotes,
      },
    });
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 30,
      friction: 7,
    }).start();
  };

  const hideOrderDetails = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setSelectedOrder(null);
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      Delivered: {
        backgroundColor: "#E8F5E9",
        color: "#4CAF50",
        icon: "checkmark-circle",
      },
      "In Transit": {
        backgroundColor: "#E3F2FD",
        color: "#2196F3",
        icon: "bicycle",
      },
      Processing: {
        backgroundColor: "#FFF3E0",
        color: "#FF9800",
        icon: "sync",
      },
      Cancelled: {
        backgroundColor: "#FFEBEE",
        color: "#F44336",
        icon: "close-circle",
      },
    };
    return styles[status] || styles.Processing;
  };

  const OrderDetailsModal = ({ order, visible, onClose }) => {
    if (!order) return null;

    const statusStyle = getStatusStyle(order.status);
    const modalTranslateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [600, 0],
    });

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: modalTranslateY }] },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={styles.modalTitle}>Order Details</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.orderProgress}>
                <View
                  style={[
                    styles.progressIndicator,
                    { backgroundColor: statusStyle.color },
                  ]}
                />
                <Text
                  style={[styles.progressText, { color: statusStyle.color }]}
                >
                  {order.status}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Order Info Card */}
              <View style={styles.detailCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons
                    name="receipt-long"
                    size={24}
                    color="#1a1a1a"
                  />
                  <Text style={styles.cardTitle}>Order Information</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Order Number</Text>
                    <Text style={styles.infoValue}>{order.orderNumber}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{order.date}</Text>
                  </View>
                </View>
              </View>

              {/* Timeline Card */}
              <View style={styles.detailCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="timeline" size={24} color="#1a1a1a" />
                  <Text style={styles.cardTitle}>Order Timeline</Text>
                </View>
                <View style={styles.timelineContainer}>
                  {order.timeline.map((event, index) => (
                    <View
                      key={index}
                      style={[
                        styles.timelineItem,
                        index === order.timeline.length - 1 && {
                          borderLeftWidth: 0,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.timelineDot,
                          index === 0 && {
                            backgroundColor: statusStyle.color,
                          },
                        ]}
                      >
                        <Ionicons
                          name={event.icon}
                          size={16}
                          color={index === 0 ? "#fff" : "#666"}
                        />
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineStatus}>
                          {event.status}
                        </Text>
                        <Text style={styles.timelineTime}>{event.time}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Items Card */}
              <View style={styles.detailCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons
                    name="shopping-cart"
                    size={24}
                    color="#1a1a1a"
                  />
                  <Text style={styles.cardTitle}>Order Items</Text>
                </View>
                <View style={styles.cardContent}>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemQuantity}>
                          ${item.price} × {item.quantity}
                        </Text>
                      </View>
                      <Text style={styles.itemTotal}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.divider} />
                  <View style={styles.costSummary}>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Subtotal</Text>
                      <Text style={styles.costValue}>
                        $
                        {(
                          parseFloat(order.total) -
                          parseFloat(order.deliveryFee)
                        ).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Delivery Fee</Text>
                      <Text style={styles.costValue}>${order.deliveryFee}</Text>
                    </View>
                    <View style={[styles.costRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>${order.total}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Delivery Card */}
              <View style={styles.detailCard}>
                <View style={styles.cardHeader}>
                  <MaterialIcons
                    name="local-shipping"
                    size={24}
                    color="#1a1a1a"
                  />
                  <Text style={styles.cardTitle}>Delivery Details</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.deliveryInfo}>
                    <MaterialIcons name="location-on" size={20} color="#666" />
                    <Text style={styles.deliveryText}>
                      {order.deliveryAddress}
                    </Text>
                  </View>
                  <View style={styles.deliveryInfo}>
                    <MaterialIcons name="person" size={20} color="#666" />
                    <Text style={styles.deliveryText}>
                      {order.status === "Processing"
                        ? "Delivery person will be assigned soon"
                        : `Delivered by ${order.deliveryPerson}`}
                    </Text>
                  </View>
                  {order.deliveryNotes && (
                    <View style={styles.deliveryInfo}>
                      <MaterialIcons name="note" size={20} color="#666" />
                      <Text style={styles.deliveryText}>
                        Note: {order.deliveryNotes}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Payment Card */}
              <View style={[styles.detailCard, { marginBottom: 20 }]}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="payment" size={24} color="#1a1a1a" />
                  <Text style={styles.cardTitle}>Payment Method</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.paymentInfo}>
                    <MaterialIcons name="credit-card" size={20} color="#666" />
                    <Text style={styles.paymentText}>
                      {order.paymentMethod}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderOrderCard = (order) => {
    const statusStyle = getStatusStyle(order.status);
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return (
      <View key={order.id} style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.orderDate}>{order.date}</Text>
          </View>
          <View
            style={[
              styles.statusContainer,
              { backgroundColor: statusStyle.backgroundColor },
            ]}
          >
            <Text style={[styles.orderStatus, { color: statusStyle.color }]}>
              {order.status}
            </Text>
          </View>
        </View>

        {/* Order Content */}
        <View style={styles.orderContent}>
          <View style={styles.itemsContainer}>
            <Text style={styles.orderItems}>
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </Text>
            <Text style={styles.orderTotal}>${order.total}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.addressText}>{order.deliveryAddress}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.orderFooter}>
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={() => handleReorder(order)}
          >
            <Ionicons name="repeat" size={18} color="#fff" />
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => showOrderDetails(order)}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#fff" />
      <ScreenHeader title="My Orders" showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {orders.map(renderOrderCard)}
      </ScrollView>

      <OrderDetailsModal
        order={selectedOrder}
        visible={isModalVisible}
        onClose={hideOrderDetails}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 90 : 70,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderDate: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  orderContent: {
    marginBottom: 12,
  },
  itemsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderItems: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addressText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reorderButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 12,
  },
  reorderButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
  detailsButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  detailsButtonText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    width: SCREEN_WIDTH,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeButton: {
    padding: 4,
  },
  orderProgress: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  progressIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalScroll: {
    padding: 16,
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: 12,
  },
  cardContent: {
    paddingHorizontal: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "row",
    paddingBottom: 24,
    paddingLeft: 24,
    borderLeftWidth: 1,
    borderLeftColor: "#e0e0e0",
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: -16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: "#666",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
  },
  costSummary: {
    marginTop: 8,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: "#666",
  },
  costValue: {
    fontSize: 14,
    color: "#1a1a1a",
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  deliveryText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 12,
    flex: 1,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    fontSize: 14,
    color: "#444",
    marginLeft: 12,
  },
});
