import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp, Search, Filter, Calendar } from 'lucide-react';
import OrdersPage from '../Pages/OrdersPages';

const Orders = () => {
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');


  return (
   <>
   <OrdersPage />
   </>
  );
};

export default Orders;