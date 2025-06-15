import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

export default function OrderScreen() {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(5.99);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState("");

  const paymentMethods = [
    { id: 1, cardType: "Visa", lastFour: "4242", expiry: "12/25" },
    { id: 2, cardType: "Mastercard", lastFour: "5678", expiry: "10/26" },
  ];

  useEffect(() => {
    // Calculate price based on quantity
    setPrice(parseFloat((5.99 * quantity).toFixed(2)));

    // Calculate delivery time based on current time
    calculateDeliveryTime();
  }, [quantity]);

  const calculateDeliveryTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    let deliveryText = "";

    // Format current date for display
    const options = { weekday: "short", month: "short", day: "numeric" };
    const today = now.toLocaleDateString("en-US", options);

    // Calculate tomorrow's date
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toLocaleDateString("en-US", options);

    // Cutoff times logic
    if (hour > 17 || hour < 9) {
      // After 5PM or before 9AM - deliver after 9AM
      if (hour > 17) {
        // After 5PM, delivery next day after 9AM
        deliveryText = `${tomorrowFormatted} after 9:00 AM`;
      } else {
        // Before 9AM, delivery same day after 9AM
        deliveryText = `${today} after 9:00 AM`;
      }
    } else {
      // Between 9AM and 5PM - deliver after 5PM same day
      deliveryText = `${today} after 5:00 PM`;
    }

    setDeliveryTime(deliveryText);
  };

  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handlePlaceOrder = () => {
    // Show order confirmation
    Alert.alert(
      "Order Confirmed!",
      `Your order of ${quantity} water bottles will be delivered on ${deliveryTime}.`,
      [
        { 
          text: "View Orders", 
          onPress: () => router.push('/orders')
        },
        {
          text: "Continue Shopping",
          onPress: () => router.push('/home'),
          style: "cancel"
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/home')}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Water</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Location */}
        <View style={styles.locationContainer}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={20} color="#1976D2" />
          </View>
          <View style={styles.locationDetails}>
            <Text style={styles.locationLabel}>Delivery Location</Text>
            <Text style={styles.locationText}>Sunset Gardens, Unit 101</Text>
          </View>
          <TouchableOpacity style={styles.changeButton}>
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Product */}
        <View style={styles.productContainer}>
          <View style={styles.productImageContainer}>
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="water" size={80} color="#1976D2" />
            </View>
          </View>
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>5-Gallon Water Bottle</Text>
            <Text style={styles.productPrice}>${price.toFixed(2)}</Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity <= 1 ? "#ccc" : "#333"}
                />
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity >= 10 && styles.quantityButtonDisabled,
                ]}
                onPress={increaseQuantity}
                disabled={quantity >= 10}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity >= 10 ? "#ccc" : "#333"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Delivery Time */}
        <View style={styles.deliveryTimeContainer}>
          <View style={styles.deliveryTimeIconContainer}>
            <Ionicons name="time-outline" size={20} color="#1976D2" />
          </View>
          <View style={styles.deliveryTimeDetails}>
            <Text style={styles.deliveryTimeLabel}>Estimated Delivery</Text>
            <Text style={styles.deliveryTimeText}>{deliveryTime}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Method</Text>

        {paymentMethods.map((method, index) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethodCard,
              selectedPaymentMethod === index &&
                styles.selectedPaymentMethodCard,
            ]}
            onPress={() => setSelectedPaymentMethod(index)}
          >
            <View style={styles.cardTypeContainer}>
              {method.cardType === "Visa" ? (
                <FontAwesome5 name="cc-visa" size={24} color="#1A1F71" />
              ) : (
                <FontAwesome5 name="cc-mastercard" size={24} color="#EB001B" />
              )}
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardTypeText}>{method.cardType}</Text>
              <Text style={styles.cardNumberText}>•••• {method.lastFour}</Text>
            </View>
            <View style={styles.cardSelection}>
              <View
                style={[
                  styles.radioButton,
                  selectedPaymentMethod === index && styles.radioButtonSelected,
                ]}
              >
                {selectedPaymentMethod === index && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={styles.addPaymentButton}
          onPress={() => router.push('/(customer)/add-payment')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#1976D2" />
          <Text style={styles.addPaymentText}>Add Payment Method</Text>
        </TouchableOpacity>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${price.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${price.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholderView: {
    width: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  locationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  changeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(25, 118, 210, 0.08)",
    borderRadius: 14,
  },
  changeButtonText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "500",
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  productImageContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  productImagePlaceholder: {
    width: 80,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    borderRadius: 12,
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quantityButtonDisabled: {
    backgroundColor: "#f9f9f9",
    borderColor: "#f0f0f0",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: "center",
  },
  deliveryTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
  },
  deliveryTimeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryTimeDetails: {
    flex: 1,
    marginLeft: 12,
  },
  deliveryTimeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  deliveryTimeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 20,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  selectedPaymentMethodCard: {
    borderColor: "#1976D2",
    backgroundColor: "rgba(25, 118, 210, 0.05)",
  },
  cardTypeContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cardTypeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  cardNumberText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  cardSelection: {
    paddingLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: "#1976D2",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1976D2",
  },
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    padding: 12,
    backgroundColor: "rgba(25, 118, 210, 0.08)",
    borderRadius: 12,
  },
  addPaymentText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
    marginLeft: 8,
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  placeOrderButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
