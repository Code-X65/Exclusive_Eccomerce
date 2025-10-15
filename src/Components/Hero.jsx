import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ArrowRight, ChevronLeft, Menu, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
// Apple
import Apple from '../assets/Images/appleLogo.png'

// Samsung
import Samsung from '../assets/Images/samsungLogo.png'

// PlayStation
import PlayStation from '../assets/Images/playstationLogo.png'

// Nike
import Nike from '../assets/Images/nikeLogo.png'

import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const Hero = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const slidesRef = useRef([]);
  const slideshowRef = useRef(null);
  const autoplayTimerRef = useRef(null);
  const autoplayDelay = 5000; // 5 seconds between slides

  const banners = [
    {
      id: 1,
      brand: "Apple",
      productLine: "iPhone 14 Series",
      title: "Up to 10% off Voucher",
      ctaText: "Shop Now",
      bgColor: "bg-black",
      textColor: "text-white",
      logoPlaceholder: Apple,
      imagePlaceholder: 'https://i.ebayimg.com/images/g/3ZoAAeSwMf1o0Djm/s-l1600.webp'
    },
    {
      id: 2,
      brand: "Samsung",
      productLine: "Galaxy S23 Ultra",
      title: "Save 15% this week",
      ctaText: "Explore Now",
      bgColor: "bg-blue-400",
      textColor: "text-white",
      logoPlaceholder: Samsung,
      imagePlaceholder: 'https://i.ebayimg.com/images/g/IuwAAOSwi2tmhlsa/s-l960.webp'
    },
    {
      id: 3,
      brand: "Sony",
      productLine: "PlayStation 5",
      title: "New games available",
      ctaText: "View Games",
      bgColor: "bg-blue-600",
      textColor: "text-white",
      logoPlaceholder: PlayStation,
      imagePlaceholder: 'https://i.ebayimg.com/images/g/a0UAAeSwxGVo0WOw/s-l1600.webp'
    },
    {
  id: 4,
  brand: "Apple",
  productLine: "Watch Series",
  title: "20% off selected smartwatches",
  ctaText: "Shop Now",
  bgColor: "bg-gray-900",
  textColor: "text-white",
  logoPlaceholder: Apple, // Replace with Apple logo if you have it
  imagePlaceholder: 'https://www.apple.com/v/watch/bt/images/overview/select/product_se__cbhd710p3auq_large.png'   
    },
    {
  id: 5,
  brand: "Samsung",
  productLine: "Home Appliances",
  title: "Free delivery on all items",
  ctaText: "Shop Collection",
  bgColor: "bg-slate-800",
  textColor: "text-white",
  logoPlaceholder: "/api/placeholder/24/24",
  imagePlaceholder: "https://images.samsung.com/is/image/samsung/p6pim/levant/feature/164683561/levant-feature-bespoke-4-door-flex-refrigerator-with-family-hub-539146972"
}
  ];

// Replace the entire categories array (around line 97-137) with:
const categories = [
  { 
    name: "SmartPhone", 
    hasSubmenu: true,
    link: "/categories/smartphones",
    subcategories: [
      { name: "iPhone Series", items: ["iPhone 17 series", "iPhone 16 series", "iPhone 15 series", "iPhone 14 series"] },
      { name: "iPhone Legacy", items: ["iPhone 13 series", "iPhone 12 series", "iPhone 11 series"] },
      { name: "Android Brands", items: ["Samsung", "Tecno", "Itel", "Infinix"] },
      { name: "Budget Friendly", items: ["Redmi", "Oppo"] }
    ]
  },
  { 
    name: "Smartwatche", 
    hasSubmenu: true, 
    link: "/categories/smartwatches",
    subcategories: [
      { name: "Apple", items: ["iWatch"] },
      { name: "Android", items: ["Android"] }
    ]
  },
  { 
    name: "Tablet", 
    hasSubmenu: true, 
    link: "/categories/tablets",
    subcategories: [
      { name: "Apple", items: ["iPad"] },
      { name: "Android", items: ["Android"] }
    ]
  },
  { 
    name: "Game", 
    hasSubmenu: true, 
    link: "/categories/games",
    subcategories: [
      { name: "Consoles", items: ["Play Station", "Xbox", "Nintendo Switch"] },
      { name: "Accessories", items: ["Game Disc", "Gaming Headsets"] }
    ]
  },
  { 
    name: "Sound", 
    hasSubmenu: true, 
    link: "/categories/sounds",
    subcategories: [
      { name: "Personal Audio", items: ["Earbuds", "Headphones", "Microphones"] },
      { name: "Speakers", items: ["Boombox", "Portable Speakers", "Bluetooth Speakers"] }
    ]
  },
  { 
    name: "Laptop", 
    hasSubmenu: true, 
    link: "/categories/laptop",
    subcategories: [
      { name: "Operating System", items: ["Mac Book", "Windows"] }
    ]
  },
  { 
    name: "Home Appliance", 
    hasSubmenu: true, 
    link: "/categories/home_appliances",
    subcategories: [
      { name: "Categories", items: ["Kitchen Appliances", "Home Appliances", "Power Appliances", "Entertainment Appliances"] }
    ]
  }
];
const handleCategoryClick = (categoryName, subcategoryName = null) => {
  const searchTerm = subcategoryName || categoryName;
  navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
};
  
  useEffect(() => {
    // Initialize GSAP animation
    slidesRef.current.forEach((slide, index) => {
      if (!slide) return;
      
      if (index === activeSlide) {
        gsap.to(slide, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          pointerEvents: 'auto'
        });
      } else {
        gsap.to(slide, {
          opacity: 0,
          x: index > activeSlide ? 100 : -100,
          duration: 0.8,
          ease: 'power2.out',
          pointerEvents: 'none'
        });
      }
    });

    // Set up autoplay
    resetAutoplayTimer();
    
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [activeSlide]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle click outside of dropdown
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (!event.target.closest('.category-item')) {
        setHoveredCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideDropdown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideDropdown);
    };
  }, []);

  const resetAutoplayTimer = () => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
    }
    
    autoplayTimerRef.current = setTimeout(() => {
      goToSlide((activeSlide + 1) % banners.length);
    }, autoplayDelay);
  };

  const goToSlide = (index) => {
    setActiveSlide(index);
  };
  
  const goToPrevSlide = () => {
    const newIndex = activeSlide === 0 ? banners.length - 1 : activeSlide - 1;
    goToSlide(newIndex);
  };
  
  const goToNextSlide = () => {
    const newIndex = (activeSlide + 1) % banners.length;
    goToSlide(newIndex);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCategoryHover = (index) => {
    if (categories[index].hasSubmenu) {
      setHoveredCategory(index);
    }
  };

  const handleCategoryLeave = () => {
    // Using a slight delay to make the dropdown more user-friendly
    setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  // Toggle dropdown in mobile view
  const toggleMobileDropdown = (index) => {
    if (categories[index].hasSubmenu) {
      setHoveredCategory(hoveredCategory === index ? null : index);
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden bg-gray-900">
      <div className="flex flex-col lg:flex-row w-full container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Mobile Menu Button - Only visible on small screens */}
       <div className="lg:hidden w-full flex justify-between items-center py-3 border-b border-gray-700">
  <button 
    onClick={toggleMobileMenu} 
    className="flex items-center text-gray-200 hover:text-red-500"
          >
            <Menu size={20} className="mr-2" />
            <span>Categories</span>
          </button>
        </div>

        {/* Mobile Categories Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mobile-menu-container fixed inset-0 bg-black/[0.5] z-50">
            <div className="bg-gray-900 w-64 h-full overflow-y-auto p-4 animate-slide-right">
              <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-100">Categories</h3>
<button 
  onClick={() => setIsMobileMenuOpen(false)}
  className="text-gray-400 hover:text-gray-200"
>
                  &times;
                </button>
              </div>
              <ul className="py-2 space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
<div 
 className="px-2 py-2 flex justify-between items-center hover:bg-gray-800 rounded cursor-pointer"
  onClick={() => {
    if (category.hasSubmenu) {
      toggleMobileDropdown(index);
    } else {
      handleCategoryClick(category.name);
    }
  }}
>
  <span className="text-gray-200 text-sm">{category.name}</span>
  {category.hasSubmenu && (
    hoveredCategory === index 
      ? <ChevronDown size={16} className="text-gray-400" />
      : <ChevronRight size={16} className="text-gray-400" />
  )}
</div>
                    
                    {/* Mobile Dropdown Menu */}
                    {category.hasSubmenu && hoveredCategory === index && (
                      <div className="pl-4 py-2 bg-gray-800 rounded mt-1">
                        {category.subcategories.map((subcat, subIdx) => (
                          <div key={subIdx} className="mb-2">
                            <div className="font-medium text-sm text-gray-300 mb-1">{subcat.name}</div>
                            <ul className="space-y-1 pl-2">
                              {subcat.items.map((item, itemIdx) => (
<div
  key={itemIdx}
  onClick={() => handleCategoryClick(subcat.name, item)}
  className="text-xs text-gray-400 hover:text-red-500 py-1 cursor-pointer block"
>
  {item}
</div>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Sidebar Navigation - Only visible on large screens */}
        <div className="hidden lg:block w-64 border-r border-gray-700 text-gray-200 text-sm pr-4">
          <ul className="py-4 space-y-2">
            {categories.map((category, index) => (
              <li 
                key={index} 
                className="relative category-item"
                onMouseEnter={() => handleCategoryHover(index)}
                onMouseLeave={handleCategoryLeave}
              >
            <div 
  onClick={() => handleCategoryClick(category.name)}
  className={`px-6 py-2 flex justify-between items-center hover:bg-gray-800 hover:text-red-400 rounded cursor-pointer ${hoveredCategory === index ? 'bg-gray-800' : ''}`}
>
  <span className="text-gray-200 text-sm">{category.name}</span>
  {category.hasSubmenu && <ChevronRight size={16} className="text-gray-400" />}
</div>
                
                {/* Desktop Dropdown Menu */}
                {category.hasSubmenu && hoveredCategory === index && (
                  <div className="absolute left-full top-0 ml-1 w-72 bg-gray-900 shadow-lg rounded-lg z-40 border border-gray-700 overflow-hidden">
                    <div className="grid grid-cols-1 gap-4 p-4">
                      {category.subcategories.map((subcat, subIdx) => (
                        <div key={subIdx} className="mb-2">
                         <div className="font-medium text-sm text-gray-200 mb-2 border-b border-gray-700 pb-1">{subcat.name}</div>
                          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {subcat.items.map((item, itemIdx) => (
 <div
  key={itemIdx}
  onClick={() => handleCategoryClick(subcat.name, item)}
className="text-xs text-gray-400 hover:text-red-500 cursor-pointer truncate block"
>
  {item}
</div>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Main Banner */}
        <div className="flex-1 pt-4 lg:p-6 w-full">
          <div ref={slideshowRef} className="relative overflow-hidden rounded-lg h-64 sm:h-72 md:h-80 lg:h-96">
            {/* Banner Slides */}
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                ref={el => slidesRef.current[index] = el}
                className={`absolute top-0 left-0 w-full h-full ${banner.bgColor} ${banner.textColor}`}
                style={{
                  opacity: index === 0 ? 1 : 0,
                  transform: index === 0 ? 'translateX(0)' : `translateX(${index > 0 ? '100%' : '-100%'})`,
                  zIndex: index === activeSlide ? 10 : 1
                }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between h-full px-6 sm:px-8 md:px-12 py-6 sm:py-8 cursor-pointer"
  onClick={() => handleCategoryClick(banner.brand)}
>
                  <div className="z-10 w-full sm:w-1/2 text-center sm:text-left mb-4 sm:mb-0">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                      <img src={banner.logoPlaceholder} alt={`${banner.brand} logo`} className="w-16 h-8 object-contain" />
                      <span className="text-xs sm:text-sm font-semibold">{banner.productLine}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{banner.title}</h2>
<div 
  onClick={() => handleCategoryClick(banner.brand)}
  className="flex items-center text-sm font-medium mx-auto sm:mx-0 group cursor-pointer"
>
  <span>{banner.ctaText}</span>
  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
</div>
                  </div>
                  
                  <div className="w-full sm:w-1/2 flex justify-center sm:justify-end">
                    <img 
                      src={banner.imagePlaceholder}
                      alt={`${banner.brand} ${banner.productLine}`}
                      className="h-32 sm:h-full object-contain max-h-48 sm:max-h-64 py-2 sm:py-8"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Navigation Arrows */}
            <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4">
              <button 
                onClick={goToPrevSlide} 
                className="bg-white/30 hover:bg-white/50 rounded-full p-1 sm:p-2 z-20 backdrop-blur-sm transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              
              <button 
                onClick={goToNextSlide} 
                className="bg-white/30 hover:bg-white/50 rounded-full p-1 sm:p-2 z-20 backdrop-blur-sm transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight size={16} className="text-white" />
              </button>
            </div>
            
            {/* Dots Navigation */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 z-20">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  onClick={() => goToSlide(index)}
                  className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    activeSlide === index 
                      ? "bg-white w-3 sm:w-4" 
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;