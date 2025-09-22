import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'
import SignUpPage from './pages/SignUpPage'
import LogInPage from './pages/LogInPage'
import ShoppingCart from './pages/ShopingCart'
import AccountManagementPage from './pages/AccountManagementPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import ProductDetails from './components/ProductDetails'
import NotFound from './components/NotFound'
import AuthProvider from './components/AuthContext'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPages'
import { CartProvider } from './components/CartContext';

const App = () => {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <>
    <CartProvider>
     {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )}
    <Router basename="/Exclusive_Eccomerce">
      <AuthProvider setIsLoading={setIsLoading}>
        <Routes>
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