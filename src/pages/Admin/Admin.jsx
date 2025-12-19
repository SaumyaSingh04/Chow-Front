import React, { useState } from 'react';
import Dashboard from './Dashboard.jsx';
import Products from './Products.jsx';
import Categories from './Categories.jsx';
import Subcategories from './Subcategories.jsx';
import AdminOrders from './AdminOrders.jsx';
import Tickets from './Tickets.jsx';
import FailedOrders from './FailedOrders.jsx';
import logo from '../../assets/logo.png';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'categories', label: 'Category', icon: '📂' },
    { id: 'subcategories', label: 'Subcategory', icon: '📁' },
    { id: 'products', label: 'Product', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'failed-orders', label: 'Failed Orders', icon: '❌' },
    { id: 'tickets', label: 'Messages', icon: '💬' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <Products />;
      case 'categories': return <Categories />;
      case 'subcategories': return <Subcategories />;
      case 'orders': return <AdminOrders />;
      case 'failed-orders': return <FailedOrders />;
      case 'tickets': return <Tickets />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`w-64 bg-white shadow-lg fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <img src={logo} alt="Chowdhry" className="h-20 sm:h-24 lg:h-30 mx-auto" />
            <button 
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-4 sm:px-6 py-3 text-left hover:bg-red-300 text-sm sm:text-base ${
                activeTab === tab.id
                  ? 'bg-red-500 text-white border-r-4 border-red-600'
                  : 'text-gray-700'
              }`}
            >
              <span className="mr-2 sm:mr-3 text-sm sm:text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                className="mr-4 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-gray-700">Admin</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Admin;