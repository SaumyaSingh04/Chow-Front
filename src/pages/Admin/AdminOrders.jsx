import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const AdminOrders = () => {
  const { getAllOrders, updateOrderStatus, updatePaymentStatus } = useApi();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      
      await updateOrderStatus(orderId, newStatus);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      const message = newStatus === 'delivered' 
        ? 'Order marked as delivered and stock updated successfully!' 
        : `Order status updated to ${newStatus} successfully!`;
      alert(message);
      
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Error updating order status: ${error.message || 'Unknown error occurred'}`);
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Orders Management</h2>
        <button
          onClick={fetchOrders}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e] w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {/* Horizontal scroll wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-[#d80a4e] text-white">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Order ID</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">User</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Items</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Total</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Status</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Payment</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Date</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr 
                    key={order._id} 
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer`}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                  >
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                      #{order._id?.slice(-8)}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">
                      {order.userId?.name || order.userName || 'N/A'}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">
                      <div className="max-w-xs">
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="text-xs">
                            {item.name} (x{item.quantity})
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className="text-xs text-gray-500">+{order.items.length - 2} more</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-white text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-500' : 
                        order.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1">
                        {order.paymentStatus === 'pending' && (
                          <button
                            onClick={() => handlePaymentUpdate(order._id, 'paid')}
                            disabled={updatingOrder === order._id}
                            className="bg-emerald-500 text-white px-2 py-1 rounded text-xs hover:bg-emerald-600 disabled:opacity-50 whitespace-nowrap"
                          >
                            {updatingOrder === order._id ? 'Updating...' : 'Mark Paid'}
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                            disabled={updatingOrder === order._id}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
                          >
                            {updatingOrder === order._id ? 'Updating...' : 'Confirm'}
                          </button>
                        )}
                        {(order.status === 'confirmed' || order.status === 'shipped') && (
                          <button
                            onClick={() => handleStatusUpdate(order._id, 'delivered')}
                            disabled={updatingOrder === order._id}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50 whitespace-nowrap"
                          >
                            {updatingOrder === order._id ? 'Updating...' : 'Deliver'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 whitespace-nowrap"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Order Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700 text-sm md:text-base">Order ID:</span>
                  <div className="text-sm md:text-base break-all">#{selectedOrder._id}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 text-sm md:text-base">Date:</span>
                  <div className="text-sm md:text-base">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700 text-sm md:text-base">Customer:</span>
                  <div className="text-sm md:text-base">{selectedOrder.userId?.name || selectedOrder.userName || 'N/A'}</div>
                  <div className="text-xs md:text-sm text-gray-500">{selectedOrder.userId?.email || 'N/A'}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 text-sm md:text-base">Total Amount:</span>
                  <div className="text-lg md:text-xl font-semibold text-green-600">₹{selectedOrder.totalAmount?.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700 text-sm md:text-base">Status:</span>
                  <div>
                    <span className={`px-2 md:px-3 py-1 rounded-full text-white text-xs md:text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 text-sm md:text-base">Payment Status:</span>
                  <div>
                    <span className={`px-2 md:px-3 py-1 rounded-full text-white text-xs md:text-sm font-medium ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-green-500' : 
                      selectedOrder.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {selectedOrder.paymentStatus?.charAt(0).toUpperCase() + selectedOrder.paymentStatus?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Delivery Information:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded">
                  {selectedOrder.deliveryAddress ? (
                    <>
                      <div className="font-medium">{selectedOrder.deliveryAddress.fullName}</div>
                      <div>{selectedOrder.deliveryAddress.street}</div>
                      {selectedOrder.deliveryAddress.apartment && <div>{selectedOrder.deliveryAddress.apartment}</div>}
                      <div>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.postcode}</div>
                      <div>{selectedOrder.deliveryAddress.phone}</div>
                      <div>{selectedOrder.deliveryAddress.email}</div>
                    </>
                  ) : (
                    <div className="text-gray-500">Delivery details not available</div>
                  )}
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <span className="font-medium text-gray-700">Order Notes:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded">
                    {selectedOrder.notes}
                  </div>
                </div>
              )}
              
              <div>
                <span className="font-medium text-gray-700">Items Ordered:</span>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items?.map((item, idx) => {
                    const itemName = item.itemId?.name || item.name || item.productName || 'Unknown Item';
                    return (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-semibold">{itemName}</div>
                        <div className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                      <div className="font-bold text-green-600">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;