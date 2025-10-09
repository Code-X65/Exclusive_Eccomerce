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
            <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
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
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 font-sans bg-gray-950 min-h-screen">
    {/* Back button */}
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
    >
      <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
      <span>Back</span>
    </button>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
         {/* Product Images Section */}
<div className="space-y-3 sm:space-y-4">
  {/* Main Image */}
  <div className="bg-gray-900 p-4 sm:p-6 lg:p-8 rounded-lg flex justify-center items-center h-64 sm:h-72 lg:h-80 border border-gray-800">
    {productImages[activeImage] ? (
      <img 
        src={productImages[activeImage]} 
        alt={product.name} 
        className="max-h-full max-w-full object-contain"
      />
    ) : (
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-gray-600 text-sm">No Image</span>
      </div>
    )}
  </div>
  
  {/* Thumbnail Images */}
  {productImages.length > 1 && (
    <div className="flex space-x-2 sm:space-x-4 justify-center overflow-x-auto pb-2 scrollbar-hide">
      {productImages.map((img, index) => (
        <div 
          key={index} 
          className={`flex-shrink-0 p-1.5 sm:p-2 border rounded-lg cursor-pointer transition-all duration-300 ${
            activeImage === index ? 'border-red-500 bg-gray-800' : 'border-gray-700 bg-gray-900'
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
            className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-contain"
          />
        </div>
      ))}
    </div>
  )}

  {/* Description - Desktop Only */}
  <p className="text-gray-400 text-sm hidden lg:block">
    {product.description || 'No description available for this product.'}
  </p>

  {/* Key Features - Desktop Only */}
  {product.features && product.features.length > 0 && product.features[0] && (
    <div className="mt-4 pt-4 border-t border-gray-800 hidden lg:block">
      <h4 className="font-medium text-gray-300 mb-2 text-sm sm:text-base">Key Features</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 border border-gray-800 rounded-lg">
          <thead>
            <tr className="bg-red-500">
              <th className="px-3 py-2 text-left text-sm font-medium text-white border-b border-gray-700">Feature</th>
            </tr>
          </thead>
          <tbody>
            {product.features.map((feature, index) => (
              feature && (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="px-3 py-2 text-sm text-gray-400">{feature}</td>
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
<div className="space-y-3 sm:space-y-4">
  <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">{product.name}</h1>
  
  {/* Ratings */}
  <div className="flex flex-wrap items-center gap-2 text-sm">
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={14} 
          className="sm:w-4 sm:h-4"
          fill={i < 4 ? "currentColor" : "none"} 
        />
      ))}
    </div>
    <span className="text-gray-500 text-xs sm:text-sm">(Reviews: 42)</span>
    <span className={`text-xs sm:text-sm px-2 py-0.5 rounded ${
      product.stockQuantity > 0 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-red-500/20 text-red-400'
    }`}>
      {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
    </span>
  </div>

  {/* Price */}
  <div className='flex items-center gap-2 sm:gap-4'>
    <div className="text-2xl sm:text-3xl font-bold text-white">₦{product.price?.toLocaleString()}</div>
    {product.originalPrice && (
      <div className="text-gray-500 line-through text-sm sm:text-base">₦{product.originalPrice?.toLocaleString()}</div>
    )}
  </div>

  {/* Short Description */}
  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
    {product.shortDescription || 'No description available for this product.'}
  </p>

  {/* Colors */}
  <div>
    <span className="block text-sm font-medium text-gray-300 mb-2">Colours:</span>
    <div className="flex space-x-2">
      {colorOptions.map((color) => (
        <button
          key={color.name}
          onClick={() => setSelectedColor(color.name)}
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full ${color.class} ${
            selectedColor === color.name ? 'ring-2 ring-offset-2 ring-offset-gray-950 ring-red-500' : ''
          }`}
          aria-label={`Select ${color.name} color`}
        />
      ))}
    </div>
  </div>
  
  {/* Stock Info */}
  {product.stockQuantity > 0 && (
    <div className="text-sm text-gray-400">
      Available: <span className="text-white font-medium">{product.stockQuantity}</span> units
    </div>
  )}
  
  {/* Quantity and Actions */}
  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
    {/* Quantity Selector */}
    <div className="flex border border-gray-700 rounded-md w-full sm:w-32 bg-gray-900">
      <button 
        onClick={() => handleQuantityChange(-1)}
        className="w-10 sm:w-8 flex items-center justify-center text-gray-400 hover:bg-gray-800 transition"
        disabled={quantity <= 1}
      >
        -
      </button>
      <div className="flex-1 text-center py-2 text-white font-medium">{quantity}</div>
      <button 
        onClick={() => handleQuantityChange(1)}
        className="w-10 sm:w-8 flex items-center justify-center text-gray-400 hover:bg-gray-800 transition"
        disabled={quantity >= (product.stockQuantity || 999)}
      >
        +
      </button>
    </div>
    
    {/* Add to Cart Button */}
    <button 
      onClick={handleAddToCart}
      disabled={product.stockQuantity === 0 || addingToCart}
      className={`flex-1 px-4 sm:px-6 py-2 sm:py-2.5 rounded-md transition flex items-center justify-center gap-2 text-sm sm:text-base font-medium ${
        product.stockQuantity > 0 && !addingToCart
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
      }`}
    >
      {addingToCart ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span className="hidden sm:inline">Adding...</span>
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          <span>{product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
        </>
      )}
    </button>
  </div>

  {/* Wishlist and Share - Mobile Full Width */}
  <div className="flex gap-2 sm:gap-3">
    <button 
      onClick={handleWishlistToggle}
      disabled={addingToWishlist}
      className={`flex-1 sm:flex-initial p-2 sm:p-2.5 rounded-md border transition ${
        isInWishlist 
          ? 'border-red-500 bg-red-500/10 hover:bg-red-500/20' 
          : 'border-gray-700 bg-gray-900 hover:bg-gray-800'
      } ${addingToWishlist ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {addingToWishlist ? (
        <Loader2 size={18} className="sm:w-5 sm:h-5 text-gray-400 animate-spin mx-auto" />
      ) : (
        <Heart 
          size={18} 
          className={`sm:w-5 sm:h-5 mx-auto ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
        />
      )}
    </button>

    {/* Share Button */}
    <div className="relative share-menu flex-1 sm:flex-initial">
      <button 
        onClick={handleShare}
        className="w-full p-2 sm:p-2.5 rounded-md border border-gray-700 bg-gray-900 hover:bg-gray-800 transition"
        title="Share product"
      >
        <Share2 size={18} className="sm:w-5 sm:h-5 text-gray-400 mx-auto" />
      </button>

      {/* Custom Share Menu - Mobile Optimized */}
      {showShareMenu && (
        <div className="fixed inset-x-4 bottom-4 sm:absolute sm:inset-x-auto sm:right-0 sm:bottom-auto sm:top-12 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 w-auto sm:w-64 p-4">
          <h4 className="font-medium text-white mb-3 text-sm sm:text-base">Share this product</h4>
          
          {/* Share URL Input */}
          <div className="mb-4">
            <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-400 bg-transparent border-none outline-none"
              />
              <button 
                onClick={copyToClipboard}
                className="px-2 sm:px-3 py-2 bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-1"
                title="Copy link"
              >
                <Copy size={14} />
                <span className="text-xs hidden sm:inline">Copy</span>
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={shareToWhatsApp}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs sm:text-sm"
            >
              <MessageCircle size={14} className="sm:w-4 sm:h-4" />
              <span>WhatsApp</span>
            </button>
            
            <button 
              onClick={shareToTwitter}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition text-xs sm:text-sm"
            >
              <Share2 size={14} className="sm:w-4 sm:h-4" />
              <span>Twitter</span>
            </button>
            
            <button 
              onClick={shareToFacebook}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm"
            >
              <Share2 size={14} className="sm:w-4 sm:h-4" />
              <span>Facebook</span>
            </button>
            
            <button 
              onClick={shareToTelegram}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs sm:text-sm"
            >
              <Send size={14} className="sm:w-4 sm:h-4" />
              <span>Telegram</span>
            </button>
          </div>
          
          <button 
            onClick={() => setShowShareMenu(false)}
            className="w-full mt-3 px-3 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-800 transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  </div>
  
  {/* Delivery Info */}
  <div className="space-y-3 border-t border-gray-800 pt-4 mt-4">
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-gray-900 rounded-full flex-shrink-0">
        <Truck size={18} className="sm:w-5 sm:h-5 text-gray-400" />
      </div>
      <div>
        <h4 className="font-medium text-sm sm:text-base text-white">Free Delivery</h4>
        <p className="text-gray-500 text-xs sm:text-sm">Enter your postal code for delivery availability</p>
      </div>
    </div>
    
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-gray-900 rounded-full flex-shrink-0">
        <RotateCcw size={18} className="sm:w-5 sm:h-5 text-gray-400" />
      </div>
      <div>
        <h4 className="font-medium text-sm sm:text-base text-white">Return Delivery</h4>
        <p className="text-gray-500 text-xs sm:text-sm">Free 30 days delivery returns. Details</p>
      </div>
    </div>
  </div>

  {/* Description - Mobile Only */}
  <p className="text-gray-400 text-sm lg:hidden pt-4 border-t border-gray-800">
    {product.description || 'No description available for this product.'}
  </p>

  {/* Key Features - Mobile Only */}
  {product.features && product.features.length > 0 && product.features[0] && (
    <div className="pt-4 border-t border-gray-800 lg:hidden">
      <h4 className="font-medium text-gray-300 mb-2 text-sm">Key Features</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 border border-gray-800 rounded-lg">
          <thead>
            <tr className="bg-red-500">
              <th className="px-3 py-2 text-left text-xs font-medium text-white border-b border-gray-700">Feature</th>
            </tr>
          </thead>
          <tbody>
            {product.features.map((feature, index) => (
              feature && (
                <tr key={index} className="border-b border-gray-800">
                  <td className="px-3 py-2 text-xs text-gray-400">{feature}</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}

  {/* Box Contents */}
  {product.boxContents && product.boxContents.length > 0 && product.boxContents[0] && (
    <div className="pt-4 border-t border-gray-800">
      <h4 className="font-medium text-gray-300 mb-2 text-sm sm:text-base">What's in the Box</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 border border-gray-800 rounded-lg">
          <thead>
            <tr className="bg-red-500">
              <th className="px-3 py-2 text-left text-xs sm:text-sm font-medium text-white border-b border-gray-700">Item</th>
            </tr>
          </thead>
          <tbody>
            {product.boxContents.map((item, index) => (
              item && (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="px-3 py-2 text-xs sm:text-sm text-gray-400">{item}</td>
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
  <div className="mt-8 sm:mt-12 lg:mt-16">
    <div className="flex justify-between items-center mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white">Related Items</h2>
    </div>
    
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
function RelatedProductCard({ product, handleAddToCartRelated }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Check wishlist status
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
          const updatedWishlist = currentWishlist.filter(item => item.productId !== product.id);
          await updateDoc(userDocRef, {
            wishlist: updatedWishlist
          });
          setIsInWishlist(false);
          alert('Product removed from wishlist!');
        } else {
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
      className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewProduct}
    >
      <div className="relative">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0].data || product.images[0].url} 
            alt={product.name} 
            className={`w-full h-40 sm:h-48 object-contain bg-gray-800 p-3 sm:p-4 transition-transform duration-300 ${
              isHovered ? 'scale-105' : ''
            }`} 
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gray-800 flex items-center justify-center">
            <span className="text-gray-600 text-sm">No Image</span>
          </div>
        )}
        
        {/* Action Buttons - Always visible on mobile, hover on desktop */}
        <div className={`absolute top-2 right-2 flex flex-col space-y-1.5 sm:space-y-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300`}>
          <button 
            className={`p-1.5 sm:p-2 rounded-full shadow-md transition ${
              isInWishlist 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-gray-900/90 hover:bg-gray-800'
            } ${addingToWishlist ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={handleWishlistToggle}
            disabled={addingToWishlist}
          >
            {addingToWishlist ? (
              <Loader2 size={14} className="sm:w-4 sm:h-4 text-gray-400 animate-spin" />
            ) : (
              <Heart 
                size={14}
                className={`sm:w-4 sm:h-4 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
              />
            )}
          </button>
          <button 
            className="p-1.5 sm:p-2 bg-gray-900/90 rounded-full shadow-md hover:bg-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProduct();
            }}
          >
            <Eye size={14} className="sm:w-4 sm:h-4 text-gray-400" />
          </button>
          <button 
            className="p-1.5 sm:p-2 bg-gray-900/90 rounded-full shadow-md hover:bg-gray-800"
            onClick={(e) => {
              e.stopPropagation();
              handleShareRelated(product);
            }}
            title="Share product"
          >
            <Share2 size={14} className="sm:w-4 sm:h-4 text-gray-400" />
          </button>
        </div>
        
        {product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
            New
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4">
        <h3 className="font-medium line-clamp-2 text-white text-sm sm:text-base">{product.name}</h3>
        <div className="flex items-center space-x-2 mt-1">
          <span className="font-semibold text-red-500 text-sm sm:text-base">₦{product.price?.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center space-x-1 mt-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={10} 
                className="sm:w-3 sm:h-3"
                fill={i < 4 ? "currentColor" : "none"}
              />
            ))}
          </div>
          <span className="text-gray-500 text-xs">(42)</span>
        </div>
        
        {/* Add to Cart Button */}
        <button 
          className={`w-full mt-2 sm:mt-3 py-1.5 sm:py-2 bg-red-500 text-white text-xs sm:text-sm rounded flex items-center justify-center space-x-1 hover:bg-red-600 transition ${
            isHovered ? 'opacity-100' : 'opacity-100 sm:opacity-0'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCartRelated(product);
          }}
        >
          <ShoppingCart size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>Add To Cart</span>
        </button>
      </div>
    </div>
  );
}
