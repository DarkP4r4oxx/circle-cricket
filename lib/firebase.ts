// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDFmI9vjkO9foDEaF5pnBTUbRoOXVwYUlw",
  authDomain: "circle-cricket.firebaseapp.com",
  projectId: "circle-cricket",
  storageBucket: "circle-cricket.firebasestorage.app",
  messagingSenderId: "773431280261",
  appId: "1:773431280261:web:80a7c65cf7140dbcf09fec",
  measurementId: "G-49DR89Z2T3",
};

// Prevent duplicate initialization in Next.js dev mode
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
