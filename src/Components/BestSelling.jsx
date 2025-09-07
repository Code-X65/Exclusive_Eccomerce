import { useState, useEffect } from 'react';
import { Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import product01 from '../assets/Images/products/Product01.png'
import product02 from '../assets/Images/products/Product02.png'
import product03 from '../assets/Images/products/Product03.png'
import product04 from '../assets/Images/products/Product04.png'
import product05 from '../assets/Images/products/Product05.png'
import product06 from '../assets/Images/products/Product06.png'
import product07 from '../assets/Images/products/Product07.png'
import product08 from '../assets/Images/products/Product08.png'
import product09 from '../assets/Images/products/Product09.png'
import product10 from '../assets/Images/products/Product10.png'

export default function BestSelling() {
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56
  });

  // Products data
  const products = [
    {
      id: 1,
      name: 'HAVIT HV-G92 Gamepad',
      originalPrice: 180,
      salePrice: 120,
      discount: 40,
      image: product05,
      rating: 5,
      reviews: 88
    },
    {
      id: 2,
      name: 'AK-900 Wired Keyboard',
      originalPrice: 960,
      salePrice: 650,
      discount: 35,
      image: product06,
      rating: 4,
      reviews: 75
    },
    {
      id: 3,
      name: 'IPS LCD Gaming Monitor',
      originalPrice: 400,
      salePrice: 370,
      discount: 30,
      image: product07,
      rating: 5,
      reviews: 99
    },
    {
      id: 4,
      name: 'S-Series Comfort Chair',
      originalPrice: 400,
      salePrice: 375,
      discount: 25,
      image: product08,
      rating: 4,
      reviews: 99
    }
  ];

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newSeconds = prevTime.seconds - 1;
        const newMinutes = newSeconds < 0 ? prevTime.minutes - 1 : prevTime.minutes;
        const newHours = newMinutes < 0 ? prevTime.hours - 1 : prevTime.hours;
        const newDays = newHours < 0 ? prevTime.days - 1 : prevTime.days;

        return {
          days: newDays < 0 ? 0 : newDays,
          hours: newHours < 0 ? 23 : newHours % 24,
          minutes: newMinutes < 0 ? 59 : newMinutes % 60,
          seconds: newSeconds < 0 ? 59 : newSeconds % 60
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Functions to handle navigation
  const handlePrevious = () => {
    console.log('Navigate to previous products');
  };

  const handleNext = () => {
    console.log('Navigate to next products');
  };

  // Rating stars component
  const RatingStars = ({ rating }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <svg 
            key={index} 
            className={`w-4 h-4 ${index < rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Format numbers with leading zeros
  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-2">
        <div className="w-5 h-10 bg-red-500 rounded mr-2"></div>
        <h2 className="text-lg font-bold text-red-500">This Month</h2>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Best Selling Products</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex justify-center mt-8">
        <button className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600">
          View All Products
        </button>
      </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className=" p-4 rounded-lg relative group">
            <div className='bg-white p-2'>

            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{product.discount}%
            </div>
            <div className="flex justify-end mb-2 space-x-2">
              <button className="p-1 bg-white rounded-full hover:bg-gray-100">
                <Heart size={16} className="text-gray-500" />
              </button>
              <button className="p-1 bg-white rounded-full hover:bg-gray-100">
                <Eye size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-32 w-32 object-contain " 
              />
            </div>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-sm mb-1">{product.name}</h3>
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="text-red-500 font-medium">${product.salePrice}</span>
                <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
              </div>
              <div className="flex justify-center items-center gap-2">
                <RatingStars rating={product.rating} />
                <span className="text-xs text-gray-500">({product.reviews})</span>
              </div>
            </div>
            <div className="mt-4  opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-full bg-black text-white text-sm py-2 rounded hover:bg-gray-800">
                Add To Cart
              </button>
            </div>
          </div>
        ))}
      </div>

    
    </div>
  );
}