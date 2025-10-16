import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../Components/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Share2, Copy, MessageCircle } from 'lucide-react';
import SmartWatch from '../assets/Images/SmartWatch.png'
import { toast } from 'react-toastify';

const SmartWatchPage = () => {
 const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHeroVisible, setIsHeroVisible] = useState(false)
  const [visibleProducts, setVisibleProducts] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const heroRef = useRef(null)
  const productsRef = useRef(null)


  const addToCart = async (product) => {
  if (!user) {
    toast.error('Please log in to add items to cart');
    return;
  }

  try {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/api/placeholder/400/400',
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      cart: arrayUnion(cartItem)
    }, { merge: true });

    toast.success('Product added to cart successfully!');
  } catch (error) {
    console.error('Error adding to cart:', error);
    toast.error('Failed to add product to cart. Please try again.');
  }
};

const addToWishlist = async (product) => {
  if (!user) {
    toast.error('Please log in to add items to wishlist');
    return;
  }

  try {
    const wishlistItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/api/placeholder/400/400',
      addedAt: new Date().toISOString()
    };

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      wishlist: arrayUnion(wishlistItem)
    }, { merge: true });

    toast.success('Product added to wishlist successfully!');
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    toast.error('Failed to add product to wishlist. Please try again.');
  }
};

const handleViewDetails = (productId) => {
  navigate(`/product/${productId}`);
};

  useEffect(() => {
    setIsHeroVisible(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (productsRef.current) {
        const rect = productsRef.current.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.8) {
          products.forEach((_, index) => {
            setTimeout(() => {
              setVisibleProducts(prev => [...new Set([...prev, index])])
            }, index * 150)
          })
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePosition({ x, y })
  }

  useEffect(() => {
  const fetchSmartWatches = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        const category = (data.category || '').toLowerCase();
        
        // Filter for smartwatch products
        if (category === 'smartwatch' || name.includes('smartwatch') || name.includes('watch')) {
          productsData.push({
            id: doc.id,
            name: data.name,
            originalPrice: data.originalPrice || data.price || 0,
            price: data.price || 0,
            rating: data.rating || 4.5,
            reviews: data.reviews || Math.floor(Math.random() * 100) + 10,
            image: data.images && data.images.length > 0 ? (data.images[0].data || data.images[0].url) : null,
            tag: data.tag || 'New',
            colors: data.colors || ['#000', '#fff', '#1e40af'],
            category: data.category,
            stock: data.stockQuantity || data.stock || 0,
            description: data.description
          });
        }
      });
      
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching smartwatches:', err);
      setError('Failed to load smartwatches');
    } finally {
      setLoading(false);
    }
  };

  fetchSmartWatches();
}, []);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });
  
  return () => unsubscribe();
}, []);

const generateProductUrl = (productId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/Exclusive_Eccomerce/product/${productId}`;
};

const shareProduct = async (product) => {
  const url = generateProductUrl(product.id);
  const shareData = {
    title: product.name,
    text: `Check out this amazing product: ${product.name} - $${product.price?.toLocaleString()}`,
    url: url,
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Product link copied to clipboard!');
      } catch (copyError) {
        toast.error('Unable to share. Please try again.');
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Product link copied to clipboard!');
    } catch (error) {
      toast.error('Unable to copy link. Please try again.');
    }
  }
};

const shareToWhatsApp = (product) => {
  const url = generateProductUrl(product.id);
  const message = `Check out this amazing product: ${product.name} - $${product.price?.toLocaleString()}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`;
  window.open(whatsappUrl, '_blank');
};

const shareToTwitter = (product) => {
  const url = generateProductUrl(product.id);
  const tweet = `Check out this product: ${product.name} - $${product.price?.toLocaleString()}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank');
};

const shareToFacebook = (product) => {
  const url = generateProductUrl(product.id);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank');
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

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

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
      toast.error('Please log in to add items to wishlist');
      return;
    }

    try {
      setAddingToWishlist(true);

      const wishlistItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
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
        toast.success('Product added to wishlist!');
      } else {
        const userData = userDoc.data();
        const currentWishlist = userData.wishlist || [];
        
        if (isInWishlist) {
          const updatedWishlist = currentWishlist.filter(item => item.productId !== product.id);
          await updateDoc(userDocRef, {
            wishlist: updatedWishlist
          });
          setIsInWishlist(false);
          toast.error('Product removed from wishlist!');
        } else {
          await updateDoc(userDocRef, {
            wishlist: arrayUnion(wishlistItem)
          });
          setIsInWishlist(true);
          toast.success('Product added to wishlist!');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist. Please try again.');
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

  // Calculate discount percentage
  const discountPercentage = product.originalPrice > 0 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative bg-gray-50 p-3 sm:p-4">
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md z-10">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Product Tag */}
        {product.tag && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-cyan-500 text-white text-xs font-medium px-2 py-1 rounded-md z-10">
            {product.tag}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className={`absolute top-12 right-2 sm:top-14 sm:right-3 flex flex-col gap-1 sm:gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-20 sm:opacity-20'} opacity-100 sm:opacity-20 group-hover:opacity-100`}>
          <button 
            onClick={handleWishlistToggle}
            disabled={addingToWishlist}
            className={`p-1.5 sm:p-2 rounded-full shadow-md transition-colors ${
              isInWishlist 
                ? 'bg-red-50 border border-red-200 hover:bg-red-100' 
                : 'bg-white hover:bg-red-50 hover:text-red-500'
            } ${addingToWishlist ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {addingToWishlist ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Heart 
                size={12} 
                className={`sm:w-4 sm:h-4 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
              />
            )}
          </button>
          
          <button
            onClick={handleViewDetails}
            className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-cyan-50 hover:text-cyan-500 transition-colors"
          >
            <Eye size={12} className="sm:w-4 sm:h-4 text-gray-600" />
          </button>

          {/* Share Button - Desktop */}
          <div className="hidden sm:block share-menu-container relative">
            <button
              onClick={handleShare}
              className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-green-50 hover:text-green-500 transition-colors"
              title="Share product"
            >
              <Share2 size={12} className="sm:w-4 sm:h-4 text-gray-600" />
            </button>

            {/* Share Menu */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48 p-3">
                <h5 className="font-medium text-gray-700 mb-2 text-xs">Share Product</h5>
                
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
            <Share2 size={12} className="text-gray-600" />
          </button>
        </div>
        
        {/* Product Image */}
        <div className="flex justify-center items-center h-32 sm:h-40 md:h-48 cursor-pointer" onClick={handleViewDetails}>
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className='w-12 h-12 sm:w-16 sm:h-16 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-3 sm:p-4 bg-gray-500">
        <h3 className="font-medium text-sm sm:text-base mb-2 line-clamp-2 text-gray-800 group-hover:text-cyan-600 leading-tight transition-colors">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          <RatingStars rating={Math.floor(product.rating)} />
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-cyan-500 font-bold text-lg sm:text-xl">${product.price?.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-gray-400 line-through text-sm">${product.originalPrice?.toLocaleString()}</span>
              <span className="text-xs font-semibold text-green-500">
                {discountPercentage}% OFF
              </span>
            </>
          )}
        </div>
        
        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="text-xs text-red-600 mb-2 font-medium">Out of Stock</div>
        )}
        
        {/* Action Buttons - Mobile Bottom Actions */}
        <div className="sm:hidden flex gap-2 mb-2">
          <button 
            onClick={handleQuickShare}
            className="flex-1 py-1.5 px-2 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
          >
            <Share2 size={12} />
            Share
          </button>
        </div>
        
        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={addingToCart || product.stock === 0}
          className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
            product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : addingToCart 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          {product.stock === 0 ? (
            'Out of Stock'
          ) : addingToCart ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Adding...</span>
              <span className="sm:hidden">...</span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart size={16} />
              Add To Cart
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

  return (
    <div className='min-h-screen '>
      {/* Hero Section */}
      <div ref={heroRef} className=' mx-auto bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 w-full overflow-hidden shadow-2xl mb-8'>
        <div 
          className='md:flex justify-center items-center p-6 sm:p-8 md:p-10 lg:p-12 relative'
          onMouseMove={handleMouseMove}
          style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          {/* Animated background elements */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div 
              className='absolute w-64 h-64 bg-cyan-400 rounded-full blur-3xl opacity-20 animate-pulse'
              style={{
                top: '20%',
                left: '10%',
                animation: 'float 6s ease-in-out infinite'
              }}
            ></div>
            <div 
              className='absolute w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-10'
              style={{
                bottom: '10%',
                right: '10%',
                animation: 'float 8s ease-in-out infinite reverse'
              }}
            ></div>
          </div>

          {/* Text content */}
          <div 
            className={`flex-1 text-white relative z-10 mb-8 md:mb-0 transform transition-all duration-1000 ${
              isHeroVisible ? 'translate-x-0 opacity-100' : '-translate-x-full '
            }`}
          >
            <div className='mb-8'>
              <h4 
                className='font-semibold text-cyan-400 mb-4 sm:mb-6 text-sm sm:text-base animate-pulse'
                style={{
                  textShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
                }}
              >
                Wearable Tech Collection
              </h4>
              <h2 
                className='font-bold text-3xl sm:text-4xl lg:text-5xl mb-6 sm:mb-8 leading-tight'
                style={{
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                }}
              >
                Track Your <br /> 
                <span className='text-cyan-400 inline-block transform hover:scale-110 transition-transform duration-300'>
                  Fitness Journey
                </span>
              </h2>
              <p className='text-gray-300 mb-8 text-sm sm:text-base'>
                Discover the latest smartwatches with cutting-edge technology, 
                health monitoring, and premium designs.
              </p>
            </div>

            {/* Stats counter animation */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
              {[
                { value: '7+', label: 'Days Battery' },
                { value: '50M', label: 'Water Resist' },
                { value: '100+', label: 'Sport Modes' },
                { value: '24/7', label: 'Heart Monitor' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className='bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/20'
                  style={{
                    animation: `slideUp 0.6s ease-out ${i * 0.1}s backwards`
                  }}
                >
                  <div className='text-xl sm:text-2xl font-bold text-cyan-400'>{stat.value}</div>
                  <div className='text-xs sm:text-sm opacity-75'>{stat.label}</div>
                </div>
              ))}
            </div>
            
            <button 
              className='font-semibold px-6 sm:px-8 py-3 sm:py-4 bg-cyan-400 hover:bg-cyan-500 cursor-pointer rounded-lg text-black transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/50 active:scale-95 text-sm sm:text-base'
              style={{
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)'
              }}
            >
              Explore Collection
            </button>
          </div>

          {/* SmartWatch Image with 3D effect */}
          <div 
            className={`flex-1 relative z-10 transform transition-all duration-1000 ${
              isHeroVisible ? 'translate-x-0 opacity-100' : 'translate-x-full '
            }`}
          >
            <div 
              className='relative transform hover:scale-105 transition-all duration-500'
              style={{
                animation: 'float 3s ease-in-out infinite',
                transform: `translateZ(50px) rotateY(${mousePosition.x * -10}deg) rotateX(${mousePosition.y * 10}deg)`,
                filter: 'drop-shadow(0 20px 40px rgba(34, 211, 238, 0.3))'
              }}
            >
              {/* SmartWatch Placeholder */}
              <div className='w-full relative aspect-square flex items-center justify-center'>
                {/* <div className='w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl'>
                  <div className='absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-transparent animate-pulse'></div>
                  <div className='w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full flex items-center justify-center border-8 border-cyan-400/30'>
                    <svg className='w-16 h-16 sm:w-24 sm:h-24 text-cyan-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div> */}
                  <div 
                          className={`flex-1 relative z-10 transform transition-all duration-1000 `}
                        >
                          <div 
                            className='relative transform hover:scale-105 transition-all duration-500'
                            style={{
                              animation: 'float 3s ease-in-out infinite',
                              transform: `translateZ(50px) rotateY(${mousePosition.x * -10}deg) rotateX(${mousePosition.y * 10}deg)`,
                              filter: 'drop-shadow(0 20px 40px rgba(34, 211, 238, 0.3))'
                            }}
                          >
                            {/* SmartWatch Image */}
                            <div className='w-full relative'>
                              <img 
                                src={SmartWatch} 
                                alt="Smart Watch" 
                                className='w-full h-auto object-contain'
                              />
                              {/* Animated circles behind watch */}
                              <div className='absolute inset-0 flex items-center justify-center -z-10'>
                                <div className='w-full h-full border-4 border-cyan-400/20 rounded-full animate-ping'></div>
                                <div className='absolute w-3/4 h-3/4 border-4 border-cyan-400/40 rounded-full animate-pulse'></div>
                              </div>
                            </div>
                          </div>
                        </div>
                
            
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
   <div ref={productsRef} className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
  {/* <div className='mb-12'>
    <div className="flex items-center mb-6">
      <div className="w-4 h-10 bg-cyan-500 rounded mr-2"></div>
      <h2 className="text-md font-bold text-cyan-500">Our Products</h2>
    </div>
    <h1 className="text-3xl sm:text-4xl font-bold mb-4">Premium SmartWatches</h1>
    <p className='text-gray-600'>Explore our curated collection of the best smartwatches</p>
  </div> */}
{/* Loading State */}
  {loading && (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mr-2" />
      <span className="text-gray-600">Loading smartwatches...</span>
    </div>
  )}

  {/* Error State */}
  {error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p className="text-red-600">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 text-red-600 underline hover:no-underline"
      >
        Retry
      </button>
    </div>
  )}

  {/* Products Grid using ProductCard component */}
  {!loading && !error && products.length > 0 && (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
      {products.map((product, index) => (
        <div
          key={product.id}
          className={`transform transition-all duration-700 ${
            visibleProducts.includes(index) ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-100'
          }`}
          style={{
            transitionDelay: visibleProducts.includes(index) ? '0ms' : `${index * 150}ms`
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )}
{/* Empty State */}
{!loading && !error && products.length === 0 && (
  <div className="text-center py-12">
    <div className="text-gray-400 text-6xl mb-4">⌚</div>
    <h3 className="text-xl font-medium text-gray-600 mb-2">No Smartwatches Found</h3>
    <p className="text-gray-500">Check back later for new products</p>
  </div>
)}
      </div>
 {/* 
  Move the following CSS to your main CSS file (e.g., App.css or index.css):

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
*/}
    </div>
  )
}

export default SmartWatchPage