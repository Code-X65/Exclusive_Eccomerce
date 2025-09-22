import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, limit, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Star, Truck, RotateCcw, Heart, ShoppingCart, Eye, ArrowLeft, Loader2,  Share2, Copy, MessageCircle, Send } from 'lucide-react';

import { onAuthStateChanged } from 'firebase/auth';
const handleShareRelated = async (product) => {
  const url = `${window.location.origin}/Exclusive_Eccomerce/product/${product.id}`;
  
  if (navigator.share && navigator.canShare) {
    try {
      await navigator.share({
        title: product.name,
        text: `Check out this product: ${product.name}`,
        url: url,
      });
    } catch (error) {
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(url);
        alert('Product link copied to clipboard!');
      } catch (copyError) {
        alert('Unable to share. Please try again.');
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      alert('Product link copied to clipboard!');
    } catch (error) {
      alert('Unable to copy link. Please try again.');
    }
  }
};

export default function ProductDetails() {
  // Route uses "/product/:id" so map the `id` param to `productId` to keep existing variable names
  const [showShareMenu, setShowShareMenu] = useState(false);
const [shareUrl, setShareUrl] = useState('');
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
const [isInWishlist, setIsInWishlist] = useState(false);
  
  // State for product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Existing state
  const [selectedColor, setSelectedColor] = useState('white');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [hoveredThumbnail, setHoveredThumbnail] = useState(null);

  // Color and size options
  const colorOptions = [
    { name: 'white', class: 'bg-gray-100 border border-gray-300' },
    { name: 'red', class: 'bg-red-500' }
  ];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
  
const handleAddToCart = async () => {
  if (!user) {
    alert('Please log in to add items to cart');
    return;
  }

  if (product.stockQuantity === 0) {
    return;
  }

  try {
    setAddingToCart(true);

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: productImages[0] || '/api/placeholder/400/400',
      quantity: quantity,
      selectedSize: selectedSize,
      selectedColor: selectedColor,
      addedAt: new Date().toISOString()
    };

    const userDocRef = doc(db, 'users', user.uid);
    
    // Use setDoc with merge to create document if it doesn't exist
    await setDoc(userDocRef, {
      cart: arrayUnion(cartItem)
    }, { merge: true });

    alert('Product added to cart successfully!');
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Failed to add product to cart. Please try again.');
  } finally {
    setAddingToCart(false);
  }
};
const handleAddToCartRelated = async (product) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert('Please log in to add items to cart');
    return;
  }

  try {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.data || product.images?.[0]?.url || '/api/placeholder/400/400',
      quantity: 1,
      selectedSize: 'M',
      selectedColor: 'white',
      addedAt: new Date().toISOString()
    };

    const userDocRef = doc(db, 'users', currentUser.uid);
    
    // Use setDoc with merge to create document if it doesn't exist
    await setDoc(userDocRef, {
      cart: arrayUnion(cartItem)
    }, { merge: true });

    alert('Product added to cart successfully!');
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Failed to add product to cart. Please try again.');
  }
};
const handleWishlistToggle = async () => {
  if (!user) {
    alert('Please log in to add items to wishlist');
    return;
  }

  try {
    setAddingToWishlist(true);

    const wishlistItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: productImages[0] || '/api/placeholder/400/400',
      addedAt: new Date().toISOString()
    };

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Create user document with wishlist
      await setDoc(userDocRef, {
        wishlist: [wishlistItem],
        createdAt: new Date().toISOString()
      });
      setIsInWishlist(true);
      alert('Product added to wishlist!');
    } else {
      const userData = userDoc.data();
      const currentWishlist = userData.wishlist || [];
      
      if (isInWishlist) {
        // Remove from wishlist
        const updatedWishlist = currentWishlist.filter(item => item.productId !== product.id);
        await updateDoc(userDocRef, {
          wishlist: updatedWishlist
        });
        setIsInWishlist(false);
        alert('Product removed from wishlist!');
      } else {
        // Add to wishlist
        await updateDoc(userDocRef, {
          wishlist: arrayUnion(wishlistItem)
        });
        setIsInWishlist(true);
        alert('Product added to wishlist!');
      }
    }
  } catch (error) {
    console.error('Error updating wishlist:', error);
    alert('Failed to update wishlist. Please try again.');
  } finally {
    setAddingToWishlist(false);
  }
};
const handleAddToWishlistRelated = async (product) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert('Please log in to add items to wishlist');
    return;
  }

  try {
    const wishlistItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.data || product.images?.[0]?.url || '/api/placeholder/400/400',
      addedAt: new Date().toISOString()
    };

    const userDocRef = doc(db, 'users', currentUser.uid);
    
    // Use setDoc with merge to create document if it doesn't exist
    await setDoc(userDocRef, {
      wishlist: arrayUnion(wishlistItem)
    }, { merge: true });

    alert('Product added to wishlist successfully!');
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    alert('Failed to add product to wishlist. Please try again.');
  }
};



const generateShareUrl = () => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/Exclusive_Eccomerce/product/${productId}`;
};

const handleShare = async () => {
  const url = generateShareUrl();
  setShareUrl(url);

  // Check if Web Share API is supported (mobile devices)
  if (navigator.share && navigator.canShare) {
    try {
      await navigator.share({
        title: product.name,
        text: `Check out this amazing product: ${product.name}`,
        url: url,
      });
    } catch (error) {
      console.log('Error sharing:', error);
      // Fall back to custom share menu
      setShowShareMenu(true);
    }
  } else {
    // Show custom share menu for desktop
    setShowShareMenu(true);
  }
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl);
    alert('Product link copied to clipboard!');
    setShowShareMenu(false);
  } catch (error) {
    console.error('Failed to copy:', error);
    alert('Failed to copy link. Please try again.');
  }
};

const shareToWhatsApp = () => {
  const message = `Check out this amazing product: ${product.name} - ₦${product.price?.toLocaleString()}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareUrl)}`;
  window.open(whatsappUrl, '_blank');
  setShowShareMenu(false);
};

const shareToTwitter = () => {
  const tweet = `Check out this amazing product: ${product.name} - ₦${product.price?.toLocaleString()}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(shareUrl)}`;
  window.open(twitterUrl, '_blank');
  setShowShareMenu(false);
};

const shareToFacebook = () => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  window.open(facebookUrl, '_blank');
  setShowShareMenu(false);
};

const shareToTelegram = () => {
  const message = `Check out this amazing product: ${product.name}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
  window.open(telegramUrl, '_blank');
  setShowShareMenu(false);
};

useEffect(() => {
  const handleClickOutside = (event) => {
    if (showShareMenu && !event.target.closest('.share-menu')) {
      setShowShareMenu(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showShareMenu]);


  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        
        // Fetch the specific product
        const productDoc = await getDoc(doc(db, 'products', productId));
        
        if (!productDoc.exists()) {
          setError('Product not found');
          return;
        }
        
        const productData = {
          id: productDoc.id,
          ...productDoc.data()
        };
        
        setProduct(productData);
        
        // Fetch related products (excluding current product)
        const relatedQuery = query(
          collection(db, 'products'),
          limit(4)
        );
        
        const relatedSnapshot = await getDocs(relatedQuery);
        const relatedData = [];
        
        relatedSnapshot.forEach((doc) => {
          if (doc.id !== productId) {
            relatedData.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });
        
        setRelatedProducts(relatedData.slice(0, 4));
        
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });
  
  return () => unsubscribe(); // Cleanup subscription
}, []);
useEffect(() => {
  const checkWishlistStatus = async () => {
    if (!user || !product) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const wishlist = userData.wishlist || [];
        setIsInWishlist(wishlist.some(item => item.productId === product.id));
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  checkWishlistStatus();
}, [user, product]);

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 999)) {
      setQuantity(newQuantity);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading product details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Get product images or use placeholder
  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.data || img.url)
    : ['/api/placeholder/400/400']; // Fallback placeholder

  return (
    <div className="max-w-6xl mx-auto p-4 font-sans">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Section */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-gray-50 p-8 rounded-lg flex justify-center items-center h-80">
            {productImages[activeImage] ? (
              <img 
                src={productImages[activeImage]} 
                alt={product.name} 
                className="max-h-full object-contain"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail Images */}
          {productImages.length > 1 && (
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
                    className="w-20 h-20 object-contain"
                  />
                </div>
              ))}
            </div>
          )}

            {/* Description */}
          <p className="text-gray-600 text-sm">
            {product.description || 'No description available for this product.'}
          </p>

         {product.features && product.features.length > 0 && product.features[0] && (
  <div className="mt-4 pt-4 border-t border-gray-100">
    <h4 className="font-medium text-gray-700 mb-2">Key Features</h4>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-red-500">
            <th className="px-4 py-2 text-left text-sm font-medium text-white border-b">Feature</th>
          </tr>
        </thead>
        <tbody>
          {product.features.map((feature, index) => (
            feature && (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-600">{feature}</td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}



        </div>
        
        {/* Product Info Section */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          
          {/* Ratings */}
          <div className="flex items-center space-x-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < 4 ? "currentColor" : "none"} 
                  className={i < 4 ? "text-yellow-400" : "text-gray-200"}
                />
              ))}
            </div>
            <span className="text-gray-500 text-sm">(Reviews: 42)</span>
            <span className={`text-sm ${product.stockQuantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <div className='flex gap-4'>
          {/* Price */}
          <div className="text-2xl font-bold">₦{product.price?.toLocaleString()}</div>

          {/* Price */}
          <div className="text-gray-400 line-through text-xs sm:text-sm">₦{product.originalPrice?.toLocaleString()}</div>

          </div>
           <p className="text-gray-600 text-sm">
            {product.shortDescription || 'No description available for this product.'}
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
          
          {/* Stock Info */}
          <div className="text-sm text-gray-600">
            {product.stockQuantity > 0 && (
              <span>Available: {product.stockQuantity} units</span>
            )}
          </div>
          
          {/* Quantity and Actions */}
          <div className="flex space-x-4 pt-4">
            <div className="flex border border-gray-300 rounded-md w-32">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <div className="flex-1 text-center py-2">{quantity}</div>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="w-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                disabled={quantity >= (product.stockQuantity || 999)}
              >
                +
              </button>
            </div>
            
          <button 
  onClick={handleAddToCart}
  disabled={product.stockQuantity === 0 || addingToCart}
  className={`px-6 py-2 rounded-md transition flex items-center gap-2 ${
    product.stockQuantity > 0 && !addingToCart
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
  }`}
>
  {addingToCart ? (
    <>
      <Loader2 size={16} className="animate-spin" />
      Adding...
    </>
  ) : (
    <>
      <ShoppingCart size={16} />
      {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
    </>
  )}
</button>
            
      <div className="flex gap-2">
  <button 
    onClick={handleWishlistToggle}
    disabled={addingToWishlist}
    className={`p-2 rounded-md border transition ${
      isInWishlist 
        ? 'border-red-500 bg-red-50 hover:bg-red-100' 
        : 'border-gray-300 hover:bg-gray-50'
    } ${addingToWishlist ? 'cursor-not-allowed opacity-50' : ''}`}
  >
    {addingToWishlist ? (
      <Loader2 size={20} className="text-gray-600 animate-spin" />
    ) : (
      <Heart 
        size={20} 
        className={isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'} 
      />
    )}
  </button>

  {/* Share Button */}
  <div className="relative share-menu">
    <button 
      onClick={handleShare}
      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition"
      title="Share product"
    >
      <Share2 size={20} className="text-gray-600" />
    </button>

    {/* Custom Share Menu */}
    {showShareMenu && (
      <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 p-4">
        <h4 className="font-medium text-gray-800 mb-3">Share this product</h4>
        
        {/* Share URL Input */}
        <div className="mb-4">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <input 
              type="text" 
              value={shareUrl} 
              readOnly 
              className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-50 border-none outline-none"
            />
            <button 
              onClick={copyToClipboard}
              className="px-3 py-2 bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-1"
              title="Copy link"
            >
              <Copy size={14} />
              <span className="text-xs">Copy</span>
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={shareToWhatsApp}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
          >
            <MessageCircle size={16} />
            WhatsApp
          </button>
          
          <button 
            onClick={shareToTwitter}
            className="flex items-center gap-2 px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition text-sm"
          >
            <Share2 size={16} />
            Twitter
          </button>
          
          <button 
            onClick={shareToFacebook}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            <Share2 size={16} />
            Facebook
          </button>
          
          <button 
            onClick={shareToTelegram}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
          >
            <Send size={16} />
            Telegram
          </button>
        </div>
        
        <button 
          onClick={() => setShowShareMenu(false)}
          className="w-full mt-3 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    )}
  </div>
</div>
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
          {/* Box Contents */}
{product.boxContents && product.boxContents.length > 0 && product.boxContents[0] && (
  <div className="mt-4 pt-4 border-t border-gray-100">
    <h4 className="font-medium text-gray-700 mb-2">What's in the Box</h4>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-red-500 ">
            <th className="px-4 py-2 text-left text-sm font-medium text-white border-b">Item</th>
          </tr>
        </thead>
        <tbody>
          {product.boxContents.map((item, index) => (
            item && (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-600">{item}</td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
        </div>
      </div>
      
      {/* Related Items Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Related Items</h2>
          </div>
          
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
  {relatedProducts.map((relatedProduct) => (
    <RelatedProductCard
      key={relatedProduct.id}
      product={relatedProduct}
      handleAddToCartRelated={handleAddToCartRelated}
    />
  ))}
</div>
        </div>
      )}
    </div>
  );
}

// Updated Related Product Component
// Complete RelatedProductCard component with wishlist functionality
function RelatedProductCard({ product, handleAddToCartRelated, handleAddToWishlistRelated }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check auth state for this component
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !product) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const wishlist = userData.wishlist || [];
          setIsInWishlist(wishlist.some(item => item.productId === product.id));
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    };

    checkWishlistStatus();
  }, [user, product]);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Please log in to add items to wishlist');
      return;
    }

    try {
      setAddingToWishlist(true);

      const wishlistItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.data || product.images?.[0]?.url || '/api/placeholder/400/400',
        addedAt: new Date().toISOString()
      };

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create user document with wishlist
        await setDoc(userDocRef, {
          wishlist: [wishlistItem],
          createdAt: new Date().toISOString()
        });
        setIsInWishlist(true);
        alert('Product added to wishlist!');
      } else {
        const userData = userDoc.data();
        const currentWishlist = userData.wishlist || [];
        
        if (isInWishlist) {
          // Remove from wishlist
          const updatedWishlist = currentWishlist.filter(item => item.productId !== product.id);
          await updateDoc(userDocRef, {
            wishlist: updatedWishlist
          });
          setIsInWishlist(false);
          alert('Product removed from wishlist!');
        } else {
          // Add to wishlist
          await updateDoc(userDocRef, {
            wishlist: arrayUnion(wishlistItem)
          });
          setIsInWishlist(true);
          alert('Product added to wishlist!');
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setAddingToWishlist(false);
    }
  };
  
  const handleViewProduct = () => {
    navigate(`/product/${product.id}`);
  };
  
  return (
    <div 
      className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
    >
      <div className="relative">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0].data || product.images[0].url} 
            alt={product.name} 
            className={`w-full h-48 object-contain bg-gray-50 p-4 transition-transform duration-300 ${
              isHovered ? 'scale-105' : ''
            }`} 
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        <div className={`absolute top-2 right-2 flex flex-col space-y-2 opacity-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : ''
        }`}>
          <button 
            className={`p-2 rounded-full shadow-md transition ${
              isInWishlist 
                ? 'bg-red-50 border border-red-200 hover:bg-red-100' 
                : 'bg-white hover:bg-gray-100'
            } ${addingToWishlist ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={handleWishlistToggle}
            disabled={addingToWishlist}
          >
            {addingToWishlist ? (
              <Loader2 size={16} className="text-gray-600 animate-spin" />
            ) : (
              <Heart 
                size={16} 
                className={isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'} 
              />
            )}
          </button>
          <button 
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProduct();
            }}
          >
            <Eye size={16} className="text-gray-600" />
          </button>
          <button 
  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
  onClick={(e) => {
    e.stopPropagation();
    handleShareRelated(product);
  }}
  title="Share product"
>
  <Share2 size={16} className="text-gray-600" />
</button>
        </div>
        
        {product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            New
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium line-clamp-2">{product.name}</h3>
        <div className="flex items-center space-x-2 mt-1">
          <span className="font-semibold text-red-500">₦{product.price?.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center space-x-1 mt-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={12} 
                fill={i < 4 ? "currentColor" : "none"}
                className={i < 4 ? "text-yellow-400" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-gray-500 text-xs">(42)</span>
        </div>
        
        <div className={`mt-3 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0 h-0'
        }`}>
          <button 
            className="w-full py-2 bg-blue-500 text-white text-sm rounded flex items-center justify-center space-x-1 hover:bg-blue-600 transition"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCartRelated(product);
            }}
          >
            <ShoppingCart size={14} />
            <span>Add To Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
