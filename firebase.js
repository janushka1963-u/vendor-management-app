import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZzHtuCfSK7UQ13mUJ-ts5oP0dwVXY5D8",
  authDomain: "vendor-management-c2f5a.firebaseapp.com",
  projectId: "vendor-management-c2f5a",
  storageBucket: "vendor-management-c2f5a.firebasestorage.app",
  messagingSenderId: "379897856784",
  appId: "1:379897856784:web:5bdfa24376d55c84e8db95",
  measurementId: "G-F65HECSQZY"

  
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const db = getFirestore(app);
