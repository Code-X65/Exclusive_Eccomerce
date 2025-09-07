import { useState, useEffect } from 'react';
import { Star, Truck, RotateCcw, Heart, ShoppingCart, Eye } from 'lucide-react';
import Thumbnail01 from '../assets/Images/Thumbnails/Thumbnail01.png'
import Thumbnail02 from '../assets/Images/Thumbnails/Thumbnail02.png'
import Thumbnail03 from '../assets/Images/Thumbnails/Thumbnail03.png'
import Thumbnail04 from '../assets/Images/Thumbnails/Thumbnail04.png'
import Thumbnail05 from '../assets/Images/Thumbnails/Thumbnail05.png'
import product01 from '../assets/Images/products/product01.png'
import product02 from '../assets/Images/products/product02.png'
import product03 from '../assets/Images/products/product03.png'
import product04 from '../assets/Images/products/product04.png'
export default function ProductDetails() {
  const [selectedColor, setSelectedColor] = useState('white');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  // Product images - main product and thumbnails
  const productImages = [
    Thumbnail01, // Main gamepad front view
    Thumbnail02, // Main gamepad front view
    Thumbnail03, // Main gamepad front view
    Thumbnail04, // Main gamepad front view
    Thumbnail05, // Main gamepad front view
   // Side view 2
  ];
  
  // Related products data
  const relatedProducts = [
    {
      id: 1,
      name: "HAVIT HV-G92 Gamepad",
      price: 120.00,
      originalPrice: 160.00,
      rating: 4.8,
      reviews: 48,
      image: product01,
    },
    {
      id: 2,
      name: "AK-900 Wired Keyboard",
      price: 110.00,
      originalPrice: 150.00,
      rating: 4.7,
      reviews: 75,
      image: product02,
    },
    {
      id: 3,
      name: "IPS LCD Gaming Monitor",
      price: 370.00,
      originalPrice: 400.00,
      rating: 4.9,
      reviews: 99,
      image: product03,
    },
    {
      id: 4,
      name: "RGB Liquid CPU Cooler",
      price: 160.00,
      originalPrice: 170.00,
      rating: 4.9,
      reviews: 65,
      image: product04,
    },
  ];

  // Thumbnail animation
  const [hoveredThumbnail, setHoveredThumbnail] = useState(null);

  // Color options
  const colorOptions = [
    { name: 'white', class: 'bg-gray-100 border border-gray-300' },
    { name: 'red', class: 'bg-red-500' }
  ];

  // Size options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Section */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-gray-50 p-8 rounded-lg flex justify-center items-center h-80">
            <img 
              src={productImages[activeImage]} 
              alt="Havic HV G-92 Gamepad" 
              className="max-h-full object-contain"
            />
          </div>
          
          {/* Thumbnail Images */}
          <div className="flex space-x-4 justify-center">
            {productImages.map((img, index) => (
              <div 
                key={index} 
                className={`p-2 border rounded-lg cursor-pointer transition-all duration-300 ${
                  activeImage === index ? 'border-blue-500' : 'border-gray-200'
                } ${
                  hoveredThumbnail === index ? 'scale-110 shadow-md' : ''
                }`}
                onClick={() => setActiveImage(index)}
                onMouseEnter={() => setHoveredThumbnail(index)}
                onMouseLeave={() => setHoveredThumbnail(null)}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-16 h-16 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Product Info Section */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Havic HV G-92 Gamepad</h1>
          
          {/* Ratings */}
          <div className="flex items-center space-x-2">
            <div className="flex text-yellow-400">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" strokeWidth={0} className="text-gray-200" />
            </div>
            <span className="text-gray-500 text-sm">(Reviews: 42)</span>
            <span className="text-blue-500 text-sm">In Stock</span>
          </div>
          
          {/* Price */}
          <div className="text-xl font-semibold">$192.00</div>
          
          {/* Description */}
          <p className="text-gray-600 text-sm">
            PlayStation 5 Controller skin high-quality vinyl with air release channels. 
            Leaves no residue when removed and does not hinder functionality. The 
            advanced adhesive ensures a perfect installation.
          </p>
          
          {/* Colors */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Colours:</span>
            <div className="flex space-x-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-6 h-6 rounded-full ${color.class} ${
                    selectedColor === color.name ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                  }`}
                  aria-label={`Select ${color.name} color`}
                />
              ))}
            </div>
          </div>
          
          {/* Size */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Size:</span>
            <div className="flex space-x-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-8 h-8 flex items-center justify-center text-sm border rounded-md ${
                    selectedSize === size 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-black border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          {/* Quantity and Actions */}
          <div className="flex space-x-4 pt-4">
            <div className="flex border border-gray-300 rounded-md w-32">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <div className="flex-1 text-center py-2">{quantity}</div>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="w-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            
            <button className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
              Buy Now
            </button>
            
            <button className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition">
              <Heart size={20} className="text-gray-600" />
            </button>
          </div>
          
          {/* Delivery Info */}
          <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full">
                <Truck size={20} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Free Delivery</h4>
                <p className="text-gray-500 text-xs">Enter your postal code for delivery availability</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-50 rounded-full">
                <RotateCcw size={20} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Return Delivery</h4>
                <p className="text-gray-500 text-xs">Free 30 days delivery returns. Details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Items Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Related Items</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map((product) => (
            <RelatedProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Related Product Component with hover animations
function RelatedProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className={`w-full h-48 object-contain bg-gray-50 p-4 transition-transform duration-300 ${
            isHovered ? 'scale-105' : ''
          }`} 
        />
        <div className={`absolute top-2 right-2 flex flex-col space-y-2 opacity-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : ''
        }`}>
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
            <Heart size={16} className="text-gray-600" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
            <Eye size={16} className="text-gray-600" />
          </button>
        </div>
        
        {product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Sale
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium">{product.name}</h3>
        <div className="flex items-center space-x-2 mt-1">
          <span className="font-semibold text-red-500">${product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="text-gray-400 text-sm line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-1 mt-1">
          <div className="flex text-yellow-400">
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" />
            <Star size={12} fill="currentColor" strokeWidth={0} className="text-gray-200" />
          </div>
          <span className="text-gray-500 text-xs">({product.reviews})</span>
        </div>
        
        <div className={`mt-3 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0 h-0'
        }`}>
          <button className="w-full py-2 bg-blue-500 text-white text-sm rounded flex items-center justify-center space-x-1 hover:bg-blue-600 transition">
            <ShoppingCart size={14} />
            <span>Add To Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}