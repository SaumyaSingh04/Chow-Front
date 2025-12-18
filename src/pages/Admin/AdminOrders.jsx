import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const AdminOrders = () => {
  const { getAllOrders, updateOrderStatus, updatePaymentStatus, updateItemStock } = useApi();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders...');
      const ordersData = await getAllOrders();
      console.log('Orders fetched:', ordersData);
      setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error fetching orders. Please check your connection.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async (orderId, paymentStatus) => {
    try {
      console.log('Updating payment status:', orderId, 'to:', paymentStatus);
      setUpdatingOrder(orderId);
      
      await updatePaymentStatus(orderId, paymentStatus);
      
      // Update state directly instead of refetching
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, paymentStatus }
            : order
        )
      );
      
      alert(`Payment status updated to ${paymentStatus} successfully!`);
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error updating payment status: ${errorMessage}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, orderItems) => {
    try {
      console.log('Updating order:', orderId, 'to status:', newStatus);
      setUpdatingOrder(orderId);
      
      // Update order status
      const response = await updateOrderStatus(orderId, newStatus);
      console.log('Order status update response:', response);
      
      // If order is completed, update stock for all items
      if (newStatus === 'delivered') {
        console.log('Updating stock for items:', orderItems);
        for (const item of orderItems) {
          const itemId = item.itemId || item._id || item.id || item.productId;
          const itemName = item.name || item.productName || 'Unknown Item';
          
          if (!itemId) {
            console.warn('No item ID found for item:', item);
            alert(`Warning: Could not update stock for ${itemName} - No item ID found`);
            continue;
          }
          
          if (!item.quantity || item.quantity <= 0) {
            console.warn('Invalid quantity for item:', item);
            continue;
          }
          
          try {
            console.log(`Updating stock for item ID: ${itemId}, quantity: -${item.quantity}`);
            const stockResponse = await updateItemStock(itemId, -item.quantity);
            console.log(`Stock updated for item ${itemName}:`, stockResponse);
          } catch (error) {
            console.error(`Error updating stock for item ${itemName}:`, error);
            alert(`Warning: Could not update stock for ${itemName}: ${error.message}`);
          }
        }
      }
      
      // Update state directly instead of refetching
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      alert(`Order status updated to ${newStatus} successfully!`);
      
    } catch (error) {
      console.error('Error updating order:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error updating order status: ${errorMessage}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'failed': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d80a4e]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
        <button
          onClick={fetchOrders}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e]"
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#d80a4e] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Payment</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr key={order._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{order._id?.slice(-8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.userId?.name || order.userName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            {item.name} (x{item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-500' : 
                        order.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {order.paymentStatus === 'pending' && (
                          <button
                            onClick={() => handlePaymentUpdate(order._id, 'paid')}
                            disabled={updatingOrder === order._id}
                            className="bg-emerald-500 text-white px-3 py-1 rounded text-xs hover:bg-emerald-600 disabled:opacity-50"
                          >
                            {updatingOrder === order._id ? 'Updating...' : 'Mark Paid'}
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'confirmed', order.items)}
                              disabled={updatingOrder === order._id}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                            >
                              {updatingOrder === order._id ? 'Updating...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'shipped', order.items)}
                              disabled={updatingOrder === order._id}
                              className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 disabled:opacity-50"
                            >
                              {updatingOrder === order._id ? 'Updating...' : 'Ship'}
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'shipped', order.items)}
                              disabled={updatingOrder === order._id}
                              className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 disabled:opacity-50"
                            >
                              {updatingOrder === order._id ? 'Updating...' : 'Ship'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'delivered', order.items)}
                              disabled={updatingOrder === order._id}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                            >
                              {updatingOrder === order._id ? 'Updating...' : 'Mark Delivered'}
                            </button>
                          </>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'delivered', order.items)}
                            disabled={updatingOrder === order._id}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                          >
                            {updatingOrder === order._id ? 'Updating...' : 'Mark Delivered'}
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped') && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'cancelled', order.items)}
                            disabled={updatingOrder === order._id}
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                          >
                            {updatingOrder === order._id ? 'Updating...' : 'Cancel'}
                          </button>
                        )}
                      </div>
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

export default AdminOrders;