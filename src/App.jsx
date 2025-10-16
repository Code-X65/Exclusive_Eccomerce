import React, { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom'
import { ProtectedRoute } from './Components/ProtectedRoute'

import AuthProvider from './Components/AuthContext'
import { CartProvider } from './Components/CartContext'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Eager load critical components
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import HomePage from './Pages/HomePage'
import NotFound from './Pages/404'
// Lazy load non-critical components
const SignUpPage = lazy(() => import('./Pages/SignUpPage'))
const LogInPage = lazy(() => import('./Pages/LogInPage'))
const ShoppingCart = lazy(() => import('./Pages/ShopingCart'))
const AccountManagementPage = lazy(() => import('./Pages/AccountManagementPage'))
const AboutPage = lazy(() => import('./Pages/AboutPage'))
const ContactPage = lazy(() => import('./Pages/ContactPage'))
const ProductDetails = lazy(() => import('./Components/ProductDetails'))

const ProductPage = lazy(() => import('./Pages/ProductPage'))
const CartPage = lazy(() => import('./Pages/CartPage'))
const WishlistPage = lazy(() => import('./Pages/WishlistPage'))
const CheckoutPage = lazy(() => import('./Pages/CheckoutPage'))
const OrdersPage = lazy(() => import('./Pages/OrdersPages'))
const SmartWatchPage = lazy(() => import('./Pages/SmartWatches'))
const BoomBoxPage = lazy(() => import('./Pages/BoomBoxPage'))
const CategoryPage = lazy(() => import('./Pages/CategoryPage'))

// Lightweight loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-500"></div>
  </div>
)

// Progress Bar Component
const NavigationProgressBar = () => {
  const [progress, setProgress] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsNavigating(true)
    setProgress(0)
    
    const timer1 = setTimeout(() => setProgress(30), 50)
    const timer2 = setTimeout(() => setProgress(60), 150)
    const timer3 = setTimeout(() => setProgress(90), 300)
    const timer4 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
      }, 400)
    }, 500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [location.pathname])

  if (!isNavigating && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[9999]">
      <div 
        className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])
  
  return (
    <CartProvider>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
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
          <Suspense fallback={<PageLoader />}>
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
                <Route path="products/:category" element={<ProductPage />} />
                <Route path="Smartwatches" element={<SmartWatchPage />} />
                <Route path="BoomBox" element={<BoomBoxPage />} />
                <Route path="category" element={<CategoryPage />} />
                <Route path="product/:id" element={<ProductDetails />} />
                <Route path="*" element={<NotFound />} />
                

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
          </Suspense>
        </AuthProvider>
      </Router>
    </CartProvider>
  )
}

export default App