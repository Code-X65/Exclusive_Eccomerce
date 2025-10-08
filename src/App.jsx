import React, { useState } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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



const App = () => {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <>
    <CartProvider>
     {/* Loading Spinner */}
    {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-300"></div>
      </div>
    )}
    <Router >
      <AuthProvider setIsLoading={setIsLoading}>
        <Routes>
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