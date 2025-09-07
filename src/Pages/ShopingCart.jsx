import { useState } from 'react';
import product01 from '../assets/Images/products/Product01.png'
import product02 from '../assets/Images/products/Product02.png'
import product03 from '../assets/Images/products/Product03.png'
export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'LCD Monitor',
      price: 550,
      quantity: 1,
      image: product01,
    },
    {
      id: 2,
      name: 'HI Gamepad',
      price: 550,
      quantity: 2,
      image: product02,
    }
  ]);
  
  const [couponCode, setCouponCode] = useState('');

  const handleQuantityChange = (id, newQuantity) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const subtotal = calculateSubtotal();
  const shipping = 'Free';
  const total = subtotal;

  return (
    <div className="max-w-6xl mx-auto p-4 my-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-grow">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 font-normal text-gray-600">Product</th>
                <th className="text-left py-4 font-normal text-gray-600">Price</th>
                <th className="text-left py-4 font-normal text-gray-600">Quantity</th>
                <th className="text-right py-4 font-normal text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} className=" border-b border-gray-200">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 object-contain"
                      />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4">${item.price}</td>
                  <td className="py-4">
                    <div className="relative">
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="border rounded appearance-none px-3 py-1 pr-8 bg-white"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-right">${item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-between mt-8">
            <button className="border border-gray-300 px-6 py-2 hover:bg-gray-50">
              Return To Shop
            </button>
            <button className="border border-gray-300 px-6 py-2 hover:bg-gray-50">
              Update Cart
            </button>
          </div>
          
          <div className="flex gap-4 mt-8">
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="border px-4 py-2 flex-grow max-w-xs"
            />
            <button className="bg-red-500 text-white px-6 py-2 hover:bg-red-600">
              Apply Coupon
            </button>
          </div>
        </div>
        
        {/* Cart Totals */}
        <div className="w-full lg:w-96">
          <div className="shadow-md p-6">
            <h2 className="text-xl font-medium mb-6">Cart Total</h2>
            
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal}</span>
            </div>
            
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{shipping}</span>
            </div>
            
            <div className="flex justify-between py-3">
              <span className="text-gray-600">Total</span>
              <span className="font-bold">${total}</span>
            </div>
            
            <button className="w-full bg-red-500 text-white py-3 mt-6 hover:bg-red-600">
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}