import { useState } from 'react';
import { ChevronUp, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import GooglePlay from '../assets/Images/GooglePlay.png'
import AppStore from '../assets/Images/AppStore.png'
import QR from '../assets/Images/qr-code.png'
import App from '../App';


export default function Footer() {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = () => {
    // Handle email subscription logic here
    console.log("Email submitted:", email);
    setEmail('');
  };

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
            
            <div className="flex w-full max-w-sm mb-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                className="bg-black border border-gray-600 text-white text-xs md:text-sm py-2 px-3 flex-grow min-w-0"
              />
              <button 
                onClick={handleSubmit} 
                className="bg-black border border-gray-600 px-3 flex-shrink-0 hover:bg-gray-900 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Support column */}
          <div className="w-full">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Support</h3>
            <p className="text-xs md:text-sm mb-2">111 Bijoy sarani, Dhaka,</p>
            <p className="text-xs md:text-sm mb-2">DH 1515, Bangladesh.</p>
            <p className="text-xs md:text-sm mb-2">exclusive@gmail.com</p>
            <p className="text-xs md:text-sm">+88015-88888-9999</p>
          </div>

          {/* Account column */}
          <div className="w-full">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Account</h3>
            <div className="text-xs md:text-sm space-y-2">
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">My Account</a></div>
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Login / Register</a></div>
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Cart</a></div>
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Wishlist</a></div>
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Shop</a></div>
            </div>
          </div>

          {/* Quick Link column */}
          <div className="w-full">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Quick Link</h3>
            <div className="text-xs md:text-sm space-y-2">
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Privacy Policy</a></div>
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Terms Of Use</a></div>
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">FAQ</a></div>
              <div><a href="#" className="hover:underline hover:text-gray-300 transition-colors">Contact</a></div>
            </div>
          </div>

          {/* Download app section */}
          <div className="w-full sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Download App</h3>
            <p className="text-xs md:text-sm text-gray-400 mb-4">Save $3 with App New User Only</p>
            
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-start gap-4">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <img src={QR} alt="QR Code" className="w-20 h-20 md:w-24 md:h-24" />
                </div>
                <div className="flex flex-col gap-2">
                  <a href="#" className="block hover:opacity-80 transition-opacity">
                    <img src={GooglePlay} alt="Get it on Google Play" className="h-8 md:h-10 w-auto" />
                  </a>
                  <a href="#" className="block hover:opacity-80 transition-opacity">
                    <img src={AppStore} alt="Download on App Store" className="h-8 md:h-10 w-auto" />
                  </a>
                </div>
              </div>
              
              <div className="flex gap-4 mt-2 sm:mt-0 lg:mt-4">
                <a href="#" className="text-white hover:text-gray-300 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-white hover:text-gray-300 transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-white hover:text-gray-300 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-white hover:text-gray-300 transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center py-4 text-xs md:text-sm text-gray-400 border-t border-gray-800">
          © Copyright Code X2023. All rights reserved.
        </div>
      </div>
    </footer>
  );
}