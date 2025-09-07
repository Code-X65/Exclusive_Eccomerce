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

export default function FlashSales() {
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
  const ProductCard = ({ product }) => (
    <div className="min-w-[250px] sm:min-w-0 p-3 rounded-lg relative group bg-gray-50 hover:shadow-md transition-shadow duration-300">
      <div className="bg-white p-2 rounded-md">
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
          -{product.discount}%
        </div>
        <div className="flex justify-end mb-2 space-x-2">
          <button className="p-1 bg-white rounded-full hover:bg-gray-100">
            <Heart size={16} className="text-gray-500" />
          </button>
          <button className="p-1 bg-white rounded-full hover:bg-gray-100">
            <Eye size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="flex justify-center mb-4">
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-24 sm:h-32 w-24 sm:w-32 object-contain" 
          />
        </div>
      </div>
      <div className="text-center mt-3">
        <h3 className="font-medium text-xs sm:text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>
        <div className="flex justify-center items-center gap-2 mb-2">
          <span className="text-red-500 font-medium text-sm sm:text-base">${product.salePrice}</span>
          <span className="text-gray-400 line-through text-xs sm:text-sm">${product.originalPrice}</span>
        </div>
        <div className="flex justify-center items-center gap-2">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
      </div>
      <div className="mt-3 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-full bg-black text-white text-xs sm:text-sm py-2 rounded hover:bg-gray-800">
          Add To Cart
        </button>
      </div>
      <div className="mt-3 sm:hidden">
        <button className="w-full bg-black text-white text-xs sm:text-sm py-2 rounded hover:bg-gray-800">
          Add To Cart
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center mb-4 sm:mb-6">
        <div className="w-3 sm:w-5 h-8 sm:h-10 bg-red-500 rounded mr-2"></div>
        <h2 className="text-xl sm:text-2xl font-bold">Today's</h2>
      </div>

      {/* Title and Timer Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-4xl font-bold">Flash Sales</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Timer Display */}
          <TimerDisplay />

          {/* Navigation Buttons */}
          <div className="flex gap-2 ml-auto sm:ml-0">
            <button 
              className="p-1 sm:p-2 border border-gray-300 rounded-full hover:bg-gray-100"
              onClick={handlePrevious}
              aria-label="Previous products"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="p-1 sm:p-2 border border-gray-300 rounded-full hover:bg-gray-100"
              onClick={handleNext}
              aria-label="Next products"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

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

      {/* View All Button */}
      <div className="flex justify-center mt-6 sm:mt-8">
        <button className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded text-sm sm:text-base hover:bg-red-600">
          View All Products
        </button>
      </div>
    </div>
  );
}