import { useState } from 'react';
import { Star, Eye, Trash2, ShoppingCart } from 'lucide-react';
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

export default function UserWishlist() {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'Gucci duffle bag',
      price: 1560,
      oldPrice: 1850,
      image: product01,
      sale: true,
    },
    {
      id: 2,
      name: 'RGB liquid CPU Cooler',
      price: 1650,
      image: product02,
    },
    {
      id: 3,
      name: 'GP11 Shooter USB Gamepad',
      price: 1550,
      image: product03,
    },
    {
      id: 4,
      name: 'Quilted Satin Jacket',
      price: 750,
      image: product04,
    },
  ]);

  const recommendedItems = [
    {
      id: 5,
      name: 'ASUS FHD Gaming Laptop',
      price: 1560,
      oldPrice: 1860,
      image: product10,
      rating: 5,
      reviews: 49,
      sale: true,
    },
    {
      id: 6,
      name: 'IPS LCD Gaming Monitor',
      price: 1850,
      image: product09,
      rating: 4,
      reviews: 35,
    },
    {
      id: 7,
      name: 'HAVIT HV-G92 Gamepad',
      price: 1550,
      image: product07,
      rating: 4,
      reviews: 61,
      hot: true,
    },
    {
      id: 8,
      name: 'AK-900 Wired Keyboard',
      price: 200,
      image: product05,
      rating: 5,
      reviews: 46,
    },
  ];

  const handleRemoveFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  const renderRatingStars = (rating, reviews) => {
    return (
      <div className="flex items-center">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
            />
          ))}
        </div>
        <span className="text-gray-500 text-xs ml-1">({reviews})</span>
      </div>
    );
  };

  const renderProductCard = (item, section) => {
    return (
      <div key={item.id} className="relative bg-white rounded shadow group">
        {/* Tags */}
        {item.sale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            SALE
          </div>
        )}
        {item.hot && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            HOT
          </div>
        )}

        {/* Quick view button */}
        <button className="absolute top-2 right-2 bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye size={16} />
        </button>

        {/* Wishlist/Remove button */}
        {section === 'wishlist' ? (
          <button 
            onClick={() => handleRemoveFromWishlist(item.id)} 
            className="absolute top-2 right-2 bg-white p-1 rounded-full"
          >
            <Trash2 size={16} />
          </button>
        ) : (
          <button className="absolute top-2 right-2 bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye size={16} />
          </button>
        )}

        {/* Product image */}
        <div className="p-4 flex justify-center">
          <img src={item.image} alt={item.name} className="h-24 w-auto object-contain" />
        </div>

        {/* Add to cart button */}
        <div className="bg-black text-white p-2 flex justify-center items-center gap-2 cursor-pointer">
          <ShoppingCart size={16} />
          <span className="text-sm">Add To Cart</span>
        </div>

        {/* Product details */}
        <div className="p-3">
          <h3 className="text-sm font-medium mb-1">{item.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-semibold">${item.price}</span>
            {item.oldPrice && (
              <span className="text-gray-500 line-through text-xs">${item.oldPrice}</span>
            )}
          </div>
          {item.rating && renderRatingStars(item.rating, item.reviews)}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Wishlist Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Wishlist ({wishlistItems.length})
          </h2>
          <button className="border border-gray-300 px-4 py-1 text-sm hover:bg-gray-50">
            Move All To Bag
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {wishlistItems.map(item => renderProductCard(item, 'wishlist'))}
        </div>
      </div>

      {/* Just For You Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-500 mr-2"></div>
            <h2 className="text-xl font-semibold">Just For You</h2>
          </div>
          <button className="text-sm hover:underline">See All</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {recommendedItems.map(item => renderProductCard(item, 'recommended'))}
        </div>
      </div>
    </div>
  );
}