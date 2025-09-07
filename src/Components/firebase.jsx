import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; 
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import firebase from "firebase/compat/app";

const firebaseConfig = {
 apiKey: "AIzaSyD2pV5wc278wM4ek4uIaiN2H7KQzctUCHU",
  authDomain: "eccom-7b829.firebaseapp.com",
  projectId: "eccom-7b829",
  storageBucket: "eccom-7b829.firebasestorage.app",
  messagingSenderId: "305850969496",
  appId: "1:305850969496:web:0a67ff5565851be37e0fed",
  measurementId: "G-N738MYE9L8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export const authService = {
  // Create user with email and password
  createUser: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Sign in with email and password
  signInUser: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Update user profile
  updateUserProfile: async (user, profile) => {
    try {
      await updateProfile(user, profile);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Send verification email
  sendVerificationEmail: async (user) => {
    try {
      await sendEmailVerification(user);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Sign out
  signOutUser: async () => {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  }
};

// Error message helper
export const getAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Login cancelled by user';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email address';
    case 'auth/popup-blocked':
      return 'Popup blocked by browser. Please allow popups and try again.';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please log in again.';
    case 'auth/invalid-action-code':
      return 'The action code is invalid. This can happen if the code is malformed or has already been used.';
    default:
      return 'An error occurred. Please try again.';
  }
};
export const db = getFirestore(app)
export default app;