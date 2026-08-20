import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration for Al-Eis Municipality App
// Replace these parameters with your real Firebase Project credentials
const firebaseConfig = {
  apiKey: "AIzaSyC-7hOYsNCXxYTNYkEwDnnF1dFbZDEq8Aw",
  authDomain: "aleis-municipality.firebaseapp.com",
  projectId: "aleis-municipality",
  storageBucket: "aleis-municipality.firebasestorage.app",
  messagingSenderId: "75609601098",
  appId: "1:75609601098:web:4da3aa8c90be33608b62b3",
  measurementId: "G-0TKEZP48S7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
