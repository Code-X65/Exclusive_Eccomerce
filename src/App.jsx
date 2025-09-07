import React from 'react'
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


const App = () => {
  return (
    <>
    {/* <Router>
      <Navbar />
    <Routes>

    <Route path="/" element={<HomePage />} />
    <Route path="/Signup" element={<SignUpPage />} />
    <Route path="/Login" element={<LogInPage />} />
    <Route path="/wishlist" element={<EcommerceWishlist />} />
    <Route path="/shoppingcart" element={<ShoppingCart />} />
    <Route path="/checkout" element={<CheckoutForm />} />
    <Route path="/account" element={<AccountManagementPage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/products" element={<ProductDetails />} />
    <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />  
    </Router> */}
    <Router>
      <AuthProvider> 
      <Navbar />
        <Routes>
          {/* Public Routes */}
        <Route path="/" element={<HomePage />} /> 
         <Route path="/Signup" element={<SignUpPage />} />
    <Route path="/Login" element={<LogInPage />} />
    <Route path="/about" element={<AboutPage />} />
     <Route path="/contact" element={<ContactPage />} />
     <Route path="/products" element={<ProductDetails />} />
      <Route path="*" element={<NotFound />} />

        {/* <Route element={<PublicOnlyRoute />}>
        </Route> */}
         
         {/* Private Routes */}
         <Route element={<ProtectedRoute />}>
            <Route path="/shoppingcart" element={<ShoppingCart />} />
            <Route path="/wishlist" element={<EcommerceWishlist />} />
             <Route path="/checkout" element={<CheckoutForm />} />
             <Route path="/account/*" element={<AccountManagementPage />} />
           
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
