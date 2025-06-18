import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import ScreenHeader from "../../../components/ui/ScreenHeader";

export default function PaymentsScreen() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      cardType: "visa",
      lastFour: "4242",
      expiryDate: "12/25",
      isDefault: true,
    },
    {
      id: 2,
      cardType: "mastercard",
      lastFour: "5678",
      expiryDate: "10/26",
      isDefault: false,
    },
  ]);

  const handleAddPaymentMethod = () => {
    router.push("/(customer)/add-payment");
  };

  const handleDeleteCard = (id) => {
    Alert.alert("Remove Card", "Are you sure you want to remove this card?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        onPress: () => {
          setPaymentMethods(
            paymentMethods.filter((method) => method.id !== id),
          );
        },
        style: "destructive",
      },
    ]);
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <ScreenHeader title="Payments" showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {paymentMethods.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Your Cards</Text>

            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <FontAwesome5
                    name={`cc-${method.cardType}`}
                    size={32}
                    color={method.cardType === "visa" ? "#1A1F71" : "#EB001B"}
                  />
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardDetails}>
                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {method.lastFour}
                  </Text>
                  <Text style={styles.cardExpiry}>
                    Expires {method.expiryDate}
                  </Text>
                </View>

                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <TouchableOpacity
                      style={styles.cardAction}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color="#1976D2"
                      />
                      <Text style={styles.cardActionText}>Set Default</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.cardAction, styles.deleteAction]}
                    onPress={() => handleDeleteCard(method.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    <Text
                      style={[styles.cardActionText, styles.deleteActionText]}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="card-outline" size={60} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
            <Text style={styles.emptyStateDescription}>
              You have not added any payment methods yet. Add a card to make
              ordering easier.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPaymentMethod}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>

        <View style={styles.secureNoteContainer}>
          <Ionicons name="lock-closed" size={14} color="#666" />
          <Text style={styles.secureNoteText}>
            Your payment information is stored securely
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingBottom: 80, // Add padding to avoid content being hidden behind the tab bar
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 90 : 70, // Fixed padding for static tab bar
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  defaultBadge: {
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: "#1976D2",
    fontSize: 12,
    fontWeight: "500",
  },
  cardDetails: {
    marginBottom: 16,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: "#666",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  cardActionText: {
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 4,
  },
  deleteAction: {
    marginLeft: 20,
  },
  deleteActionText: {
    color: "#FF3B30",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: "#1976D2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secureNoteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  secureNoteText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#666",
  },
});
