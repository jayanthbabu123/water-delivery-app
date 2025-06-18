import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddPaymentScreen() {
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [errors, setErrors] = useState({});

  const formatCardNumber = (text) => {
    // Remove non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (text) => {
    // Remove non-digit characters
    const cleaned = text.replace(/\D/g, "");
    // Add slash after first 2 digits
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    validateField("cardNumber", formatted);
  };

  const handleExpiryDateChange = (text) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);
    validateField("expiryDate", formatted);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case "cardNumber":
        if (value.replace(/\s/g, "").length !== 16) {
          newErrors.cardNumber = "Card number must be 16 digits";
        } else {
          delete newErrors.cardNumber;
        }
        break;
      case "cardholderName":
        if (!value.trim()) {
          newErrors.cardholderName = "Cardholder name is required";
        } else {
          delete newErrors.cardholderName;
        }
        break;
      case "expiryDate":
        const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!regex.test(value)) {
          newErrors.expiryDate = "Invalid format (MM/YY)";
        } else {
          const [month, year] = value.split("/");
          const now = new Date();
          const currentYear = now.getFullYear() % 100;
          const currentMonth = now.getMonth() + 1;

          if (
            parseInt(year, 10) < currentYear ||
            (parseInt(year, 10) === currentYear &&
              parseInt(month, 10) < currentMonth)
          ) {
            newErrors.expiryDate = "Card has expired";
          } else {
            delete newErrors.expiryDate;
          }
        }
        break;
      case "cvv":
        if (value.length !== 3 && value.length !== 4) {
          newErrors.cvv = "CVV must be 3 or 4 digits";
        } else {
          delete newErrors.cvv;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllFields = () => {
    validateField("cardNumber", cardNumber);
    validateField("cardholderName", cardholderName);
    validateField("expiryDate", expiryDate);
    validateField("cvv", cvv);

    return Object.keys(errors).length === 0;
  };

  const handleSaveCard = () => {
    if (validateAllFields()) {
      // In a real app, securely send card info to payment processor
      // Never store full card details on device

      // Show success message
      Alert.alert(
        "Card Added",
        "Your payment method has been added successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert(
        "Invalid Information",
        "Please check the card details and try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.cardIconsContainer}>
            <Ionicons name="card-outline" size={32} color="#1976D2" />
            <Text style={styles.cardIconsText}>Credit/Debit Card</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={[
                styles.input,
                errors.cardNumber ? styles.inputError : null,
              ]}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              keyboardType="numeric"
              maxLength={19}
            />
            {errors.cardNumber && (
              <Text style={styles.errorText}>{errors.cardNumber}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.cardholderName ? styles.inputError : null,
              ]}
              placeholder="John Doe"
              value={cardholderName}
              onChangeText={(text) => {
                setCardholderName(text);
                validateField("cardholderName", text);
              }}
              autoCapitalize="words"
            />
            {errors.cardholderName && (
              <Text style={styles.errorText}>{errors.cardholderName}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.expiryDate ? styles.inputError : null,
                ]}
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={handleExpiryDateChange}
                keyboardType="numeric"
                maxLength={5}
              />
              {errors.expiryDate && (
                <Text style={styles.errorText}>{errors.expiryDate}</Text>
              )}
            </View>

            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={[styles.input, errors.cvv ? styles.inputError : null]}
                placeholder="123"
                value={cvv}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  setCvv(cleaned);
                  validateField("cvv", cleaned);
                }}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              {errors.cvv && (
                <Text style={styles.errorText}>{errors.cvv}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveCardToggle}
            onPress={() => setSaveCard(!saveCard)}
          >
            <View
              style={[
                styles.checkbox,
                saveCard ? styles.checkboxChecked : {},
              ]}
            >
              {saveCard && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.saveCardText}>
              Save this card for future payments
            </Text>
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>
              Your payment information is secure and encrypted
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addCardButton}
            onPress={handleSaveCard}
          >
            <Text style={styles.addCardButtonText}>Add Card</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardIconsContainer: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 12,
  },
  cardIconsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#F44336",
  },
  errorText: {
    fontSize: 12,
    color: "#F44336",
    marginTop: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveCardToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1976D2",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1976D2",
  },
  saveCardText: {
    fontSize: 14,
    color: "#333",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  addCardButton: {
    backgroundColor: "#1976D2",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addCardButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpace: {
    height: 40,
  },
});
