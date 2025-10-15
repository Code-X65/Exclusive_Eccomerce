import { useState, useEffect, useRef, useMemo } from 'react';
import { Heart, Eye, Phone, Watch, Tablet, Gamepad2, Speaker, Laptop, Refrigerator, Star, Filter, X, Grid3x3, List, Upload } from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../Components/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { Share2, Copy, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategoryPage = () => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [selectedCategory, setSelectedCategory] = useState('smartphone');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');


const navigate = useNavigate();  
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFor, setUploadingFor] = useState('');
  const [userCartItems, setUserCartItems] = useState([]);
const [userWishlistItems, setUserWishlistItems] = useState([]);
  const fileInputRef = useRef(null);

  const categoryHierarchy = {
    smartphone: {
      label: 'SmartPhones',
      subcategories: {
        iphone_17: "iPhone 17 series",
        iphone_16: "iPhone 16 series",
        iphone_15: "iPhone 15 series",
        iphone_14: "iPhone 14 series",
        iphone_13: "iPhone 13 series",
        iphone_12: "iPhone 12 series",
        iphone_11: "iPhone 11 series",
        samsung: "Samsung",
        tecno: "Tecno", 
        itel: "Itel",
        infinix: "Infinix",
        redmi: "Redmi",
        oppo: "Oppo"
      }
    },
    smartwatch: {
      label: 'Smartwatches',
      subcategories: {
        iwatch: "iWatch",
        android: "Android"
      }
    },
    tablet: {
      label: 'Tablets',
      subcategories: {
        ipad: "iPad",
        android: "Android"
      }
    },
    game: {
      label: 'Games',
      subcategories: {
        playstation: "Play Station",
        xbox: "Xbox",
        nintendo_switch: "Nintendo Switch",
        game_disc: "Game Disc",
        gaming_headsets: "Gaming Headsets"
      }
    },
    sound: {
      label: 'Sounds',
      subcategories: {
        boombox: "Boombox",
        earbuds: "Earbuds",
        headphones: "Headphones",
        portable_speakers: "Portable Speakers",
        bluetooth_speakers: "Bluetooth Speakers",
        microphones: "Microphones"
      }
    },
    laptop: {
      label: 'Laptop',
      subcategories: {
        macbook: "Mac Book",
        windows: "Windows"
      }
    },
    home_appliance: {
      label: 'Home Appliances',
      subcategories: {
        kitchen: "Kitchen Appliances",
        home: "Home Appliances",
        power: "Power Appliances",
        entertainment: "Entertainment Appliances"
      }
    }
  };

  const categoryImages = {
    smartphone: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
      'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExODFzd2RhMmNkYXd6aHl3YWpmbWlsaDh1dHU4ejZ4OGtibGZpajhlcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lRdYpyYmtvUjqrqkhL/giphy.gif'
    ],
    smartwatch: [
      'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExemh0eTl6ams1cngyOTVxbTVhbm14NzloeXY0cThmemFpejJrZXA1eCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ScHXTFTxkA5YA/200.webp',
      'https://media2.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bnNiZnppMTMwd2p5dXU2ZzAycnN6dnFtZXNpMmUzMGVrdGk1dGxwaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/JszoCjVjkHeCuHxGoL/giphy.webp'
    ],
    tablet: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1200'
    ],
    game: [
      'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=1200',
      'https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=1200'
    ],
    sound: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200'
    ],
    laptop: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200'
    ],
    home_appliance: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=1200',
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200'
    ]
  };

  const heroTextRef = useRef(null);
  const heroImageRef = useRef(null);
const BrowserCategory = [
  { 
    icon: <Phone />, 
    title: "smartphone",  // changed from smartphones
    heroTitle: "Latest Smartphones",
    heroDescription: "Discover cutting-edge technology in the palm of your hand",
  },
  { 
    icon: <Watch />, 
    title: "smartwatch",  // changed from smartwatches
    heroTitle: "Smart Wearables",
    heroDescription: "Track your fitness and stay connected on the go",
  },
  { 
    icon: <Tablet />, 
    title: "tablet",  // changed from tablets
    heroTitle: "Powerful Tablets",
    heroDescription: "Portable performance for work and entertainment",
  },
  { 
    icon: <Gamepad2 />, 
    title: "game",  // changed from games
    heroTitle: "Gaming Consoles",
    heroDescription: "Experience next-gen gaming like never before",
  },
  { 
    icon: <Speaker />, 
    title: "sound",  // changed from sounds
    heroTitle: "Premium Audio",
    heroDescription: "Immerse yourself in crystal-clear sound quality",
  },
  { 
    icon: <Laptop />, 
    title: "laptop",  // keep as is
    heroTitle: "High-Performance Laptops",
    heroDescription: "Power through your work with cutting-edge machines",
  },
  { 
    icon: <Refrigerator />, 
    title: "home_appliance",  // changed from home_appliances
    heroTitle: "Smart Home Appliances",
    heroDescription: "Upgrade your home with intelligent technology",
  },
];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const generateProductUrl = (productId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/product/${productId}`;
};

const shareProduct = async (product) => {
  const url = generateProductUrl(product.id);
  const shareData = {
    title: product.name,
    text: `Check out this amazing product: ${product.name} - ₦${product.price?.toLocaleString()}`,
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
  const message = `Check out this amazing product: ${product.name} - ₦${product.price?.toLocaleString()}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`;
  window.open(whatsappUrl, '_blank');
};

const shareToTwitter = (product) => {
  const url = generateProductUrl(product.id);
  const tweet = `Check out this product: ${product.name} - ₦${product.price?.toLocaleString()}`;
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
            category: data.category,
            subcategory: data.subcategory,
            price: data.price || 0,
            brand: data.brand || 'Unknown',
            rating: data.rating || 5,
            reviews: data.reviews || Math.floor(Math.random() * 100) + 10,
            image: data.images && data.images.length > 0 ? (data.images[0].data || data.images[0].url) : "📱",
            discount: data.discount || 0
          });
        });
        
        setProducts(productsData);
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

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Image rotation effect - cycles through 2 images every 5 seconds
  useEffect(() => {
    const images = categoryImages[selectedCategory] || [];
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [selectedCategory]);

  // Reset image index and subcategory when category changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setSelectedSubcategory('all');
  }, [selectedCategory]);

  useEffect(() => {
    // Background image animation - starts first
    if (heroImageRef.current) {
      heroImageRef.current.style.opacity = '0';
      setTimeout(() => {
        heroImageRef.current.style.transition = 'opacity 1s ease-in-out';
        heroImageRef.current.style.opacity = '1';
      }, 100);
    }

    // Animation for hero text - starts after background
    if (heroTextRef.current) {
      const elements = heroTextRef.current.children;
      
      // Fade out
      Array.from(elements).forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-30px)';
      });

      // Fade in with stagger - delayed to sync with background
      setTimeout(() => {
        Array.from(elements).forEach((el, index) => {
          setTimeout(() => {
            el.style.transition = 'all 0.7s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
          }, index * 150);
        });
      }, 400);
    }
  }, [selectedCategory, currentImageIndex]);

  const handleFileUpload = (e, category) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const imageUrls = files.slice(0, 2).map(file => URL.createObjectURL(file));
      // Note: You'll need to implement setCategoryImages if you want this feature
      console.log('Images uploaded for', category, imageUrls);
    }
    setShowUploadModal(false);
  };

  const openUploadModal = (category) => {
    setUploadingFor(category);
    setShowUploadModal(true);
  };



  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const currentCategory = BrowserCategory.find(cat => cat.title === selectedCategory);
  const currentImages = categoryImages[selectedCategory] || [];
  const hasImages = currentImages.length > 0;

 const filteredProducts = products.filter(product => {
  // Category filter
  if (product.category !== selectedCategory) return false;
  
  // Subcategory filter
  if (selectedSubcategory !== 'all' && product.subcategory !== selectedSubcategory) return false;
  
  return true;
});

 const sortedProducts = filteredProducts;

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
        image: product.image || '📱',
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
      className="bg-gray-800 rounded-lg overflow-hidden group hover:shadow-xl hover:shadow-red-500/20 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-gray-700 flex items-center justify-center h-64">
        <div className="flex justify-center items-center h-40 md:h-56 cursor-pointer" onClick={handleViewDetails}>
    {product.image ? (
      <img 
        src={product.image} 
        alt={product.name} 
        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
      />
    ) : (
      <div className="w-24 h-24 bg-gray-600 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-sm">No Image</span>
      </div>
    )}
  </div>
        
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            -{product.discount}%
          </div>
        )}
        
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={handleWishlistToggle}
            disabled={addingToWishlist}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isInWishlist 
                ? 'bg-red-50 border border-red-200 hover:bg-red-100' 
                : 'bg-white hover:bg-red-50 hover:text-red-500'
            } ${addingToWishlist ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {addingToWishlist ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Heart 
                size={18} 
                fill={isInWishlist ? 'currentColor' : 'none'}
                className={isInWishlist ? 'text-red-500' : 'text-gray-600'}
              />
            )}
          </button>
          
          <button
            onClick={handleViewDetails}
            className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 hover:text-blue-500 transition-colors"
          >
            <Eye size={18} />
          </button>

          <div className="share-menu-container relative">
            <button
              onClick={handleShare}
              className="p-2 bg-white rounded-full shadow-md hover:bg-green-50 hover:text-green-500 transition-colors"
            >
              <Share2 size={18} />
            </button>

            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg z-50 w-48 p-3">
                <h5 className="font-medium text-gray-800 mb-2 text-xs">Share Product</h5>
                
                <div className="space-y-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      shareToWhatsApp(product);
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600"
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
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-blue-400 text-white rounded hover:bg-blue-500"
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
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Share2 size={12} />
                    Facebook
                  </button>
                  
                  <button 
                    onClick={handleQuickShare}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    <Copy size={12} />
                    Copy Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button 
            onClick={handleViewDetails}
            className="p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
          >
            <Eye size={20} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-white">{product.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.floor(product.rating) ? '#fbbf24' : 'none'}
                className="text-yellow-400"
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">({product.reviews})</span>
        </div>
        <p className="text-sm text-gray-400 mb-2">{product.brand}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-500 font-bold text-xl">
            ₦{product.salePrice?.toLocaleString()}
          </span>
          {product.discount > 0 && (
            <span className="text-gray-500 line-through">₦{product.originalPrice?.toLocaleString()}</span>
          )}
        </div>
        
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <div 
        ref={heroImageRef}
        className="relative md:min-h-[700px] bg-gray-900 transition-all duration-700 overflow-hidden"
        style={{
          backgroundImage: hasImages ? `url(${currentImages[currentImageIndex]})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
       
          {/* Hero Text Content - Hidden on mobile */}
          <div ref={heroTextRef} className="mb-12 sm:mb-16 max-w-2xl sm:block">
            <div className="inline-block px-4 py-2 bg-red-500 rounded-full text-sm font-semibold mb-4">
              EXPLORE NOW
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
              {currentCategory?.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 mb-8 drop-shadow-lg">
              {currentCategory?.heroDescription}
            </p>
            <button className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-105">
              Shop Now
            </button>
          </div>

          {/* Category Icons - Right side on mobile, left side on desktop */}
          <div className="fixed sm:static right-2 top-1/2 -translate-y-1/2 sm:translate-y-0 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start z-20">
            {BrowserCategory.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.title)}
                className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-6 rounded-xl transition-all transform hover:scale-110 backdrop-blur-sm ${
                  selectedCategory === category.title 
                    ? 'bg-white text-black shadow-2xl scale-110' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="text-xl sm:text-3xl">{category.icon}</div>
                <div className="text-[10px] sm:text-sm font-medium text-center whitespace-nowrap hidden sm:block">
                  {categoryHierarchy[category.title]?.label || category.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Upload Images for {categoryHierarchy[uploadingFor]?.label}</h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-400 mb-6">
              Select 2 images that will rotate every 5 seconds for the {categoryHierarchy[uploadingFor]?.label} category.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, uploadingFor)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-6 py-4 bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-3"
            >
              <Upload size={24} />
              <span className="font-semibold">Choose Images (Max 2)</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mr-2" />
          <span className="text-white">Loading products...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-400 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products Section */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Subcategories Pills */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <button
                onClick={() => setSelectedSubcategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedSubcategory === 'all'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All {categoryHierarchy[selectedCategory]?.label}
              </button>
              {categoryHierarchy[selectedCategory]?.subcategories && 
                Object.entries(categoryHierarchy[selectedCategory].subcategories).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSubcategory(key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedSubcategory === key
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))
              }
            </div>
          </div>


          <div>
        

            {/* Products Grid */}
           {/* Products Grid */}
<div className="flex-1">
  <div className="mb-4">
    <p className="text-gray-400">
      Showing {sortedProducts.length} products in {categoryHierarchy[selectedCategory]?.label}
      {selectedSubcategory !== 'all' && ` > ${categoryHierarchy[selectedCategory]?.subcategories[selectedSubcategory]}`}
    </p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {sortedProducts.map(product => (
      <ProductCard 
        key={product.id} 
        product={{
          ...product,
          salePrice: product.discount > 0 
            ? (product.price * (1 - product.discount / 100))
            : product.price,
          originalPrice: product.price,
          stock: 100 // default stock since not in your data
        }} 
      />
    ))}
  </div>

  {sortedProducts.length === 0 && (
    <div className="text-center py-16">
      <p className="text-gray-400 text-lg">No products found matching your filters.</p>
    </div>
  )}
</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;