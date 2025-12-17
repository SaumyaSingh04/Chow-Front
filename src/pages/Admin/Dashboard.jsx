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
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* New Orders Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-medium mb-2">New Orders</h3>
            <p className="text-4xl font-bold">3,243</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
        </div>

        {/* Customers Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-medium mb-2">Customers</h3>
            <p className="text-4xl font-bold">15.07k</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
        </div>

        {/* Ticket Resolved Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 p-6 rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-medium mb-2">Ticket Resolved</h3>
            <p className="text-4xl font-bold">578</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
        </div>

        {/* Revenue Today Card */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 rounded-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-medium mb-2">Revenue Today</h3>
            <p className="text-4xl font-bold">INR 11.61k</p>
          </div>
          <div className="absolute top-4 right-4 text-6xl opacity-20">₹</div>
        </div>
      </div>


    </div>
  );
};

export default Dashboard;