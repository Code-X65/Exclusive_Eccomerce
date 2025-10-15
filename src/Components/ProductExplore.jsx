import { useState, useEffect, useRef,} from 'react';
import { Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { useLocation, useParams } from 'react-router-dom';
import { Loader2, Share2, Copy, MessageCircle, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { db, auth } from './firebase';

export default function ProductExplore() {
  const navigate = useNavigate();
const { category: categoryParam } = useParams();
  const [selectedCategory, setSelectedCategory] = useState('All')
const [selectedPriceRange, setSelectedPriceRange] = useState('All');
const [sidebarOpen, setSidebarOpen] = useState(false);
const [cartItems, setCartItems] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [shuffledProducts, setShuffledProducts] = useState([]);
const productsPerPage = 16;
const location = useLocation();
const [searchQuery, setSearchQuery] = useState('');
const [originalProducts, setOriginalProducts] = useState([]);
const [userCartItems, setUserCartItems] = useState([]);
const [userWishlistItems, setUserWishlistItems] = useState([]);
const categories = [
  'All',
  'Smartphone',
  'Gaming',
  'Electronics',
  'Furniture',
  'Accessories',
  'Monitors',
  'Keyboards'
];

const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: '$0 - $100', min: 0, max: 100 },
  { label: '$100 - $300', min: 100, max: 300 },
  { label: '$300 - $500', min: 300, max: 500 },
  { label: '$500+', min: 500, max: Infinity }
];

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
const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

const filteredProducts = shuffledProducts.filter(product => {
  // Search query filter
  if (searchQuery && searchQuery.trim()) {
    const searchTerm = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm);
    
    if (!matchesSearch) return false;
  }
  
  // Category filter
  const categoryMatch = selectedCategory === 'All' || 
    (selectedCategory === 'Gaming' && (product.name?.includes('Gamepad') || product.name?.includes('Gaming') || product.category === 'gaming')) || 
    (selectedCategory === 'Smartphone' && (product.name?.includes('Gamepad') || product.name?.includes('Smartphone') || product.category === 'smartphone'))
     ||
    (selectedCategory === 'Electronics' && (product.name?.includes('Keyboard') || product.name?.includes('Monitor') || product.category === 'smartphone' || product.category === 'accessory')) ||
    (selectedCategory === 'Furniture' && product.name?.includes('Chair')) ||
    (selectedCategory === 'Accessories' && (product.name?.includes('Gamepad') || product.name?.includes('Keyboard') || product.category === 'accessory')) ||
    (selectedCategory === 'Monitors' && product.name?.includes('Monitor')) ||
    (selectedCategory === 'Keyboards' && product.name?.includes('Keyboard'));
  
  // Price filter
  const priceRange = priceRanges.find(range => range.label === selectedPriceRange);
  const priceMatch = product.salePrice >= priceRange.min && product.salePrice <= priceRange.max;
  
  return categoryMatch && priceMatch;
});   
const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
const startIndex = (currentPage - 1) * productsPerPage;
const endIndex = startIndex + productsPerPage;
const currentProducts = filteredProducts.slice(startIndex, endIndex);

const generateProductUrl = (productId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/Exclusive_Eccomerce/product/${productId}`;
};

const shareProduct = async (product) => {
  const url = generateProductUrl(product.id);
  const shareData = {
    title: product.name,
    text: `Check out this amazing product: 
     ${product.name} - ₦${product.salePrice?.toLocaleString()}`,
    url: url,
  };

  // Check if Web Share API is supported (mobile devices)
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      console.log('Error sharing:', error);
      // Fall back to copying link
      try {
        await navigator.clipboard.writeText(url);
        alert('Product link copied to clipboard!');
      } catch (copyError) {
        alert('Unable to share. Please try again.');
      }
    }
  } else {
    // Fallback for desktop - copy to clipboard
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


const goToNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};

const goToPrevPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};

const goToPage = (page) => {
  setCurrentPage(page);
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
          price: product.salePrice,
          image: product.image || '/api/placeholder/400/400',
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
    
    // Use setDoc with merge to create document if it doesn't exist
    await setDoc(userDocRef, {
      wishlist: arrayUnion(wishlistItem)
    }, { merge: true });

    alert('Product added to wishlist successfully!');
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    alert('Failed to add product to wishlist. Please try again.');
  }
};
const handleSearch = (query) => {
  if (!query || !query.trim()) {
    setProducts(originalProducts);
    setShuffledProducts(shuffleArray(originalProducts));
    return;
  }

  const searchTerm = query.toLowerCase().trim();
  const filtered = originalProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description?.toLowerCase().includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm)
  );
  
  setProducts(filtered);
  setShuffledProducts(filtered);
  setCurrentPage(1); // Reset to first page for search results
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Sidebar = () => (
  <div className={`fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:sticky lg:top-20 lg:translate-x-0 lg:block lg:h-screen lg:overflow-y-auto z-50`}>
    <div className="p-4 h-full overflow-y-auto lg:max-h-[calc(100vh-5rem)]">
      {/* Close button for mobile */}
      <div className="lg:hidden flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="p-2 hover:bg-gray-800 rounded text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-white">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
    <button
  key={category}
  onClick={() => {
    setSelectedCategory(category);
    setSidebarOpen(false);
    // Navigate to category route
    if (category === 'All') {
      navigate('/products');
    } else {
      navigate(`/products/${category.toLowerCase()}`);
    }
  }}
  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
    selectedCategory === category 
      ? 'bg-red-500 text-white' 
      : 'text-gray-300 hover:bg-gray-800'
  }`}
>
  {category}
</button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-white">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map(range => (
            <button
  key={range.label}
  onClick={() => {
    setSelectedPriceRange(range.label);
    setSidebarOpen(false);
    // Update URL
    const params = new URLSearchParams(location.search);
    if (range.label === 'All') {
      params.delete('price');
    } else {
      params.set('price', range.label);
    }
    navigate(`?${params.toString()}`, { replace: true });
  }}
  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
    selectedPriceRange === range.label 
      ? 'bg-red-500 text-white' 
      : 'text-gray-300 hover:bg-gray-800'
  }`}
>
  {range.label}
</button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

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
      
      setOriginalProducts(productsData);
      setProducts(productsData);
      setShuffledProducts(shuffleArray(productsData));
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
  const urlParams = new URLSearchParams(location.search);
  const search = urlParams.get('search');
  
  if (search) {
    setSearchQuery(search);
    handleSearch(search);
  } else {
    setSearchQuery('');
    // Reset to original products when no search
    setProducts(originalProducts);
    setShuffledProducts(shuffleArray(originalProducts));
  }
}, [location.search, originalProducts]);
  // Check for mobile/desktop view
  useEffect(() => {
    const checkWindowSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkWindowSize();
    window.addEventListener('resize', checkWindowSize);
    
    return () => window.removeEventListener('resize', checkWindowSize);
  }, []);

  useEffect(() => {
  setCurrentPage(1);
}, [selectedCategory, selectedPriceRange]);

useEffect(() => {
  setShuffledProducts(shuffleArray(products));
}, []);

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
          originalPrice: data.price ? data.price * 1.2 : 0, // Simulate original price as 20% higher
          salePrice: data.price || 0,
          discount: 20, // Default discount
          image: data.images && data.images.length > 0 ? (data.images[0].data || data.images[0].url) : null,
          rating: 5, // Default rating
          reviews: Math.floor(Math.random() * 100) + 10, // Random reviews
          category: data.category,
          stock: data.stockQuantity || data.stock || 0,
          description: data.description
        });
      });
      
      setProducts(productsData);
      setShuffledProducts(shuffleArray(productsData));
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

// Sync category from URL params
useEffect(() => {
  if (categoryParam) {
    const formattedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1).toLowerCase();
    setSelectedCategory(formattedCategory);
  } else {
    setSelectedCategory('All');
  }
}, [categoryParam]);

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
      // For mobile, just scroll the container
      if (productContainerRef.current) {
        productContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
      }
    } else {
      // For desktop grid view, update visible range
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
      // For mobile, just scroll the container
      if (productContainerRef.current) {
        productContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
      }
    } else {
      // For desktop grid view, update visible range
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
        <span className="text-xs text-gray-500">Days</span>
        <span className="text-lg sm:text-2xl font-bold">{formatNumber(timeLeft.days)}</span>
      </div>
      <span className="text-lg sm:text-2xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500">Hours</span>
        <span className="text-lg sm:text-2xl font-bold">{formatNumber(timeLeft.hours)}</span>
      </div>
      <span className="text-lg sm:text-2xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500">Minutes</span>
        <span className="text-lg sm:text-2xl font-bold">{formatNumber(timeLeft.minutes)}</span>
      </div>
      <span className="text-lg sm:text-2xl font-bold">:</span>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-500">Seconds</span>
        <span className="text-lg sm:text-2xl font-bold">{formatNumber(timeLeft.seconds)}</span>
      </div>
    </div>
  );

  // Product card component
const ProductCard = ({ product }) => {
const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [cartItemQuantity, setCartItemQuantity] = useState(0);

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
        // Create user document with wishlist
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
          // Remove from wishlist
          const updatedWishlist = currentWishlist.filter(item => item.productId !== product.id);
          await updateDoc(userDocRef, {
            wishlist: updatedWishlist
          });
          setIsInWishlist(false);
          alert('Product removed from wishlist!');
        } else {
          // Add to wishlist
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
     className="bg-gray-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-800 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative bg-gray-800 p-3 sm:p-4">
        {/* Discount Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md z-10">
          -{product.discount}%
        </div>
        
        {/* Action Buttons */}
        <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 sm:gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'} opacity-100 sm:opacity-0 group-hover:opacity-100`}>
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
            className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-blue-50 hover:text-blue-500 transition-colors"
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
              <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 w-48 p-3">
                <h5 className="font-medium text-gray-200 mb-2 text-xs">Share Product</h5>
                
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
        <div className="flex justify-center items-center h-20 sm:h-32 md:h-40 cursor-pointer" onClick={handleViewDetails}>
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-2 sm:p-4 bg-gray-900">
        <h3 className="font-medium text-xs sm:text-sm md:text-base mb-1 sm:mb-2 line-clamp-2 h-8 sm:h-10 text-gray-200 group-hover:text-white leading-tight">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          <span className="text-red-500 font-bold text-sm sm:text-base md:text-lg">₦{product.salePrice?.toLocaleString()}</span>
          <span className="text-gray-400 line-through text-xs sm:text-sm">₦{product.originalPrice?.toLocaleString()}</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        
        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="text-xs text-red-600 mb-2">Out of Stock</div>
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
  className={`w-full py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${
    product.stock === 0
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
      : addingToCart 
        ? 'bg-gray-400 text-white cursor-not-allowed' 
        : isInCart
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-black text-white hover:bg-red-500 hover:shadow-md transform hover:-translate-y-0.5'
  }`}
>
  {product.stock === 0 ? (
    'Out of Stock'
  ) : addingToCart ? (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span className="hidden sm:inline">{isInCart ? 'Updating...' : 'Adding...'}</span>
      <span className="sm:hidden">...</span>
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
   <div className="flex min-h-screen bg-gray-950">
    {/* Sidebar */}
    <Sidebar />
    
    {/* Overlay for mobile */}
    {sidebarOpen && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    {/* Main Content */}
    <div className="flex-1 lg:ml-0">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
    {/* Header Section */}
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
  <div className="flex items-center w-full sm:w-auto">
    <button 
      className="lg:hidden p-2 mr-2 hover:bg-gray-800 rounded text-white"
      onClick={() => setSidebarOpen(true)}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <div className="w-3 sm:w-5 h-8 sm:h-10 bg-red-500 rounded mr-2"></div>
    <h2 className="text-lg sm:text-xl font-bold text-white">Products</h2>
  </div>
  
  {/* Results Count */}
  <div className="text-xs sm:text-sm text-gray-400 w-full sm:w-auto">
    Showing {filteredProducts.length} of {searchQuery ? shuffledProducts.length : products.length} products
    {searchQuery && <span className="ml-2 text-red-400">• Search: "{searchQuery}"</span>}
  </div>
</div>

        {/* Loading State */}
      {loading && (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-red-500 mr-2" />
    <span className="text-gray-300 text-sm sm:text-base">Loading products...</span>
  </div>
)}

{/* Error States */}
      {error && (
  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 sm:p-4 mb-6">
    <p className="text-red-400 text-sm sm:text-base">{error}</p>
    <button 
      onClick={() => window.location.reload()}
      className="mt-2 text-red-400 underline hover:no-underline text-sm"
    >
      Retry
    </button>
  </div>
)}

        {/* Rest of your existing JSX content... */}
        {!loading && !error && (
          <>
            {/* Title Section */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
  <div>
    <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2 text-white">
      {searchQuery ? `Search Results for "${searchQuery}"` : 'Explore Our Products'}
    </h1>
    {searchQuery && (
      <p className="text-gray-400 text-sm sm:text-base">
        Found {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
      </p>
    )}
    {selectedCategory !== 'All' && (
      <p className="text-gray-400 text-sm sm:text-base">Category: <span className="font-medium text-red-400">{selectedCategory}</span></p>
    )}
  </div>
  
  {searchQuery && (
    <button
      onClick={() => {
        setSearchQuery('');
        window.history.pushState({}, '', window.location.pathname);
        setProducts(originalProducts);
        setShuffledProducts(shuffleArray(originalProducts));
      }}
      className="px-3 py-2 sm:px-4 text-sm sm:text-base bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
    >
      Clear Search
    </button>
  )}
</div>

            {/* Products Section - Mobile Scrollable View */}
           <div className="sm:hidden pb-4">
  <div className="flex flex-col gap-3">
    {currentProducts.map((product) =>  (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
</div>

          {/* Products Section - Desktop Grid View */}
<div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
  {currentProducts.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

           {/* Empty State */}
{filteredProducts.length === 0 && (
  <div className="text-center py-8 sm:py-12">
    <div className="text-gray-600 text-4xl sm:text-6xl mb-4">📦</div>
    <h3 className="text-lg sm:text-xl font-medium text-gray-300 mb-2">
      {searchQuery ? `No results found for "${searchQuery}"` : 'No products found'}
    </h3>
    <p className="text-gray-500 text-sm sm:text-base px-4">
      {searchQuery 
        ? 'Try searching with different keywords or check your spelling' 
        : 'Try adjusting your filters to see more results'
      }
    </p>
    {searchQuery && (
      <button
        onClick={() => {
          setSearchQuery('');
          window.history.pushState({}, '', window.location.pathname);
          setProducts(originalProducts);
          setShuffledProducts(shuffleArray(originalProducts));
        }}
        className="mt-4 px-4 py-2 text-sm sm:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        View All Products
      </button>
    )}
  </div>
)}

{/* Suggested Products */}
{filteredProducts.length === 0 && shuffledProducts.length > 0 && (
  <div className="mt-8 sm:mt-12">
    <div className="flex justify-between items-center mb-4 sm:mb-6">
      <h3 className="text-lg sm:text-xl font-semibold text-white">
        You Might Like These Instead
      </h3>
      <button
        onClick={() => {
          setSearchQuery('');
          setSelectedCategory('All');
          setSelectedPriceRange('All');
          window.history.pushState({}, '', window.location.pathname);
          setProducts(originalProducts);
          setShuffledProducts(shuffleArray(originalProducts));
          setCurrentPage(1);
        }}
        className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
      >
        View All Products
      </button>
    </div>
    
    {/* Suggested Products Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {shuffledProducts.slice(0, 8).map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
)}

         {/* Pagination */}
{filteredProducts.length > productsPerPage && (
  <div className="flex justify-center items-center mt-6 sm:mt-8 gap-1 sm:gap-2 flex-wrap px-2">
    {/* Previous Button */}
    <button 
      onClick={goToPrevPage}
      disabled={currentPage === 1}
      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
        currentPage === 1 
          ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
          : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
      }`}
    >
      Prev
    </button>
    
    {/* Page Numbers */}
    <div className="flex gap-1">
      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        // Show limited pages on mobile
        if (window.innerWidth < 640 && totalPages > 5) {
          if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="px-1 text-gray-600">...</span>;
          }
          return null;
        }
        return (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-red-500 text-white'
                : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        );
      })}
    </div>
    
    {/* Next Button */}
    <button 
      onClick={goToNextPage}
      disabled={currentPage === totalPages}
      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
        currentPage === totalPages 
          ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
          : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
      }`}
    >
      Next
    </button>
  </div>
)}
          </>
        )}
      </div>
    </div>
  </div>
);
}