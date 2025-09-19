import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Loader2, Eye } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Import your Firebase config - adjust path as needed
import { db, auth } from '../Components/firebase';

const WishlistPage = () => {
  const [user, setUser] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setWishlistItems([]);
        setCartItems([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch wishlist and cart items when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setWishlistItems([]);
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
          setWishlistItems(userData.wishlist || []);
          setCartItems(userData.cart || []);
        } else {
          setWishlistItems([]);
          setCartItems([]);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist. Please try again.');
        setWishlistItems([]);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user) return;

    try {
      setUpdating(true);
      setError('');
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentWishlist = userData.wishlist || [];
        
        // Remove the specific item
        const updatedWishlist = currentWishlist.filter(item => item.productId !== productId);
        
        await updateDoc(userDocRef, { wishlist: updatedWishlist });
        setWishlistItems(updatedWishlist);
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Add item to cart from wishlist
  const addToCart = async (wishlistItem) => {
    if (!user) return;

    try {
      setUpdating(true);
      setError('');

      const cartItem = {
        productId: wishlistItem.productId,
        name: wishlistItem.name,
        price: wishlistItem.price,
        image: wishlistItem.image,
        quantity: 1,
        selectedSize: 'M',
        selectedColor: 'default',
        addedAt: new Date().toISOString()
      };

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentCart = userData.cart || [];
        
        // Check if item already exists in cart
        const existingItemIndex = currentCart.findIndex(item => item.productId === wishlistItem.productId);
        
        let updatedCart;
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          updatedCart = currentCart.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Add new item to cart
          updatedCart = [...currentCart, cartItem];
        }
        
        await updateDoc(userDocRef, { cart: updatedCart });
        setCartItems(updatedCart);
        
        // Optionally remove from wishlist after adding to cart
        // await removeFromWishlist(wishlistItem.productId);
        
        alert('Item added to cart successfully!');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!user) return;

    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        setUpdating(true);
        setError('');
        
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { wishlist: [] });
        setWishlistItems([]);
      } catch (err) {
        console.error('Error clearing wishlist:', err);
        setError('Failed to clear wishlist. Please try again.');
      } finally {
        setUpdating(false);
      }
    }
  };

  // Move all items to cart
  const moveAllToCart = async () => {
    if (!user || wishlistItems.length === 0) return;

    if (window.confirm('Move all wishlist items to cart?')) {
      try {
        setUpdating(true);
        setError('');

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentCart = userData.cart || [];
          
          // Convert wishlist items to cart items
          const newCartItems = wishlistItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
            selectedSize: 'M',
            selectedColor: 'default',
            addedAt: new Date().toISOString()
          }));

          // Merge with existing cart, updating quantities for duplicates
          let updatedCart = [...currentCart];
          
          newCartItems.forEach(newItem => {
            const existingIndex = updatedCart.findIndex(item => item.productId === newItem.productId);
            if (existingIndex >= 0) {
              updatedCart[existingIndex].quantity += 1;
            } else {
              updatedCart.push(newItem);
            }
          });

          await updateDoc(userDocRef, { 
            cart: updatedCart,
            wishlist: [] // Clear wishlist after moving to cart
          });
          
          setCartItems(updatedCart);
          setWishlistItems([]);
          
          alert('All items moved to cart successfully!');
        }
      } catch (err) {
        console.error('Error moving items to cart:', err);
        setError('Failed to move items to cart. Please try again.');
      } finally {
        setUpdating(false);
      }
    }
  };

  // Check if item is already in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.productId === productId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your wishlist.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Empty wishlist state
  if (wishlistItems.length === 0 && !loading) {
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
            <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
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

          {/* Empty State */}
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save your favorite items for later!</p>
            <button 
              onClick={() => window.location.href = '/products'}
              className="bg-red-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              Explore Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main wishlist view
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
            <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
            <span className="ml-3 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              {wishlistItems.length} items
            </span>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="flex gap-3">
              <button 
                onClick={moveAllToCart}
                disabled={updating}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors text-sm"
              >
                Move All to Cart
              </button>
              <button 
                onClick={clearWishlist}
                disabled={updating}
                className="text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
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

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              {/* Product Image */}
              <div className="relative bg-gray-50 p-4">
                <div className="aspect-square flex items-center justify-center">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons Overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => window.location.href = `/product/${item.productId}`}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(item.productId)}
                    disabled={updating}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 h-12">
                  {item.name}
                </h3>
                
                <div className="text-lg font-semibold text-red-500 mb-3">
                  ₦{item.price?.toLocaleString()}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(item)}
                    disabled={updating}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                      isInCart(item.productId)
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {updating ? (
                      <div className="flex items-center justify-center gap-1">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="hidden sm:inline">Adding...</span>
                      </div>
                    ) : isInCart(item.productId) ? (
                      <div className="flex items-center justify-center gap-1">
                        <ShoppingCart size={14} />
                        <span>In Cart</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <ShoppingCart size={14} />
                        <span>Add to Cart</span>
                      </div>
                    )}
                  </button>

                  <button 
                    onClick={() => removeFromWishlist(item.productId)}
                    disabled={updating}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove from Wishlist"
                  >
                    <Heart size={16} className="fill-current" />
                  </button>
                </div>

                {/* Added Date */}
                <div className="text-xs text-gray-400 mt-2">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <button 
            onClick={() => window.location.href = '/products'}
            className="bg-gray-100 text-gray-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;