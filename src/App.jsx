import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ProtectedRoute } from './Components/ProtectedRoute'
import HomePage from './Pages/HomePage'
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import { Outlet } from 'react-router-dom'
import SignUpPage from './Pages/SignUpPage'
import LogInPage from './Pages/LogInPage'
import ShoppingCart from './Pages/ShopingCart'
import AccountManagementPage from './Pages/AccountManagementPage'
import AboutPage from './Pages/AboutPage'
import ContactPage from './Pages/ContactPage'
import ProductDetails from './Components/ProductDetails'
import NotFound from './Components/NotFound'
import AuthProvider from './Components/AuthContext'
import ProductPage from './Pages/ProductPage'
import CartPage from './Pages/CartPage'
import WishlistPage from './Pages/WishlistPage'
import CheckoutPage from './Pages/CheckoutPage'
import OrdersPage from './Pages/OrdersPages'
import { CartProvider } from './Components/CartContext';
import SmartWatchPage from './Pages/SmartWatches'
import BoomBoxPage from './Pages/BoomBoxPage'
import CategoryPage from './Pages/CategoryPage'

// Progress Bar Component
const NavigationProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Start progress bar
    setIsNavigating(true);
    setProgress(0);
    
    const timer1 = setTimeout(() => setProgress(30), 50);
    const timer2 = setTimeout(() => setProgress(60), 150);
    const timer3 = setTimeout(() => setProgress(90), 300);
    const timer4 = setTimeout(() => {
      setProgress(100);
      // Hide progress bar after completion
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 400);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [location.pathname]);

  if (!isNavigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
      <div 
        className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 transition-all duration-300 ease-out shadow-lg"
        style={{ 
          width: `${progress}%`,
          boxShadow: progress > 0 ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
        }}
      />
    </div>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true)
  
  // Scroll to top component
  const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);

    return null;
  };

  useEffect(() => {
    // Simulate initial app load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000) // Adjust timing as needed

    return () => clearTimeout(timer)
  }, [])
  
  return (
    <>
    <CartProvider>
     {/* Loading Spinner */}
    {isLoading && (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-500"></div>
          <p className="text-white text-sm font-medium">Loading...</p>
        </div>
      </div>
    )}
    
    <Router basename="/Exclusive_Eccomerce/">
      <AuthProvider setIsLoading={setIsLoading}>
        <NavigationProgressBar />
        <ScrollToTop />
        <Routes >
          {/* Inline layout using react-router Outlet so we don't depend on BaseLayout component file */}
          <Route element={<>
            <Navbar />
            <main className="min-h-[calc(100vh-200px)]">
              <Outlet />
            </main>
            <Footer />
          </>}>
            <Route index element={<HomePage />} />
            <Route path="Signup" element={<SignUpPage />} />
            <Route path="Login" element={<LogInPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="products/:category" element={<ProductPage />} />
            <Route path="Smartwatches" element={<SmartWatchPage />} />
            <Route path="BoomBox" element={<BoomBoxPage />} />
            <Route path="category" element={<CategoryPage />} />
            
            <Route path="product/:id" element={<ProductDetails />} />

            <Route element={<ProtectedRoute />}>
              <Route path="shoppingcart" element={<ShoppingCart />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="account/*" element={<AccountManagementPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>

            <Route path="not-found" element={<NotFound />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
    </CartProvider>
    </>
  )
}

export default App