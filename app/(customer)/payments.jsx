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
import ScreenHeader from "../../components/ui/ScreenHeader";

export default function PaymentsScreen() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "visa",
      last4: "4242",
      expiryDate: "12/24",
      isDefault: true,
    },
    {
      id: 2,
      type: "mastercard",
      last4: "5678",
      expiryDate: "10/25",
      isDefault: false,
    },
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: "May 15, 2023",
      description: "Water Delivery - 2x 20L",
      amount: 45.0,
      status: "Completed",
    },
    {
      id: 2,
      date: "May 1, 2023",
      description: "Water Delivery - 1x 20L",
      amount: 25.0,
      status: "Completed",
    },
    {
      id: 3,
      date: "Apr 15, 2023",
      description: "Water Delivery - 3x 20L",
      amount: 65.0,
      status: "Completed",
    },
  ]);

  const handleAddPayment = () => {
    router.push("/(customer)/add-payment");
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    );
  };

  const handleRemovePayment = (id) => {
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
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
      ],
    );
  };

  const getCardIcon = (type) => {
    switch (type) {
      case "visa":
        return <FontAwesome5 name="cc-visa" size={24} color="#1A1F71" />;
      case "mastercard":
        return <FontAwesome5 name="cc-mastercard" size={24} color="#EB001B" />;
      case "amex":
        return <FontAwesome5 name="cc-amex" size={24} color="#2E77BC" />;
      default:
        return <FontAwesome5 name="credit-card" size={24} color="#333" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScreenHeader title="Payments" />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity onPress={handleAddPayment}>
              <Text style={styles.addButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentCard}>
              <View style={styles.cardDetails}>
                {getCardIcon(method.type)}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNumber}>
                    •••• •••• •••• {method.last4}
                  </Text>
                  <Text style={styles.cardExpiry}>
                    Expires {method.expiryDate}
                  </Text>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
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
                    <Text style={styles.cardActionText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.cardAction}
                  onPress={() => handleRemovePayment(method.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#F44336" />
                  <Text style={[styles.cardActionText, { color: "#F44336" }]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addPaymentButton}
            onPress={handleAddPayment}
          >
            <Ionicons name="add-circle-outline" size={20} color="#1976D2" />
            <Text style={styles.addPaymentText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{transaction.status}</Text>
                </View>
              </View>
              <Text style={styles.transactionAmount}>
                ${transaction.amount.toFixed(2)}
              </Text>
            </View>
          ))}

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Transactions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1976D2",
  },
  paymentCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
  },
  cardDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: "#757575",
  },
  defaultBadge: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
  addPaymentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1976D2",
    borderRadius: 8,
    borderStyle: "dashed",
    padding: 12,
    marginTop: 8,
  },
  addPaymentText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "600",
    marginLeft: 8,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  viewAllButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },
});
