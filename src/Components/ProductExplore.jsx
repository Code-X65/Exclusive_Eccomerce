import { useState, useEffect, useRef } from 'react';
import { Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import product01 from '../assets/Images/products/Product01.png'
import product02 from '../assets/Images/products/Product02.png'
import product03 from '../assets/Images/products/Product03.png'
import product04 from '../assets/Images/products/Product04.png'
import product05 from '../assets/Images/products/Product05.png'
import product06 from '../assets/Images/products/Product06.png'
import product07 from '../assets/Images/products/Product07.png'
import product08 from '../assets/Images/products/Product08.png'
import product09 from '../assets/Images/products/Product09.png'
import product10 from '../assets/Images/products/Product10.png'

export default function ProductExplore() {
  const [selectedCategory, setSelectedCategory] = useState('All')
const [selectedPriceRange, setSelectedPriceRange] = useState('All');
const [sidebarOpen, setSidebarOpen] = useState(false);
const [cartItems, setCartItems] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [shuffledProducts, setShuffledProducts] = useState([]);
const productsPerPage = 16;

const categories = [
  'All',
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

  // Products data
  const products = [
    {
      id: 1,
      name: 'HAVIT HV-G92 Gamepad',
      originalPrice: 180,
      salePrice: 120,
      discount: 40,
      image: product01,
      rating: 5,
      reviews: 88
    },
    {
      id: 2,
      name: 'AK-900 Wired Keyboard',
      originalPrice: 960,
      salePrice: 650,
      discount: 35,
      image: product02,
      rating: 4,
      reviews: 75
    },
    {
      id: 3,
      name: 'IPS LCD Gaming Monitor',
      originalPrice: 400,
      salePrice: 370,
      discount: 30,
      image: product03,
      rating: 5,
      reviews: 99
    },
    {
      id: 4,
      name: 'S-Series Comfort Chair',
      originalPrice: 400,
      salePrice: 375,
      discount: 25,
      image: product04,
      rating: 4,
      reviews: 99
    },
    {
      id: 5,
      name: 'S-Series Comfort Chair',
      originalPrice: 400,
      salePrice: 375,
      discount: 25,
      image: product05,
      rating: 5,
      reviews: 99
    },
    {
      id: 6,
      name: 'S-Series Comfort Chair',
      originalPrice: 400,
      salePrice: 375,
      discount: 25,
      image: product06,
      rating: 5,
      reviews: 99
    },
    {
      id: 7,
      name: 'S-Series Comfort Chair',
      originalPrice: 400,
      salePrice: 375,
      discount: 25,
      image: product07,
      rating: 5,
      reviews: 99
    },
    {
      id: 8,
      name: 'S-Series Comfort Chair',
      originalPrice: 400,
      salePrice: 375,
      discount: 25,
      image: product08,
      rating: 5,
      reviews: 99
    },
    {
      id: 9,
      name: 'S-Series Comfort Chair',
      originalPrice: 400,
      salePrice: 375,
      discount: 25,
      image: product09,
      rating: 5,
      reviews: 99
    },
    {
      id: 10,
      name: 'S-Series Comfort Chair',
      originalPrice: 400,
      salePrice: 375,
      discount: 25,
      image: product10,
      rating: 5,
      reviews: 99
    }
  ];
const filteredProducts = shuffledProducts.filter(product => {
  const categoryMatch = selectedCategory === 'All' || 
    (selectedCategory === 'Gaming' && (product.name.includes('Gamepad') || product.name.includes('Gaming'))) ||
    (selectedCategory === 'Electronics' && (product.name.includes('Keyboard') || product.name.includes('Monitor'))) ||
    (selectedCategory === 'Furniture' && product.name.includes('Chair')) ||
    (selectedCategory === 'Accessories' && (product.name.includes('Gamepad') || product.name.includes('Keyboard'))) ||
    (selectedCategory === 'Monitors' && product.name.includes('Monitor')) ||
    (selectedCategory === 'Keyboards' && product.name.includes('Keyboard'));
  
  const priceRange = priceRanges.find(range => range.label === selectedPriceRange);
  const priceMatch = product.salePrice >= priceRange.min && product.salePrice <= priceRange.max;
  
  return categoryMatch && priceMatch;
});
const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
const startIndex = (currentPage - 1) * productsPerPage;
const endIndex = startIndex + productsPerPage;
const currentProducts = filteredProducts.slice(startIndex, endIndex);

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

const addToCart = (product) => {
  setCartItems(prev => {
    const existing = prev.find(item => item.id === product.id);
    if (existing) {
      return prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    return [...prev, { ...product, quantity: 1 }];
  });
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
  <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 lg:relative lg:translate-x-0 lg:block`}>
    <div className="p-4 h-full overflow-y-auto">
      {/* Close button for mobile */}
      <div className="lg:hidden flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ✕
        </button>
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category 
                  ? 'bg-red-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Price Range</h3>
        <div className="space-y-2">
          {priceRanges.map(range => (
            <button
              key={range.label}
              onClick={() => setSelectedPriceRange(range.label)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedPriceRange === range.label 
                  ? 'bg-red-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Cart</h3>
        <div className="text-sm text-gray-600">
          {cartItems.length > 0 ? (
            <div>
              <p>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</p>
              <p className="font-medium">
                ${cartItems.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0).toFixed(2)}
              </p>
            </div>
          ) : (
            <p>Cart is empty</p>
          )}
        </div>
      </div>
    </div>
  </div>
);


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
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    addToCart(product);
    setAddingToCart(false);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative bg-gray-50 p-3 sm:p-4">
        {/* Discount Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md z-10">
          -{product.discount}%
        </div>
        
        {/* Action Buttons */}
        <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 sm:gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'} opacity-100 sm:opacity-0 group-hover:opacity-100`}>
          <button className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors">
            <Heart size={12} className="sm:w-4 sm:h-4 text-gray-600" />
          </button>
          <button className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-blue-50 hover:text-blue-500 transition-colors">
            <Eye size={12} className="sm:w-4 sm:h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Product Image */}
        <div className="flex justify-center items-center h-20 sm:h-32 md:h-40">
          <img 
            src={product.image} 
            alt={product.name} 
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
          />
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-2 sm:p-4">
        <h3 className="font-medium text-xs sm:text-sm md:text-base mb-1 sm:mb-2 line-clamp-2 h-8 sm:h-10 text-gray-800 group-hover:text-gray-900 leading-tight">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          <span className="text-red-500 font-bold text-sm sm:text-base md:text-lg">${product.salePrice}</span>
          <span className="text-gray-400 line-through text-xs sm:text-sm">${product.originalPrice}</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        
        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={addingToCart}
          className={`w-full py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 ${
            addingToCart 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-black text-white hover:bg-red-500 hover:shadow-md transform hover:-translate-y-0.5'
          }`}
        >
          {addingToCart ? (
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Adding...</span>
              <span className="sm:hidden">...</span>
            </div>
          ) : (
            <span>Add To Cart</span>
          )}
        </button>
      </div>
    </div>
  );
};



return (
  <div className="flex min-h-screen bg-gray-50">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center">
            <button 
              className="lg:hidden p-2 mr-2 hover:bg-gray-100 rounded"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div className="w-3 sm:w-5 h-8 sm:h-10 bg-red-500 rounded mr-2"></div>
            <h2 className="text-md sm:text-md font-bold">Products</h2>
          </div>
          
          {/* Results Count */}
          <div className="text-sm text-gray-600 max-sm:hidden">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

        {/* Title Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">Explore Our Products</h1>
            {selectedCategory !== 'All' && (
              <p className="text-gray-600">Category: <span className="font-medium text-red-500">{selectedCategory}</span></p>
            )}
          </div>

        </div>

        {/* Products Section - Mobile Scrollable View */}
        <div className="sm:hidden pb-4 -mx-4 px-4" ref={productContainerRef}>
          <div className="flex flex-col gap-4 ">
            {currentProducts.map((product) =>  (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Products Section - Desktop Grid View */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results</p>
          </div>
        )}

        {/* View All Button */}
       {filteredProducts.length > productsPerPage && (
  <div className="flex justify-center items-center mt-6 sm:mt-8 gap-2">
    {/* Previous Button */}
    <button 
      onClick={goToPrevPage}
      disabled={currentPage === 1}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        currentPage === 1 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      Prev
    </button>
    
    {/* Page Numbers */}
    <div className="flex gap-1">
      {[...Array(totalPages)].map((_, index) => {
        const page = index + 1;
        return (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        currentPage === totalPages 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      Next
    </button>
  </div>
)}
      </div>
    </div>
  </div>
);
}