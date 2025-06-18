import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

export default function SupportScreen() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supportCategories = [
    {
      id: "order",
      label: "Order Issues",
      icon: "cart-outline",
      description: "Problems with your order or delivery",
    },
    {
      id: "account",
      label: "Account Help",
      icon: "person-outline",
      description: "Login, profile, or payment issues",
    },
    {
      id: "product",
      label: "Product Questions",
      icon: "water-outline",
      description: "Questions about our water products",
    },
    {
      id: "feedback",
      label: "App Feedback",
      icon: "star-outline",
      description: "Suggestions or feedback about our app",
    },
  ];

  const faqItems = [
    {
      question: "How do I track my delivery?",
      answer:
        "You can track your delivery in real-time from the Orders tab. Select your active order to view its current status and location.",
    },
    {
      question: "How do I cancel an order?",
      answer:
        "You can cancel an order from the Order Details screen if the order is still in the 'Processing' state. Once the order status changes to 'Out for Delivery', it can no longer be cancelled.",
    },
    {
      question: "How do I change my delivery address?",
      answer:
        "You can update your delivery address from the Profile tab. Go to 'Manage Addresses' and edit your existing address or add a new one.",
    },
    {
      question: "How do I add a payment method?",
      answer:
        "You can add a payment method from the Payments tab. Tap on '+ Add New' and follow the instructions to add your credit or debit card.",
    },
  ];

  const handleSubmit = () => {
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a support category.");
      return;
    }

    if (!message.trim()) {
      Alert.alert("Error", "Please enter your message.");
      return;
    }

    setIsLoading(true);

    // Simulate API request
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Message Sent",
        "Thank you for contacting us. We'll respond to your inquiry as soon as possible.",
        [
          {
            text: "OK",
            onPress: () => {
              setSelectedCategory(null);
              setMessage("");
              router.back();
            },
          },
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            <Text style={styles.supportText}>
              Please select a category and describe your issue. Our support team
              will get back to you as soon as possible.
            </Text>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoriesContainer}>
              {supportCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      selectedCategory === category.id && styles.selectedCategoryIcon,
                    ]}
                  >
                    <Ionicons
                      name={category.icon}
                      size={22}
                      color={
                        selectedCategory === category.id ? "#fff" : "#1976D2"
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && styles.selectedCategoryText,
                    ]}
                  >
                    {category.label}
                  </Text>
                  <Text
                    style={[
                      styles.categoryDescription,
                      selectedCategory === category.id && styles.selectedCategoryText,
                    ]}
                  >
                    {category.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Your Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Describe your issue or question..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.submitButtonText}>Sending...</Text>
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Other Ways to Reach Us</Text>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color="#1976D2" />
              <Text style={styles.contactText}>+1 (555) 123-4567</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#1976D2" />
              <Text style={styles.contactText}>support@waterdelivery.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={20} color="#1976D2" />
              <Text style={styles.contactText}>
                Monday - Friday, 9:00 AM - 6:00 PM
              </Text>
            </View>
          </View>

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  supportText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  selectedCategory: {
    backgroundColor: "#1976D2",
    borderColor: "#1976D2",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedCategoryIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: "#757575",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  messageInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 20,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#bbdefb",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  contactInfo: {
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
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
  },
  bottomSpace: {
    height: 40,
  },
});
