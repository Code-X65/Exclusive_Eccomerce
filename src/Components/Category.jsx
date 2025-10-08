import { useState, useEffect, useRef } from 'react';
import { Heart, Eye, ChevronLeft, ChevronRight, Phone, Computer, Watch, Headphones, Gamepad, Camera } from 'lucide-react';

const Category = () => {
  // References for the chevron buttons
  const leftChevronRef = useRef(null);
  const rightChevronRef = useRef(null);
  const slideshowRef = useRef(null);
  
  // State for the slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // New state for category slider
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  
  // State to track window width
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Category data
  const BrowserCategory = [
    { icon: <Phone />, title: "Phone" },
    { icon: <Computer />, title: "Computer" },
    { icon: <Camera />, title: "Camera" },
    { icon: <Watch />, title: "Smartwatch" },
    { icon: <Headphones />, title: "HeadPhones" },
    { icon: <Gamepad />, title: "Gaming" },
    { icon: <Camera />, title: "Accessories" },
    { icon: <Computer />, title: "Tablets" }
  ];

  // Calculate how many categories to show per view based on screen size
  const getCategoriesPerView = () => {
    if (windowWidth < 640) return 2; // Mobile
    if (windowWidth < 768) return 3; // Small tablet
    if (windowWidth < 1024) return 4; // Large tablet
    return 5; // Desktop
  };

  const categoriesPerView = getCategoriesPerView();
  const maxCategoryIndex = Math.max(0, BrowserCategory.length - categoriesPerView);

  // Function to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Ensure current index is still valid with new number of categories per view
      const newCategoriesPerView = getCategoriesPerView();
      const newMaxIndex = Math.max(0, BrowserCategory.length - newCategoriesPerView);
      setCurrentCategoryIndex(prev => Math.min(prev, newMaxIndex));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowWidth]);

  // Function to navigate categories
  const navigateCategories = (direction) => {
    if (direction === 'next') {
      setCurrentCategoryIndex((prev) => Math.min(prev + 1, maxCategoryIndex));
    } else {
      setCurrentCategoryIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  // Animation effect for slides
  useEffect(() => {
    if (!slideshowRef.current) return;
    
    const tl = window.gsap?.timeline();
    if (tl) {
      tl.fromTo(
        slideshowRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [currentSlide]);
  
  // Calculate width percentage for each category item
  const getItemWidthClass = () => {
    switch (categoriesPerView) {
      case 2: return 'w-1/2';
      case 3: return 'w-1/3';
      case 4: return 'w-1/4';
      default: return 'w-1/5';
    }
  };
  
  return (
    <>
      <div className=''>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 border-y-2 my-4 sm:my-8 border-gray-300 py-4 sm:py-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-3 sm:w-5 h-8 sm:h-10 bg-red-500 rounded mr-2"></div>
            <h2 className="text-base sm:text-lg font-bold text-red-500">Categories</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-0 text-white">Browse By Category</h1>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => navigateCategories('prev')}
                  disabled={currentCategoryIndex === 0}
                  className={`p-2 border text-white border-gray-300 rounded-full hover:bg-red-500 hover:text-white transition-colors ${currentCategoryIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => navigateCategories('next')}
                  disabled={currentCategoryIndex >= maxCategoryIndex}
                  className={`p-2 border text-white border-gray-300 rounded-full hover:bg-red-500 hover:text-white transition-colors ${currentCategoryIndex >= maxCategoryIndex ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Category Slider */}
          <div className="relative mb-4 sm:mb-8">
            {/* Category container with overflow hidden */}
            <div className="overflow-hidden relative">
              {/* Sliding container */}
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentCategoryIndex * (100 / categoriesPerView)}%)` }}
              >
                {BrowserCategory.map((category, index) => (
                  <div 
                    key={index} 
                    className={`flex-none ${getItemWidthClass()} px-1 sm:px-2`}
                  >
                    <div className="flex flex-col items-center gap-2 sm:gap-4 p-3 sm:p-6 border border-gray-300 rounded shadow-sm hover:bg-red-500 group transition-colors hover:border-0">
                      <div className="group-hover:text-white transition-colors text-white">{category.icon}</div>
                      <div className="text-xs sm:text-sm font-medium text-center group-hover:text-white transition-colors text-white">{category.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Category;