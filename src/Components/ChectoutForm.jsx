import { useState } from 'react';
import product01 from '../assets/Images/products/Product01.png'
import product02 from '../assets/Images/products/Product02.png'
import product03 from '../assets/Images/products/Product03.png'

export default function CheckoutForm() {
  const [saveInfo, setSaveInfo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Order placed!');
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Left side - Billing details */}
      <div className="w-full lg:w-3/5">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Billing Details</h1>
        </div>
        
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">First Name</label>
              <input 
                type="text" 
                className="w-full p-2 bg-gray-100 rounded border border-gray-200" 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Last Name</label>
              <input 
                type="text" 
                className="w-full p-2 bg-gray-100 rounded border border-gray-200" 
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Company Name</label>
            <input 
              type="text" 
              className="w-full p-2 bg-gray-100 rounded border border-gray-200" 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Street Address</label>
            <input 
              type="text" 
              className="w-full p-2 bg-gray-100 rounded border border-gray-200" 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Apartment, floor, etc. (Optional)</label>
            <input 
              type="text" 
              className="w-full p-2 bg-gray-100 rounded border border-gray-200" 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Town/City</label>
              <input 
                type="text" 
                className="w-full p-2 bg-gray-100 rounded border border-gray-200" 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">ZIP/Postal Code</label>
              <input 
                type="text" 
                className="w-full p-2 bg-gray-100 rounded border border-gray-200" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
              <input 
                type="tel" 
                className="w-full p-2 bg-gray-100 rounded border border-gray-200" 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Email Address</label>
              <input 
                type="email" 
                className="w-full p-2 bg-gray-100 rounded border border-gray-200" 
              />
            </div>
          </div>
          
          <div className="mb-6 flex items-center">
            <input 
              type="checkbox" 
              id="saveInfo" 
              className="mr-2" 
              checked={saveInfo}
              onChange={() => setSaveInfo(!saveInfo)}
            />
            <label htmlFor="saveInfo" className="text-sm">Save this information for faster check-out next time</label>
          </div>
        </div>
      </div>
      
      {/* Right side - Order summary */}
      <div className="w-full lg:w-2/5">
        <div className="bg-white p-4 sm:p-6 rounded shadow">
          {/* Order items */}
          <div className="border-b pb-4 mb-4">
            <h2 className="text-lg font-semibold mb-4">Your Order</h2>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded mr-2 sm:mr-3 flex items-center justify-center overflow-hidden">
                 <img src={product01} alt="LCD Monitor" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm sm:text-base">LCD Monitor</span>
              </div>
              <span className="font-semibold text-sm sm:text-base">$650</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded mr-2 sm:mr-3 flex items-center justify-center overflow-hidden">
                  <img src={product02} alt="Hi Gamepad" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm sm:text-base">Hi Gamepad</span>
              </div>
              <span className="font-semibold text-sm sm:text-base">$1100</span>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="border-b pb-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 text-sm sm:text-base">Subtotal:</span>
              <span className="font-semibold text-sm sm:text-base">$1750</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 text-sm sm:text-base">Shipping:</span>
              <span className="text-green-600 text-sm sm:text-base">Free</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-base sm:text-lg font-bold">Total:</span>
              <span className="text-base sm:text-lg font-bold">$1750</span>
            </div>
          </div>
          
          {/* Payment methods */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Payment Method</h3>
            <div className="flex items-center mb-3 flex-wrap sm:flex-nowrap">
              <input 
                type="radio" 
                id="card" 
                name="payment" 
                className="mr-2" 
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />
              <label htmlFor="card" className="mr-2 sm:mr-4">Bank</label>
              <div className="flex space-x-2 mt-1 sm:mt-0">
                <div className="w-8 h-5 bg-pink-600 rounded"></div>
                <div className="w-8 h-5 bg-blue-100 rounded flex items-center justify-center text-xs text-blue-800">VISA</div>
                <div className="w-8 h-5 bg-yellow-500 rounded"></div>
                <div className="w-8 h-5 bg-gray-300 rounded"></div>
              </div>
            </div>
            
            <div className="flex items-center">
              <input 
                type="radio" 
                id="cash" 
                name="payment" 
                className="mr-2" 
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
              />
              <label htmlFor="cash">Cash on delivery</label>
            </div>
          </div>
          
          {/* Coupon code */}
          <div className="flex flex-col sm:flex-row mb-6">
            <input 
              type="text" 
              placeholder="Coupon Code" 
              className="flex-grow p-2 border border-gray-300 rounded-t sm:rounded-l sm:rounded-r-none sm:rounded-t-none mb-2 sm:mb-0"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded-b sm:rounded-r sm:rounded-l-none sm:rounded-b-none"
              onClick={() => console.log('Apply coupon:', couponCode)}
            >
              Apply Coupon
            </button>
          </div>
          
          {/* Place Order button */}
          <button 
            className="w-full bg-red-500 text-white py-3 rounded hover:bg-red-600 transition-colors"
            onClick={handleSubmit}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}