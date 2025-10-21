import { useState, useEffect, useRef } from 'react';
import { ChevronUp, Facebook, Twitter, Instagram, Linkedin, Heart, ShoppingBag } from 'lucide-react';
import GooglePlay from '../assets/Images/GooglePlay.png'
import AppStore from '../assets/Images/AppStore.png'
import QR from '../assets/Images/qr-code.png'
import App from '../App';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from '../Components/AuthContext';
import { User } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
const [searchSuggestions, setSuggestions] = useState([]);
const [searchHistory, setSearchHistory] = useState([]);
const [showSearchDropdown, setShowSearchDropdown] = useState(false);
const [isSearchFocused, setIsSearchFocused] = useState(false);
const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
const searchRef = useRef(null);
const searchDropdownRef = useRef(null);
const navigate = useNavigate();
const { currentUser, isLoggedIn } = useAuth();
const [profile, setProfile] = useState(false);
const profileRef = useRef(null);

const profileImg = isLoggedIn ? currentUser.photoURL : '';

const handleProfile = () => {
  setProfile(!profile);
};

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = () => {
    // Handle email subscription logic here
    console.log("Email submitted:", email);
    setEmail('');
  };

  // Load search history
useEffect(() => {
  try {
    const savedHistory = sessionStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  } catch (error) {
    console.log('Storage not available, using in-memory history');
  }
}, []);

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

const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchQuery(value);
  
  if (value.length > 0) {
    fetchSuggestions(value);
  } else {
    setSuggestions([]);
  }
};

const handleSearchFocus = () => {
  setIsSearchFocused(true);
  setShowSearchDropdown(true);
  if (searchQuery.length === 0 && searchHistory.length > 0) {
    setSuggestions([]);
  }
};

const handleSearchBlur = () => {
  setTimeout(() => {
    setIsSearchFocused(false);
    setShowSearchDropdown(false);
  }, 300);
};

const handleSearchSubmit = (query = searchQuery) => {
  if (!query.trim()) return;
  
  const newHistory = [query.trim(), ...searchHistory.filter(item => item !== query.trim())].slice(0, 10);
  setSearchHistory(newHistory);
  
  try {
    sessionStorage.setItem('searchHistory', JSON.stringify(newHistory));
  } catch (error) {
    console.log('Storage not available');
  }
  
  setShowSearchDropdown(false);
  setSearchQuery('');
  navigate(`/products?search=${encodeURIComponent(query)}`);
};

const handleSuggestionClick = (suggestion) => {
  if (typeof suggestion === 'string') {
    setSearchQuery(suggestion);
    handleSearchSubmit(suggestion);
  } else {
    setSearchQuery('');
    setShowSearchDropdown(false);
    navigate(`/product/${suggestion.id}`);
  }
};

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

useEffect(() => {
  const handleClickOutside = (event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setProfile(false);
    }
  };
  
  if (profile) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [profile]);

  return (
    <footer className="bg-black text-white bottom-0 w-full">
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8 py-8 md:py-12">
          {/* Exclusive column */}
          <div className="w-full">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Exclusive</h3>
            <p className="mb-2 text-sm md:text-base">Subscribe</p>
            <p className="text-xs md:text-sm mb-4">Get 10% off your first order</p>
            
           <div className="relative w-full max-w-sm mb-4" ref={searchDropdownRef}>
  <div className="flex">
    <input
      ref={searchRef}
      type="text"
      placeholder="Search products..."
      value={searchQuery}
      onChange={handleSearchChange}
      onFocus={handleSearchFocus}
      onBlur={handleSearchBlur}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          handleSearchSubmit();
        }
      }}
      className="bg-black border border-gray-600 text-white text-xs md:text-sm py-2 px-3 flex-grow min-w-0"
    />
    <button 
      onClick={() => handleSearchSubmit()} 
      className="bg-black border border-gray-600 px-3 flex-shrink-0 hover:bg-gray-900 transition-colors"
    >
      <Search size={16} />
    </button>
  </div>
  
  {showSearchDropdown && (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
      {isLoadingSuggestions && (
        <div className="px-4 py-2 text-sm text-gray-400 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Searching...
        </div>
      )}
      
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
              className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer flex items-center border-b border-gray-600 last:border-b-0"
            >
              <Search size={14} className="mr-3 text-gray-400" />
              <span>{historyItem}</span>
            </div>
          ))}
        </>
      )}
      
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
              className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
            >
              <div className="font-medium">{suggestion.name}</div>
              <div className="text-xs text-gray-400">
                {suggestion.category} • ₦{suggestion.price?.toLocaleString()}
              </div>
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSearchSubmit();
          }}
          className="px-4 py-2 text-sm text-blue-400 hover:bg-gray-700 cursor-pointer border-t border-gray-600"
        >
          <Search size={14} className="inline mr-2" />
          Search for "{searchQuery}"
        </div>
      )}
      
      {!isLoadingSuggestions && searchQuery.length === 0 && searchHistory.length === 0 && (
        <div className="px-4 py-2 text-sm text-gray-400">
          Start typing to search for products...
        </div>
      )}
    </div>
  )}
</div>
          </div>

          {/* Support column */}
          <div className="w-full">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Support</h3>
            <p className="text-xs md:text-sm mb-2">Akugba Akoko</p>
            <p className="text-xs md:text-sm mb-2">Ondo state, Nigeria.</p>
            <p className="text-xs md:text-sm mb-2">exclusive@gmail.com</p>
            <p className="text-xs md:text-sm">+234-913-233-2395</p>
          </div>

         
         {/* Account column */}
<div className="w-full">
  <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Account</h3>
  <div className="text-xs md:text-sm space-y-2 flex flex-col">
    {isLoggedIn ? (
      <>
        <div className="relative" ref={profileRef}>
          <div 
            onClick={handleProfile}
            className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-colors"
          >
            <img 
              src={profileImg} 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-gray-600"
            />
            <span>{currentUser?.displayName || 'My Profile'}</span>
          </div>
          
          {profile && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700 z-50">
              <ul className="py-1">
                <Link to='/account'>
                  <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 hover:text-red-400 cursor-pointer transition-all text-white">
                    <User className="w-4 h-4" /> Manage Account
                  </li>
                </Link>
                <Link to='/orders'>
                  <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 hover:text-red-400 cursor-pointer transition-all text-white">
                    <ShoppingBag className="w-4 h-4" /> My Orders
                  </li>
                </Link>
                <Link to='/wishlist'>
                  <li className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 hover:text-red-400 cursor-pointer transition-all text-white">
                    <Heart className="w-4 h-4" /> Wishlist
                  </li>
                </Link>
              </ul>
            </div>
          )}
        </div>
        <Link to="/cart" className="hover:underline hover:text-gray-300 transition-colors">Cart</Link>
        <Link to="/shop" className="hover:underline hover:text-gray-300 transition-colors">Shop</Link>
      </>
    ) : (
      <>
        <Link to="/login" className="hover:underline hover:text-gray-300 transition-colors">Login / Register</Link>
        <Link to="/cart" className="hover:underline hover:text-gray-300 transition-colors">Cart</Link>
        <Link to="/wishlist" className="hover:underline hover:text-gray-300 transition-colors">Wishlist</Link>
        <Link to="/shop" className="hover:underline hover:text-gray-300 transition-colors">Shop</Link>
      </>
    )}
  </div>
</div>

          {/* Quick Link column */}
          <div className="w-full">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Quick Link</h3>
            <div className="text-xs md:text-sm space-y-2">
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Privacy Policy</a></div>
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Terms Of Use</a></div>
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">FAQ</a></div>
              <Link to="/contact"><div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Contact</a></div></Link>
            </div>
          </div>

        {/* Download app section */}
<div className="w-full sm:col-span-2 lg:col-span-1">
  <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Download App</h3>
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
    <p className="text-sm md:text-base text-yellow-400 font-semibold mb-2">Coming Soon!</p>
    <p className="text-xs md:text-sm text-gray-400">Our mobile app is under development. Stay tuned for the launch!</p>
  </div>
  
  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start gap-4">
    <div className="flex gap-3 items-start opacity-50 pointer-events-none">
      <div className="flex-shrink-0">
        <img src={QR} alt="QR Code" className="w-20 h-20 md:w-24 md:h-24 grayscale" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="relative">
          <img src={GooglePlay} alt="Get it on Google Play" className="h-8 md:h-10 w-auto grayscale" />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white bg-black/60 rounded">Soon</span>
        </div>
        <div className="relative">
          <img src={AppStore} alt="Download on App Store" className="h-8 md:h-10 w-auto grayscale" />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white bg-black/60 rounded">Soon</span>
        </div>
      </div>
    </div>
    
    <div className="flex gap-4 mt-2 sm:mt-0 lg:mt-4">
      <a href="https://facebook.com" className="text-white hover:text-blue-500 transition-colors">
        <Facebook size={20} />
      </a>
      <a href="https://twitter.com" className="text-white hover:text-blue-300 transition-colors">
        <Twitter size={20} />
      </a>
      <a href="https://instagram.com" className="text-white hover:text-red-500 transition-colors">
        <Instagram size={20} />
      </a>
      <a href="https://linkedin.com" className="text-white hover:text-blue-700 transition-colors">
        <Linkedin size={20} />
      </a>
    </div>
  </div>
</div>
        </div>

        {/* Copyright */}
        <div className="text-center py-4 text-xs md:text-sm text-gray-400 border-t border-gray-800">
          © Copyright Code X2025. All rights reserved.
        </div>
      </div>
    </footer>
  );
}