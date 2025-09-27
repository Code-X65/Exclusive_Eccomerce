import { useState } from 'react';
import { ChevronUp, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import GooglePlay from '../assets/Images/GooglePlay.png'
import AppStore from '../assets/Images/AppStore.png'
import QR from '../assets/Images/Qr_code.png'
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
    <footer className="bg-black text-white bottom-0 ">
     
<div className='max-w-6xl mx-auto'>
    
      {/* Main footer content */}
      <div className="grid md:grid=cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 py-8 px-6 md:px-12">
        {/* Exclusive column */}
        <div>
          <h3 className="font-bold mb-4">Exclusive</h3>
          <p className="mb-2">Subscribe</p>
          <p className="text-xs mb-4">Get 10% off your first order</p>
          
          <div className="flex mb-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              className="bg-black border border-gray-600 text-white text-xs py-2 px-3 mr-1 flex-grow"
            />
            <button 
              onClick={handleSubmit} 
              className="bg-black border border-gray-600 px-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Support column */}
        <div>
          <h3 className="font-bold mb-4">Support</h3>
          <p className="text-xs mb-1">111 Bijoy sarani, Dhaka,</p>
          <p className="text-xs mb-1">DH 1515, Bangladesh.</p>
          <p className="text-xs mb-1">exclusive@gmail.com</p>
          <p className="text-xs mb-3">+88015-88888-9999</p>
        </div>

        {/* Account column */}
        <div>
          <h3 className="font-bold mb-4">Account</h3>
          <div className="text-xs space-y-2">
            <div><a href="#" className="hover:underline">My Account</a></div>
            <div><a href="#" className="hover:underline">Login / Register</a></div>
            <div><a href="#" className="hover:underline">Cart</a></div>
            <div><a href="#" className="hover:underline">Wishlist</a></div>
            <div><a href="#" className="hover:underline">Shop</a></div>
          </div>
        </div>

        {/* Quick Link column */}
        <div>
          <h3 className="font-bold mb-4">Quick Link</h3>
          <div className="text-xs space-y-2">
            <div><a href="#" className="hover:underline">Privacy Policy</a></div>
            <div><a href="#" className="hover:underline">Terms Of Use</a></div>
            <div><a href="#" className="hover:underline">FAQ</a></div>
            <div><a href="#" className="hover:underline">Contact</a></div>
          </div>
        </div>
      {/* Download app section */}
      <div className="px-6   pb-8">
        <h3 className="font-bold mb-4">Download App</h3>
        <div className="flex flex-col justify-between items-center">
          <div>
            <p className="text-sm text-gray-400 ">Save $3 with App New User Only</p>
            <div className="flex  mt-4">
              <div className="">
                <img src={QR} alt="QR Code" className="" />
              </div>
              <div className="flex flex-col justify-center space-y-2">
                <a href="#" className="  flex items-center">
                  <img src={GooglePlay} alt="Google Play" className="mr-2 " />
                 
                </a>
                <a href="#" className=" flex items-center">
                  <img src={AppStore} alt="App Store" className="mr-2 " />
               
                </a>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-white hover:text-gray-300"><Facebook size={18} /></a>
            <a href="#" className="text-white hover:text-gray-300"><Twitter size={18} /></a>
            <a href="#" className="text-white hover:text-gray-300"><Instagram size={18} /></a>
            <a href="#" className="text-white hover:text-gray-300"><Linkedin size={18} /></a>
          </div>
        </div>
      </div>
      </div>


      {/* Copyright */}
      <div className="text-center py-4 text-xs text-gray-400 border-t border-gray-800">
        © Copyright Code X2023  . All rights reserved.
      </div>
</div>
    </footer>
  );
}