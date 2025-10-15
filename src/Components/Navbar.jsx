import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';
import { Heart, HeartMinus, LogOut, Search, ShoppingBag, ShoppingBasket, Star, User, UserCircle, XCircle } from 'lucide-react';
import { useCart } from '../Components/CartContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [isSticky, setIsSticky] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [searchSuggestions, setSuggestions] = useState([]);
const [searchHistory, setSearchHistory] = useState([]);
const [showSearchDropdown, setShowSearchDropdown] = useState(false);
const [isSearchFocused, setIsSearchFocused] = useState(false);
const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
const searchRef = useRef(null);
const searchDropdownRef = useRef(null);
const navigate = useNavigate();
const [cartCount, setCartCount] = useState(0);

  const { currentUser, isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [profile, setProfile] = useState(false);
  const profileRef = useRef(null);
  
  const profileImg = isLoggedIn ? currentUser.photoURL : '';
  const handleProfile = () => {
    setProfile(!profile);
  };
//  className="w-full text-left text-gray-200 hover:bg-gray-800 hover:text-red-500 block pl-3 pr-4 py-2 text-base font-medium transform transition-all duration-200 hover:translate-x-2 animate-bounceIn"
  

    const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by protected routes
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  // Handle sticky navbar on scroll
useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 100) { // Adjust threshold as needed
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  window.addEventListener('scroll', handleScroll);
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);
  // Handle clicking outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfile(false);
      }
    };
    
    // Add event listener when dropdown is open
    if (profile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profile]);

  // Load search history from localStorage
useEffect(() => {
  // For artifacts environment, we'll use sessionStorage or just in-memory
  try {
    const savedHistory = sessionStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  } catch (error) {
    // Fallback to empty array if storage fails
    console.log('Storage not available, using in-memory history');
  }
}, []);
useEffect(() => {
  const fetchCartCount = async () => {
    if (!currentUser) {
      setCartCount(0);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const cart = userData.cart || [];
        // Calculate total quantity of all items
        const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(totalCount);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  fetchCartCount();
  
  // Optional: Set up an interval to refresh cart count periodically
  const interval = setInterval(fetchCartCount, 5000); // Refresh every 5 seconds
  
  return () => clearInterval(interval);
}, [currentUser]);

// Fetch suggestions from database
const fetchSuggestions = async (searchTerm) => {
  if (!searchTerm.trim()) {
    setSuggestions([]);
    return;
  }

  setIsLoadingSuggestions(true);
  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    const suggestions = [];
    const searchTermLower = searchTerm.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const productName = (data.name || data.title || '').toLowerCase();
      
      if (productName.includes(searchTermLower)) {
        suggestions.push({
          id: doc.id,
          name: data.name || data.title,
          category: data.category,
          price: data.price
        });
      }
    });
    
    setSuggestions(suggestions.slice(0, 5));
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    setSuggestions([]);
  }
  setIsLoadingSuggestions(false);
};  
// Handle search input change
const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchQuery(value);
  
  if (value.length > 0) {
    fetchSuggestions(value);
  } else {
    setSuggestions([]);
  }
};

// Handle search focus
const handleSearchFocus = () => {
  setIsSearchFocused(true);
  setShowSearchDropdown(true);
  if (searchQuery.length === 0 && searchHistory.length > 0) {
    // Show search history when focused and no query
    setSuggestions([]);
  }
};

// Handle search blur

const handleSearchBlur = () => {
  setTimeout(() => {
    setIsSearchFocused(false);
    setShowSearchDropdown(false);
  }, 300); // Increased from 200ms to 300ms
};

// Handle search submit

const handleSearchSubmit = (query = searchQuery) => {
  if (!query.trim()) return;
  
  // Save to search history (in-memory for artifacts)
  const newHistory = [query.trim(), ...searchHistory.filter(item => item !== query.trim())].slice(0, 10);
  setSearchHistory(newHistory);
  
  // Try to save to sessionStorage (works better in artifacts than localStorage)
  try {
    sessionStorage.setItem('searchHistory', JSON.stringify(newHistory));
  } catch (error) {
    console.log('Storage not available');
  }
  
  // Clear search UI
  setShowSearchDropdown(false);
  setSearchQuery('');
  
  // Navigate to products page with search query
  navigate(`/products?search=${encodeURIComponent(query)}`);
};


// Handle suggestion click
const handleSuggestionClick = (suggestion) => {
  if (typeof suggestion === 'string') {
    // It's from search history
    setSearchQuery(suggestion);
    handleSearchSubmit(suggestion);
  } else {
    // It's a product suggestion - navigate to product page
    setSearchQuery('');
    setShowSearchDropdown(false);
    setIsMenuOpen(false); // Close mobile menu
    navigate(`/product/${suggestion.id}`);
  }
};

// Handle click outside search dropdown
useEffect(() => {
  const handleClickOutside = (event) => {
    if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
      setShowSearchDropdown(false);
    }
  };
  
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);
  

const mobileMenuItemClass = "text-gray-200 hover:bg-gray-800 hover:text-red-500 block pl-3 pr-4 py-2 text-base font-medium transform transition-all duration-200 hover:translate-x-2";

  return (
<header className={`bg-gray-900 border-b border-gray-700 transition-all duration-300 ${
  isSticky 
    ? 'fixed top-0 left-0 right-0 z-50 shadow-lg animate-slideDown' 
    : 'relative'
}`}>
    {/* Spacer to prevent content jump when navbar becomes fixed */}
  {isSticky && <div className="h-4"></div>}

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 ">
        <div className="flex justify-between h-16">

            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-red-500">
                Exclusive
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/"className="border-transparent text-gray-300 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                Home
              </Link>
              <Link to="/products"className="border-transparent text-gray-300 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                Products
              </Link>
              <Link to="/category"className="border-transparent text-gray-300 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                Categories
              </Link>
              <Link to="/contact"className="border-transparent text-gray-300 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                Contact
              </Link>
              {
                isLoggedIn ? (
                   <></>
                ):(
                  <>
                   <Link to="/signup"className="border-transparent text-gray-300 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                SignUp
              </Link>
                  </>
                )
              }

            </nav>
         
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2 lg:space-x-4">
   <div className="relative flex-1 max-w-md" ref={searchDropdownRef}>
  <input 
    ref={searchRef}
    type="text" 
    value={searchQuery}
    onChange={handleSearchChange}
    onFocus={handleSearchFocus}
    onBlur={handleSearchBlur}
    onKeyPress={(e) => {
      if (e.key === 'Enter') {
        handleSearchSubmit();
      }
    }}
    placeholder="What are you looking for?" 
    className="w-full py-2 pl-3 pr-10 text-sm rounded-md bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 border border-gray-700"
  />
  <div 
    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 cursor-pointer hover:text-red-500"
    onClick={() => handleSearchSubmit()}
  >
    <Search />
  </div>
  
 {/* Search Dropdown */}
{showSearchDropdown && (
  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
    {isLoadingSuggestions && (
      <div className="px-4 py-2 text-sm text-gray-400 flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
        Searching...
      </div>
    )}
    
    {/* Show search history when no query and history exists */}
    {!isLoadingSuggestions && searchQuery.length === 0 && searchHistory.length > 0 && (
      <>
        <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-900 border-b border-gray-700">
          Recent Searches
        </div>
        {searchHistory.slice(0, 5).map((historyItem, index) => (
          <div
            key={`history-${index}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSuggestionClick(historyItem);
            }}
            className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer flex items-center border-b border-gray-50 last:border-b-0"
          >
            <Search size={14} className="mr-3 text-gray-400" />
            <span>{historyItem}</span>
          </div>
        ))}
      </>
    )}
    
    {/* Show product suggestions when typing */}
    {!isLoadingSuggestions && searchQuery.length > 0 && searchSuggestions.length > 0 && (
      <>
        <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-900 border-b border-gray-700">
          Products
        </div>
        {searchSuggestions.map((suggestion) => (
          <div
            key={`product-${suggestion.id}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSuggestionClick(suggestion);
            }}
            className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer border-b border-gray-50 last:border-b-0"
          >
            <div className="font-medium">{suggestion.name}</div>
            <div className="text-xs text-gray-400">
              {suggestion.category} • ₦{suggestion.price?.toLocaleString()}
            </div>
          </div>
        ))}
      </>
    )}
    
    {/* No results message */}
    {!isLoadingSuggestions && searchQuery.length > 0 && searchSuggestions.length === 0 && (
      <div className="px-4 py-2 text-sm text-gray-400">
        No products found for "{searchQuery}"
      </div>
    )}
    
    {/* Search for query option */}
    {searchQuery.length > 0 && (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSearchSubmit();
        }}
        className="px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 cursor-pointer border-t border-gray-200"
      >
        <Search size={14} className="inline mr-2" />
        Search for "{searchQuery}"
      </div>
    )}
    
    {/* Show message when no history */}
    {!isLoadingSuggestions && searchQuery.length === 0 && searchHistory.length === 0 && (
      <div className="px-4 py-2 text-sm text-gray-400">
        Start typing to search for products...
      </div>
    )}
  </div>
)}  
</div>
            {isLoggedIn ? (
              <>
            
 <div className="flex justify-center items-center gap-6 p-4 ">
      {/* Icon buttons */}
      <Link to='/wishlist'>
      
      <Heart className="w-6 h-6 text-gray-300 hover:text-red-500 cursor-pointer transition-colors" />
      </Link>

      <Link to="/cart" className="relative">
  <ShoppingBasket className="w-6 h-6 text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" />
  {cartCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
      {cartCount > 99 ? '99+' : cartCount}
    </span>
  )}
</Link>
      
      {/* Profile section with dropdown - using ref for click detection */}
      <div className="relative" ref={profileRef}>
         <img src={profileImg} alt="img"    onClick={handleProfile}  className="cursor-pointer w-10 h-10 text-gray-700 hover:text-black transition-colors rounded-full" />
       

        {/* Dropdown menu with fixed positioning and animation */}
        <div
         className={`absolute right-0 mt-2 w-48 lg:w-56 bg-black/70 backdrop-blur-sm rounded-lg shadow-lg text-white z-50 transition-all duration-300 ${
  profile ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
}`}
        >
          <ul className="py-1">
           <Link to='/account'> <li className="flex items-center gap-3 px-4 py-2 hover:bg-black/40 hover:text-red-400 cursor-pointer transition-all duration-300">
              <User className="w-5 h-5" /> Manage My Account
            </li></Link>
          <Link to='/orders'>  <li className="flex items-center gap-3 px-4 py-2 hover:bg-black/40 hover:text-red-400 cursor-pointer transition-all duration-300">
              <ShoppingBag className="w-5 h-5" /> My Orders
            </li></Link>
            <li className="flex items-center gap-3 px-4 py-2 hover:bg-black/40 hover:text-red-400 cursor-pointer transition-all duration-300">
              <XCircle className="w-5 h-5" /> My Cancellations
            </li>
            <li className="flex items-center gap-3 px-4 py-2 hover:bg-black/40 hover:text-red-400 cursor-pointer transition-all duration-300">
              <Star className="w-5 h-5" /> My Reviews
            </li>
            <li
              onClick={() => {
                handleLogout();
                setProfile(false);
              }}
              className="flex items-center gap-3 px-4 py-2 hover:bg-black/40 hover:text-red-400 cursor-pointer transition-all duration-300"
            >
              <LogOut className="w-5 h-5" /> Logout
            </li>
          </ul>
        </div>
      </div>
    </div>
              </>
            ) : (
              <>

              </>
            )}
            
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
             className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-gray-100 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
   {isMenuOpen && (
  <>
    {/* Dark overlay */}
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
        isMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsMenuOpen(false)}
    />
    
    {/* Mobile menu */}
    <div className={`md:hidden absolute top-full left-0 right-0 bg-black/[0.7] border-b border-gray-200 shadow-lg z-50 transform transition-all duration-300 ease-out ${
      isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
    }`}>
                         {/* Serach Section */}
{/* Mobile Search Section */}
<div className="px-4 py-3" ref={searchDropdownRef}>
  <div className="relative">
    <input 
      ref={searchRef}
      type="text" 
      value={searchQuery}
      onChange={handleSearchChange}
      onFocus={handleSearchFocus}
      onBlur={handleSearchBlur}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          handleSearchSubmit();
        }
      }}
      placeholder="What are you looking for?" 
      className="w-full py-2 pl-4 pr-10 rounded-md bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
    />
    <div 
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 cursor-pointer hover:text-red-500"
      onClick={() => handleSearchSubmit()}
    >
      <Search />
    </div>
    
    {/* Mobile Search Dropdown */}
    {showSearchDropdown && (
      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
        {/* Same dropdown content as desktop */}
        {isLoadingSuggestions && (
          <div className="px-4 py-2 text-sm text-gray-400 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            Searching...
          </div>
        )}
        
        {!isLoadingSuggestions && searchQuery.length === 0 && searchHistory.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50">
              Recent Searches
            </div>
            {searchHistory.slice(0, 5).map((historyItem, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(historyItem)}
                className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer flex items-center"
              >
                <Search size={14} className="mr-2 text-gray-400" />
                {historyItem}
              </div>
            ))}
          </>
        )}
        
        {!isLoadingSuggestions && searchQuery.length > 0 && searchSuggestions.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50">
              Products
            </div>
           {/* For product suggestions */}
{searchSuggestions.map((suggestion) => (
  <div
    key={suggestion.id}
    onClick={(e) => {
      e.preventDefault();
      handleSuggestionClick(suggestion);
    }}
    className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer"
  >
    <div className="font-medium">{suggestion.name}</div>
    <div className="text-xs text-gray-400">
      {suggestion.category} • ₦{suggestion.price?.toLocaleString()}
    </div>
  </div>
))}

{/* For search history */}
{searchHistory.slice(0, 5).map((historyItem, index) => (
  <div
    key={index}
    onClick={(e) => {
      e.preventDefault();
      handleSuggestionClick(historyItem);
    }}
    className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer flex items-center"
  >
    <Search size={14} className="mr-2 text-gray-400" />
    {historyItem}
  </div>
))}
          </>
        )}
        
        {!isLoadingSuggestions && searchQuery.length > 0 && searchSuggestions.length === 0 && (
          <div className="px-4 py-2 text-sm text-gray-400">
            No products found for "{searchQuery}"
          </div>
        )}
        
        {searchQuery.length > 0 && (
          <div
            onClick={() => handleSearchSubmit()}
            className="px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 cursor-pointer border-t border-gray-100"
          >
            Search for "{searchQuery}"
          </div>
        )}
      </div>
    )}
  </div>
</div>
          <div className="pt-2 pb-3 space-y-1">
  <Link to="/" onClick={() => setIsMenuOpen(false)} className={`${mobileMenuItemClass} ${isMenuOpen ? 'animate-slideIn' : ''}`} style={{animationDelay: '0.1s'}}>
    Home
  </Link>
  <Link to="/products" onClick={() => setIsMenuOpen(false)} className={`${mobileMenuItemClass} ${isMenuOpen ? 'animate-slideIn' : ''}`} style={{animationDelay: '0.15s'}}>
    Products
  </Link>
  <Link to="/categories" onClick={() => setIsMenuOpen(false)} className={`${mobileMenuItemClass} ${isMenuOpen ? 'animate-slideIn' : ''}`} style={{animationDelay: '0.2s'}}>
    Categories
  </Link>
  <Link to="/contact" onClick={() => setIsMenuOpen(false)} className={`${mobileMenuItemClass} ${isMenuOpen ? 'animate-slideIn' : ''}`} style={{animationDelay: '0.25s'}}>
    Contact
  </Link>
</div>


          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoggedIn ? (
              <div className="space-y-1">
                <Link to="/Account/profile" onClick={() => setIsMenuOpen(false)} className={mobileMenuItemClass}>
  {currentUser.displayName || 'My Account'}
</Link>
               <button
  onClick={() => {
    handleLogout();
    setIsMenuOpen(false);
  }}
 className="w-full text-left text-gray-400 hover:bg-gray-50 hover:text-red-500 block pl-3 pr-4 py-2 text-base font-medium transform transition-all duration-200 hover:translate-x-2 animate-bounceIn"
>
  Log Out
</button>
              </div>
            ) : (
              <div className="space-y-1">
               <Link to="/login" onClick={() => setIsMenuOpen(false)} className={mobileMenuItemClass}>
  Login
</Link>
<Link to="/signup" onClick={() => setIsMenuOpen(false)} className={mobileMenuItemClass}>
  Sign Up
</Link>
              </div>
            )}
           <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="text-gray-200 hover:bg-gray-800 hover:text-red-500 flex items-center pl-3 pr-4 py-2 text-base font-medium">
  <div className="relative mr-2">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
    {cartCount > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
        {cartCount > 99 ? '99+' : cartCount}
      </span>
    )}
  </div>
  Cart
</Link>
          </div>
 

{/* Mobile Wichlist and cart */}
<div className="px-4 py-3 border-t border-gray-700">
  <div className="flex items-center space-x-4">
    <Link to="/wishlist" className="flex items-center text-gray-200 hover:text-red-500">
      <Heart className="w-6 h-6 mr-2" />
      Wishlist
    </Link>
    <Link to="/cart" className="flex items-center text-white hover:text-blue-500 relative">
      <div className="relative mr-2">
        <ShoppingBasket className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </div>
      Cart
    </Link>
  </div>
</div>
        </div>
  </>
)}
    </header>
  );
};

export default Navbar;