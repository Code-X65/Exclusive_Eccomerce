import { useState, useEffect, useRef } from 'react';
import { Heart, Eye, ChevronLeft, ChevronRight, Loader2, Share2, Copy, MessageCircle } from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';


export default function FlashSales() {
  const [userCartItems, setUserCartItems] = useState([]);
const [userWishlistItems, setUserWishlistItems] = useState([]);
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56
  });

  // Scrollable product container ref
  const productContainerRef = useRef(null);
  
  // Current visible products range
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 4 });
  const [isMobile, setIsMobile] = useState(false);

  // NEW STATE ADDITIONS
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  // NEW FUNCTIONS - Add these functions
  const generateProductUrl = (productId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/Exclusive_Eccomerce/product/${productId}`;
  };

  const shareProduct = async (product) => {
    const url = generateProductUrl(product.id);
    const shareData = {
      title: product.name,
      text: `Check out this amazing product: ${product.name} - ₦${product.salePrice?.toLocaleString()}`,
      url: url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
        try {
          await navigator.clipboard.writeText(url);
          alert('Product link copied to clipboard!');
        } catch (copyError) {
          alert('Unable to share. Please try again.');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Product link copied to clipboard!');
      } catch (error) {
        alert('Unable to copy link. Please try again.');
      }
    }
  };

  const shareToWhatsApp = (product) => {
    const url = generateProductUrl(product.id);
    const message = `Check out this amazing product: ${product.name} - ₦${product.salePrice?.toLocaleString()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToTwitter = (product) => {
    const url = generateProductUrl(product.id);
    const tweet = `Check out this product: ${product.name} - ₦${product.salePrice?.toLocaleString()}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = (product) => {
    const url = generateProductUrl(product.id);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

const addToCart = async (product) => {
  if (!user) {
    alert('Please log in to add items to cart');
    return;
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentCart = userData.cart || [];
      
      // Find existing item
      const existingItemIndex = currentCart.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        currentCart[existingItemIndex].quantity += 1;
        await updateDoc(userDocRef, { cart: currentCart });
        setUserCartItems(currentCart);
        alert('Cart updated successfully!');
      } else {
        // Add new item
        const cartItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '📱',
          quantity: 1,
          selectedSize: 'M',
          selectedColor: 'white',
          addedAt: new Date().toISOString()
        };
        
        await setDoc(userDocRef, {
          cart: arrayUnion(cartItem)
        }, { merge: true });
        
        setUserCartItems([...currentCart, cartItem]);
        alert('Product added to cart successfully!');
      }
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Failed to add product to cart. Please try again.');
  }
};

  const addToWishlist = async (product) => {
    if (!user) {
      alert('Please log in to add items to wishlist');
      return;
    }

    try {
      const wishlistItem = {
        productId: product.id,
        name: product.name,
        price: product.salePrice,
        image: product.image || '/api/placeholder/400/400',
        addedAt: new Date().toISOString()
      };

      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        wishlist: arrayUnion(wishlistItem)
      }, { merge: true });

      alert('Product added to wishlist successfully!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add product to wishlist. Please try again.');
    }
  };



useEffect(() => {
  const fetchUserData = async () => {
    if (!user) {
      setUserCartItems([]);
      setUserWishlistItems([]);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserCartItems(userData.cart || []);
        setUserWishlistItems(userData.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  fetchUserData();
}, [user]);

  // MODIFIED useEffect - Replace existing useEffect hooks with these
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            name: data.name,
            originalPrice: data.price ? data.price * 1.2 : 0,
            salePrice: data.price || 0,
            discount: 20,
            image: data.images && data.images.length > 0 ? (data.images[0].data || data.images[0].url) : null,
            rating: 5,
            reviews: Math.floor(Math.random() * 100) + 10,
            category: data.category,
            stock: data.stockQuantity || data.stock || 0,
            description: data.description
          });
        });
        
        // Get only first 10 products
        setProducts(productsData.slice(0, 10));
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  // Check for mobile/desktop view
  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    
    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newSeconds = prevTime.seconds - 1;
        const newMinutes = newSeconds < 0 ? prevTime.minutes - 1 : prevTime.minutes;
        const newHours = newMinutes < 0 ? prevTime.hours - 1 : prevTime.hours;
        const newDays = newHours < 0 ? prevTime.days - 1 : prevTime.days;

        return {
          days: newDays < 0 ? 0 : newDays,
          hours: newHours < 0 ? 23 : newHours % 24,
          minutes: newMinutes < 0 ? 59 : newMinutes % 60,
          seconds: newSeconds < 0 ? 59 : newSeconds % 60
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate products to display based on screen size
  const productsPerView = () => {
    if (window.innerWidth < 640) return 1;  // Small mobile
    if (window.innerWidth < 768) return 2;  // Mobile
    if (window.innerWidth < 1024) return 2; // Tablet
    if (window.innerWidth < 1280) return 4; // Desktop
    return 5; // Large desktop
  };

  // Functions to handle navigation
  const handlePrevious = () => {
    if (isMobile) {
      if (productContainerRef.current) {
        productContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
      }
    } else {
      const step = productsPerView();
      const newStart = Math.max(0, visibleRange.start - step);
      setVisibleRange({
        start: newStart,
        end: newStart + step
      });
    }
  };

  const handleNext = () => {
    if (isMobile) {
      if (productContainerRef.current) {
        productContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
      }
    } else {
      const step = productsPerView();
      const newStart = Math.min(products.length - step, visibleRange.start + step);
      setVisibleRange({
        start: newStart,
        end: newStart + step
      });
    }
  };

  // Rating stars component
  const RatingStars = ({ rating }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <svg 
            key={index} 
            className={`w-3 h-3 sm:w-4 sm:h-4 ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Format numbers with leading zeros
  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  // Timer display component
  const TimerDisplay = () => (
    <div className="flex gap-1 sm:gap-2 text-center">
      <div className="flex flex-col items-center">
<span className="text-xs text-gray-400">Days</span>
<span className="text-lg sm:text-2xl font-bold text-gray-100">{formatNumber(timeLeft.days)}</span>
      </div>
      <span className="text-lg sm:text-2xl font-bold text-gray-100">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400">Hours</span>
        <span className="text-lg sm:text-2xl font-bold text-gray-100">{formatNumber(timeLeft.hours)}</span>
      </div>
      <span className="text-lg sm:text-2xl font-bold text-gray-100">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400">Minutes</span>
        <span className="text-lg sm:text-2xl font-bold text-gray-100">{formatNumber(timeLeft.minutes)}</span>
      </div>
      <span className="text-lg sm:text-2xl font-bold text-gray-100">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-400">Seconds</span>
        <span className="text-lg sm:text-2xl font-bold text-gray-100">{formatNumber(timeLeft.seconds)}</span>
      </div>
    </div>
  );

  // UPDATED Product card component - Replace the existing ProductCard
  const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemQuantity, setCartItemQuantity] = useState(0);
// Check cart and wishlist status
   useEffect(() => {
    const cartItem = userCartItems.find(item => item.productId === product.id);
    if (cartItem) {
      setIsInCart(true);
      setCartItemQuantity(cartItem.quantity);
    } else {
      setIsInCart(false);
      setCartItemQuantity(0);
    }

    const wishlistItem = userWishlistItems.find(item => item.productId === product.id);
    setIsInWishlist(!!wishlistItem);
  }, [userCartItems, userWishlistItems, product.id]);

    // Check if product is in wishlist
    useEffect(() => {
      const checkWishlistStatus = async () => {
        if (!user || !product) return;

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const wishlist = userData.wishlist || [];
            setIsInWishlist(wishlist.some(item => item.productId === product.id));
          }
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      };

      checkWishlistStatus();
    }, [user, product]);

    // Close share menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (showShareMenu && !event.target.closest('.share-menu-container')) {
          setShowShareMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showShareMenu]);

    const handleViewDetails = () => {
      navigate(`/product/${product.id}`);
    };

    const handleAddToCart = async () => {
      setAddingToCart(true);
      await addToCart(product);
      setAddingToCart(false);
    };

    const handleWishlistToggle = async () => {
      if (!user) {
        alert('Please log in to add items to wishlist');
        return;
      }

      try {
        setAddingToWishlist(true);

        const wishlistItem = {
          productId: product.id,
          name: product.name,
          price: product.salePrice,
          image: product.image || '/api/placeholder/400/400',
          addedAt: new Date().toISOString()
        };

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            wishlist: [wishlistItem],
            createdAt: new Date().toISOString()
          });
          setIsInWishlist(true);
          alert('Product added to wishlist!');
        } else {
          const userData = userDoc.data();
          const currentWishlist = userData.wishlist || [];
          
          if (isInWishlist) {
            const updatedWishlist = currentWishlist.filter(item => item.productId !== product.id);
            await updateDoc(userDocRef, {
              wishlist: updatedWishlist
            });
            setIsInWishlist(false);
            alert('Product removed from wishlist!');
          } else {
            await updateDoc(userDocRef, {
              wishlist: arrayUnion(wishlistItem)
            });
            setIsInWishlist(true);
            alert('Product added to wishlist!');
          }
        }
      } catch (error) {
        console.error('Error updating wishlist:', error);
        alert('Failed to update wishlist. Please try again.');
      } finally {
        setAddingToWishlist(false);
      }
    };

    const handleShare = (e) => {
      e.stopPropagation();
      setShowShareMenu(!showShareMenu);
    };

    const handleQuickShare = async (e) => {
      e.stopPropagation();
      await shareProduct(product);
    };

    return (
      <div 
        className="min-w-[250px] sm:min-w-0 p-3 rounded-lg relative group bg-gray-800 hover:shadow-xl transition-shadow duration-300 border border-gray-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-gray-900 p-2 rounded-md relative">
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
            -{product.discount}%
          </div>
          
          {/* Action Buttons */}
          <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'} opacity-100 sm:opacity-0 group-hover:opacity-100`}>
            <button 
              onClick={handleWishlistToggle}
              disabled={addingToWishlist}
              className={`p-1.5 rounded-full shadow-md transition-colors ${
                isInWishlist 
                  ? 'bg-red-50 border border-red-200 hover:bg-red-100' 
                  : 'bg-gray-700 hover:bg-red-900/30 hover:text-red-500'
              } ${addingToWishlist ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {addingToWishlist ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Heart 
                  size={16} 
                  className={`${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
                />
              )}
            </button>
            
            <button
              onClick={handleViewDetails}
              className="p-1.5 bg-gray-700 hover:bg-blue-900/30 rounded-full shadow-md  hover:text-blue-500 transition-colors"
            >
              <Eye size={16} className="text-gray-500" />
            </button>

            {/* Share Button - Desktop */}
            <div className="hidden sm:block share-menu-container relative">
              <button
                onClick={handleShare}
                className="p-1.5 bg-gray-700 hover:bg-blue-900/30 rounded-full shadow-md  hover:text-green-500 transition-colors"
                title="Share product"
              >
                <Share2 size={16} className="text-gray-500" />
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 w-48 p-3">
  <h5 className="font-medium text-gray-100 mb-2 text-xs">Share Product</h5>
                  
                  <div className="space-y-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        shareToWhatsApp(product);
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle size={12} />
                      WhatsApp
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        shareToTwitter(product);
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors"
                    >
                      <Share2 size={12} />
                      Twitter
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        shareToFacebook(product);
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Share2 size={12} />
                      Facebook
                    </button>
                    
                    <button 
                      onClick={handleQuickShare}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      <Copy size={12} />
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Share Button - Mobile (Quick Share) */}
            <button
              onClick={handleQuickShare}
              className="sm:hidden p-1.5 bg-white rounded-full shadow-md hover:bg-green-50 hover:text-green-500 transition-colors"
              title="Share product"
            >
              <Share2 size={16} className="text-gray-500" />
            </button>
          </div>
          
          <div className="flex justify-center mb-4 cursor-pointer" onClick={handleViewDetails}>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-24 sm:h-32 w-24 sm:w-32 object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            ) : (
             <div className="h-24 sm:h-32 w-24 sm:w-32 bg-gray-700 rounded-lg flex items-center justify-center">
  <span className="text-gray-500 text-xs">No Image</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-3">
          <h3 className="font-medium text-xs sm:text-sm mb-1 line-clamp-2 h-10 text-gray-100">{product.name}</h3>
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-red-500 font-medium text-sm sm:text-base">₦{product.salePrice?.toLocaleString()}</span>
            <span className="text-gray-400 line-through text-xs sm:text-sm">₦{product.originalPrice?.toLocaleString()}</span>
          </div>
          <div className="flex justify-center items-center gap-2 mb-2">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-gray-400">({product.reviews})</span>
          </div>
          
          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="text-xs text-red-600 mb-2">Out of Stock</div>
          )}
          
          {/* Mobile Share Button */}
          <div className="sm:hidden mb-2">
            <button 
              onClick={handleQuickShare}
             className="w-full py-1.5 px-2 bg-gray-700 text-gray-200 rounded text-xs font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
            >
              <Share2 size={12} />
              Share
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <button 
  onClick={handleAddToCart}
  disabled={addingToCart || product.stock === 0}
  className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
    product.stock === 0
      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
      : addingToCart 
        ? 'bg-gray-600 text-white cursor-not-allowed' 
        : isInCart
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-red-500 text-white hover:bg-red-600'
  }`}
>
  {product.stock === 0 ? (
    'Out of Stock'
  ) : addingToCart ? (
    <div className="flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      {isInCart ? 'Updating...' : 'Adding...'}
    </div>
  ) : (
    <span>{isInCart ? `In Cart (${cartItemQuantity})` : 'Add To Cart'}</span>
  )}
</button>
        </div>
      </div>
    );
  };

   return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 overflow-hidden bg-gray-900">
      {/* Header Section */}
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-3 sm:w-5 h-8 sm:h-10 bg-red-500 rounded mr-2"></div>
       <h2 className="text-xl sm:text-2xl font-bold text-gray-100">Today's</h2>
      </div>

      {/* Title and Timer Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
  <h1 className="text-2xl sm:text-4xl font-bold text-gray-100">Flash Sales</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Timer Display */}
          <TimerDisplay />

          {/* Navigation Buttons */}
          <div className="flex gap-2 ml-auto sm:ml-0 hidden">
            <button 
              className="p-1 sm:p-2 border border-gray-700 rounded-full hover:bg-gray-800 text-gray-300"
              onClick={handlePrevious}
              aria-label="Previous products"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="p-1 sm:p-2 border border-gray-700 rounded-full hover:bg-gray-800 text-gray-300"
              onClick={handleNext}
              aria-label="Next products"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mr-2" />
          <span className="text-gray-300">Loading flash sales...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
  <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-400 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products Section - Only show if not loading and no error */}
      {!loading && !error && (
        <>
          {/* Products Section - Mobile Scrollable View */}
          <div className="sm:hidden overflow-x-auto pb-4 -mx-4 px-4" ref={productContainerRef}>
            <div className="flex gap-4 w-max">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Products Section - Desktop Grid View */}
          <div className="hidden sm:grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Empty State */}
          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔥</div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No flash sales available</h3>
<p className="text-gray-400">Check back later for amazing deals!</p>
            </div>
          )}

          {/* View All Button - Only show if products exist */}
          {products.length > 0 && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <button 
                onClick={() => navigate('/products')}
                className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded text-sm sm:text-base hover:bg-red-600"
              >
                View All Products
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
