import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, Search, Filter, Calendar } from 'lucide-react';

const Orders = () => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const orders = [
    {
      id: '12345',
      date: 'May 5, 2025',
      status: 'Delivered',
      total: '$129.99',
      items: [
        { id: 1, name: 'Wireless Headphones', price: '$89.99', quantity: 1, image: '/api/placeholder/60/60' },
        { id: 2, name: 'USB-C Cable', price: '$19.99', quantity: 2, image: '/api/placeholder/60/60' }
      ],
      deliveryAddress: '123 Main St, Anytown, ST 12345',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: 'Delivered on May 10, 2025'
    },
    {
      id: '12344',
      date: 'April 28, 2025',
      status: 'Shipped',
      total: '$45.50',
      items: [
        { id: 3, name: 'Graphic T-Shirt', price: '$24.99', quantity: 1, image: '/api/placeholder/60/60' },
        { id: 4, name: 'Phone Case', price: '$19.99', quantity: 1, image: '/api/placeholder/60/60' }
      ],
      deliveryAddress: '123 Main St, Anytown, ST 12345',
      trackingNumber: 'TRK987654321',
      estimatedDelivery: 'Expected by May 22, 2025'
    },
    {
      id: '12343',
      date: 'April 15, 2025',
      status: 'Processing',
      total: '$199.99',
      items: [
        { id: 5, name: 'Smart Watch', price: '$199.99', quantity: 1, image: '/api/placeholder/60/60' }
      ],
      deliveryAddress: '123 Main St, Anytown, ST 12345',
      trackingNumber: 'Pending',
      estimatedDelivery: 'Processing - Not shipped yet'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Shipped':
        return <Truck className="w-4 h-4 text-blue-500" />;
      case 'Processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const filteredOrders = orders.filter(order => {
    // Filter by tab
    if (activeTab !== 'all' && order.status.toLowerCase() !== activeTab) {
      return false;
    }
    
    // Filter by search
    if (searchQuery && !order.id.includes(searchQuery) && 
        !order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
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
              placeholder="Search orders by number or product name"
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
              All Orders
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
              onClick={() => setActiveTab('shipped')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'shipped'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Shipped
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'delivered'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Delivered
            </button>
          </nav>
        </div>

        {/* Order list */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleOrderDetails(order.id)}>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">Order #{order.id}</h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Placed on {order.date} • {order.items.length} item(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Total: {order.total}</p>
                    </div>
                    <div>
                      {expandedOrderId === order.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded order details */}
                {expandedOrderId === order.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                        <p className="mt-1 text-sm text-gray-900">{order.deliveryAddress}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Delivery Information</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {order.status === 'Processing' ? (
                            'Your order is being prepared for shipping'
                          ) : (
                            <>
                              Tracking: {order.trackingNumber}<br />
                              {order.estimatedDelivery}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-gray-500 mb-2">Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{item.price}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-between">
                      <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Track Order
                      </button>
                      <div className="space-x-2">
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Request Return
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Get Help
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">We couldn't find any orders matching your criteria.</p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View all orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;