import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const Dashboard = () => {
  const { getDashboardStats, fetchItems, fetchCategories, getTickets, items, categories, loading } = useApi();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalCategories: 0,
    totalSubcategories: 0
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
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h2>
      
      {/* Stats Cards */}
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

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold text-[#d80a4e]">{stats.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Subcategories</h3>
          <p className="text-3xl font-bold text-[#d80a4e]">{stats.totalSubcategories || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Support Tickets</h3>
          <p className="text-3xl font-bold text-[#d80a4e]">{tickets.length || 0}</p>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {tickets.slice(0, 5).map((ticket, index) => (
              <div key={ticket._id || index} className="border-l-4 border-[#d80a4e] pl-3">
                <p className="text-sm text-gray-600">{ticket.subject || 'New ticket'}</p>
                <p className="text-xs text-gray-400">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recently'}</p>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="border-l-4 border-[#d80a4e] pl-3">
                <p className="text-sm text-gray-600">No recent activity</p>
                <p className="text-xs text-gray-400">System is running smoothly</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Server Status</span>
              <span className="text-green-600 font-semibold">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database</span>
              <span className="text-green-600 font-semibold">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Status</span>
              <span className="text-green-600 font-semibold">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-gray-600">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;