import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, AlertCircle, Eye, Download, Filter, Calendar } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Import your Firebase config - adjust path as needed
import { db, auth } from '../Components/firebase';

const OrdersPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setOrders([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }));
        
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Order status configurations
  const orderStatuses = {
    processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-800', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle }
  };

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter(order => filterStatus === 'all' || order.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount_high':
          return (b.orderSummary?.total || 0) - (a.orderSummary?.total || 0);
        case 'amount_low':
          return (a.orderSummary?.total || 0) - (b.orderSummary?.total || 0);
        default:
          return 0;
      }
    });

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-8 h-8 animate-pulse text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
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

  // Order Details Modal
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const StatusIcon = orderStatuses[order.status]?.icon || Clock;

    return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
  <div className="bg-white rounded-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
         <div className="p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
  <div className="flex items-center justify-between">
    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Order Details</h2>
    <button 
      onClick={onClose}
      className="p-2 hover:bg-gray-100 rounded-lg"
    >
      <span className="text-xl">✕</span>
    </button>
  </div>
</div>

          {/* Order Info */}
         <div className="p-4 sm:p-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Order ID:</span> {order.id}</div>
                  <div><span className="text-gray-600">Date:</span> {formatDate(order.createdAt)}</div>
                  <div><span className="text-gray-600">Total:</span> ₦{(order.orderSummary?.total || 0).toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${orderStatuses[order.status]?.color}`}>
                      <StatusIcon size={12} />
                      {orderStatuses[order.status]?.label}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Shipping Address</h3>
                <div className="text-sm text-gray-600">
                  <p>{order.shippingInfo?.firstName || ''} {order.shippingInfo?.lastName || ''}</p>
                  <p>{order.shippingInfo?.address || 'No address provided'}</p>
                  <p>{order.shippingInfo?.city || ''}, {order.shippingInfo?.state || ''}</p>
                  <p>{order.shippingInfo?.zipCode || ''}</p>
                  <p>{order.shippingInfo?.phone || ''}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
           <div className="mb-4 sm:mb-6">
  <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Order Items</h3>
  <div className="space-y-2 sm:space-y-3">
    {(order.items || []).map((item, index) => (
      <div key={`${item.productId || index}-${index}`} className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
        <img 
          src={item.image || '/api/placeholder/60/60'} 
          alt={item.name || 'Product'}
          className="w-12 h-12 sm:w-15 sm:h-15 object-cover rounded-lg bg-white flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.name || 'Unknown Product'}</h4>
                      <div className="text-sm text-gray-600">
                        {item.selectedSize && `Size: ${item.selectedSize} • `}
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                      </div>
                      <div className="text-sm font-semibold text-gray-800">
                        ₦{(item.price || 0).toLocaleString()} × {item.quantity || 1}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>₦{(order.orderSummary?.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>₦{(order.orderSummary?.shipping || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>₦{(order.orderSummary?.tax || 0).toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₦{(order.orderSummary?.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
  <button className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-800 text-sm sm:text-base rounded-lg hover:bg-gray-200 transition-colors">
    Download Invoice
  </button>
</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
       <div className="mb-4 sm:mb-8">
  <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-0">
    <button 
      onClick={() => window.history.back()}
      className="p-2 hover:bg-gray-100 rounded-lg"
    >
      <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
    </button>
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Orders</h1>
      <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Track and manage your orders</p>
    </div>
  </div>
</div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
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

        {/* Filters and Sort */}
       <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <Filter size={16} className="text-gray-500 flex-shrink-0" />
      <select 
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="flex-1 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
      >
        <option value="all">All Orders</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <div className="flex items-center gap-2 flex-1 min-w-0">
      <Calendar size={16} className="text-gray-500 flex-shrink-0" />
      <select 
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="flex-1 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="amount_high">Highest Amount</option>
        <option value="amount_low">Lowest Amount</option>
      </select>
    </div>

    <div className="text-xs sm:text-sm text-gray-500 sm:ml-auto text-center sm:text-left">
      {filteredAndSortedOrders.length} of {orders.length} orders
    </div>
  </div>
</div>

        {/* Orders List */}
        {filteredAndSortedOrders.length === 0 ? (
         <div className="text-center py-8 sm:py-12 px-4">
  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
    {filterStatus === 'all' 
      ? "You haven't placed any orders yet." 
      : `No orders with status "${orderStatuses[filterStatus]?.label || filterStatus}".`
    }
  </p>
  <button 
    onClick={() => window.location.href = '/Exclusive_Eccomerce/products'}
    className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-red-600 transition-colors"
  >
    Start Shopping
  </button>
</div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedOrders.map((order) => {
              const StatusIcon = orderStatuses[order.status]?.icon || Clock;
              
              return (
               <div key={order.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
    <div className="flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
        <h3 className="font-semibold text-sm sm:text-base text-gray-800">Order #{order.id.slice(-8)}</h3>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${orderStatuses[order.status]?.color} w-fit`}>
          <StatusIcon size={12} />
          {orderStatuses[order.status]?.label}
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600">{formatDate(order.createdAt)}</p>
    </div>
    
    <div className="flex items-center justify-between sm:block sm:text-right">
      <div className="text-base sm:text-lg font-bold text-gray-800">
        ₦{(order.orderSummary?.total || 0).toLocaleString()}
      </div>
      <p className="text-xs sm:text-sm text-gray-600">
        {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
      </p>
    </div>
  </div>

                  {/* Order Items Preview */}
                  <div className="flex gap-3 mb-4 overflow-x-auto">
                    {(order.items || []).slice(0, 3).map((item, index) => (
                      <img
                        key={`${item.productId || index}-${index}`}
                        src={item.image || '/api/placeholder/50/50'}
                        alt={item.name || 'Product'}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                      />
                    ))}
                    {(order.items || []).length > 3 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                        +{(order.items || []).length - 3}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
     <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-100">
    <button 
      onClick={() => setSelectedOrder(order)}
      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
    >
      <Eye size={16} />
      View Details
    </button>
    
    <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base">
      <Download size={16} />
      Invoice
    </button>
  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default OrdersPage;