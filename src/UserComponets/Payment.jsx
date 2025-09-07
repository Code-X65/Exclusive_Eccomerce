// Payment.js
import React, { useState, useEffect } from 'react';
import { CreditCard, PlusCircle, Edit2, Trash2, Check, X, Lock, AlertCircle } from 'lucide-react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc
} from 'firebase/firestore';
import { db } from '../Components/firebase';
import { useAuth } from '../Components/AuthContext';

const Payment = () => {
  const { currentUser } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [cardType, setCardType] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);

  const userId = currentUser?.uid;

  const generatePaymentId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Fetch payment methods from user document
  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        console.warn('No userId provided to fetchPaymentMethods');
        setPaymentMethods([]);
        return;
      }

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const methods = userData.paymentMethods || [];
        const sortedMethods = methods.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });
        setPaymentMethods(sortedMethods);
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Failed to load payment methods. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPaymentMethods();
    } else {
      setLoading(false);
      console.warn('Payment: No authenticated user found');
    }
  }, [userId]);

  // Create new payment method
  const createPaymentMethod = async (paymentData) => {
    try {
      if (!userId) {
        throw new Error('User authentication required');
      }

      const newPaymentMethod = {
        ...paymentData,
        id: generatePaymentId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      let userData = {};
      if (userDoc.exists()) {
        userData = userDoc.data();
      }

      let currentMethods = userData.paymentMethods || [];

      // If this is set as default or it's the first card, update all other methods to not be default
      if (paymentData.isDefault || currentMethods.length === 0) {
        newPaymentMethod.isDefault = true;
        currentMethods = currentMethods.map(method => ({
          ...method,
          isDefault: false,
          updatedAt: new Date()
        }));
      }

      const updatedMethods = [...currentMethods, newPaymentMethod];

      await setDoc(userDocRef, {
        ...userData,
        paymentMethods: updatedMethods,
        updatedAt: new Date()
      }, { merge: true });
      
      await fetchPaymentMethods();
      return newPaymentMethod.id;
    } catch (error) {
      console.error('Error creating payment method:', error);
      setError('Failed to create payment method. Please try again.');
      throw error;
    }
  };

  // Update existing payment method
  const updatePaymentMethod = async (paymentId, paymentData) => {
    try {
      if (!paymentId || !userId) {
        throw new Error('Payment ID and user authentication required');
      }

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      let currentMethods = userData.paymentMethods || [];
      
      if (paymentData.isDefault) {
        currentMethods = currentMethods.map(method => ({
          ...method,
          isDefault: method.id === paymentId ? true : false,
          updatedAt: new Date()
        }));
      }

      currentMethods = currentMethods.map(method => {
        if (method.id === paymentId) {
          return {
            ...method,
            ...paymentData,
            id: paymentId,
            updatedAt: new Date()
          };
        }
        return method;
      });

      await updateDoc(userDocRef, {
        paymentMethods: currentMethods,
        updatedAt: new Date()
      });
      
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error updating payment method:', error);
      setError('Failed to update payment method. Please try again.');
      throw error;
    }
  };

  // Delete payment method
  const deletePaymentMethod = async (paymentId) => {
    try {
      if (!paymentId || !userId) {
        throw new Error('Payment ID and user authentication required');
      }

      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      const currentMethods = userData.paymentMethods || [];
      const methodToDelete = currentMethods.find(method => method.id === paymentId);
      const updatedMethods = currentMethods.filter(method => method.id !== paymentId);

      // If we deleted the default card and there are other cards, make the first one default
      if (methodToDelete?.isDefault && updatedMethods.length > 0) {
        updatedMethods[0].isDefault = true;
        updatedMethods[0].updatedAt = new Date();
      }

      await updateDoc(userDocRef, {
        paymentMethods: updatedMethods,
        updatedAt: new Date()
      });
      
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      setError('Failed to delete payment method. Please try again.');
      throw error;
    }
  };

  // Set a payment method as default
  const setDefaultPaymentMethod = async (paymentId) => {
    try {
         if (!paymentId || !userId) {
           throw new Error('Payment ID and user authentication required');
         }
   
         const userDocRef = doc(db, 'payment_methods', userId);
         const userDoc = await getDoc(userDocRef);
         
         if (!userDoc.exists()) {
           throw new Error('User document not found');
         }
   
         const currentMethods = userDoc.data().paymentMethods || [];
         
         // Set all payment methods to not default, except the selected one
         const updatedMethods = currentMethods.map(method => ({
           ...method,
           isDefault: method.id === paymentId,
           updatedAt: new Date()
         }));
   
         // Update the user document
         await updateDoc(userDocRef, {
           paymentMethods: updatedMethods,
           updatedAt: new Date()
         });
         
         // Refresh the payment methods list
         await fetchPaymentMethods();
       } catch (error) {
         console.error('Error setting default payment method:', error);
         setError('Failed to set default payment method. Please try again.');
       }
     };
     
     // Card type detection based on first digit
     const detectCardType = (number) => {
       const firstDigit = number.charAt(0);
       if (firstDigit === '4') return 'visa';
       if (firstDigit === '5') return 'mastercard';
       if (firstDigit === '3') return 'amex';
       if (firstDigit === '6') return 'discover';
       return '';
     };
     
     const handleCardNumberChange = (e) => {
       const value = e.target.value.replace(/\D/g, '');
       const type = detectCardType(value);
       setCardType(type);
       
       // Format card number with spaces
       if (e.target.value) {
         let formatted = '';
         for (let i = 0; i < value.length; i++) {
           if (i > 0 && i % 4 === 0) {
             formatted += ' ';
           }
           formatted += value[i];
         }
         setCardNumber(formatted.slice(0, 19)); // Limit to 16 digits + spaces
       }
     };
     
     const handleExpiryChange = (e) => {
       const value = e.target.value.replace(/\D/g, '');
       if (value) {
         if (value.length <= 2) {
           setExpiryDate(value);
         } else {
           setExpiryDate(value.slice(0, 2) + '/' + value.slice(2, 4));
         }
       }
     };
     
     const handleCVVChange = (e) => {
       const value = e.target.value.replace(/\D/g, '');
       setCvv(value.slice(0, 4)); // Limit CVV to 4 digits (for Amex)
     };
     
     const validateForm = () => {
       const errors = {};
       
       if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
         errors.cardNumber = 'Please enter a valid card number';
       }
       
       if (!nameOnCard) {
         errors.nameOnCard = 'Please enter the name on card';
       }
       
       if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
         errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
       } else {
         // Check if card is expired
         const [month, year] = expiryDate.split('/');
         const expiryDateObj = new Date(2000 + parseInt(year), parseInt(month) - 1);
         const currentDate = new Date();
         
         if (expiryDateObj < currentDate) {
           errors.expiryDate = 'This card has expired';
         }
       }
       
       if (!cvv || cvv.length < 3) {
         errors.cvv = 'Please enter a valid CVV';
       }
       
       setFormErrors(errors);
       return Object.keys(errors).length === 0;
     };
     
     const handleAddNewPayment = () => {
       setEditingPaymentId(null);
       setShowAddPaymentForm(true);
       setFormErrors({});
       setError(null);
       setCardType('');
       setCardNumber('');
       setNameOnCard('');
       setExpiryDate('');
       setCvv('');
       setSetAsDefault(false);
     };
     
     const handleEditPayment = (id) => {
       setEditingPaymentId(id);
       setShowAddPaymentForm(true);
       setFormErrors({});
       setError(null);
       
       const method = paymentMethods.find(m => m.id === id);
       setCardType(method.type);
       setCardNumber('');  // For security, we don't populate this
       setNameOnCard(method.nameOnCard);
       setExpiryDate(method.expiryDate);
       setCvv('');  // For security, we don't populate this
       setSetAsDefault(method.isDefault);
     };
     
     const handleDeletePayment = async (id) => {
       if (window.confirm('Are you sure you want to delete this payment method?')) {
         try {
           await deletePaymentMethod(id);
         } catch (error) {
           // Error is already handled in deletePaymentMethod function
         }
       }
     };
     
     const handleSetDefault = async (id) => {
       try {
         await setDefaultPaymentMethod(id);
       } catch (error) {
         // Error is already handled in setDefaultPaymentMethod function
       }
     };
     
     const handleSavePayment = async () => {
       // Validate form
       if (!validateForm()) {
         return;
       }
       
       try {
         setError(null);
         
         const paymentData = {
           type: cardType || 'credit-card',
           cardNumber: '•••• •••• •••• ' + cardNumber.replace(/\s/g, '').slice(-4),
           nameOnCard: nameOnCard,
           expiryDate: expiryDate,
           isDefault: setAsDefault
         };
   
         if (editingPaymentId) {
           await updatePaymentMethod(editingPaymentId, paymentData);
         } else {
           await createPaymentMethod(paymentData);
         }
         
         // Close form
         setShowAddPaymentForm(false);
         setEditingPaymentId(null);
       } catch (error) {
         console.error('Error saving payment method:', error);
       }
     };
   
     const handleCancel = () => {
       setShowAddPaymentForm(false);
       setEditingPaymentId(null);
       setFormErrors({});
       setError(null);
       setCardType('');
       setCardNumber('');
       setNameOnCard('');
       setExpiryDate('');
       setCvv('');
       setSetAsDefault(false);
     };
   
     // Render card icon based on type
     const renderCardIcon = (type) => {
       switch (type) {
         case 'visa':
           return <CreditCard className="text-blue-600" />;
         case 'mastercard':
           return <CreditCard className="text-red-600" />;
         case 'amex':
           return <CreditCard className="text-green-600" />;
         case 'discover':
           return <CreditCard className="text-yellow-600" />;
         default:
           return <CreditCard />;
       }
     };
   
     // Early return if no authenticated user
     if (!currentUser) {
       return (
         <div className="max-w-xl mx-auto p-4">
           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
             <p className="text-yellow-800">Please log in to manage your payment methods.</p>
           </div>
         </div>
       );
     }
   
     if (loading) {
       return (
         <div className="max-w-xl mx-auto p-4 flex justify-center items-center py-8">
           <div className="text-gray-600">Loading payment methods...</div>
         </div>
       );
     }
   
     return (
       <div className="max-w-xl mx-auto p-4">
         <h2 className="text-2xl font-bold mb-4">Payment Methods</h2>
         
         {/* Error Display */}
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
         
         <div className="space-y-4">
           {paymentMethods.length > 0 ? (
             paymentMethods.map(method => (
               <div key={method.id} className={`flex items-center justify-between p-4 border rounded ${method.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                 <div className="flex items-center space-x-3">
                   {renderCardIcon(method.type)}
                   <div>
                     <div className="font-semibold">{method.cardNumber}</div>
                     <div className="text-xs text-gray-500">{method.nameOnCard} &middot; Expires {method.expiryDate}</div>
                     {method.isDefault && (
                       <span className="inline-flex items-center text-xs text-blue-600 font-semibold">
                         <Check className="w-4 h-4 mr-1" /> Default
                       </span>
                     )}
                   </div>
                 </div>
                 <div className="flex items-center space-x-2">
                   {!method.isDefault && (
                     <button
                       className="text-blue-600 hover:underline text-xs"
                       onClick={() => handleSetDefault(method.id)}
                       title="Set as default"
                     >
                       Set Default
                     </button>
                   )}
                   <button
                     className="p-1 hover:bg-gray-100 rounded"
                     onClick={() => handleEditPayment(method.id)}
                     title="Edit"
                   >
                     <Edit2 className="w-4 h-4" />
                   </button>
                   <button
                     className="p-1 hover:bg-gray-100 rounded"
                     onClick={() => handleDeletePayment(method.id)}
                     title="Delete"
                   >
                     <Trash2 className="w-4 h-4 text-red-500" />
                   </button>
                 </div>
               </div>
             ))
           ) : (
             <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
               <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-3" />
               <h3 className="text-lg font-medium text-gray-800 mb-1">No payment methods saved yet</h3>
               <p className="text-gray-600 mb-4">Add your first payment method to make checkout easier</p>
               <button 
                 onClick={handleAddNewPayment}
                 className="inline-flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-150"
               >
                 <PlusCircle className="h-4 w-4 mr-2" />
                 Add Payment Method
               </button>
             </div>
           )}
         </div>
         
         {paymentMethods.length > 0 && (
           <button
             className="mt-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
             onClick={handleAddNewPayment}
           >
             <PlusCircle className="w-5 h-5 mr-2" /> Add New Payment Method
           </button>
         )}
   
         {showAddPaymentForm && (
           <div className="fixed inset-0 bg-black/[0.5] bg-opacity-30 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
               <button
                 className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                 onClick={handleCancel}
                 title="Close"
               >
                 <X className="w-5 h-5" />
               </button>
               <h3 className="text-lg font-semibold mb-4">{editingPaymentId ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
               <form
                 onSubmit={e => {
                   e.preventDefault();
                   handleSavePayment();
                 }}
                 className="space-y-4"
               >
                 <div>
                   <label className="block text-sm font-medium mb-1">Card Number</label>
                   <div className="flex items-center border rounded px-2">
                     {renderCardIcon(cardType)}
                     <input
                       type="text"
                       className="flex-1 p-2 outline-none"
                       placeholder="1234 5678 9012 3456"
                       value={cardNumber}
                       onChange={handleCardNumberChange}
                       maxLength={19}
                     />
                   </div>
                   {formErrors.cardNumber && (
                     <div className="text-xs text-red-600 flex items-center mt-1">
                       <AlertCircle className="w-4 h-4 mr-1" /> {formErrors.cardNumber}
                     </div>
                   )}
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Name on Card</label>
                   <input
                     type="text"
                     className="w-full border rounded p-2"
                     placeholder="Full Name"
                     value={nameOnCard}
                     onChange={e => setNameOnCard(e.target.value)}
                   />
                   {formErrors.nameOnCard && (
                     <div className="text-xs text-red-600 flex items-center mt-1">
                       <AlertCircle className="w-4 h-4 mr-1" /> {formErrors.nameOnCard}
                     </div>
                   )}
                 </div>
                 <div className="flex space-x-2">
                   <div className="flex-1">
                     <label className="block text-sm font-medium mb-1">Expiry Date</label>
                     <input
                       type="text"
                       className="w-full border rounded p-2"
                       placeholder="MM/YY"
                       value={expiryDate}
                       onChange={handleExpiryChange}
                       maxLength={5}
                     />
                     {formErrors.expiryDate && (
                       <div className="text-xs text-red-600 flex items-center mt-1">
                         <AlertCircle className="w-4 h-4 mr-1" /> {formErrors.expiryDate}
                       </div>
                     )}
                   </div>
                   <div className="flex-1">
                     <label className="block text-sm font-medium mb-1">CVV</label>
                     <input
                       type="password"
                       className="w-full border rounded p-2"
                       placeholder="CVV"
                       value={cvv}
                       onChange={handleCVVChange}
                       maxLength={4}
                     />
                     {formErrors.cvv && (
                       <div className="text-xs text-red-600 flex items-center mt-1">
                         <AlertCircle className="w-4 h-4 mr-1" /> {formErrors.cvv}
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="flex items-center mt-2">
                   <input
                     type="checkbox"
                     id="setAsDefault"
                     checked={setAsDefault}
                     onChange={e => setSetAsDefault(e.target.checked)}
                     className="mr-2"
                   />
                   <label htmlFor="setAsDefault" className="text-sm">Set as default payment method</label>
                 </div>
                 <div className="flex justify-end space-x-2 mt-4">
                   <button
                     type="button"
                     className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                     onClick={handleCancel}
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                   >
                     {editingPaymentId ? 'Save Changes' : 'Add Card'}
                   </button>
                 </div>
               </form>
               <div className="flex items-center text-xs text-gray-500 mt-4">
                 <Lock className="w-4 h-4 mr-1" /> Your payment information is securely encrypted.
               </div>
             </div>
           </div>
         )}
       </div>
     );
   };
   
   export default Payment;