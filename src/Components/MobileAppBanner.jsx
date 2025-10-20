import { useState } from 'react';
import { Bell, Smartphone, ShoppingCart, Heart, User, Star, TrendingUp, ArrowLeft } from 'lucide-react';
import PhoneFrame from './Phoneframe';

export default function MobileAppBanner() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const products = [
    { id: 1, name: 'Latest Phone', desc: 'Premium quality', price: '₦450,000', rating: 4.8, icon: Smartphone, color: 'from-purple-400 to-pink-400' },
    { id: 2, name: 'Accessories', desc: 'Best deals', price: '₦25,000', rating: 4.9, icon: ShoppingCart, color: 'from-blue-400 to-cyan-400' },
    { id: 3, name: 'Wishlist Items', desc: 'Save favorites', price: 'View All', rating: null, icon: Heart, color: 'from-pink-400 to-rose-400' }
  ];

  const handleNotifyMe = () => {
    if (email.trim()) {
      console.log('Notify email:', email);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNotifyMe();
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 10;
    const y = (e.clientX - rect.left - rect.width / 2) / 10;
    setRotateX(x);
    setRotateY(y);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const renderContent = () => {
    if (selectedProduct) {
      return (
        <div className="px-6 py-4 h-full flex flex-col">
          <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-2 text-purple-400 mb-4">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className={`w-24 h-24 bg-gradient-to-br ${selectedProduct.color} rounded-2xl flex items-center justify-center mb-4`}>
              <selectedProduct.icon className="text-white" size={48} />
            </div>
            <h3 className="text-xl font-bold text-white text-center">{selectedProduct.name}</h3>
            <p className="text-gray-400 text-sm mt-2">{selectedProduct.desc}</p>
            <p className="text-2xl font-bold text-purple-400 mt-6">{selectedProduct.price}</p>
            {selectedProduct.rating && (
              <div className="flex items-center gap-2 mt-4">
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                <span className="text-gray-300">{selectedProduct.rating}</span>
              </div>
            )}
            <button className="bg-purple-600 text-white px-8 py-2 rounded-lg mt-8 hover:bg-purple-500 transition w-full">
              Add to Cart
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="px-6 pb-4">
          <h3 className="text-2xl font-bold text-white mb-1">Exclusive</h3>
          <p className="text-gray-400 text-sm">Welcome back!</p>
        </div>

        <div className="px-6 mb-4">
          <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-gray-500 text-sm">Search products...</span>
          </div>
        </div>

        <div className="px-6 space-y-3 overflow-y-auto" style={{ maxHeight: '240px' }}>
          {products.map(product => (
            <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-gray-800 rounded-2xl p-4 shadow-lg hover:bg-gray-700 cursor-pointer transition">
              <div className="flex gap-3">
                <div className={`w-16 h-16 bg-gradient-to-br ${product.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <product.icon className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">{product.name}</h4>
                  <p className="text-xs text-gray-500 mb-1">{product.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400">{product.price}</span>
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={12} />
                        <span className="text-xs text-gray-400">{product.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <style>{`
      @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
      .float-animation { animation: float 3s ease-in-out infinite; }
    `}</style>,
    <div className="bg-gray-800 py-6 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-center">
          
          <div className="text-white space-y-6">
            <div className="inline-block">
              <span className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full animate-pulse">
                COMING SOON
              </span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Shop Smarter
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                On The Go
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-400">
              Our mobile app is launching soon! Get exclusive deals, faster checkout, and personalized shopping experience right in your pocket.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <ShoppingCart size={20} className="text-purple-400" />
                </div>
                <span className="text-gray-300">Lightning-fast checkout</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Bell size={20} className="text-purple-400" />
                </div>
                <span className="text-gray-300">Instant push notifications for deals</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <TrendingUp size={20} className="text-purple-400" />
                </div>
                <span className="text-gray-300">Personalized recommendations</span>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-400 mb-3">
                Be the first to know when we launch:
              </p>
              {!isSubmitted ? (
                <div className="md:flex gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700 w-full"
                  />
                  <button
                    onClick={handleNotifyMe}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-500 transition-colors flex items-center gap-2 whitespace-nowrap max-md:mt-4 max-md:"
                  >
                    <Bell size={18} />
                    Notify Me
                  </button>
                </div>
              ) : (
                <div className="bg-green-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 w-fit text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Thanks! You're on the list!
                </div>
              )}
            </div>
          </div>
          {/* Phone frame */}

          <PhoneFrame />
        </div>
      </div>
    </div>
  );
}