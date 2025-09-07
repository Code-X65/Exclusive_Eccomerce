import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, authService } from '../Components/firebase';

// Create the authentication context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children, setIsLoading }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up auth state listener on component mount
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
      if (setIsLoading) {
        setIsLoading(false);
      }
    });

    // Clean up the listener on unmount
    return unsubscribe;
  }, [setIsLoading]);

  // Wrapper functions that handle loading state
  const signUpWithLoading = async (...args) => {
    if (setIsLoading) setIsLoading(true);
    try {
      return await authService.createUser(...args);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  const loginWithLoading = async (...args) => {
    if (setIsLoading) setIsLoading(true);
    try {
      return await authService.signInUser(...args);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  const googleSignInWithLoading = async (...args) => {
    if (setIsLoading) setIsLoading(true);
    try {
      return await authService.signInWithGoogle(...args);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  const logoutWithLoading = async (...args) => {
    if (setIsLoading) setIsLoading(true);
    try {
      return await authService.signOutUser(...args);
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  };

  // Define all auth-related functions
  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    signUp: signUpWithLoading,
    login: loginWithLoading,
    googleSignIn: googleSignInWithLoading,
    logout: logoutWithLoading,
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