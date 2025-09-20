import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayRemove, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Import your Firebase config - adjust path as needed
import { db, auth } from '../Components/firebase';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // HOOKS MUST BE AT THE TOP - BEFORE ANY RETURNS
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setCartItems([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch cart items when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCartItems(userData.cart || []);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load cart. Please try again.');
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  // Update quantity of item in cart
  const updateQuantity = async (productId, newQuantity) => {
    if (!user || newQuantity < 1) return;

    try {
      setUpdating(true);
      setError(''); // Clear any previous errors
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentCart = userData.cart || [];
        
        // Update the specific item's quantity
        const updatedCart = currentCart.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity }
            : item
        );
        
        await updateDoc(userDocRef, { cart: updatedCart });
        setCartItems(updatedCart);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!user) return;

    try {
      setUpdating(true);
      setError(''); // Clear any previous errors
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentCart = userData.cart || [];
        
        // Remove the specific item
        const updatedCart = currentCart.filter(item => item.productId !== productId);
        
        await updateDoc(userDocRef, { cart: updatedCart });
        setCartItems(updatedCart);
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user) return;

    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        setUpdating(true);
        setError(''); // Clear any previous errors
        
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { cart: [] });
        setCartItems([]);
      } catch (err) {
        console.error('Error clearing cart:', err);
        setError('Failed to clear cart. Please try again.');
      } finally {
        setUpdating(false);
      }
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = cartItems.length > 0 ? (subtotal > 100 ? 0 : 10) : 0; // Free shipping over $100
  const total = subtotal + tax + shipping;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
          <button 
            onClick={() => window.location.href = '/Exclusive_Eccomerce/login'}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg mr-4"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => setError('')}
                className="mt-2 text-red-700 underline hover:no-underline text-sm"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Empty State */}
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <button 
              onClick={() => window.location.href = '/Exclusive_Eccomerce/products'}
              className="bg-red-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main cart view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg mr-4"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
          </div>
          
          {cartItems.length > 0 && (
            <button 
              onClick={clearCart}
              disabled={updating}
              className="text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-50"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={() => setError('')}
                className="text-red-700 hover:text-red-900 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Cart Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              {/* Cart Header */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">
                  Cart Items ({cartItems.length})
                </h2>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-100">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img 
                          src={item.image || '/api/placeholder/120/120'} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                        
                        {/* Product Variants */}
                        <div className="text-sm text-gray-500 mb-3">
                          {item.selectedSize && (
                            <span className="mr-4">Size: {item.selectedSize}</span>
                          )}
                          {item.selectedColor && (
                            <span>Color: {item.selectedColor}</span>
                          )}
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold text-gray-800">
                            ₦{item.price?.toLocaleString()}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button 
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={updating || item.quantity <= 1}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={16} />
                              </button>
                              
                              <span className="px-4 py-2 min-w-[60px] text-center">
                                {item.quantity}
                              </span>
                              
                              <button 
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={updating}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button 
                              onClick={() => removeFromCart(item.productId)}
                              disabled={updating}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="mt-2 text-right">
                          <span className="text-sm text-gray-500">Subtotal: </span>
                          <span className="font-medium text-gray-800">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm sticky top-8">
              {/* Summary Header */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
              </div>

              {/* Summary Details */}
              <div className="p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `₦${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>

                {/* Free Shipping Notice */}
                {shipping > 0 && subtotal < 100 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Add ₦{(100 - subtotal).toLocaleString()} more for free shipping!
                    </p>
                  </div>
                )}

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>

                {/* Checkout Button */}
                <Link to="/checkout"> 
                <button 
                  disabled={updating || cartItems.length === 0}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6"
                >
                  {updating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
                </Link>

                {/* Continue Shopping */}
                <button 
                  onClick={() => window.location.href = '/Exclusive_Eccomerce/products'}
                  className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </button>

                {/* Security Notice */}
                <div className="text-xs text-gray-500 text-center mt-4">
                  🔒 Secure checkout with SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;