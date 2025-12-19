import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const FailedOrders = () => {
  const { getFailedOrders, updateOrderStatus } = useApi();
  const [failedOrders, setFailedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFailedOrders();
  }, []);

  const loadFailedOrders = async () => {
    try {
      setLoading(true);
      const data = await getFailedOrders();
      setFailedOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading failed orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryOrder = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 'pending');
      loadFailedOrders(); // Refresh list
    } catch (error) {
      console.error('Error retrying order:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="animate-spin h-8 w-8 border-b-2 border-red-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Failed Orders Management</h2>
      </div>

      {failedOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No failed orders found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {failedOrders.map((order) => (
              <div key={order._id} className="border-b border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">#{order._id.slice(-6)}</div>
                  <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <div>Customer: {order.customerId?.name || 'N/A'}</div>
                  <div>Amount: ₹{order.totalAmount}</div>
                </div>
                <button
                  onClick={() => handleRetryOrder(order._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-xs w-full sm:w-auto"
                >
                  Retry Order
                </button>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold">Order ID</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold">Customer</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold">Amount</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold">Date</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs sm:text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {failedOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                      {order.customerId?.name || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm">
                      <button
                        onClick={() => handleRetryOrder(order._id)}
                        className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 text-xs"
                      >
                        Retry Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FailedOrders;