import React, { useState } from 'react';
import { XCircle, Search, Filter, Calendar, ChevronDown, ChevronUp, AlertCircle, ShoppingBag, Clock, ShoppingCart } from 'lucide-react';

const Cancellations = () => {
  const [expandedCancellationId, setExpandedCancellationId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasCancellations, setHasCancellations] = useState(true); // Toggle this to false to see empty state

  const cancellations = [
    {
      id: 'CNL12345',
      orderId: '12345',
      orderDate: 'May 5, 2025',
      cancellationDate: 'May 6, 2025',
      status: 'Refunded',
      refundAmount: '$129.99',
      refundMethod: 'Original Payment Method (Credit Card)',
      refundDate: 'May 8, 2025',
      cancellationReason: 'Found better price elsewhere',
      items: [
        { 
          id: 1, 
          name: 'Wireless Headphones', 
          price: '$89.99', 
          quantity: 1,
          image: '/api/placeholder/60/60' 
        },
        { 
          id: 2, 
          name: 'USB-C Cable', 
          price: '$19.99', 
          quantity: 2,
          image: '/api/placeholder/60/60' 
        }
      ],
      notes: 'Cancellation processed and refund completed.'
    },
    {
      id: 'CNL12346',
      orderId: '12344',
      orderDate: 'April 28, 2025',
      cancellationDate: 'April 28, 2025',
      status: 'Partial Refund',
      refundAmount: '$89.99',
      refundMethod: 'Store Credit',
      refundDate: 'April 30, 2025',
      cancellationReason: 'Ordered wrong item',
      items: [
        { 
          id: 3, 
          name: 'Graphic T-Shirt', 
          price: '$24.99', 
          quantity: 1,
          image: '/api/placeholder/60/60',
          status: 'Canceled'
        },
        { 
          id: 4, 
          name: 'Phone Case', 
          price: '$19.99', 
          quantity: 1,
          image: '/api/placeholder/60/60',
          status: 'Shipped' 
        }
      ],
      notes: 'One item was already shipped and cannot be canceled. Partial refund issued for canceled item.'
    },
    {
      id: 'CNL12347',
      orderId: '12343',
      orderDate: 'April 15, 2025',
      cancellationDate: 'April 15, 2025',
      status: 'Processing',
      refundAmount: '$199.99',
      refundMethod: 'Original Payment Method (Credit Card)',
      refundDate: 'Pending',
      cancellationReason: 'Changed mind',
      items: [
        { 
          id: 5, 
          name: 'Smart Watch', 
          price: '$199.99', 
          quantity: 1,
          image: '/api/placeholder/60/60' 
        }
      ],
      notes: 'Cancellation request received. Refund processing.'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Refunded':
        return <ShoppingBag className="w-4 h-4 text-green-500" />;
      case 'Partial Refund':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Refunded':
        return 'bg-green-100 text-green-800';
      case 'Partial Refund':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleCancellationDetails = (cancellationId) => {
    if (expandedCancellationId === cancellationId) {
      setExpandedCancellationId(null);
    } else {
      setExpandedCancellationId(cancellationId);
    }
  };

  const filteredCancellations = cancellations.filter(cancellation => {
    // Filter by tab
    if (activeTab !== 'all' && cancellation.status.toLowerCase() !== activeTab.toLowerCase()) {
      return false;
    }
    
    // Filter by search
    if (searchQuery && !cancellation.id.includes(searchQuery.toUpperCase()) && 
        !cancellation.orderId.includes(searchQuery) && 
        !cancellation.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Cancellations</h1>
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </button>
          <button className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {hasCancellations ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Search bar */}
          <div className="px-4 py-5 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search cancellations by ID, order number or product name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Cancellations
              </button>
              <button
                onClick={() => setActiveTab('processing')}
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'processing'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => setActiveTab('refunded')}
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'refunded'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Refunded
              </button>
              <button
                onClick={() => setActiveTab('partial refund')}
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'partial refund'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Partial Refunds
              </button>
            </nav>
          </div>

          {/* Cancellation list */}
          <div className="divide-y divide-gray-200">
            {filteredCancellations.length > 0 ? (
              filteredCancellations.map((cancellation) => (
                <div key={cancellation.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleCancellationDetails(cancellation.id)}>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                        {getStatusIcon(cancellation.status)}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">Cancellation {cancellation.id}</h3>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(cancellation.status)}`}>
                            {cancellation.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Order #{cancellation.orderId} • Canceled on {cancellation.cancellationDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Refund: {cancellation.refundAmount}</p>
                        <p className="text-xs text-gray-500">{cancellation.items.length} item(s)</p>
                      </div>
                      <div>
                        {expandedCancellationId === cancellation.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded cancellation details */}
                  {expandedCancellationId === cancellation.id && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Order Information</h4>
                          <div className="mt-1 text-sm text-gray-900">
                            <p>Order Number: #{cancellation.orderId}</p>
                            <p>Order Date: {cancellation.orderDate}</p>
                            <p>Cancellation Date: {cancellation.cancellationDate}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Refund Information</h4>
                          <div className="mt-1 text-sm text-gray-900">
                            <p>Amount: {cancellation.refundAmount}</p>
                            <p>Method: {cancellation.refundMethod}</p>
                            <p>Refund Status: {cancellation.refundDate}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Cancellation Reason</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{cancellation.cancellationReason}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Status Notes</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{cancellation.notes}</p>
                      </div>

                      <h4 className="text-sm font-medium text-gray-500 mb-2">Canceled Items</h4>
                      <div className="space-y-3">
                        {cancellation.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded">
                            <div className="flex-shrink-0">
                              <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                              <p className="text-sm text-gray-500">{item.price} × {item.quantity}</p>
                              {item.status && (
                                <div className="mt-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.status === 'Canceled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">
                                {item.quantity > 1 ? `Subtotal: $${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-between">
                        {cancellation.status === 'Processing' && (
                          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Check Status
                          </button>
                        )}
                        {(cancellation.status === 'Refunded' || cancellation.status === 'Partial Refund') && (
                          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            View Receipt
                          </button>
                        )}
                        <div className="space-x-2">
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Contact Support
                          </button>
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            View Original Order
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No cancellations found</h3>
                <p className="mt-1 text-sm text-gray-500">We couldn't find any cancellations matching your criteria.</p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setActiveTab('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View all cancellations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-16 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-gray-100 p-6">
                <XCircle className="h-16 w-16 text-gray-400" />
              </div>
            </div>
            <h3 className="mt-4 text-xl font-medium text-gray-900">No Canceled Orders</h3>
            <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
              You haven't canceled any orders yet. If you need to cancel an order, please visit your orders page.
            </p>
            <div className="mt-8">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <ShoppingCart className="mr-2 h-5 w-5" />
                View My Orders
              </button>
            </div>
            <div className="mt-4">
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Need help? Contact customer support
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">About Order Cancellations</h2>
        <div className="space-y-4 text-sm text-gray-600">
          <p>
            You can request to cancel an order within 1 hour of placing it. After that time, cancellation may not be possible if your order has entered the processing or shipping stage.
          </p>
          <p>
            If your order has already shipped, you may need to initiate a return once you receive the items. Please check our <a href="#" className="text-indigo-600 hover:text-indigo-800">return policy</a> for more information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cancellations;