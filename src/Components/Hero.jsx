import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ArrowRight, ChevronLeft, Menu, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
// Apple
import Apple from '../assets/Images/appleLogo.png'
import Iphone from '../assets/Images/heroIphone.png'
// Samsung
import Samsung from '../assets/Images/samsungLogo.png'
import SamsungPhone from '../assets/Images/samsungPhone.png'
// PlayStation
import PlayStation from '../assets/Images/playstationLogo.png'
import Pes from '../assets/Images/pes.png'
// Nike
import Nike from '../assets/Images/nikeLogo.png'
import NikeShoe from '../assets/Images/nIkeShoe.png'
import { Link } from 'react-router-dom';

const Hero = () => {
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
      imagePlaceholder: Iphone
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
      imagePlaceholder: SamsungPhone
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
      imagePlaceholder: Pes
    },
    {
      id: 4,
      brand: "Nike",
      productLine: "Summer Collection",
      title: "20% off selected items",
      ctaText: "Get Yours",
      bgColor: "bg-orange-600",
      textColor: "text-white",
      logoPlaceholder: Nike,
      imagePlaceholder: NikeShoe    
    },
    {
      id: 5,
      brand: "Dyson",
      productLine: "Smart Home",
      title: "Free delivery on all items",
      ctaText: "Shop Collection",
      bgColor: "bg-gray-800",
      textColor: "text-white",
      logoPlaceholder: "/api/placeholder/24/24",
      imagePlaceholder: "/api/placeholder/280/240"
    }
  ];

 const categories = [
  { 
    name: "Smartphones", 
    hasSubmenu: true,
    link: "/categories/smartphones",
    subcategories: [
      { name: "Android Phones", items: ["Samsung Galaxy", "Google Pixel", "OnePlus", "Xiaomi"] },
      { name: "iPhones", items: ["iPhone 15 Pro", "iPhone 15", "iPhone 14", "iPhone SE"] },
      { name: "Budget Phones", items: ["Under $200", "Under $400", "Mid-range", "Refurbished"] },
      { name: "Gaming Phones", items: ["ROG Phone", "RedMagic", "Black Shark", "Razer Phone"] }
    ]
  },
  { 
    name: "Phone Accessories", 
    hasSubmenu: true,
    link: "/categories/accessories",
    subcategories: [
      { name: "Cases & Covers", items: ["Protective Cases", "Designer Cases", "Leather Cases", "Clear Cases"] },
      { name: "Screen Protection", items: ["Tempered Glass", "Privacy Screens", "Blue Light Filters", "Anti-Glare"] },
      { name: "Chargers", items: ["Wireless Chargers", "Fast Chargers", "Car Chargers", "Power Banks"] },
      { name: "Audio", items: ["Headphones", "Earbuds", "Bluetooth Speakers", "Phone Stands"] }
    ]
  },
  { name: "Tablets", hasSubmenu: false, link: "/categories/tablets" },
  { name: "Smartwatches", hasSubmenu: false, link: "/categories/smartwatches" },
  { name: "Wireless Earbuds", hasSubmenu: false, link: "/categories/earbuds" },
  { name: "Phone Repairs", hasSubmenu: false, link: "/categories/repairs" },
  { name: "Refurbished Phones", hasSubmenu: false, link: "/categories/refurbished" },
  { name: "Phone Plans", hasSubmenu: false, link: "/categories/plans" },
  { name: "Trade-In Program", hasSubmenu: false, link: "/categories/trade-in" },
];
  
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
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Mobile Menu Button - Only visible on small screens */}
        <div className="lg:hidden w-full flex justify-between items-center py-3 border-b border-gray-200">
          <button 
            onClick={toggleMobileMenu} 
            className="flex items-center text-gray-700 hover:text-blue-500"
            aria-label="Toggle Categories Menu"
          >
            <Menu size={20} className="mr-2" />
            <span>Categories</span>
          </button>
        </div>

        {/* Mobile Categories Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mobile-menu-container fixed inset-0 bg-black/[0.5] z-50">
            <div className="bg-white w-64 h-full overflow-y-auto p-4 animate-slide-right">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Categories</h3>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <ul className="py-2 space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link 
  to={category.link || '#'}
  className="px-2 py-2 flex justify-between items-center hover:bg-gray-100 rounded cursor-pointer"
  onClick={() => toggleMobileDropdown(index)}
>
  <span className="text-gray-800 text-sm">{category.name}</span>
  {category.hasSubmenu && (
    hoveredCategory === index 
      ? <ChevronDown size={16} className="text-gray-400" />
      : <ChevronRight size={16} className="text-gray-400" />
  )}
</Link>
                    
                    {/* Mobile Dropdown Menu */}
                    {category.hasSubmenu && hoveredCategory === index && (
                      <div className="pl-4 py-2 bg-gray-50 rounded mt-1">
                        {category.subcategories.map((subcat, subIdx) => (
                          <div key={subIdx} className="mb-2">
                            <div className="font-medium text-sm text-gray-700 mb-1">{subcat.name}</div>
                            <ul className="space-y-1 pl-2">
                              {subcat.items.map((item, itemIdx) => (
                              <Link
  to={`/products/${item.toLowerCase().replace(/\s+/g, '-')}`}
  key={itemIdx} 
  className="text-xs text-gray-600 hover:text-blue-500 py-1 cursor-pointer block"
>
  {item}
</Link>
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
        <div className="hidden lg:block w-64 border-r border-gray-200 text-gray-800 text-sm pr-4">
          <ul className="py-4 space-y-2">
            {categories.map((category, index) => (
              <li 
                key={index} 
                className="relative category-item"
                onMouseEnter={() => handleCategoryHover(index)}
                onMouseLeave={handleCategoryLeave}
              >
               <Link to={category.link || '#'} className={`px-6 py-2 flex justify-between items-center hover:bg-gray-100 hover:text-red-400 rounded cursor-pointer ${hoveredCategory === index ? 'bg-gray-100' : ''}`}>
  <span className="text-gray-800 text-sm">{category.name}</span>
  {category.hasSubmenu && <ChevronRight size={16} className="text-gray-400" />}
</Link>
                
                {/* Desktop Dropdown Menu */}
                {category.hasSubmenu && hoveredCategory === index && (
                  <div className="absolute left-full top-0 ml-1 w-72 bg-white shadow-lg rounded-lg z-40 border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 gap-4 p-4">
                      {category.subcategories.map((subcat, subIdx) => (
                        <div key={subIdx} className="mb-2">
                          <div className="font-medium text-sm text-gray-800 mb-2 border-b pb-1">{subcat.name}</div>
                          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {subcat.items.map((item, itemIdx) => (
                              <Link 
  to={`/products/${item.toLowerCase().replace(/\s+/g, '-')}`}
  key={itemIdx} 
  className="text-xs text-gray-600 hover:text-red-500 cursor-pointer truncate block"
>
  {item}
</Link>
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
                <div className="flex flex-col sm:flex-row items-center justify-between h-full px-6 sm:px-8 md:px-12 py-6 sm:py-8">
                  <div className="z-10 w-full sm:w-1/2 text-center sm:text-left mb-4 sm:mb-0">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                      <img src={banner.logoPlaceholder} alt={`${banner.brand} logo`} className="w-16 h-8 object-contain" />
                      <span className="text-xs sm:text-sm font-semibold">{banner.productLine}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{banner.title}</h2>
                   <Link 
  to={`/products/${banner.brand.toLowerCase()}`}
  className="flex items-center text-sm font-medium mx-auto sm:mx-0 group"
>
  <span>{banner.ctaText}</span>
  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
</Link>
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