import { useState, useEffect } from 'react';
import { Heart, Eye, Loader2, Share2, Copy, MessageCircle } from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, query, where, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';

export default function BestSelling() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [displayMonth, setDisplayMonth] = useState('');
  const navigate = useNavigate();

  // Generate product URL for sharing
  const generateProductUrl = (productId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/product/${productId}`;
  };

  // Share functions
  const shareProduct = async (product) => {
    const url = generateProductUrl(product.id);
    const shareData = {
      title: product.name,
      text: `Check out this amazing product: ${product.name} - ₦${product.salePrice?.toLocaleString()}`,
      url: url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
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

  const shareToWhatsApp = (product) => {
    const url = generateProductUrl(product.id);
    const message = `Check out this amazing product: ${product.name} - ₦${product.salePrice?.toLocaleString()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToTwitter = (product) => {
    const url = generateProductUrl(product.id);
    const tweet = `Check out this product: ${product.name} - ₦${product.salePrice?.toLocaleString()}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = (product) => {
    const url = generateProductUrl(product.id);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  // Add to cart function
  const addToCart = async (product) => {
    if (!user) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.salePrice,
        image: product.image || '/api/placeholder/400/400',
        quantity: 1,
        selectedSize: 'M',
        selectedColor: 'white',
        addedAt: new Date().toISOString()
      };

      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        cart: arrayUnion(cartItem)
      }, { merge: true });

      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });

      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  // Fetch products by month
  useEffect(() => {
    const fetchProductsByMonth = async () => {
      try {
        setLoading(true);
        
        // Get current date
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-11
        
        // Get start and end of current month
        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
        
        // Get start and end of previous month
        const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const previousMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        // Try to fetch products from current month
        const querySnapshot = await getDocs(collection(db, 'products'));
        const allProducts = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt ? new Date(data.createdAt) : null;
          
          allProducts.push({
            id: doc.id,
            name: data.name,
            originalPrice: data.price ? data.price * 1.25 : 0,
            salePrice: data.price || 0,
            discount: 20,
            image: data.images && data.images.length > 0 ? (data.images[0].data || data.images[0].url) : null,
            rating: 5,
            reviews: Math.floor(Math.random() * 100) + 10,
            category: data.category,
            stock: data.stockQuantity || data.stock || 0,
            description: data.description,
            createdAt: createdAt
          });
        });

        // Filter products for current month
        let monthlyProducts = allProducts.filter(product => {
          if (!product.createdAt) return false;
          return product.createdAt >= currentMonthStart && product.createdAt <= currentMonthEnd;
        });

        // If no products in current month, try previous month
        if (monthlyProducts.length === 0) {
          monthlyProducts = allProducts.filter(product => {
            if (!product.createdAt) return false;
            return product.createdAt >= previousMonthStart && product.createdAt <= previousMonthEnd;
          });
          
          if (monthlyProducts.length > 0) {
            setDisplayMonth(previousMonthStart.toLocaleString('default', { month: 'long', year: 'numeric' }));
          }
        } else {
          setDisplayMonth(currentMonthStart.toLocaleString('default', { month: 'long', year: 'numeric' }));
        }

        // If still no products, show all products
        if (monthlyProducts.length === 0) {
          monthlyProducts = allProducts;
          setDisplayMonth('All Time');
        }

        // Sort by a metric (you can add sales data to sort by actual sales)
        // For now, sorting by reviews as a proxy for popularity
        monthlyProducts.sort((a, b) => b.reviews - a.reviews);
        
        // Get top 4 products
        setProducts(monthlyProducts.slice(0, 4));
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByMonth();
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

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

  // Product Card Component
  const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addingToWishlist, setAddingToWishlist] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

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

    // Close share menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (showShareMenu && !event.target.closest('.share-menu-container')) {
          setShowShareMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showShareMenu]);

    const handleViewDetails = () => {
      navigate(`/product/${product.id}`);
    };

    const handleAddToCart = async () => {
      setAddingToCart(true);
      await addToCart(product);
      setAddingToCart(false);
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
          price: product.salePrice,
          image: product.image || '/api/placeholder/400/400',
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

    const handleShare = (e) => {
      e.stopPropagation();
      setShowShareMenu(!showShareMenu);
    };

    const handleQuickShare = async (e) => {
      e.stopPropagation();
      await shareProduct(product);
    };

    return (
      <div 
        className="p-4 rounded-lg relative group bg-gray-700 hover:shadow-xl transition-shadow duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-gray-100 p-2 rounded-md relative">
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">
            -{product.discount}%
          </div>
          
          {/* Action Buttons */}
          <div className={`absolute top-2 right-2 flex flex-col gap-1 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              onClick={handleWishlistToggle}
              disabled={addingToWishlist}
              className={`p-1.5 rounded-full shadow-md transition-colors ${
                isInWishlist 
                  ? 'bg-red-50 border border-red-200 hover:bg-red-100' 
                  : 'bg-gray-700 hover:bg-red-50'
              } ${addingToWishlist ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {addingToWishlist ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Heart 
                  size={16} 
                  className={`${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
                />
              )}
            </button>
            
            <button
              onClick={handleViewDetails}
              className="p-1.5 bg-gray-700 hover:bg-blue-50 rounded-full shadow-md transition-colors"
            >
              <Eye size={16} className="text-gray-500" />
            </button>

            {/* Share Button */}
            <div className="share-menu-container relative">
              <button
                onClick={handleShare}
                className="p-1.5 bg-gray-700 hover:bg-green-50 rounded-full shadow-md transition-colors"
                title="Share product"
              >
                <Share2 size={16} className="text-gray-500" />
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-gray-700 border border-gray-200 rounded-lg shadow-lg z-50 w-48 p-3">
                  <h5 className="font-medium text-gray-800 mb-2 text-xs">Share Product</h5>
                  
                  <div className="space-y-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        shareToWhatsApp(product);
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle size={12} />
                      WhatsApp
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        shareToTwitter(product);
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-blue-400 text-white rounded hover:bg-blue-500 transition-colors"
                    >
                      <Share2 size={12} />
                      Twitter
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        shareToFacebook(product);
                        setShowShareMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Share2 size={12} />
                      Facebook
                    </button>
                    
                    <button 
                      onClick={handleQuickShare}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      <Copy size={12} />
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center mb-4 cursor-pointer" onClick={handleViewDetails}>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-32 w-32 object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            ) : (
              <div className="h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-3">
          <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10 text-white">{product.name}</h3>
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-red-500 font-medium">₦{product.salePrice?.toLocaleString()}</span>
            <span className="text-gray-400 line-through text-sm">₦{product.originalPrice?.toLocaleString()}</span>
          </div>
          <div className="flex justify-center items-center gap-2 mb-2">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-gray-500">({product.reviews})</span>
          </div>
          
          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="text-xs text-red-600 mb-2">Out of Stock</div>
          )}
        </div>
        
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className={`w-full text-sm py-2 rounded transition-colors ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : addingToCart 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : addingToCart ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </div>
            ) : (
              'Add To Cart'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center mb-2">
        <div className="w-5 h-10 bg-red-500 rounded mr-2"></div>
        <h2 className="text-lg font-bold text-red-500">This Month</h2>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-4xl font-bold">Best Selling Products</h1>
          {displayMonth && (
            <p className="text-sm text-gray-500 mt-1">{displayMonth}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="md:flex justify-center hidden">
            <button 
              onClick={() => navigate('/products')}
              className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600"
            >
              View All Products
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mr-2" />
          <span className="text-gray-600">Loading best sellers...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">No products available</h3>
              <p className="text-gray-500">Check back later for amazing deals!</p>
            </div>
          )}

          {/* Mobile View All Button */}
          <div className="md:hidden flex justify-center mt-6">
            <button 
              onClick={() => navigate('/products')}
              className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600"
            >
              View All Products
            </button>
          </div>
        </>
      )}
    </div>
  );
}