import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  deleteDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { firestore } from './firebase';

// Collection references
const usersCollection = collection(firestore, 'users');
const ordersCollection = collection(firestore, 'orders');
const communitiesCollection = collection(firestore, 'communities');
const paymentsCollection = collection(firestore, 'payments');

/**
 * Creates or updates a user document in Firestore
 * @param {string} userId - The user ID (from auth)
 * @param {Object} userData - The user data to save
 * @returns {Promise<void>}
 */
export const saveUserData = async (userId, userData) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

/**
 * Gets a user document from Firestore
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} - The user data or null if not found
 */
export const getUserData = async (userId) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Creates a new order in Firestore
 * @param {Object} orderData - The order data
 * @returns {Promise<string>} - The new order ID
 */
export const createOrder = async (orderData) => {
  try {
    const orderRef = await addDoc(ordersCollection, {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'PENDING', // Initial status
    });
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Updates an order's status
 * @param {string} orderId - The order ID
 * @param {string} status - The new status
 * @returns {Promise<void>}
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(firestore, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

/**
 * Gets orders for a specific user
 * @param {string} userId - The user ID
 * @param {Object} options - Query options (limit, startAfter, etc.)
 * @returns {Promise<Array>} - Array of order documents
 */
export const getUserOrders = async (userId, options = {}) => {
  try {
    let q = query(
      ordersCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    if (options.startAfter) {
      q = query(q, startAfter(options.startAfter));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

/**
 * Set up a real-time listener for a user's orders
 * @param {string} userId - The user ID
 * @param {Function} callback - Callback function that receives the updated orders
 * @returns {Function} - Unsubscribe function to stop listening
 */
export const subscribeToUserOrders = (userId, callback) => {
  const q = query(
    ordersCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};

/**
 * Gets all communities from Firestore
 * @returns {Promise<Array>} - Array of community documents
 */
export const getCommunities = async () => {
  try {
    const querySnapshot = await getDocs(communitiesCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting communities:', error);
    throw error;
  }
};

/**
 * Saves a payment method for a user
 * @param {string} userId - The user ID
 * @param {Object} paymentData - The payment method data
 * @returns {Promise<string>} - The payment method ID
 */
export const savePaymentMethod = async (userId, paymentData) => {
  try {
    const paymentRef = await addDoc(paymentsCollection, {
      userId,
      ...paymentData,
      createdAt: serverTimestamp(),
    });
    return paymentRef.id;
  } catch (error) {
    console.error('Error saving payment method:', error);
    throw error;
  }
};

/**
 * Gets all payment methods for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of payment method documents
 */
export const getUserPaymentMethods = async (userId) => {
  try {
    const q = query(
      paymentsCollection,
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
};

/**
 * Deletes a payment method
 * @param {string} paymentId - The payment method ID
 * @returns {Promise<void>}
 */
export const deletePaymentMethod = async (paymentId) => {
  try {
    const paymentRef = doc(firestore, 'payments', paymentId);
    await deleteDoc(paymentRef);
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

/**
 * Sets a default payment method for a user
 * @param {string} userId - The user ID
 * @param {string} paymentId - The payment method ID
 * @returns {Promise<void>}
 */
export const setDefaultPaymentMethod = async (userId, paymentId) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, {
      defaultPaymentMethodId: paymentId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};