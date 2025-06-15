import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

export default function AddPaymentScreen() {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [cardType, setCardType] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  // Animated values for card flip
  const flipAnimation = React.useRef(new Animated.Value(0)).current;
  const flipRotation = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotation = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  const flipToBack = () => {
    Animated.timing(flipAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const flipToFront = () => {
    Animated.timing(flipAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Format card number with spaces
  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const limit = 16;
    const formatted = cleaned.substring(0, limit).replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    
    // Detect card type based on first digits
    if (cleaned.startsWith('4')) {
      setCardType('visa');
    } else if (/^5[1-5]/.test(cleaned)) {
      setCardType('mastercard');
    } else if (/^3[47]/.test(cleaned)) {
      setCardType('amex');
    } else if (/^6(?:011|5)/.test(cleaned)) {
      setCardType('discover');
    } else {
      setCardType(null);
    }
  };

  // Format expiry date with slash
  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/[^0-9]/gi, '');
    if (cleaned.length <= 2) {
      setExpiryDate(cleaned);
    } else {
      setExpiryDate(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
    }
  };

  const handleAddCard = () => {
    // Validate card details
    if (cardNumber.length < 19 || !cardholderName || expiryDate.length < 5 || cvv.length < 3) {
      // Show error
      alert('Please fill in all card details correctly');
      return;
    }

    // In a real app, we would securely send the card details to a payment processor
    // Here we'll just simulate success and navigate back
    router.push('/payments');
  };

  // Simple focus handler for card flip
  const handleFocus = (field) => {
    setFocusedField(field);
    if (field === 'cvv') {
      flipToBack();
    } else if (flipAnimation._value === 1) {
      flipToFront();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/payments')}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={styles.placeholderView} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Credit Card Visual */}
          <View style={styles.cardContainer}>
            {/* Front of card */}
            <Animated.View 
              style={[
                styles.cardFace, 
                styles.cardFront,
                { transform: [{ rotateY: flipRotation }] }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardChip} />
                {cardType ? (
                  <FontAwesome5 
                    name={`cc-${cardType}`} 
                    size={32} 
                    color="#FFF" 
                  />
                ) : (
                  <Text style={styles.cardTypeText}>CARD</Text>
                )}
              </View>
              
              <Text style={styles.cardNumberText}>
                {cardNumber || '•••• •••• •••• ••••'}
              </Text>
              
              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardLabelText}>CARD HOLDER</Text>
                  <Text style={styles.cardDetailText}>
                    {cardholderName || 'YOUR NAME'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardLabelText}>EXPIRES</Text>
                  <Text style={styles.cardDetailText}>
                    {expiryDate || 'MM/YY'}
                  </Text>
                </View>
              </View>
            </Animated.View>
            
            {/* Back of card */}
            <Animated.View 
              style={[
                styles.cardFace, 
                styles.cardBack,
                { transform: [{ rotateY: backRotation }] }
              ]}
            >
              <View style={styles.cardStrip} />
              <View style={styles.cardCvvContainer}>
                <Text style={styles.cardCvvLabel}>CVV</Text>
                <View style={styles.cardCvvField}>
                  <Text style={styles.cardCvvText}>
                    {cvv ? '•'.repeat(cvv.length) : ''}
                  </Text>
                </View>
              </View>
              {cardType && (
                <View style={styles.cardBackLogo}>
                  <FontAwesome5 
                    name={`cc-${cardType}`} 
                    size={32} 
                    color="#FFF" 
                  />
                </View>
              )}
            </Animated.View>
          </View>
          
          {/* Card Details Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'cardNumber' && styles.inputContainerFocused
              ]}>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={formatCardNumber}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="number-pad"
                  maxLength={19}
                  onFocus={() => handleFocus('cardNumber')}
                />
                {cardType && (
                  <FontAwesome5 
                    name={`cc-${cardType}`} 
                    size={24} 
                    color="#666" 
                    style={styles.inputIcon}
                  />
                )}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <View style={[
                styles.inputContainer,
                focusedField === 'cardholderName' && styles.inputContainerFocused
              ]}>
                <TextInput
                  style={styles.input}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="John Doe"
                  autoCapitalize="words"
                  onFocus={() => handleFocus('cardholderName')}
                />
              </View>
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'expiryDate' && styles.inputContainerFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    value={expiryDate}
                    onChangeText={formatExpiryDate}
                    placeholder="MM/YY"
                    keyboardType="number-pad"
                    maxLength={5}
                    onFocus={() => handleFocus('expiryDate')}
                  />
                </View>
              </View>
              
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <View style={[
                  styles.inputContainer,
                  focusedField === 'cvv' && styles.inputContainerFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={true}
                    onFocus={() => handleFocus('cvv')}
                  />
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.defaultContainer}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  isDefault && styles.checkboxChecked
                ]}>
                  {isDefault && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>
              </View>
              <Text style={styles.defaultText}>Set as default payment method</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.addCardButton}
              onPress={handleAddCard}
            >
              <Text style={styles.addCardButtonText}>Add Card</Text>
            </TouchableOpacity>
            
            <View style={styles.secureNoteContainer}>
              <Ionicons name="lock-closed" size={16} color="#666" />
              <Text style={styles.secureNoteText}>
                Your payment information is stored securely
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholderView: {
    width: 24,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  cardContainer: {
    height: 200,
    marginBottom: 30,
    position: 'relative',
  },
  cardFace: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 20,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardFront: {
    backgroundColor: '#1976D2',
    justifyContent: 'space-between',
  },
  cardBack: {
    backgroundColor: '#1976D2',
    justifyContent: 'flex-start',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: '#f4d35e',
    borderRadius: 6,
    opacity: 0.8,
  },
  cardTypeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardNumberText: {
    color: '#fff',
    fontSize: 22,
    letterSpacing: 2,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabelText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginBottom: 4,
  },
  cardDetailText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cardStrip: {
    height: 40,
    backgroundColor: '#000',
    marginLeft: -20,
    marginRight: -20,
    marginTop: 20,
  },
  cardCvvContainer: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  cardCvvLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginBottom: 4,
  },
  cardCvvField: {
    backgroundColor: '#fff',
    width: 50,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCvvText: {
    fontSize: 14,
    color: '#333',
  },
  cardBackLogo: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  formContainer: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },
  inputContainerFocused: {
    borderColor: '#1976D2',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputIcon: {
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1976D2',
  },
  defaultText: {
    fontSize: 14,
    color: '#333',
  },
  addCardButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addCardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secureNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureNoteText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
});