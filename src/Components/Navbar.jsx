import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Components/AuthContext';
import { Heart, HeartMinus, LogOut, Search, ShoppingBag, ShoppingBasket, Star, User, UserCircle, XCircle } from 'lucide-react';

const Navbar = () => {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [profile, setProfile] = useState(false);
  const profileRef = useRef(null);
  
  const profileImg = isLoggedIn ? currentUser.photoURL : '';
  const handleProfile = () => {
    setProfile(!profile);
  };
  const mobileMenuItemClass = "text-white hover:bg-gray-50 hover:text-red-500 block pl-3 pr-4 py-2 text-base font-medium transform transition-all duration-200 hover:translate-x-2";
  
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
  

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by protected routes
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="bg-white border-b-1 border-gray-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between h-16">

            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-red-500">
                Exclusive
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                Home
              </Link>
              <Link to="/products" className="border-transparent text-gray-500 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                Products
              </Link>
              <Link to="/categories" className="border-transparent text-gray-500 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                Categories
              </Link>
              <Link to="/contact" className="border-transparent text-gray-500 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                Contact
              </Link>
              {
                isLoggedIn ? (
                   <></>
                ):(
                  <>
                   <Link to="/signup" className="border-transparent text-gray-500 hover:border-red-500 hover:text-red-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium animation-1000 duration-600">
                SignUp
              </Link>
                  </>
                )
              }

            </nav>
         
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2 lg:space-x-4">
             <div className="relative flex-1 max-w-md">
    <input 
  type="text" 
  placeholder="What are you looking for?" 
  className="w-full py-2 pl-3 pr-10 text-sm rounded-md bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
/>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700">
      <Search />
    </div>
  </div>
            {isLoggedIn ? (
              <>
            
 <div className="flex justify-center items-center gap-6 p-4 ">
      {/* Icon buttons */}
      <Link to='/wishlist'>
      
      <Heart className="w-6 h-6 text-gray-700 hover:text-red-500 cursor-pointer transition-colors" />
      </Link>

      <Link to="/cart">
      
      <ShoppingBasket className="w-6 h-6 text-gray-700 hover:text-blue-500 cursor-pointer transition-colors" />
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
            <li className="flex items-center gap-3 px-4 py-2 hover:bg-black/40 hover:text-red-400 cursor-pointer transition-all duration-300">
              <ShoppingBag className="w-5 h-5" /> My Orders
            </li>
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
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
          <div className="px-4 py-3 ">
  <div className="relative">
    <input 
      type="text" 
      placeholder="What are you looking for?" 
      className="w-full py-2 pl-4 pr-10 rounded-md bg-gray-100 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300"
    />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700">
      <Search />
    </div>
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
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className={mobileMenuItemClass}>
  {currentUser.displayName || 'My Account'}
</Link>
               <button
  onClick={() => {
    handleLogout();
    setIsMenuOpen(false);
  }}
 className="w-full text-left text-gray-500 hover:bg-gray-50 hover:text-red-500 block pl-3 pr-4 py-2 text-base font-medium transform transition-all duration-200 hover:translate-x-2 animate-bounceIn"
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
           <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="text-white hover:bg-gray-50 hover:text-red-500 flex items-center pl-3 pr-4 py-2 text-base font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Cart
            </Link>
          </div>
 

{/* Mobile Wichlist and cart */}
<div className="px-4 py-3 border-t border-gray-200">
  <div className="flex items-center space-x-4">
    <button className="flex items-center text-white hover:text-red-500">
      <Heart className="w-6 h-6 mr-2" />
      Wishlist
    </button>
    <button className="flex items-center text-white hover:text-blue-500">
      <ShoppingBasket className="w-6 h-6 mr-2" />
      Cart
    </button>
  </div>
</div>
        </div>
  </>
)}
    </header>
  );
};

export default Navbar;