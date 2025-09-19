import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ShoppingBag, MapPin, CreditCard, Shield, User, Mail, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Import your Firebase config - adjust path as needed
import { db, auth } from '../Components/firebase';

const CheckoutPage = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation

  // Form data
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria'
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'bank_transfer'

  // Nigerian states for dropdown
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
    'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
    'Yobe', 'Zamfara'
  ];

  // HOOKS MUST BE AT THE TOP - BEFORE ANY RETURNS
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setShippingInfo(prev => ({
          ...prev,
          email: firebaseUser.email || ''
        }));
      }
      if (!firebaseUser) {
        setCartItems([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch cart items when user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCartItems(userData.cart || []);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError('Failed to load cart. Please try again.');
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = cartItems.length > 0 ? (subtotal > 100000 ? 0 : 2500) : 0; // Free shipping over ₦100,000
  const total = subtotal + tax + shipping;

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate shipping form
  const validateShippingForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state'];
    const missing = required.filter(field => !shippingInfo[field].trim());
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic)
    if (shippingInfo.phone.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  // Handle Paystack payment
  const handlePaystackPayment = () => {
    if (!window.PaystackPop) {
      setError('Payment system is not loaded. Please refresh the page.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: 'pk_test_your_paystack_public_key', // Replace with your actual public key
      email: shippingInfo.email,
      amount: total * 100, // Paystack expects amount in kobo
      currency: 'NGN',
      ref: `order_${Date.now()}_${user.uid}`, // Generate unique reference
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: `${shippingInfo.firstName} ${shippingInfo.lastName}`
          },
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: shippingInfo.phone
          }
        ]
      },
      callback: function(response) {
        handlePaymentSuccess(response);
      },
      onClose: function() {
        setProcessing(false);
        setError('Payment was cancelled');
      }
    });

    handler.openIframe();
  };

  // Handle payment success
  const handlePaymentSuccess = async (response) => {
    try {
      setProcessing(true);
      setError('');

      // Create order in Firestore
      const orderData = {
        userId: user.uid,
        items: cartItems,
        shippingInfo,
        paymentInfo: {
          method: paymentMethod,
          reference: response.reference,
          status: 'completed'
        },
        orderSummary: {
          subtotal,
          tax,
          shipping,
          total
        },
        status: 'processing',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save order to Firestore
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Clear user's cart
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { cart: [] });

      // Update local state
      setCartItems([]);
      setSuccess(true);
      setCurrentStep(3);

    } catch (err) {
      console.error('Error processing order:', err);
      setError('Failed to process order. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle checkout process
  const handleCheckout = async () => {
    if (currentStep === 1) {
      if (!validateShippingForm()) return;
      setCurrentStep(2);
      setError('');
    } else if (currentStep === 2) {
      setProcessing(true);
      setError('');
      
      if (paymentMethod === 'card') {
        handlePaystackPayment();
      } else {
        // Handle bank transfer or other payment methods
        setError('Bank transfer payment is not yet implemented');
        setProcessing(false);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to checkout.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products before checking out.</p>
          <button 
            onClick={() => window.location.href = '/products'}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/orders'}
              className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              View My Orders
            </button>
            <button 
              onClick={() => window.location.href = '/products'}
              className="w-full bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Paystack Script */}
      <script src="https://js.paystack.co/v1/inline.js"></script>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg mr-4"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, label: 'Shipping Info', icon: User },
              { step: 2, label: 'Payment', icon: CreditCard },
              { step: 3, label: 'Confirmation', icon: CheckCircle }
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step <= currentStep 
                    ? 'bg-red-500 border-red-500 text-white' 
                    : 'border-gray-300 text-gray-300'
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step <= currentStep ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {label}
                </span>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    step < currentStep ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => setError('')}
                  className="mt-2 text-red-700 underline hover:no-underline text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-5 h-5 text-red-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Shipping Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="080xxxxxxxx"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your full address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select a state</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.country}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 text-red-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-300 rounded-lg p-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-red-500 focus:ring-red-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-800">Card Payment</div>
                        <div className="text-sm text-gray-600">Pay securely with your debit/credit card via Paystack</div>
                      </div>
                    </label>
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4 opacity-50">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        disabled
                        className="w-4 h-4 text-red-500 focus:ring-red-500"
                      />
                      <div className="ml-3">
                        <div className="font-medium text-gray-800">Bank Transfer</div>
                        <div className="text-sm text-gray-600">Transfer directly to our bank account (Coming Soon)</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 flex items-center p-3 bg-green-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500 mr-3" />
                  <div className="text-sm text-green-800">
                    Your payment information is secure and encrypted. We use Paystack for safe transactions.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm sticky top-8">
              {/* Summary Header */}
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
              </div>

              {/* Order Items */}
              <div className="p-6 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex items-center gap-3 mb-4 last:mb-0">
                    <img 
                      src={item.image || '/api/placeholder/50/50'} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </h3>
                      <div className="text-xs text-gray-500">
                        {item.selectedSize && `${item.selectedSize} • `}
                        {item.selectedColor}
                      </div>
                      <div className="text-sm font-semibold text-gray-800">
                        ₦{item.price?.toLocaleString()} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Calculations */}
              <div className="p-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `₦${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6"
                >
                  {processing ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </div>
                  ) : currentStep === 1 ? (
                    'Continue to Payment'
                  ) : (
                    'Place Order'
                  )}
                </button>

                {/* Security Notice */}
                <div className="text-xs text-gray-500 text-center mt-4">
                  🔒 Secure checkout with SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;