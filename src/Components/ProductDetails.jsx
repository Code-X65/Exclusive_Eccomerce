import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../Firebase/Firebase';
import { Star, Truck, RotateCcw, Heart, ShoppingCart, Eye, ArrowLeft, Loader2 } from 'lucide-react';

export default function ProductDetails() {
  // Route uses "/product/:id" so map the `id` param to `productId` to keep existing variable names
  const { id: productId } = useParams();
  const navigate = useNavigate();
  
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* Product Images Section */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-gray-50  rounded-lg flex justify-center items-center h-80 ">
            {productImages[activeImage] ? (
              <img 
                src={productImages[activeImage]} 
                alt={product.name} 
                className="max-h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
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
          
          {/* Price */}
          <div className="text-xl font-semibold">₦{product.price?.toLocaleString()}</div>
          
          {/* Description */}
          <p className="text-gray-600 text-sm">
            {product.description || 'No description available for this product.'}
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
              className={`px-6 py-2 rounded-md transition ${
                product.stockQuantity > 0
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              disabled={product.stockQuantity === 0}
            >
              {product.stockQuantity > 0 ? 'Buy Now' : 'Out of Stock'}
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
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Related Items</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Updated Related Product Component
function RelatedProductCard({ product }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
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
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              // Handle wishlist
            }}
          >
            <Heart size={16} className="text-gray-600" />
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
              // Handle add to cart
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
