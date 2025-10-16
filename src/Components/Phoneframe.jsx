import { useState } from 'react';
import { ShoppingCart, Heart, User, Search, MapPin, ChevronRight, Star } from 'lucide-react';

export default function PhoneFrame() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const featuredProducts = [
    { id: 1, name: 'Premium Headphones', price: '₦15,999', image: '🎧', rating: 4.8, reviews: 324 },
    { id: 2, name: 'Wireless Watch', price: '₦12,500', image: '⌚', rating: 4.6, reviews: 218 },
    { id: 3, name: 'Phone Case', price: '₦3,999', image: '📱', rating: 4.9, reviews: 512 }
  ];

  const categories = [
    { name: 'Electronics', icon: '📱' },
    { name: 'Fashion', icon: '👔' },
    { name: 'Home', icon: '🏠' },
    { name: 'Sports', icon: '⚽' }
  ];

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
        <div className="px-4 py-4 h-full flex flex-col">
          <button onClick={() => setSelectedProduct(null)} className="text-red-600 font-semibold mb-4">
            ← Back
          </button>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-7xl mb-4">{selectedProduct.image}</div>
            <h3 className="text-xl font-bold text-gray-900 text-center">{selectedProduct.name}</h3>
            <div className="flex items-center gap-2 mt-3">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-gray-600">{selectedProduct.rating} ({selectedProduct.reviews} reviews)</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-6">{selectedProduct.price}</p>
            <button className="bg-red-600 text-white px-8 py-3 rounded-lg mt-8 w-full font-semibold hover:bg-red-700 transition">
              Add to Cart
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Shop</h3>
            <div className="flex gap-2">
              <MapPin size={20} className="text-gray-600" />
              <ShoppingCart size={20} className="text-gray-600" />
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <Search size={16} className="text-gray-500" />
            <input type="text" placeholder="Search..." className="bg-transparent text-sm w-full outline-none text-gray-900" />
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="bg-gray-100 rounded-full p-3 text-xl">{cat.icon}</div>
                <span className="text-xs text-gray-600">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-gray-900 text-sm">Featured</h4>
            <span className="text-red-600 text-xs font-semibold flex items-center">See all <ChevronRight size={14} /></span>
          </div>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '200px' }}>
            {featuredProducts.map(product => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-gray-50 rounded-lg p-3 flex gap-3 cursor-pointer hover:bg-gray-100 transition">
                <div className="text-4xl">{product.image}</div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 text-sm">{product.name}</h5>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                  </div>
                  <p className="font-bold text-red-600 text-sm mt-1">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div >
        <div
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: 'transform 0.1s ease-out',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="w-72 h-[600px] bg-black rounded-[2.5rem] p-3 shadow-2xl border-8 border-gray-900">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10"></div>
            
            <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative flex flex-col">
              <div className="flex justify-between items-center px-4 pt-6 pb-2 text-gray-900 text-xs font-semibold">
                <span>9:41</span>
                <div className="flex gap-1">
                  <div className="w-4 h-3 border border-gray-900 rounded-sm"></div>
                  <div className="w-1 h-3 bg-gray-900 rounded-sm"></div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {renderContent()}
              </div>

              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                  {[
                    { icon: ShoppingCart, label: 'Shop', id: 'home' },
                    { icon: Search, label: 'Search', id: 'search' },
                    { icon: Heart, label: 'Wishlist', id: 'wishlist' },
                    { icon: User, label: 'Account', id: 'account' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex flex-col items-center gap-1 transition"
                    >
                      <tab.icon className={activeTab === tab.id ? 'text-red-600' : 'text-gray-400'} size={22} />
                      <span className={`text-xs font-medium ${activeTab === tab.id ? 'text-red-600' : 'text-gray-400'}`}>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -top-3 -right-3 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-xs shadow-lg animate-bounce">
            Hot Deal
          </div>
        </div>
      </div>
    </div>
  );
}