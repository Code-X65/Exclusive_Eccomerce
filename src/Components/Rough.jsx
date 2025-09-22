import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, limit, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Star, Truck, RotateCcw, Heart, ShoppingCart, Eye, ArrowLeft, Loader2, Share2, Award, Shield, ChevronLeft, ChevronRight, FactoryIcon, X, Phone, Package, SelectedLocation  } from 'lucide-react';

import { onAuthStateChanged } from 'firebase/auth';


export default function ProductDetails() {
  // Route uses "/product/:id" so map the `id` param to `productId` to keep existing variable names
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
  <div className="bg-gray-50 min-h-screen">
  <div className="max-w-7xl mx-auto p-4">
    {/* Back button */}
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
    >
      <ArrowLeft size={16} />
      Back
    </button>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column - Product Images */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Badges */}
        <div className="flex gap-2 mb-4">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Official Store</span>
          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Pay on Delivery</span>
        </div>

        {/* Main Product Image */}
        <div className="bg-gray-50 p-6 rounded-lg flex justify-center items-center h-80 mb-4 relative">
          {productImages[activeImage] ? (
            <img 
              src={productImages[activeImage]} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          {/* Heart Icon */}
          <button 
            onClick={handleWishlistToggle}
            disabled={addingToWishlist}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
              isInWishlist 
                ? 'bg-red-50 text-red-500' 
                : 'bg-white text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart 
              size={20} 
              className={isInWishlist ? 'fill-red-500' : ''} 
            />
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => setActiveImage(Math.max(0, activeImage - 1))}
            className="p-1 rounded hover:bg-gray-100"
            disabled={activeImage === 0}
          >
            <ChevronLeft size={16} className={activeImage === 0 ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          
          <div className="flex gap-2">
            {productImages.slice(0, 6).map((img, index) => (
              <div 
                key={index}
                className={`w-12 h-12 border rounded cursor-pointer transition-all ${
                  activeImage === index ? 'border-orange-500' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveImage(index)}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-full object-contain p-1"
                />
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setActiveImage(Math.min(productImages.length - 1, activeImage + 1))}
            className="p-1 rounded hover:bg-gray-100"
            disabled={activeImage === productImages.length - 1}
          >
            <ChevronRight size={16} className={activeImage === productImages.length - 1 ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>

        {/* Share Section */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">SHARE THIS PRODUCT</h4>
          <div className="flex gap-3">
            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50">
              <FactoryIcon size={16} className="text-blue-600" />
            </button>
            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50">
              <X size={16} className="text-blue-400" />
            </button>
            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50">
              <Share2 size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Column - Product Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Product Title */}
        <h1 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h1>
        
        {/* Brand */}
        <div className="text-sm text-gray-600 mb-4">
          Brand: <span className="text-blue-600 hover:underline cursor-pointer">{product.brand || 'N/A'}</span> | 
          <span className="text-blue-600 hover:underline cursor-pointer ml-1">Similar products from {product.brand || 'brand'}</span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900">₦ {product.price?.toLocaleString()}</div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="text-gray-400 line-through text-sm">₦ {product.originalPrice?.toLocaleString()}</div>
          )}
        </div>

        {/* Stock Status */}
        <div className={`text-sm mb-2 ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {product.stockQuantity > 0 ? 'In stock' : 'Out of stock'}
        </div>

        {/* Shipping Info */}
        <div className="text-sm text-gray-600 mb-4">
          + shipping from ₦ 750 to LEKKI-AJAH (SANGOTEDO)
        </div>

        {/* Ratings */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                fill={i < 4 ? "#fbbf24" : "none"} 
                className={i < 4 ? "text-yellow-400" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-blue-600 text-sm hover:underline cursor-pointer">(5638 verified ratings)</span>
        </div>

        {/* Variant Selection */}
        {product.colors && product.colors.length > 0 && product.colors[0].name && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">SELECT OTHER OPTIONS:</h4>
            <div className="flex gap-3">
              {product.colors.map((color, index) => (
                color.name && (
                  <div 
                    key={index} 
                    className="relative border rounded-lg p-2 cursor-pointer hover:border-orange-500 transition-colors"
                  >
                    <div 
                      className="w-12 h-12 rounded"
                      style={{ backgroundColor: color.hex }}
                    />
                    {/* Pink dot indicator if selected */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Storage Options */}
        {product.storageOptions && product.storageOptions.length > 0 && product.storageOptions[0].capacity && (
          <div className="mb-6">
            <div className="flex gap-2">
              {product.storageOptions.map((option, index) => (
                option.capacity && (
                  <div key={index} className="border rounded-lg p-3 cursor-pointer hover:border-orange-500 transition-colors">
                    <div className="text-sm font-medium">{option.capacity}</div>
                    {option.price && (
                      <div className="text-xs text-gray-500">₦{parseFloat(option.price).toLocaleString()}</div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0 || addingToCart}
          className={`w-full py-3 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            product.stockQuantity > 0 && !addingToCart
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {addingToCart ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              Add to cart
            </>
          )}
        </button>

        {/* Promotions */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">PROMOTIONS</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                <Phone size={10} className="text-orange-600" />
              </div>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                Call 07006000000 To Place Your Order
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                <Package size={10} className="text-orange-600" />
              </div>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                Enjoy cheaper shipping fees when you select a PickUp Station at checkout.
              </span>
            </div>
          </div>
        </div>

        {/* Report Link */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button className="text-sm text-blue-600 hover:underline">
            Report incorrect product information
          </button>
        </div>
      </div>

      {/* Right Column - Delivery & Returns */}
      <div className="space-y-4">
        
        {/* Delivery Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Truck size={18} className="text-orange-500" />
            DELIVERY & RETURNS
          </h3>
          
          {/* Jumia Express */}
          <div className="flex items-center gap-2 mb-4">
            <img src="/api/placeholder/80/20" alt="Jumia Express" className="h-5" />
            <div className="text-xs">
              <div className="font-medium">The BEST products, delivered faster.</div>
              <div className="text-gray-600">Now PAY on DELIVERY. Cash or Bank Transfer Anywhere. Zero Wahala!</div>
              <button className="text-blue-600 hover:underline">Details</button>
            </div>
          </div>

          {/* Location Selection */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Choose your location</h4>
            
            <div className="relative mb-2">
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white text-sm"
              >
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja</option>
                <option value="Port Harcourt">Port Harcourt</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
              <select 
                value={selectedDeliveryArea}
                onChange={(e) => setSelectedDeliveryArea(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white text-sm"
              >
                <option value="LEKKI-AJAH (SANGOTEDO)">LEKKI-AJAH (SANGOTEDO)</option>
                <option value="IKEJA">IKEJA</option>
                <option value="VICTORIA ISLAND">VICTORIA ISLAND</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Delivery Options */}
          <div className="space-y-4">
            
            {/* Pickup Station */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Package size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-sm">Pickup Station</div>
                  <button className="text-blue-600 text-xs hover:underline">Details</button>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">Delivery Fees ₦ 750</div>
              <div className="text-xs text-gray-500">
                Ready for pickup between <span className="font-medium">24 September</span> and <span className="font-medium">26 September</span> if you place your order within the next <span className="font-medium text-red-600">21hrs 40mins</span>
              </div>
            </div>

            {/* Door Delivery */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Truck size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-sm">Door Delivery</div>
                  <button className="text-blue-600 text-xs hover:underline">Details</button>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-2">Delivery Fees ₦ 1,710</div>
              <div className="text-xs text-gray-500">
                Ready for delivery between <span className="font-medium">24 September</span> and <span className="font-medium">26 September</span> if you place your order within the next <span className="font-medium text-red-600">21hrs 40mins</span>
              </div>
            </div>

            {/* Return Policy */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <RotateCcw size={20} className="text-gray-600" />
                <div>
                  <div className="font-medium text-sm">Return Policy</div>
                  <div className="text-xs text-gray-500">Easy return, quick refund.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-medium text-gray-900 mb-4">PRODUCT DETAILS</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Brand:</span>
              <span className="font-medium">{product.brand || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium">{product.model || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium capitalize">{product.category || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SKU:</span>
              <span className="font-mono text-xs">{product.sku || 'N/A'}</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Features */}
          {product.features && product.features.length > 0 && product.features[0] && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-700 mb-2">Key Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {product.features.map((feature, index) => (
                  feature && <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Box Contents */}
          {product.boxContents && product.boxContents.length > 0 && product.boxContents[0] && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-700 mb-2">What's in the Box</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {product.boxContents.map((item, index) => (
                  item && <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Related Products */}
    {relatedProducts.length > 0 && (
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Customers who viewed this item also viewed</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
