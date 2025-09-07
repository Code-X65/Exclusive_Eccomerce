import { useState } from 'react';
import { ArrowLeft, ArrowRight, Upload, X, Plus, Star, Eye, Check } from 'lucide-react';

export default function ProductUploadWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    category: '',
    brand: '',
    
    // Pricing
    price: '',
    originalPrice: '',
    
    // Images
    mainImage: null,
    thumbnails: [],
    
    // Specifications
    colors: [],
    sizes: [],
    
    // Inventory
    stock: '',
    sku: '',
    
    // Shipping
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    freeShipping: false
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]);

  const totalSteps = 6;

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e, type = 'main') => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'main') {
          setImagePreview(e.target.result);
          updateFormData('mainImage', file);
        } else {
          const newThumbnails = [...thumbnailPreviews, e.target.result];
          setThumbnailPreviews(newThumbnails);
          updateFormData('thumbnails', [...formData.thumbnails, file]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = (index) => {
    const newThumbnails = thumbnailPreviews.filter((_, i) => i !== index);
    const newFiles = formData.thumbnails.filter((_, i) => i !== index);
    setThumbnailPreviews(newThumbnails);
    updateFormData('thumbnails', newFiles);
  };

  const addColor = (color) => {
    if (color && !formData.colors.includes(color)) {
      updateFormData('colors', [...formData.colors, color]);
    }
  };

  const removeColor = (color) => {
    updateFormData('colors', formData.colors.filter(c => c !== color));
  };

  const addSize = (size) => {
    if (size && !formData.sizes.includes(size)) {
      updateFormData('sizes', [...formData.sizes, size]);
    }
  };

  const removeSize = (size) => {
    updateFormData('sizes', formData.sizes.filter(s => s !== size));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
              <p className="text-gray-600 mt-2">Tell us about your product</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your product features and benefits"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="gaming">Gaming</option>
                    <option value="clothing">Clothing</option>
                    <option value="home">Home & Garden</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => updateFormData('brand', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter brand name"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Pricing</h2>
              <p className="text-gray-600 mt-2">Set your product pricing</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData('price', e.target.value)}
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => updateFormData('originalPrice', e.target.value)}
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">For showing discounts</p>
                </div>
              </div>
              
              {formData.price && formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}%
                      </span>
                    </div>
                    <div>
                      <p className="text-green-800 font-medium">Discount Applied</p>
                      <p className="text-green-600 text-sm">
                        Save ${(parseFloat(formData.originalPrice) - parseFloat(formData.price)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Product Images</h2>
              <p className="text-gray-600 mt-2">Upload high-quality images of your product</p>
            </div>
            
            <div className="space-y-6">
              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Main Product Image *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="mx-auto max-h-48 rounded-lg" />
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          updateFormData('mainImage', null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'main')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Thumbnail Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Additional Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {thumbnailPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`Thumbnail ${index + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                      <button
                        onClick={() => removeThumbnail(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {thumbnailPreviews.length < 4 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer relative">
                      <Plus className="text-gray-400" size={24} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'thumbnail')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Product Specifications</h2>
              <p className="text-gray-600 mt-2">Add colors, sizes, and other variants</p>
            </div>
            
            <div className="space-y-6">
              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Available Colors</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.colors.map((color, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{color}</span>
                      <button
                        onClick={() => removeColor(color)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add color (e.g., Red, Blue, Black)"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addColor(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      addColor(input.value.trim());
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Available Sizes</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.sizes.map((size, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{size}</span>
                      <button
                        onClick={() => removeSize(size)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add size (e.g., XS, S, M, L, XL)"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSize(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      addSize(input.value.trim());
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Inventory & Shipping</h2>
              <p className="text-gray-600 mt-2">Manage stock and shipping details</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => updateFormData('stock', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter stock quantity"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => updateFormData('sku', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Product SKU"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Product weight"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => updateFormData('dimensions', { ...formData.dimensions, length: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Length"
                  />
                  <input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => updateFormData('dimensions', { ...formData.dimensions, width: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Width"
                  />
                  <input
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => updateFormData('dimensions', { ...formData.dimensions, height: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Height"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="freeShipping"
                  checked={formData.freeShipping}
                  onChange={(e) => updateFormData('freeShipping', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="freeShipping" className="text-sm font-medium text-gray-700">
                  Offer free shipping for this product
                </label>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Review & Publish</h2>
              <p className="text-gray-600 mt-2">Review your product details before publishing</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Product Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div>
                  {imagePreview && (
                    <img src={imagePreview} alt="Product" className="w-full h-64 object-contain bg-gray-50 rounded-lg" />
                  )}
                  {thumbnailPreviews.length > 0 && (
                    <div className="flex space-x-2 mt-3">
                      {thumbnailPreviews.slice(0, 3).map((thumb, index) => (
                        <img key={index} src={thumb} alt={`Thumb ${index}`} className="w-16 h-16 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{formData.name || 'Product Name'}</h3>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" strokeWidth={0} className="text-gray-200" />
                    </div>
                    <span className="text-gray-500 text-sm">New Product</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-red-500">${formData.price || '0.00'}</span>
                    {formData.originalPrice && parseFloat(formData.originalPrice) > parseFloat(formData.price) && (
                      <span className="text-gray-400 line-through">${formData.originalPrice}</span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm">{formData.description || 'Product description'}</p>
                  
                  {formData.colors.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Colors: </span>
                      <span className="text-sm text-gray-600">{formData.colors.join(', ')}</span>
                    </div>
                  )}
                  
                  {formData.sizes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Sizes: </span>
                      <span className="text-sm text-gray-600">{formData.sizes.join(', ')}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Stock:</span> {formData.stock || 0} units</p>
                    <p><span className="font-medium">Category:</span> {formData.category || 'Uncategorized'}</p>
                    {formData.brand && <p><span className="font-medium">Brand:</span> {formData.brand}</p>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Check className="text-green-600" size={20} />
                <p className="text-green-800 font-medium">Ready to publish!</p>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Your product will be live on the store once you click "Publish Product"
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Upload Product</h1>
          <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Basic Info</span>
          <span>Pricing</span>
          <span>Images</span>
          <span>Specs</span>
          <span>Inventory</span>
          <span>Review</span>
        </div>
      </div>
      
      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        {renderStepContent()}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition ${
            currentStep === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          <ArrowLeft size={20} />
          <span>Previous</span>
        </button>
        
        <div className="flex space-x-4">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            Save Draft
          </button>
          
          {currentStep === totalSteps ? (
            <button className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              <Check size={20} />
              <span>Publish Product</span>
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <span>Next</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}