import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB2AvaoOrij0E_l8lV1GNX3SGc24ld9oPI",
  authDomain: "la-boite-a-jeux-2d014.firebaseapp.com",
  projectId: "la-boite-a-jeux-2d014",
  storageBucket: "la-boite-a-jeux-2d014.firebasestorage.app",
  messagingSenderId: "57244565659",
  appId: "1:57244565659:web:d0dc2a37e56f2dc71ec63e",
  measurementId: "G-ZB273B5C1B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth()
export const db = getFirestore(app);
export default app;