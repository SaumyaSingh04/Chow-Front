import React, { useState } from 'react';
import Dashboard from './Dashboard.jsx';
import Products from './Products.jsx';
import Categories from './Categories.jsx';
import Subcategories from './Subcategories.jsx';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'subcategories', label: 'Subcategories' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <Products />;
      case 'categories': return <Categories />;
      case 'subcategories': return <Subcategories />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-8 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <div className="absolute top-8 right-16 hidden lg:block">
          <div >
          <img src="/src/assets/logo.png" alt="Chowdhry Sweet House" className="h-20 md:h-40 absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#d80a4e] text-[#d80a4e]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default Admin;