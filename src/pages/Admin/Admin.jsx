import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const Admin = () => {
  const { getDashboardStats, fetchItems, fetchCategories, getTickets, getAdminDashboard, items, categories, loading } = useApi();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardStats = await getDashboardStats();
        if (dashboardStats) {
          setStats(dashboardStats);
        }
        await fetchItems();
        await fetchCategories();
        const ticketData = await getTickets();
        setTickets(ticketData || []);
        await getAdminDashboard();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

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
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
            <p className="text-3xl font-bold text-[#d80a4e]">{stats.totalOrders || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Products</h3>
            <p className="text-3xl font-bold text-[#d80a4e]">{stats.totalProducts || items.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
            <p className="text-3xl font-bold text-[#d80a4e]">{stats.totalCategories || categories.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
            <p className="text-3xl font-bold text-[#d80a4e]">₹{stats.totalRevenue || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-pink-50 hover:bg-pink-100 rounded text-[#d80a4e]">Add Product</button>
              <button className="w-full text-left p-3 bg-pink-50 hover:bg-pink-100 rounded text-[#d80a4e]">View Orders</button>
              <button className="w-full text-left p-3 bg-pink-50 hover:bg-pink-100 rounded text-[#d80a4e]">Manage Users</button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="border-l-4 border-[#d80a4e] pl-3">
                <p className="text-sm text-gray-600">New order #1234</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
              <div className="border-l-4 border-[#d80a4e] pl-3">
                <p className="text-sm text-gray-600">Product added</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;