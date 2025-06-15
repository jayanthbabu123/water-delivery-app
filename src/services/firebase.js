// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4v5pC-by4H3hADKtZqKUHxV-8OWBRzqM",
  authDomain: "water-delivery-app-f7c53.firebaseapp.com",
  projectId: "water-delivery-app-f7c53",
  storageBucket: "water-delivery-app-f7c53.appspot.com",
  messagingSenderId: "912473710274",
  appId: "1:912473710274:web:bf7dd2acfbb87cc70f056c",
  measurementId: "G-BN5RZ7GDZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize other Firebase services
const firestore = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);

// Export the Firebase services
export { app, auth, firestore, storage, functions, analytics };