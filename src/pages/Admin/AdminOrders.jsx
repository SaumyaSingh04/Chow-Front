import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/index.jsx';
import { useNavigate } from 'react-router-dom';

const AdminOrders = () => {
  const { getAllOrders, updateOrderStatus, updatePaymentStatus, createShipment, trackOrder, updateDeliveryStatus, service } = useApi();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [trackingData, setTrackingData] = useState({});

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders(currentPage, itemsPerPage);
      setOrders(response.orders || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || 0);
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
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
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
          order.orderId === orderId 
            ? { ...order, orderStatus: newStatus }
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

  const handleCreateShipment = async (orderId) => {
    try {
      setUpdatingOrder(orderId);
      const result = await createShipment(orderId);
      
      if (result.success) {
        alert(`Shipment created successfully! Waybill: ${result.waybill}`);
        fetchOrders(); // Refresh orders to show updated status
      } else {
        alert(`Failed to create shipment: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating shipment:', error);
      alert(`Error creating shipment: ${error.message}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleDeliveryStatusUpdate = async (orderId, deliveryStatus) => {
    try {
      setUpdatingOrder(orderId);
      
      await updateDeliveryStatus(orderId, deliveryStatus);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, deliveryStatus, orderStatus: deliveryStatus === 'DELIVERED' ? 'delivered' : deliveryStatus === 'IN_TRANSIT' ? 'shipped' : order.orderStatus }
            : order
        )
      );
      
      alert(`Delivery status updated to ${deliveryStatus} successfully!`);
      
    } catch (error) {
      console.error('Error updating delivery status:', error);
      alert(`Error updating delivery status: ${error.message || 'Unknown error occurred'}`);
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
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 px-4 pt-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Orders Management</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e]"
          >
            Refresh
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow mx-4 mb-4 flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <table className="min-w-[1800px] w-full">
              <thead className="bg-[#d80a4e] text-white sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[100px]">Order ID</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[150px]">Customer</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[200px]">Address</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[300px]">Items</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[80px]">Subtotal</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[80px]">Tax (5%)</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[80px]">Delivery</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[80px]">Total</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[100px]">Order Status</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[100px]">Payment Status</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[100px]">Order Date</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[60px]">Distance</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[80px]">Weight</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[100px]">Delivery Status</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[100px]">Payment Mode</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr key={order.orderId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                    <td className="px-2 py-2 text-sm font-medium text-gray-900">
                      #{order.orderId?.slice(-8)}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone}</div>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      <div className="max-w-[200px] truncate" title={order.deliveryAddress}>
                        {order.deliveryAddress || 'N/A'}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      <div className="max-w-[300px] truncate" title={order.itemsString}>
                        {order.itemsString}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      ₹{(() => {
                        const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                        return subtotal.toFixed(2);
                      })()}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      ₹{(() => {
                        const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                        return (subtotal * 0.05).toFixed(2);
                      })()}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      ₹{(order.shipping?.total || 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700 font-semibold">
                      ₹{(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-500' : 
                        order.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      {order.distance || 0} km
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      {order.totalWeight || 0}g
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                        order.deliveryStatus === 'DELIVERED' ? 'bg-green-500' :
                        order.deliveryStatus === 'IN_TRANSIT' ? 'bg-blue-500' :
                        order.deliveryStatus === 'SHIPMENT_CREATED' ? 'bg-purple-500' :
                        order.deliveryStatus === 'PENDING' ? 'bg-yellow-500' :
                        order.deliveryStatus === 'RTO' ? 'bg-red-500' : 'bg-gray-500'
                      }`}>
                        {order.deliveryStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentMode === 'PREPAID' ? 'bg-green-100 text-green-800' :
                        order.paymentMode === 'COD' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.paymentMode || 'N/A'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className="flex flex-col gap-1">
                        {order.paymentStatus === 'pending' && (
                          <button
                            onClick={() => handlePaymentUpdate(order.orderId, 'paid')}
                            disabled={updatingOrder === order.orderId}
                            className="bg-emerald-500 text-white px-2 py-1 rounded text-xs hover:bg-emerald-600 disabled:opacity-50"
                          >
                            {updatingOrder === order.orderId ? 'Updating...' : 'Mark Paid'}
                          </button>
                        )}
                        {order.orderStatus === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(order.orderId, 'confirmed')}
                            disabled={updatingOrder === order.orderId}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                          >
                            {updatingOrder === order.orderId ? 'Updating...' : 'Confirm'}
                          </button>
                        )}
                        
                        {/* Self-delivery orders (GKP) - Manual shipment buttons */}
                        {order.shipping?.provider === 'self' && order.orderStatus === 'confirmed' && order.paymentStatus === 'paid' && (
                          <>
                            <button
                              onClick={() => handleDeliveryStatusUpdate(order.orderId, 'IN_TRANSIT')}
                              disabled={updatingOrder === order.orderId}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50"
                            >
                              {updatingOrder === order.orderId ? 'Updating...' : 'Mark Shipped'}
                            </button>
                            <button
                              onClick={() => handleDeliveryStatusUpdate(order.orderId, 'DELIVERED')}
                              disabled={updatingOrder === order.orderId}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                            >
                              {updatingOrder === order.orderId ? 'Updating...' : 'Mark Delivered'}
                            </button>
                          </>
                        )}
                        
                        {/* Self-delivery orders - Additional status buttons */}
                        {order.shipping?.provider === 'self' && order.deliveryStatus === 'IN_TRANSIT' && (
                          <button
                            onClick={() => handleDeliveryStatusUpdate(order.orderId, 'DELIVERED')}
                            disabled={updatingOrder === order.orderId}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                          >
                            {updatingOrder === order.orderId ? 'Updating...' : 'Mark Delivered'}
                          </button>
                        )}
                        
                        {/* Delhivery orders - Auto-managed, no manual buttons */}
                        {order.shipping?.provider === 'delhivery' && order.orderStatus === 'confirmed' && order.paymentStatus === 'paid' && !order.waybill && (
                          <div className="text-xs text-gray-500 italic">
                            Auto-shipment via Delhivery
                          </div>
                        )}
                        
                        {/* Delhivery tracking */}
                        {order.shipping?.provider === 'delhivery' && order.waybill && (
                          <button
                            onClick={() => handleTrackOrder(order.orderId)}
                            className="bg-cyan-500 text-white px-2 py-1 rounded text-xs hover:bg-cyan-600"
                          >
                            Track Delhivery
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowPaymentModal(true);
                          }}
                          className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                        >
                          Payment Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600"
                        >
                          Order Details
                        </button>
                        <button
                          onClick={() => navigate(`/admin/order/${order.orderId}`)}
                          className="bg-teal-500 text-white px-2 py-1 rounded text-xs hover:bg-teal-600"
                        >
                          Full Details
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
      
      {/* Pagination */}
      <div className="bg-white rounded-lg shadow mx-4 mb-4">
        <div className="bg-white px-3 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center text-xs md:text-sm text-gray-700 gap-2 sm:gap-0">
            <span>Items per page: {itemsPerPage}</span>
            <span className="sm:ml-8">{(currentPage - 1) * itemsPerPage + 1} – {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs md:text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ◀
            </button>
            <span className="text-xs md:text-sm text-gray-600">
              {currentPage} / {totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
              disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
              className="px-3 py-1 text-xs md:text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Details Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Payment Details</h3>
                  <p className="text-blue-100 mt-1">Order #{selectedOrder.orderId?.slice(-8)}</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Order Information */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-blue-900">Order Info</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Order ID</span>
                      <span className="text-blue-900 font-mono text-sm bg-white px-2 py-1 rounded">{selectedOrder.orderId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Date</span>
                      <span className="text-blue-900">{new Date(selectedOrder.orderDate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedOrder.orderStatus === 'delivered' ? 'bg-green-500 text-white' :
                        selectedOrder.orderStatus === 'shipped' ? 'bg-purple-500 text-white' :
                        selectedOrder.orderStatus === 'confirmed' ? 'bg-blue-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {selectedOrder.orderStatus?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Total Amount</span>
                      <span className="text-blue-900 font-bold text-lg">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                    </div>
                    {selectedOrder.confirmedAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-medium">Confirmed At</span>
                        <span className="text-blue-900 text-sm">{new Date(selectedOrder.confirmedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-green-900">Customer</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-green-700 font-medium block">Name</span>
                      <span className="text-green-900">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium block">Email</span>
                      <span className="text-green-900 text-sm">{selectedOrder.customerEmail}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium block">Phone</span>
                      <span className="text-green-900">{selectedOrder.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-green-700 font-medium block">Address</span>
                      <span className="text-green-900 text-sm">{selectedOrder.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-purple-900">Payment</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {selectedOrder.paymentStatus?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">Method</span>
                      <span className="text-purple-900 capitalize">{selectedOrder.paymentMethod || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">Mode</span>
                      <span className="text-purple-900">{selectedOrder.paymentMode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 font-medium">Amount</span>
                      <span className="text-purple-900 font-bold">₹{selectedOrder.paymentAmount?.toFixed(2) || selectedOrder.totalAmount?.toFixed(2)}</span>
                    </div>
                    {selectedOrder.razorpayPaymentId && (
                      <div>
                        <span className="text-purple-700 font-medium block">Payment ID</span>
                        <span className="text-purple-900 font-mono text-xs bg-white px-2 py-1 rounded">{selectedOrder.razorpayPaymentId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-orange-900">Items</h4>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-orange-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-orange-900">{item.itemId?.name || 'Unknown Item'}</div>
                            <div className="text-orange-700 text-sm">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-900">₹{item.price}</div>
                            <div className="text-orange-700 text-sm">₹{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-orange-700">{selectedOrder.itemsString}</div>
                    )}
                  </div>
                </div>

                {/* Shipping */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-indigo-900">Shipping</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-700 font-medium">Provider</span>
                      <span className="text-indigo-900 capitalize">{selectedOrder.shipping?.provider || selectedOrder.deliveryProvider || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-700 font-medium">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedOrder.deliveryStatus === 'DELIVERED' ? 'bg-green-500 text-white' :
                        selectedOrder.deliveryStatus === 'IN_TRANSIT' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {selectedOrder.deliveryStatus || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-700 font-medium">Cost</span>
                      <span className="text-indigo-900 font-bold">₹{selectedOrder.shipping?.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-700 font-medium">Weight</span>
                      <span className="text-indigo-900">{selectedOrder.totalWeight || 0} grams</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-700 font-medium">Distance</span>
                      <span className="text-indigo-900">{selectedOrder.distance || 0} km</span>
                    </div>
                    {selectedOrder.waybill && (
                      <div>
                        <span className="text-indigo-700 font-medium block">Waybill</span>
                        <span className="text-indigo-900 font-mono text-xs bg-white px-2 py-1 rounded">{selectedOrder.waybill}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-emerald-900">Summary</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-medium">Subtotal</span>
                      <span className="text-emerald-900">₹{(() => {
                        const subtotal = selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || selectedOrder.subtotal || 0;
                        return subtotal.toFixed(2);
                      })()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-medium">Tax</span>
                      <span className="text-emerald-900">₹{selectedOrder.tax?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-medium">Delivery</span>
                      <span className="text-emerald-900">₹{(selectedOrder.shipping?.total || selectedOrder.deliveryCharge || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-emerald-300 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-900 font-bold text-lg">Total</span>
                        <span className="text-emerald-900 font-bold text-xl">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-emerald-700 text-sm">
                      <span className="font-medium">Currency:</span> {selectedOrder.currency || 'INR'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Order #{selectedOrder.orderId?.slice(-8)}</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Basic Info */}
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-medium text-blue-900 mb-2">Order Info</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">ID:</span> #{selectedOrder.orderId?.slice(-8)}</div>
                    <div><span className="font-medium">Date:</span> {new Date(selectedOrder.orderDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        selectedOrder.orderStatus === 'delivered' ? 'bg-green-500 text-white' :
                        selectedOrder.orderStatus === 'shipped' ? 'bg-blue-500 text-white' :
                        selectedOrder.orderStatus === 'confirmed' ? 'bg-purple-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                    <div><span className="font-medium">Total:</span> ₹{selectedOrder.totalAmount}</div>
                    <div><span className="font-medium">Weight:</span> {selectedOrder.totalWeight || 0}g</div>
                    <div><span className="font-medium">Distance:</span> {selectedOrder.distance || 0} km</div>
                    {selectedOrder.confirmedAt && (
                      <div><span className="font-medium">Confirmed:</span> {new Date(selectedOrder.confirmedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-medium text-green-900 mb-2">Customer</h4>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Name:</span> {selectedOrder.customerName}</div>
                    <div><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.customerEmail}</div>
                    <div><span className="font-medium">Address:</span> {selectedOrder.deliveryAddress}</div>
                  </div>
                </div>
              </div>

              {/* Middle Column - Items & Status */}
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.itemId?.name || 'Unknown Item'}</div>
                            <div className="text-xs text-gray-600">Qty: {item.quantity} | Weight: {item.weight || 0}g</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">₹{item.price}</div>
                            <div className="text-xs text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    )) || <div className="text-sm text-gray-500">{selectedOrder.itemsString}</div>}
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="font-medium text-yellow-900 mb-2">Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Payment:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedOrder.deliveryStatus === 'DELIVERED' ? 'bg-green-500 text-white' :
                        selectedOrder.deliveryStatus === 'IN_TRANSIT' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {selectedOrder.deliveryStatus || 'PENDING'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="text-xs">{selectedOrder.shipping?.provider || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode:</span>
                      <span className="text-xs">{selectedOrder.paymentMode || 'N/A'}</span>
                    </div>
                    {selectedOrder.waybill && (
                      <div className="flex justify-between">
                        <span>Waybill:</span>
                        <span className="text-xs font-mono">{selectedOrder.waybill}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Shipping & Transactions */}
              <div className="space-y-3">
                {selectedOrder.shipping && (
                  <div className="bg-indigo-50 p-3 rounded">
                    <h4 className="font-medium text-indigo-900 mb-2">Shipping</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="font-medium">₹{selectedOrder.shipping.total}</span>
                      </div>
                      {selectedOrder.shipping.breakdown && (
                        <>
                          <div className="flex justify-between text-xs">
                            <span>Base:</span>
                            <span>₹{selectedOrder.shipping.breakdown.baseRate}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Weight:</span>
                            <span>₹{selectedOrder.shipping.breakdown.weightRate || 0}</span>
                          </div>
                          {selectedOrder.shipping.breakdown.fuelSurcharge && (
                            <div className="flex justify-between text-xs">
                              <span>Fuel:</span>
                              <span>₹{selectedOrder.shipping.breakdown.fuelSurcharge}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.razorpayData?.length > 0 && (
                  <div className="bg-emerald-50 p-3 rounded">
                    <h4 className="font-medium text-emerald-900 mb-2">Transactions</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedOrder.razorpayData.map((txn, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border">
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="font-medium">Payment ID:</span>
                              <span className="font-mono text-xs">{txn.paymentId?.slice(-8) || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Amount:</span>
                              <span>₹{(txn.amount / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Method:</span>
                              <span>{txn.method || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Status:</span>
                              <span className={`px-1 rounded text-xs ${
                                txn.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {txn.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Verified:</span>
                              <span>{txn.signatureVerified ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(txn.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-purple-50 p-3 rounded">
                  <h4 className="font-medium text-purple-900 mb-2">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{(() => {
                        const subtotal = selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                        return subtotal.toFixed(2);
                      })()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%):</span>
                      <span>₹{(() => {
                        const subtotal = selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                        return (subtotal * 0.05).toFixed(2);
                      })()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span>₹{(selectedOrder.shipping?.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Total:</span>
                      <span>₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowOrderModal(false)} className="bg-gray-500 text-white px-3 py-1 rounded text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
