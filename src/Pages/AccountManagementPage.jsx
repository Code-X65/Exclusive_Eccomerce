import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import Profile from '../UserComponets/Profile';
import AddressBook from '../UserComponets/AddressBook';
import Payment from '../UserComponets/Payment';
import Orders from '../UserComponets/Orders';
import Returns from '../UserComponets/Returns';
import Cancellation from '../UserComponets/Cancellations';
import UserWishlist from '../UserComponets/UserWishlist';

// Progress Bar Component
const NavigationProgressBar = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const timer = setTimeout(() => setProgress(30), 50);
      const timer2 = setTimeout(() => setProgress(70), 150);
      const timer3 = setTimeout(() => setProgress(100), 300);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-red-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Main component that handles nested routing
const AccountManagementPage = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  // Handle navigation loading state
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      <NavigationProgressBar isLoading={isNavigating} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Sidebar Navigation */}
          <AccountSidebar setIsNavigating={setIsNavigating} />
          
          {/* Main Content Area */}
          <div className="flex-1 bg-white p-4 md:p-6 border border-gray-200 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <div className="text-sm">
                <span>Welcome! </span>
                <span className="font-medium text-red-500">Code X</span>
              </div>
            </div>
            
            {/* Nested Routes */}
            <div className={`transition-opacity duration-200 ${isNavigating ? 'opacity-50' : 'opacity-100'}`}>
              <AccountRoutes />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Sidebar Navigation Component
const AccountSidebar = ({ setIsNavigating }) => {
  const location = useLocation();

  const handleNavClick = () => {
    setIsNavigating(true);
  };

  return (
    <nav className="text-sm md:w-64 mb-6 md:mb-0">
      <div className="mb-4">
        <div className="flex items-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-700">My Account</span>
        </div>
      </div>
      
      <div className="mb-6 md:mb-8">
        <h2 className="font-bold text-gray-800 mb-2">Manage My Account</h2>
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/account/profile" 
              onClick={handleNavClick}
              className={({ isActive }) => 
                `block w-full text-left px-2 py-1 rounded-md transition-colors duration-150 ${
                  isActive ? 'font-medium text-red-500' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              My Profile
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/account/address" 
              onClick={handleNavClick}
              className={({ isActive }) => 
                `block w-full text-left px-2 py-1 rounded-md transition-colors duration-150 ${
                  isActive ? 'font-medium text-red-500' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              Address Book
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/account/payment" 
              onClick={handleNavClick}
              className={({ isActive }) => 
                `block w-full text-left px-2 py-1 rounded-md transition-colors duration-150 ${
                  isActive ? 'font-medium text-red-500' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              My Payment Options
            </NavLink>
          </li>
        </ul>
      </div>
      
      <div className="mb-6 md:mb-8">
        <h2 className="font-bold text-gray-800 mb-2">My Orders</h2>
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/account/orders" 
              onClick={handleNavClick}
              className={({ isActive }) => 
                `block w-full text-left px-2 py-1 rounded-md transition-colors duration-150 ${
                  isActive ? 'font-medium text-red-500' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              My Orders
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/account/returns" 
              onClick={handleNavClick}
              className={({ isActive }) => 
                `block w-full text-left px-2 py-1 rounded-md transition-colors duration-150 ${
                  isActive ? 'font-medium text-red-500' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              My Returns
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/account/cancellations" 
              onClick={handleNavClick}
              className={({ isActive }) => 
                `block w-full text-left px-2 py-1 rounded-md transition-colors duration-150 ${
                  isActive ? 'font-medium text-red-500' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              My Cancellations
            </NavLink>
          </li>
        </ul>
      </div>
      
      <div>
        <h2 className="font-bold text-gray-800 mb-2">My Wishlist</h2>
        <ul className="space-y-1">
          <li>
            <NavLink 
              to="/account/wishlist" 
              onClick={handleNavClick}
              className={({ isActive }) => 
                `block w-full text-left px-2 py-1 rounded-md transition-colors duration-150 ${
                  isActive ? 'font-medium text-red-500' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              My Wishlist
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

// Routes Component
const AccountRoutes = () => {
  const [firstName, setFirstName] = useState('Mel');
  const [lastName, setLastName] = useState('Rimel');
  const [email, setEmail] = useState('melrimel@gmail.com');
  const [address, setAddress] = useState('Kingston, 6258, United State');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log('Saving profile changes...');
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/account/profile" replace />} />
      <Route path="profile" element={
        <Profile 
          handleSaveChanges={handleSaveChanges}
          firstName={firstName}
          lastName={lastName}
          email={email}
          address={address}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setEmail={setEmail}
          setAddress={setAddress}
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          setCurrentPassword={setCurrentPassword}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
        />
      } />
      <Route path="address" element={
        <AddressBook 
          firstName={firstName} 
          lastName={lastName} 
          email={email} 
          address={address} 
        />
      } />
      <Route path="payment" element={<Payment />} />
      <Route path="orders" element={<Orders />} />
      <Route path="returns" element={<Returns />} />
      <Route path="cancellations" element={<Cancellation />} />
      <Route path="wishlist" element={<UserWishlist />} />
      <Route path="*" element={<Navigate to="/account/profile" replace />} />
    </Routes>
  );
};

export default AccountManagementPage;