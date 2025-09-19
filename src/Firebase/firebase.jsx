// firebase.js - Create this new file
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2pV5wc278wM4ek4uIaiN2H7KQzctUCHU",
  authDomain: "eccom-7b829.firebaseapp.com",
  projectId: "eccom-7b829",
  storageBucket: "eccom-7b829.firebasestorage.app",
  messagingSenderId: "305850969496",
  appId: "1:305850969496:web:0a67ff5565851be37e0fed",
  measurementId: "G-N738MYE9L8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;