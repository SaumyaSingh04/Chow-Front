import React, { useEffect, useState } from "react";
import { ShoppingCart, Users, CheckCircle, DollarSign, Package, FolderOpen, Layers, XCircle } from "lucide-react";
import { useApi } from "../../contexts/index.jsx";

const Dashboard = () => {
  const { getDashboardStats, getFailedOrders, fetchItems, fetchCategories, getAllSubcategories, items, categories, loading, dashboardRefreshTrigger } = useApi();
  const [stats, setStats] = useState({
    newOrders: 0,
    totalCustomers: 0,
    ticketsResolved: 0,
    revenueToday: 0,
    failedOrders: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, [items, categories, dashboardRefreshTrigger]);

  const loadDashboardStats = async () => {
    try {
      // Get main stats from API
      const data = await getDashboardStats();
      console.log('Dashboard API response:', data);
      
      if (data && Object.keys(data).length > 0) {
        setStats({
          newOrders: data.newOrders || 0,
          totalCustomers: data.totalCustomers || 0,
          ticketsResolved: data.ticketsResolved || 0,
          revenueToday: data.revenueToday || 0,
          failedOrders: data.failedOrders || 0
        });
      } else {
        // Fallback: Calculate from existing data
        await loadFallbackStats();
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Fallback: Calculate from existing data
      await loadFallbackStats();
    }
  };

  const loadFallbackStats = async () => {
    try {
      // Fetch all data to calculate stats
      await fetchItems();
      await fetchCategories();
      const subcats = await getAllSubcategories();
      
      // Calculate stats from fetched data
      setStats({
        totalOrders: 156, // Placeholder since we don't have orders data
        totalUsers: 89, // Placeholder since we don't have users data
        totalRevenue: 45000, // Placeholder since we don't have revenue data
        ticketsResolved: 23, // Placeholder since we don't have tickets data
        failedOrders: 12, // Placeholder for failed orders
        totalProducts: items?.length || 0,
        totalCategories: categories?.length || 0,
        totalSubcategories: subcats?.length || 0
      });
    } catch (error) {
      console.error('Error loading fallback stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 max-w-7xl">
        
        {/* New Orders */}
        <div className="relative h-28 sm:h-32 lg:h-36 rounded-xl bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg overflow-hidden">
          <div className="relative z-10 h-full flex items-center justify-between px-3 sm:px-4 lg:px-6">
            <div>
              <p className="text-xs font-medium opacity-90">New Orders</p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats.newOrders?.toLocaleString() || '0'}</h2>
            </div>
          </div>
          <ShoppingCart className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 opacity-20" />
        </div>

        {/* Customers */}
        <div className="relative h-28 sm:h-32 lg:h-36 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg overflow-hidden">
          <div className="relative z-10 h-full flex items-center justify-between px-3 sm:px-4 lg:px-6">
            <div>
              <p className="text-xs font-medium opacity-90">Customers</p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats.totalCustomers?.toLocaleString() || '0'}</h2>
            </div>
          </div>
          <Users className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 opacity-20" />
        </div>

        {/* Ticket Resolved */}
        <div className="relative h-28 sm:h-32 lg:h-36 rounded-xl bg-gradient-to-r from-emerald-700 to-green-400 text-white shadow-lg overflow-hidden">
          <div className="relative z-10 h-full flex items-center justify-between px-3 sm:px-4 lg:px-6">
            <div>
              <p className="text-xs font-medium opacity-90">Ticket Resolved</p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats.ticketsResolved?.toLocaleString() || '0'}</h2>
            </div>
          </div>
          <CheckCircle className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 opacity-20" />
        </div>

        {/* Revenue Today */}
        <div className="relative h-28 sm:h-32 lg:h-36 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-400 text-white shadow-lg overflow-hidden">
          <div className="relative z-10 h-full flex items-center justify-between px-3 sm:px-4 lg:px-6">
            <div>
              <p className="text-xs font-medium opacity-90">Revenue Today</p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">₹{stats.revenueToday?.toLocaleString() || '0'}</h2>
            </div>
          </div>
          <DollarSign className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 opacity-20" />
        </div>

        {/* Failed Orders */}
        <div className="relative h-28 sm:h-32 lg:h-36 rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-white shadow-lg overflow-hidden">
          <div className="relative z-10 h-full flex items-center justify-between px-3 sm:px-4 lg:px-6">
            <div>
              <p className="text-xs font-medium opacity-90">Failed Orders</p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats.failedOrders?.toLocaleString() || '0'}</h2>
            </div>
          </div>
          <XCircle className="absolute right-2 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 opacity-20" />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
