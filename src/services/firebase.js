// Import React Native Firebase modules
import { firebase } from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import "@react-native-firebase/firestore";
import "@react-native-firebase/functions";
import "@react-native-firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyQ4fhTA-JRZqoI2pkxezqBzEnilYX3m0",
  authDomain: "water-delivery-app-92ba4.firebaseapp.com",
  projectId: "water-delivery-app-92ba4",
  storageBucket: "water-delivery-app-92ba4.firebasestorage.app",
  messagingSenderId: "976235379245",
  appId: "1:976235379245:web:3174f6eb90f815c2a956a4",
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

// Export Firebase services using React Native Firebase
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const functions = firebase.functions();

// Export the firebase app instance
export default firebase;
