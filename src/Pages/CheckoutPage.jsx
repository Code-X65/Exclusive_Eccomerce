import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, ShoppingBag, MapPin, CreditCard, Shield, User, Mail, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Import your Firebase config - adjust path as needed
import { db, auth } from '../Components/firebase';

// Email service function to send order confirmation
const sendOrderConfirmationEmail = async (orderData) => {
  try {
    // Check if EmailJS is loaded and initialized
    if (!window.emailjs) {
      throw new Error('EmailJS not loaded. Please refresh the page and try again.');
    }

    console.log('Preparing email data for order:', orderData.orderId);

    // Prepare template parameters - keep it simple to avoid 418 errors
    const templateParams = {
      to_email: 'omoloyeamoss65@gmail.com', // Replace with your business email
      customer_name: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
      customer_email: orderData.shippingInfo.email,
      customer_phone: orderData.shippingInfo.phone || 'Not provided',
      order_id: orderData.orderId,
      payment_reference: orderData.paymentInfo.reference,
      total_amount: `₦${orderData.orderSummary.total.toLocaleString()}`,
      order_date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      order_time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      // Simplified customer address
      customer_address: `${orderData.shippingInfo.address}, ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state}`,
      // Order summary
      subtotal: `₦${orderData.orderSummary.subtotal.toLocaleString()}`,
      shipping_cost: orderData.orderSummary.shipping === 0 ? 'FREE' : `₦${orderData.orderSummary.shipping.toLocaleString()}`,
      tax_amount: `₦${orderData.orderSummary.tax.toLocaleString()}`,
      items_count: orderData.items.length,
      // Simple items list (avoid complex HTML in initial test)
      items_summary: orderData.items.map(item => 
        `${item.name} - Qty: ${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}`
      ).join(' | ')
    };

    console.log('Sending email with parameters:', templateParams);

    // Send email using EmailJS
    const response = await window.emailjs.send(
      'service_g4g9dcl',    // Replace with your EmailJS service ID
      'template_7wjz6qi',   // Replace with your EmailJS template ID
      templateParams
      // Note: Don't pass the public key here, it should be initialized already
    );
    
    console.log('✅ Order confirmation email sent successfully:', response);
    return { success: true, response };

  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    
    // More specific error handling
    if (error.status === 418) {
      console.error('EmailJS 418 Error - Check your service ID, template ID, and template variables');
    } else if (error.status === 400) {
      console.error('EmailJS 400 Error - Invalid parameters or template configuration');
    } else if (error.status === 403) {
      console.error('EmailJS 403 Error - Check your public key and service permissions');
    }
    
    return { success: false, error: error.message || 'Unknown email error' };
  }
};



// Load EmailJS script
const loadEmailJS = () => {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'; // Updated to latest version
    script.async = true;
    script.onload = () => {
      // Initialize EmailJS with your public key using the new method
      window.emailjs.init({
        publicKey: 'le_8hFfmXsk6tcrQf' // Replace with your actual EmailJS public key
      });
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load EmailJS'));
    document.head.appendChild(script);
  });
};

const CheckoutPage = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation

  // Form data
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);
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
  const [paystackLoaded, setPaystackLoaded] = useState(false);

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

  // Fetch cart items and saved addresses when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setCartItems([]);
        setSavedAddresses([]);
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
          
          // Get saved addresses
          const addresses = userData.addresses || [];
          setSavedAddresses(addresses);
          
          // Auto-select default address if available
          const defaultAddress = addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setShippingInfo({
              firstName: defaultAddress.firstName || '',
              lastName: defaultAddress.lastName || '',
              email: user.email || '',
              phone: '',
              address: defaultAddress.address || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              zipCode: defaultAddress.zip || '',
              country: defaultAddress.country === 'US' ? 'Nigeria' : defaultAddress.country || 'Nigeria'
            });
          }
        } else {
          setCartItems([]);
          setSavedAddresses([]);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load data. Please try again.');
        setCartItems([]);
        setSavedAddresses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);
  useEffect(() => {
  loadEmailJS().catch(error => console.warn('Failed to load EmailJS:', error));
}, []);

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

  // Handle address selection
  const handleAddressSelection = (addressId) => {
    if (addressId === 'new') {
      setUseNewAddress(true);
      setSelectedAddressId('');
      setShippingInfo({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Nigeria'
      });
    } else {
      setUseNewAddress(false);
      setSelectedAddressId(addressId);
      const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
      if (selectedAddress) {
        setShippingInfo({
          firstName: selectedAddress.firstName || '',
          lastName: selectedAddress.lastName || '',
          email: user?.email || '',
          phone: '',
          address: selectedAddress.address || '',
          city: selectedAddress.city || '',
          state: selectedAddress.state || '',
          zipCode: selectedAddress.zip || '',
          country: selectedAddress.country === 'US' ? 'Nigeria' : selectedAddress.country || 'Nigeria'
        });
      }
    }
  };

  // Validate shipping form
  const validateShippingForm = () => {
    // If using saved address, just check if one is selected
    if (!useNewAddress && selectedAddressId) {
      return true;
    }

    // If using new address, validate form fields
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
    if (!paystackLoaded) {
      setError('Payment system is not loaded yet. Please wait a moment and try again.');
      setProcessing(false);
      return;
    }

    if (!window.PaystackPop) {
      setError('Payment system failed to load. Please refresh the page.');
      setProcessing(false);
      return;
    }

    // Ensure we have a logged-in user (should be present before payment step)
    const uidPart = user?.uid || 'guest';

    const handler = window.PaystackPop.setup({
      key: 'pk_test_193ff585726726ec44aac5aeda26996b1fb5753b', // Replace with your actual public key
      email: shippingInfo.email,
      amount: Math.round(total * 100), // Paystack expects amount in kobo
      currency: 'NGN',
      ref: `order_${Date.now()}_${uidPart}`, // Generate unique reference
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: `${shippingInfo.firstName} ${shippingInfo.lastName}`
          },
          {
            display_name: 'Phone Number',
            variable_name: 'phone_number',
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

  // Load Paystack script dynamically
  useEffect(() => {
    const scriptId = 'paystack-inline-js';
    if (document.getElementById(scriptId)) {
      setPaystackLoaded(!!window.PaystackPop);
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => setPaystackLoaded(false);
    document.body.appendChild(script);

    return () => {
      // Do not remove script on unmount to allow caching; just leave it.
    };
  }, []);

  // Handle payment success
// REPLACE your existing handlePaymentSuccess function with this updated version:

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
    
    // Add the order ID to the order data for email
    const orderDataWithId = {
      ...orderData,
      orderId: orderRef.id
    };

    // Send order confirmation email
    try {
      console.log('Sending order confirmation email...');
      const emailResult = await sendOrderConfirmationEmail(orderDataWithId);
      
      if (emailResult.success) {
        console.log('Order confirmation email sent successfully');
      } else {
        console.warn('Failed to send order confirmation email:', emailResult.error);
        // Don't fail the entire order process if email fails
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Continue with order completion even if email fails
    }
    
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
        <div className="text-center  mx-auto p-6">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to checkout.</p>
          <button 
            onClick={() => window.location.href = '/Exclusive_Eccomerce/login'}
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
        <div className="text-center  mx-auto p-6">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products before checking out.</p>
          <button 
            onClick={() => window.location.href = '/Exclusive_Eccomerce/products'}
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
        <div className="text-center  mx-auto p-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = '/Exclusive_Eccomerce/orders '}
              className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              View My Orders
            </button>
            <button 
              onClick={() => window.location.href = '/Exclusive_Eccomerce/products'}
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
  {/* Paystack script is loaded dynamically via useEffect */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center mb-6 sm:mb-8">
           <button 
    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : window.history.back()}
    className="p-2 hover:bg-gray-100 rounded-lg mr-3 sm:mr-4"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>

        {/* Progress Steps */}
       <div className="mb-6 sm:mb-8">
          <div className="hidden sm:flex items-center justify-center space-x-8">
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
        {/* Mobile Progress Indicator */}
  <div className="sm:hidden flex justify-center mb-6">
    <div className="text-sm font-medium text-gray-600">
      Step {currentStep} of 3
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

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-5 h-5 text-red-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Shipping Information</h2>
                </div>

                {/* Address Selection */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-3">Choose Shipping Address</h3>
                    <div className="space-y-2 sm:space-y-3">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => handleAddressSelection(address.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="selectedAddress"
                                value={address.id}
                                checked={selectedAddressId === address.id}
                                onChange={() => handleAddressSelection(address.id)}
                                className="w-4 h-4 text-red-500 focus:ring-red-500 mr-3"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">
                                    {address.firstName} {address.lastName}
                                  </span>
                                  {address.isDefault && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {address.address}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.state} {address.zip}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add New Address Option */}
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          useNewAddress
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handleAddressSelection('new')}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="selectedAddress"
                            value="new"
                            checked={useNewAddress}
                            onChange={() => handleAddressSelection('new')}
                            className="w-4 h-4 text-red-500 focus:ring-red-500 mr-3"
                          />
                          <span className="font-medium text-gray-800">+ Use a new address</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Address Form (shown when no saved addresses or "new" is selected) */}
                {(savedAddresses.length === 0 || useNewAddress) && (
                  <div>
                    {savedAddresses.length > 0 && (
                      <h3 className="text-md font-medium text-gray-700 mb-4">New Address Details</h3>
                    )}
                    
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
  type="text"
  value={shippingInfo.firstName}
  onChange={(e) => handleInputChange('firstName', e.target.value)}
  className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                          className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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

                    {/* Save Address Option */}
                    {useNewAddress && (
                      <div className="mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-500 focus:ring-red-500 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-600">
                            Save this address for future orders
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 text-red-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-300 rounded-lg p-3 sm:p-4">
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
               <div className="mt-6 flex items-start sm:items-center p-3 bg-green-50 rounded-lg">
  <Shield className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
  <div className="text-xs sm:text-sm text-green-800">
                    Your payment information is secure and encrypted. We use Paystack for safe transactions.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
  <div className="bg-white rounded-xl shadow-sm lg:sticky lg:top-8">
              {/* Summary Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
              </div>

              {/* Order Items */}
            <div className="p-4 sm:p-6 max-h-48 sm:max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 last:mb-0">
                    <img 
                      src={item.image || '/api/placeholder/50/50'} 
                      alt={item.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                    />
                   <div className="flex-1 min-w-0">
  <h3 className="text-xs sm:text-sm font-medium text-gray-800 truncate">
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
              <div className="p-4 sm:p-6 border-t border-gray-100 space-y-2 sm:space-y-3">
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `₦${shipping.toLocaleString()}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>Tax</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-base sm:text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full bg-red-500 text-white py-3 sm:py-3.5 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-4 sm:mt-6"
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
                <div className="text-xs text-gray-500 text-center mt-3 sm:mt-4">
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