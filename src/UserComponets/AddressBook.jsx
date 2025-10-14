// AddressBook.js
import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, MapPin, Check } from 'lucide-react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../Components/firebase';
import { useAuth } from '../Components/AuthContext';

const AddressBook = () => {
  const { currentUser } = useAuth();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'Nigeria',
  type: 'shipping',
  isDefault: false
});

  const userId = currentUser?.uid;

  // Nigerian states for dropdown
const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

  const generateAddressId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Fetch addresses from user document
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        console.warn('No userId provided to fetchAddresses');
        setSavedAddresses([]);
        return;
      }

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const addresses = userData.addresses || [];
        const sortedAddresses = addresses.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });
        setSavedAddresses(sortedAddresses);
      } else {
        setSavedAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAddresses();
    } else {
      setLoading(false);
      console.warn('AddressBook: No authenticated user found');
    }
  }, [userId]);

  // Create new address
  const createAddress = async (addressData) => {
    try {
      if (!userId) {
        throw new Error('User authentication required');
      }

      const newAddress = {
        ...addressData,
        id: generateAddressId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      let userData = {};
      if (userDoc.exists()) {
        userData = userDoc.data();
      }

      let currentAddresses = userData.addresses || [];

      if (addressData.isDefault) {
        currentAddresses = currentAddresses.map(addr => ({
          ...addr,
          isDefault: false,
          updatedAt: new Date()
        }));
      }

      const updatedAddresses = [...currentAddresses, newAddress];

      await setDoc(userDocRef, {
        ...userData,
        addresses: updatedAddresses,
        updatedAt: new Date()
      }, { merge: true });
      
      await fetchAddresses();
      return newAddress.id;
    } catch (error) {
      console.error('Error creating address:', error);
      setError('Failed to create address. Please try again.');
      throw error;
    }
  };

  // Update existing address
  const updateAddress = async (addressId, addressData) => {
    try {
      if (!addressId || !userId) {
        throw new Error('Address ID and user authentication required');
      }

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      let currentAddresses = userData.addresses || [];
      
      if (addressData.isDefault) {
        currentAddresses = currentAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId ? true : false,
          updatedAt: new Date()
        }));
      }

      currentAddresses = currentAddresses.map(addr => {
        if (addr.id === addressId) {
          return {
            ...addr,
            ...addressData,
            id: addressId,
            updatedAt: new Date()
          };
        }
        return addr;
      });

      await updateDoc(userDocRef, {
        addresses: currentAddresses,
        updatedAt: new Date()
      });
      
      await fetchAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      setError('Failed to update address. Please try again.');
      throw error;
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      if (!addressId || !userId) {
        throw new Error('Address ID and user authentication required');
      }

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      const currentAddresses = userData.addresses || [];
      const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);

      await updateDoc(userDocRef, {
        addresses: updatedAddresses,
        updatedAt: new Date()
      });
      
      await fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address. Please try again.');
      throw error;
    }
  };

  // Set an address as default
  const setDefaultAddress = async (addressId) => {
    try {
      if (!addressId || !userId) {
        throw new Error('Address ID and user authentication required');
      }

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      const currentAddresses = userData.addresses || [];
      
      const updatedAddresses = currentAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
        updatedAt: new Date()
      }));

      await updateDoc(userDocRef, {
        addresses: updatedAddresses,
        updatedAt: new Date()
      });
      
      await fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('Failed to set default address. Please try again.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const handleEdit = (addressId) => {
  const addressToEdit = savedAddresses.find(addr => addr.id === addressId);
  if (addressToEdit) {
    setFormData({
      firstName: addressToEdit.firstName || '',
      lastName: addressToEdit.lastName || '',
      email: addressToEdit.email || currentUser?.email || '',
      phone: addressToEdit.phone || '',
      address: addressToEdit.address || '',
      city: addressToEdit.city || '',
      state: addressToEdit.state || '',
      zip: addressToEdit.zip || '',
      country: addressToEdit.country === 'US' ? 'Nigeria' : addressToEdit.country || 'Nigeria',
      type: addressToEdit.type || 'shipping',
      isDefault: addressToEdit.isDefault || false
    });
    setEditingAddressId(addressId);
    setShowAddressForm(true);
    setError(null);
  }
};

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId);
      } catch (error) {
        // Error is already handled in deleteAddress function
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      // Error is already handled in setDefaultAddress function
    }
  };

const handleAddNewAddress = () => {
  setFormData({
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'Nigeria',
    type: 'shipping',
    isDefault: false
  });
  setEditingAddressId(null);
  setShowAddressForm(true);
  setError(null);
};

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      if (editingAddressId) {
        await updateAddress(editingAddressId, formData);
      } else {
        await createAddress(formData);
      }
      
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

const handleCancel = () => {
  setShowAddressForm(false);
  setEditingAddressId(null);
  setFormData({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'Nigeria',
    type: 'shipping',
    isDefault: false
  });
  setError(null);
};

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please log in to manage your addresses.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex justify-center items-center py-8">
        <div className="text-gray-600">Loading addresses...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
        {!showAddressForm && (
          <button 
            onClick={handleAddNewAddress}
            className="flex items-center text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-150"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Address
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {showAddressForm ? (
        <form onSubmit={handleSaveAddress} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingAddressId ? 'Edit Address' : 'Add New Address'}
          </h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
  <div>
    <label className="block text-gray-700 text-sm font-medium mb-2">First Name *</label>
    <input 
      type="text" 
      name="firstName"
      value={formData.firstName}
      onChange={handleInputChange}
      className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
      placeholder="Enter your first name"
      required
    />
  </div>
  <div>
    <label className="block text-gray-700 text-sm font-medium mb-2">Last Name *</label>
    <input 
      type="text" 
      name="lastName"
      value={formData.lastName}
      onChange={handleInputChange}
      className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
      placeholder="Enter your last name"
      required
    />
  </div>
  
  {/* EMAIL FIELD - NEW */}
  <div>
    <label className="block text-gray-700 text-sm font-medium mb-2">Email Address *</label>
    <input 
      type="email" 
      name="email"
      value={formData.email}
      onChange={handleInputChange}
      className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
      placeholder="Enter your email"
      required
    />
  </div>
  
  {/* PHONE FIELD - NEW */}
  <div>
    <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number *</label>
    <input 
      type="tel" 
      name="phone"
      value={formData.phone}
      onChange={handleInputChange}
      className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
      placeholder="080xxxxxxxx"
      required
    />
  </div>
  
  <div className="md:col-span-2">
    <label className="block text-gray-700 text-sm font-medium mb-2">Street Address *</label>
    <input 
      type="text" 
      name="address"
      value={formData.address}
      onChange={handleInputChange}
      className="w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
      placeholder="Enter your full address"
      required
    />
  </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">City</label>
              <input 
                type="text" 
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">State/Province</label>
              <input 
                type="text" 
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">ZIP/Postal Code</label>
              <input 
                type="text" 
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Country</label>
              <select 
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">Address Type</label>
              <div className="flex space-x-4 mt-1">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="type" 
                    value="shipping"
                    checked={formData.type === 'shipping'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-indigo-600" 
                  />
                  <span className="ml-2 text-gray-700">Shipping</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="type" 
                    value="billing"
                    checked={formData.type === 'billing'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-indigo-600" 
                  />
                  <span className="ml-2 text-gray-700">Billing</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="type" 
                    value="both"
                    checked={formData.type === 'both'}
                    onChange={handleInputChange}
                    className="form-radio h-4 w-4 text-indigo-600" 
                  />
                  <span className="ml-2 text-gray-700">Both</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2 mt-2">
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="form-checkbox h-4 w-4 text-indigo-600" 
                />
                <span className="ml-2 text-gray-700">Set as default address</span>
              </label>
            </div>
          </div>
          <div className="flex space-x-3 mt-8">
            <button 
              type="submit"
              className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition duration-150"
            >
              Save Address
            </button>
            <button 
              type="button"
              onClick={handleCancel}
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-50 transition duration-150"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {savedAddresses.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {savedAddresses.map(address => (
                <div key={address.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-5">
                <div className="flex justify-between items-start">
  <div>
    <div className="flex items-center mb-2">
      <span className="font-semibold text-gray-800 text-lg">
        {address.firstName} {address.lastName}
      </span>
      {address.isDefault && (
        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium inline-flex items-center">
          <Check className="h-3 w-3 mr-1" />
          Default
        </span>
      )}
      <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
        {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
      </span>
    </div>
    {address.email && (
      <p className="text-gray-600 text-sm">
        <span className="font-medium">Email:</span> {address.email}
      </p>
    )}
    {address.phone && (
      <p className="text-gray-600 text-sm mb-1">
        <span className="font-medium">Phone:</span> {address.phone}
      </p>
    )}
    <p className="text-gray-600">{address.address}</p>
    <p className="text-gray-600">
      {address.city}, {address.state} {address.zip}
    </p>
    <p className="text-gray-600">{address.country}</p>
  </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(address.id)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition duration-150"
                          title="Edit"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(address.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition duration-150"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        {!address.isDefault && (
                          <button 
                            onClick={() => handleSetDefault(address.id)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition duration-150"
                            title="Set as default"
                          >
                            <MapPin className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No addresses saved yet</h3>
              <p className="text-gray-600 mb-4">Add your first shipping or billing address</p>
              <button 
                onClick={handleAddNewAddress}
                className="inline-flex items-center text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-150"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Address
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AddressBook;