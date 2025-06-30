import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Select from "../../components/ui/Select";
import { CommunityService } from "../../src/services/community";
import { OrderService } from "../../src/services/order";
import { ProductService } from "../../src/services/product";
import { DeliveryTimeUtils } from "../../src/utils/deliveryTime";

export default function PlaceOrderScreen() {
  // State management
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [userData, setUserData] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedApartment, setSelectedApartment] = useState("");
  const [tempAddress, setTempAddress] = useState({
    contactName: "",
    contactPhone: "",
    specialInstructions: "",
    communityId: "",
    apartmentNumber: "",
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);
  const [orderNotes, setOrderNotes] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  // Price calculations
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      calculatePrices();
    }
  }, [selectedProduct, quantity]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log("🚀 Loading initial data...");

      // Load user data
      const storedUserData = await AsyncStorage.getItem("userData");
      if (storedUserData) {
        const user = JSON.parse(storedUserData);
        console.log("👤 User data loaded:", user);
        setUserData(user);
        await loadDeliveryAddress(user);
      } else {
        console.log("❌ No user data found");
        Alert.alert("Error", "Please login first");
        router.replace("/login");
        return;
      }

      // Load products
      await loadProducts();

      // Load payment methods
      loadPaymentMethods();
    } catch (error) {
      console.error("❌ Error loading initial data:", error);
      Alert.alert("Error", "Failed to load order data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      console.log("📦 Loading products...");
      let productsData = await ProductService.getProducts();
      console.log("📦 Products loaded:", productsData.length);

      // If no products exist, create initial products
      if (productsData.length === 0) {
        console.log("📦 No products found, creating initial products...");
        await ProductService.createInitialProducts();
        productsData = await ProductService.getProducts();
        console.log("📦 Initial products created:", productsData.length);
      }

      setProducts(productsData);
      console.log("📦 Products set in state:", productsData);

      // Set default selected product (first one)
      if (productsData.length > 0) {
        setSelectedProduct(productsData[0]);
        console.log("📦 Default product selected:", productsData[0].name);
      }
    } catch (error) {
      console.error("❌ Error loading products:", error);
      Alert.alert("Error", "Failed to load products. Please try again.");
    }
  };

  const loadDeliveryAddress = async (user) => {
    try {
      // Load communities
      let communitiesData = await CommunityService.getCommunities();
      const formattedCommunities =
        CommunityService.formatCommunitiesForSelect(communitiesData);
      setCommunities(formattedCommunities);

      if (user.profile?.communityId && user.profile?.apartmentNumber) {
        const community = await CommunityService.getCommunityById(
          user.profile.communityId,
        );

        if (community) {
          // Load apartments for the community
          const apartmentsData = await CommunityService.getApartments(
            user.profile.communityId,
          );
          const formattedApartments =
            CommunityService.formatApartmentsForSelect(apartmentsData);
          setApartments(formattedApartments);

          setSelectedCommunity(community.id);
          setSelectedApartment(user.profile.apartmentNumber);

          setDeliveryAddress({
            communityId: community.id,
            communityName: community.name,
            apartmentNumber: user.profile.apartmentNumber,
            contactName: user.profile.name || "",
            contactPhone: user.phoneNumber || "",
            specialInstructions: "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading delivery address:", error);
    }
  };

  const loadPaymentMethods = () => {
    // Mock payment methods - in real app, load from user's saved payment methods
    const mockPaymentMethods = [
      {
        id: 1,
        cardType: "Visa",
        lastFour: "4242",
        expiry: "12/25",
        isDefault: true,
      },
      {
        id: 2,
        cardType: "Mastercard",
        lastFour: "5678",
        expiry: "10/26",
        isDefault: false,
      },
    ];
    setPaymentMethods(mockPaymentMethods);
  };

  const calculatePrices = () => {
    if (!selectedProduct) return;

    const productSubtotal = ProductService.calculateTotalPrice(
      selectedProduct,
      quantity,
    );
    const productDeliveryFee = ProductService.calculateDeliveryFee(
      productSubtotal,
      quantity,
    );
    const total = productSubtotal + productDeliveryFee;

    setSubtotal(productSubtotal);
    setDeliveryFee(productDeliveryFee);
    setTotalAmount(total);
  };

  const formatDeliveryAddress = () => {
    if (!deliveryAddress) {
      return {
        contactName: "Add delivery address",
        communityName: "",
        apartmentNumber: "",
      };
    }

    return {
      contactName: deliveryAddress.contactName || "Add contact name",
      communityName: deliveryAddress.communityName || "",
      apartmentNumber: deliveryAddress.apartmentNumber || "",
    };
  };

  const calculateEstimatedDelivery = () => {
    return DeliveryTimeUtils.calculateEstimatedDelivery();
  };

  const increaseQuantity = () => {
    if (
      selectedProduct &&
      quantity < selectedProduct.pricing.maxOrderQuantity
    ) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setQuantity(1); // Reset quantity when changing product
  };

  const handleAddressChange = () => {
    console.log("📍 handleAddressChange called");
    setTempAddress({
      contactName:
        deliveryAddress?.contactName || userData?.profile?.name || "",
      contactPhone:
        deliveryAddress?.contactPhone || userData?.phoneNumber || "",
      specialInstructions: deliveryAddress?.specialInstructions || "",
      communityId: selectedCommunity || deliveryAddress?.communityId || "",
      apartmentNumber:
        selectedApartment || deliveryAddress?.apartmentNumber || "",
    });
    setIsAddressModalVisible(true);
  };

  const handleCommunitySelect = async (communityId) => {
    setSelectedCommunity(communityId);
    try {
      const apartmentsData = await CommunityService.getApartments(communityId);
      const formattedApartments =
        CommunityService.formatApartmentsForSelect(apartmentsData);
      setApartments(formattedApartments);
      setSelectedApartment("");
    } catch (error) {
      console.error("Error loading apartments:", error);
      Alert.alert("Error", "Failed to load apartments");
    }
  };

  const saveAddressChanges = async () => {
    try {
      if (!selectedCommunity || !selectedApartment) {
        Alert.alert("Error", "Please select both community and apartment");
        return;
      }

      if (!tempAddress.contactName.trim()) {
        Alert.alert("Error", "Please enter contact name");
        return;
      }

      if (!tempAddress.contactPhone.trim()) {
        Alert.alert("Error", "Please enter contact phone");
        return;
      }

      const community =
        await CommunityService.getCommunityById(selectedCommunity);
      if (!community) {
        Alert.alert("Error", "Failed to load community details");
        return;
      }

      setDeliveryAddress({
        communityId: selectedCommunity,
        communityName: community.name,
        apartmentNumber: selectedApartment,
        contactName: tempAddress.contactName.trim(),
        contactPhone: tempAddress.contactPhone.trim(),
        specialInstructions: tempAddress.specialInstructions.trim() || "",
      });

      setIsAddressModalVisible(false);
    } catch (error) {
      console.error("Error saving address changes:", error);
      Alert.alert("Error", "Failed to save address changes");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      // Validate order data
      if (!selectedProduct) {
        Alert.alert("Error", "Please select a product");
        return;
      }

      if (!deliveryAddress) {
        Alert.alert("Error", "Delivery address is required");
        return;
      }

      // Validate delivery address fields
      if (!deliveryAddress.communityId || !deliveryAddress.communityName) {
        Alert.alert("Error", "Please select a valid community");
        return;
      }

      if (!deliveryAddress.apartmentNumber) {
        Alert.alert("Error", "Please select an apartment number");
        return;
      }

      if (!deliveryAddress.contactName || !deliveryAddress.contactName.trim()) {
        Alert.alert("Error", "Please enter contact name");
        return;
      }

      if (!deliveryAddress.contactPhone || !deliveryAddress.contactPhone.trim()) {
        Alert.alert("Error", "Please enter contact phone");
        return;
      }

      if (paymentMethods.length === 0) {
        Alert.alert("Error", "Please add a payment method");
        return;
      }

      setPlacingOrder(true);

      // Check product availability
      const availability = await ProductService.checkAvailability(
        selectedProduct.id,
        quantity,
      );
      if (!availability.available) {
        Alert.alert("Product Unavailable", availability.reason);
        setPlacingOrder(false);
        return;
      }

      // Prepare order data
      const orderData = {
        userId: userData.userId,
        communityId: deliveryAddress.communityId,
        products: [
          {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            quantity: quantity,
            unitPrice: selectedProduct.pricing.basePrice,
            totalPrice: subtotal,
            specifications: selectedProduct.specifications,
          },
        ],
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        discount: 0,
        tax: 0,
        totalAmount: totalAmount,
        deliveryAddress: {
          communityId: deliveryAddress.communityId,
          communityName: deliveryAddress.communityName,
          apartmentNumber: deliveryAddress.apartmentNumber,
          contactName: deliveryAddress.contactName.trim(),
          contactPhone: deliveryAddress.contactPhone.trim(),
          specialInstructions: deliveryAddress.specialInstructions || "",
        },
        paymentMethod: {
          type: "card",
          cardId: paymentMethods[selectedPaymentMethod]?.id || null,
          cardLastFour: paymentMethods[selectedPaymentMethod]?.lastFour || null,
          cardType: paymentMethods[selectedPaymentMethod]?.cardType || null,
        },
        deliverySchedule: {
          preferredTime: "asap",
          estimatedDelivery: OrderService.calculateEstimatedDelivery(),
        },
        orderNotes: orderNotes,
      };

      // Validate order data
      const validation = OrderService.validateOrderData(orderData);
      if (!validation.isValid) {
        Alert.alert("Order Validation Failed", validation.errors.join("\n"));
        setPlacingOrder(false);
        return;
      }

      // Create order
      console.log("📝 Creating order with data:", orderData);
      console.log("📝 Delivery address:", orderData.deliveryAddress);
      console.log("📝 Payment method:", orderData.paymentMethod);
      const result = await OrderService.createOrder(orderData);
      console.log("📝 Order creation result:", result);

      if (result.success) {
        Alert.alert(
          "Order Placed Successfully!",
          `Your order #${result.orderId} has been placed and will be delivered by ${calculateEstimatedDelivery()}.`,
          [
            {
              text: "View Orders",
              onPress: () => router.push("/(customer)/(tabs)/orders"),
            },
            {
              text: "Continue Shopping",
              onPress: () => router.push("/(customer)/(tabs)/home"),
              style: "cancel",
            },
          ],
        );
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert(
        "Order Failed",
        "Unable to place your order. Please try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
        <View style={styles.placeholderView} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TouchableOpacity
            style={styles.addressContainer}
            onPress={() => {
              console.log("📍 Address change button pressed");
              handleAddressChange();
            }}
          >
            <View style={styles.addressIconContainer}>
              <Ionicons name="location" size={20} color="#1976D2" />
            </View>
            <View style={styles.addressDetails}>
              <Text style={styles.addressName}>
                {formatDeliveryAddress().contactName}
              </Text>
              {deliveryAddress?.communityName && (
                <Text style={styles.addressText}>
                  {formatDeliveryAddress().communityName}
                </Text>
              )}
              {deliveryAddress?.apartmentNumber && (
                <Text style={styles.apartmentText}>
                  Apartment: {formatDeliveryAddress().apartmentNumber}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => {
                console.log("📍 Change button pressed");
                handleAddressChange();
              }}
            >
              <Text style={styles.changeButtonText}>
                {deliveryAddress ? "Change" : "Add"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Product Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Product</Text>
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[
                styles.productCard,
                selectedProduct?.id === product.id &&
                  styles.selectedProductCard,
              ]}
              onPress={() => handleProductSelect(product)}
            >
              <View style={styles.productImageContainer}>
                <Ionicons
                  name="water"
                  size={40}
                  color={
                    selectedProduct?.id === product.id ? "#1976D2" : "#666"
                  }
                />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>
                <Text style={styles.productVolume}>
                  {product.specifications.volume}
                </Text>
                <Text style={styles.productPrice}>
                  ₹{product.pricing.basePrice}
                </Text>
              </View>
              <View style={styles.productSelection}>
                <View
                  style={[
                    styles.radioButton,
                    selectedProduct?.id === product.id &&
                      styles.radioButtonSelected,
                  ]}
                >
                  {selectedProduct?.id === product.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quantity Selection */}
        {selectedProduct && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
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
                  quantity >= selectedProduct.pricing.maxOrderQuantity &&
                    styles.quantityButtonDisabled,
                ]}
                onPress={increaseQuantity}
                disabled={quantity >= selectedProduct.pricing.maxOrderQuantity}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={
                    quantity >= selectedProduct.pricing.maxOrderQuantity
                      ? "#ccc"
                      : "#333"
                  }
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.quantityNote}>
              Max order: {selectedProduct.pricing.maxOrderQuantity} bottles
            </Text>
          </View>
        )}

        {/* Delivery Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Delivery</Text>
          <View style={styles.deliveryTimeContainer}>
            <View style={styles.deliveryTimeIconContainer}>
              <Ionicons name="time-outline" size={20} color="#1976D2" />
            </View>
            <View style={styles.deliveryTimeDetails}>
              <Text style={styles.deliveryTimeText}>
                {calculateEstimatedDelivery()}
              </Text>
              <Text style={styles.deliveryTimeSubtext}>Standard delivery</Text>
            </View>
          </View>
          
          {/* Delivery Policy Info */}
          <View style={styles.deliveryPolicyContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#FF9800" />
            <Text style={styles.deliveryPolicyText}>
              {DeliveryTimeUtils.getDeliveryPolicy()}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
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
                  <FontAwesome5
                    name="cc-mastercard"
                    size={24}
                    color="#EB001B"
                  />
                )}
              </View>
              <View style={styles.cardDetails}>
                <Text style={styles.cardTypeText}>{method.cardType}</Text>
                <Text style={styles.cardNumberText}>
                  •••• {method.lastFour}
                </Text>
              </View>
              <View style={styles.cardSelection}>
                <View
                  style={[
                    styles.radioButton,
                    selectedPaymentMethod === index &&
                      styles.radioButtonSelected,
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
            onPress={() => router.push("/(customer)/add-payment")}
          >
            <Ionicons name="add-circle-outline" size={20} color="#1976D2" />
            <Text style={styles.addPaymentText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={orderNotes}
            onChangeText={setOrderNotes}
            placeholder="Add any special instructions for your order"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {selectedProduct?.name} x {quantity}
            </Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text
              style={[
                styles.summaryValue,
                deliveryFee === 0 && styles.freeText,
              ]}
            >
              {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (placingOrder || !selectedProduct) &&
              styles.placeOrderButtonDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={placingOrder || !selectedProduct}
        >
          {placingOrder ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.placeOrderButtonText}>
              Place Order • ₹{totalAmount.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Change Modal */}
      <Modal
        visible={isAddressModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddressModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                console.log("❌ Modal cancel pressed");
                setIsAddressModalVisible(false);
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Delivery Details</Text>
            <TouchableOpacity
              onPress={() => {
                console.log("💾 Modal save pressed");
                saveAddressChanges();
              }}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Delivery Location</Text>

              <Text style={styles.inputLabel}>Select Community</Text>
              <Select
                value={selectedCommunity}
                options={communities}
                onSelect={handleCommunitySelect}
                placeholder="Choose your community"
                searchable
              />

              <Text style={styles.inputLabel}>Select Apartment</Text>
              <Select
                value={selectedApartment}
                options={apartments}
                onSelect={setSelectedApartment}
                placeholder={
                  !selectedCommunity
                    ? "Select community first"
                    : "Choose your apartment"
                }
                disabled={!selectedCommunity}
              />

              <Text style={styles.modalSectionTitle} >
                Contact Information
              </Text>

              <Text style={styles.inputLabel}>Contact Name</Text>
              <TextInput
                style={styles.modalInput}
                value={tempAddress.contactName}
                onChangeText={(text) =>
                  setTempAddress({ ...tempAddress, contactName: text })
                }
                placeholder="Enter contact name"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={tempAddress.contactPhone}
                onChangeText={(text) =>
                  setTempAddress({ ...tempAddress, contactPhone: text })
                }
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Special Instructions</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                value={tempAddress.specialInstructions}
                onChangeText={(text) =>
                  setTempAddress({ ...tempAddress, specialInstructions: text })
                }
                placeholder="Any special delivery instructions..."
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
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
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
  },
  addressIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  addressDetails: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  apartmentText: {
    fontSize: 12,
    color: "#888",
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
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  selectedProductCard: {
    borderColor: "#1976D2",
    backgroundColor: "rgba(25, 118, 210, 0.05)",
  },
  productImageContainer: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  productVolume: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976D2",
  },
  productSelection: {
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: "center",
  },
  quantityNote: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  deliveryTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  deliveryTimeText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  deliveryTimeSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
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
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
  notesInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 80,
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginTop: 24,
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
  freeText: {
    color: "#4CAF50",
    fontWeight: "600",
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
        elevation: 8,
      },
    }),
  },
  placeOrderButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  placeOrderButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
  },
  modalSaveText: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  deliveryPolicyContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginTop: 8,
  },
  deliveryPolicyText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
});
