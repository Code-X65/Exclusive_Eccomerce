import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, authService } from '../Components/firebase';

// Create the authentication context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up auth state listener on component mount
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up the listener on unmount
    return unsubscribe;
  }, []);

  // Define all auth-related functions
  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    signUp: authService.createUser,
    login: authService.signInUser,
    googleSignIn: authService.signInWithGoogle,
    logout: authService.signOutUser,
    updateProfile: authService.updateUserProfile,
    resetPassword: authService.resetPassword,
    sendVerificationEmail: authService.sendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;