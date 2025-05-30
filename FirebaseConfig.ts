// labwatch-app/FirebaseConfig.ts
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth'; // Updated auth imports
import { getFirestore } from 'firebase/firestore'; // Add this import
import { firebaseConfig } from "./APIkeys";

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth
// Use getAuth() for modular SDK if you are not using initializeAuth for specific persistence
// For most cases, initializeAuth is preferred for custom persistence.
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error) {
  console.warn("Failed to initialize Auth with persistence, falling back to default. Error:", error);
  // Fallback if initializeAuth with persistence fails (e.g., in a non-RN environment or error)
  // This typically shouldn't happen in a React Native app if AsyncStorage is set up.
  authInstance = getAuth(app);
}
export const auth = authInstance;

// Initialize Firestore and export it as db
export const db = getFirestore(app);