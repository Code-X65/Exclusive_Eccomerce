import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './Components/ProtectedRoute'
import Navbar from './Components/Navbar'
import HomePage from './Pages/HomePage'
import Footer from './Components/Footer'
import SignUpPage from './Pages/SignUpPage'
import LogInPage from './Pages/LogInPage'
import EcommerceWishlist from './Pages/Wistlist'
import ShoppingCart from './Pages/ShopingCart'
import CheckoutForm from './Components/ChectoutForm'
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



const App = () => {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <>
     {/* Loading Spinner */}
    {isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )}
    <Router>
      <AuthProvider setIsLoading={setIsLoading}>
      <Navbar />
        <Routes>
          {/* Public Routes */}
        <Route path="/" element={<HomePage />} /> 
         <Route path="/Signup" element={<SignUpPage />} />
    <Route path="/Login" element={<LogInPage />} />
    <Route path="/about" element={<AboutPage />} />
     <Route path="/contact" element={<ContactPage />} />
     <Route path="/products" element={<ProductPage />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/product/:id" element={<ProductDetails />} />

        {/* <Route element={<PublicOnlyRoute />}>
        </Route> */}
         
         {/* Private Routes */}
         <Route element={<ProtectedRoute />}>
            <Route path="/shoppingcart" element={<ShoppingCart />} />
            {/* <Route path="/wishlist" element={<EcommerceWishlist />} /> */}
             <Route path="/checkout" element={<CheckoutPage />} />
             <Route path="/account/*" element={<AccountManagementPage />} />
             <Route path="/cart" element={<CartPage />} />
             <Route path="/wishlist" element={<WishlistPage />} />
             

           
          </Route>

             {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </AuthProvider>

    </Router>
    </>
  )
}

export default App
