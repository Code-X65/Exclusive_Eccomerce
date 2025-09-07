import React, { useState } from 'react';
import { RefreshCcw, Package, ArrowLeft, Search, Filter, Calendar, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock} from 'lucide-react';
import { Link } from 'react-router-dom'

const Returns = () => {
  const [expandedReturnId, setExpandedReturnId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const returns = [
    {
      id: 'RTN12345',
      orderId: '12345',
      originalOrderDate: 'May 5, 2025',
      returnDate: 'May 15, 2025',
      status: 'Completed',
      refundAmount: '$89.99',
      refundMethod: 'Original Payment Method (Credit Card)',
      refundDate: 'May 20, 2025',
      items: [
        { 
          id: 1, 
          name: 'Wireless Headphones', 
          price: '$89.99', 
          reason: 'Defective/Doesn\'t work', 
          image: '/api/placeholder/60/60',
          returnType: 'Refund'
        }
      ],
      returnLabel: 'Label #RTL987654321',
      trackingNumber: 'TRK876543210',
      returnMethod: 'Drop-off at Carrier Location',
      notes: 'Package received in good condition. Refund processed.'
    },
    {
      id: 'RTN12346',
      orderId: '12344',
      originalOrderDate: 'April 28, 2025',
      returnDate: 'May 10, 2025',
      status: 'In Transit',
      refundAmount: '$24.99',
      refundMethod: 'Original Payment Method (Credit Card)',
      refundDate: 'Pending',
      items: [
        { 
          id: 3, 
          name: 'Graphic T-Shirt', 
          price: '$24.99', 
          reason: 'Ordered wrong size', 
          image: '/api/placeholder/60/60',
          returnType: 'Exchange'
        }
      ],
      returnLabel: 'Label #RTL123456789',
      trackingNumber: 'TRK123987456',
      returnMethod: 'Mail-in Return',
      notes: 'Return package in transit. Expected arrival: May 22, 2025.'
    },
    {
      id: 'RTN12347',
      orderId: '12343',
      originalOrderDate: 'April 15, 2025',
      returnDate: 'May 8, 2025',
      status: 'Processing',
      refundAmount: '$199.99',
      refundMethod: 'Store Credit',
      refundDate: 'Pending Review',
      items: [
        { 
          id: 5, 
          name: 'Smart Watch', 
          price: '$199.99', 
          reason: 'Changed mind', 
          image: '/api/placeholder/60/60',
          returnType: 'Refund'
        }
      ],
      returnLabel: 'Label #RTL456789123',
      trackingNumber: 'TRK456123789',
      returnMethod: 'Mail-in Return',
      notes: 'Return received. Item under inspection.'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'In Transit':
        return <RefreshCcw className="w-4 h-4 text-blue-500" />;
      case 'Processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleReturnDetails = (returnId) => {
    if (expandedReturnId === returnId) {
      setExpandedReturnId(null);
    } else {
      setExpandedReturnId(returnId);
    }
  };

  const filteredReturns = returns.filter(returnItem => {
    // Filter by tab
    if (activeTab !== 'all' && returnItem.status.toLowerCase() !== activeTab.toLowerCase()) {
      return false;
    }
    
    // Filter by search
    if (searchQuery && !returnItem.id.includes(searchQuery.toUpperCase()) && 
        !returnItem.orderId.includes(searchQuery) && 
        !returnItem.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Returns</h1>
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
              placeholder="Search returns by ID, order number or product name"
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
              All Returns
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
              onClick={() => setActiveTab('in transit')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'in transit'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'completed'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Completed
            </button>
          </nav>
        </div>

        {/* Return list */}
        <div className="divide-y divide-gray-200">
          {filteredReturns.length > 0 ? (
            filteredReturns.map((returnItem) => (
              <div key={returnItem.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleReturnDetails(returnItem.id)}>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                      {getStatusIcon(returnItem.status)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">Return {returnItem.id}</h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                          {returnItem.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        For Order #{returnItem.orderId} • Initiated on {returnItem.returnDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Refund: {returnItem.refundAmount}</p>
                      <p className="text-xs text-gray-500">{returnItem.items.length} item(s)</p>
                    </div>
                    <div>
                      {expandedReturnId === returnItem.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded return details */}
                {expandedReturnId === returnItem.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Return Information</h4>
                        <div className="mt-1 text-sm text-gray-900">
                          <p>Return Label: {returnItem.returnLabel}</p>
                          <p>Tracking: {returnItem.trackingNumber}</p>
                          <p>Return Method: {returnItem.returnMethod}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Refund Information</h4>
                        <div className="mt-1 text-sm text-gray-900">
                          <p>Amount: {returnItem.refundAmount}</p>
                          <p>Method: {returnItem.refundMethod}</p>
                          <p>Status: {returnItem.refundDate}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Status Notes</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{returnItem.notes}</p>
                    </div>

                    <h4 className="text-sm font-medium text-gray-500 mb-2">Items Returned</h4>
                    <div className="space-y-3">
                      {returnItem.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded">
                          <div className="flex-shrink-0">
                            <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                            <p className="text-sm text-gray-500">{item.price}</p>
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {item.returnType}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Reason:</div>
                            <div className="text-sm font-medium text-gray-700">{item.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-between">
                      {returnItem.status === 'In Transit' && (
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Track Package
                        </button>
                      )}
                      {returnItem.status === 'Processing' && (
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Check Status
                        </button>
                      )}
                      {returnItem.status === 'Completed' && (
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
              <RefreshCcw className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No returns found</h3>
              <p className="mt-1 text-sm text-gray-500">We couldn't find any returns matching your criteria.</p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View all returns
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <ArrowLeft className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Need to start a new return?</h2>
            <p className="mt-1 text-sm text-gray-500">
              To initiate a new return, please go to your orders page and select the order you want to return items from.
            </p>
            <div className="mt-3">
            <Link to='/account/orders'>    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Go to My Orders
              </button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;