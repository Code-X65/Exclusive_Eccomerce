import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children, setIsLoading }) => {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    setIsLoading(true);
    // Simulate an API call
    setTimeout(() => {
      setUser({ name: 'User' }); // Replace with actual user data
      setIsLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};