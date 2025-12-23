import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const AdminOrders = () => {
  const { getAllOrders, updateOrderStatus, updatePaymentStatus } = useApi();
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
        <div className="bg-white rounded-lg shadow mx-4 mb-4 flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <table className="min-w-[1400px] w-full">
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
                      ₹{order.subtotal || 0}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      ₹{order.tax || 0}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      ₹{order.deliveryCharge || 0}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700 font-semibold">
                      ₹{order.totalAmount || 0}
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
                        {(order.orderStatus === 'confirmed' || order.orderStatus === 'shipped') && (
                          <button
                            onClick={() => handleStatusUpdate(order.orderId, 'delivered')}
                            disabled={updatingOrder === order.orderId}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                          >
                            {updatingOrder === order.orderId ? 'Updating...' : 'Deliver'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowPaymentModal(true);
                          }}
                          className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                        >
                          View Payment
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="bg-indigo-500 text-white px-2 py-1 rounded text-xs hover:bg-indigo-600"
                        >
                          View Details
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
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Complete Payment Details</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Order Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium text-blue-700">Order ID:</span>
                    <div className="break-all text-blue-900">#{selectedOrder.orderId}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Customer:</span>
                    <div className="text-blue-900">{selectedOrder.customerName}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Total Amount:</span>
                    <div className="text-blue-900 font-bold text-lg">₹{selectedOrder.totalAmount}</div>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Status</h4>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full text-white text-lg font-medium ${
                    selectedOrder.paymentStatus === 'paid' ? 'bg-green-500' : 
                    selectedOrder.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {selectedOrder.paymentStatus?.charAt(0).toUpperCase() + selectedOrder.paymentStatus?.slice(1)}
                  </span>
                  <div className="text-sm text-gray-600">
                    Last updated: {new Date(selectedOrder.orderDate).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Razorpay Transaction Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Razorpay Transaction Details</h4>
                <div className="space-y-4">
                  {(selectedOrder.razorpayTransactions || selectedOrder.razorpayData) && (selectedOrder.razorpayTransactions || selectedOrder.razorpayData).length > 0 ? (
                    (selectedOrder.razorpayTransactions || selectedOrder.razorpayData).map((transaction, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="text-md font-semibold text-gray-800">Transaction #{idx + 1}</h5>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.paymentId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status === 'paid' || transaction.paymentId ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="font-medium text-gray-600">Razorpay Order ID:</span>
                            <div className="break-all text-gray-900 mt-1 font-mono text-xs">{transaction.orderId || 'N/A'}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="font-medium text-gray-600">Payment ID:</span>
                            <div className="break-all text-gray-900 mt-1 font-mono text-xs">{transaction.paymentId || 'Not Generated'}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="font-medium text-gray-600">Payment Method:</span>
                            <div className="text-gray-900 mt-1 capitalize">{transaction.method || 'N/A'}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <span className="font-medium text-gray-600">Bank/Wallet:</span>
                            <div className="text-gray-900 mt-1 capitalize">{transaction.bank || 'N/A'}</div>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <span className="font-medium text-green-600">Amount Paid:</span>
                            <div className="text-green-900 mt-1 font-bold">₹{transaction.amount ? (transaction.amount / 100).toFixed(2) : '0.00'}</div>
                          </div>
                          <div className="bg-red-50 p-3 rounded">
                            <span className="font-medium text-red-600">Gateway Fee:</span>
                            <div className="text-red-900 mt-1">₹{transaction.fee ? (transaction.fee / 100).toFixed(2) : '0.00'}</div>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded">
                            <span className="font-medium text-yellow-600">Gateway Tax:</span>
                            <div className="text-yellow-900 mt-1">₹{transaction.tax ? (transaction.tax / 100).toFixed(2) : '0.00'}</div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded">
                            <span className="font-medium text-blue-600">Transaction Date:</span>
                            <div className="text-blue-900 mt-1">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            }) : 'N/A'}</div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded">
                            <span className="font-medium text-purple-600">Payment Status:</span>
                            <div className="text-purple-900 mt-1 capitalize">{transaction.status || 'Processing'}</div>
                          </div>
                          <div className="bg-indigo-50 p-3 rounded">
                            <span className="font-medium text-indigo-600">Currency:</span>
                            <div className="text-indigo-900 mt-1">{transaction.currency || 'INR'}</div>
                          </div>
                        </div>
                        
                        {/* Payment Signature */}
                        {transaction.signature && (
                          <div className="mt-4 bg-gray-50 p-3 rounded">
                            <span className="font-medium text-gray-600">Payment Signature:</span>
                            <div className="break-all text-xs font-mono text-gray-700 mt-2 bg-white p-2 rounded border">
                              {transaction.signature}
                            </div>
                          </div>
                        )}
                        
                        {/* Additional Transaction Info */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {transaction.receipt && (
                            <div>
                              <span className="font-medium text-gray-600">Receipt:</span>
                              <span className="ml-2 text-gray-900 font-mono text-xs">{transaction.receipt}</span>
                            </div>
                          )}
                          {transaction.notes && Object.keys(transaction.notes).length > 0 && (
                            <div className="col-span-2">
                              <span className="font-medium text-gray-600">Notes:</span>
                              <div className="mt-1 text-gray-900">
                                {Object.entries(transaction.notes).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="font-medium">{key}:</span> {value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 bg-gray-50 rounded-lg text-center">
                      <div className="text-gray-400 text-4xl mb-4">💳</div>
                      <div className="text-gray-500 text-lg">No payment transaction details available</div>
                      <div className="text-gray-400 text-sm mt-2">Payment may be pending or failed</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Financial Breakdown */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-green-900 mb-3">Financial Breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-700">Subtotal:</span>
                    <div className="text-green-900 font-semibold">₹{selectedOrder.subtotal || 0}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Tax (5%):</span>
                    <div className="text-green-900 font-semibold">₹{selectedOrder.tax || 0}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Delivery:</span>
                    <div className="text-green-900 font-semibold">₹{selectedOrder.deliveryCharge || 0}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Total:</span>
                    <div className="text-green-900 font-bold text-lg">₹{selectedOrder.totalAmount || 0}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-medium"
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
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Complete Order Details</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-blue-50 p-5 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium text-blue-700">Order ID:</span>
                    <div className="text-blue-900 font-mono text-sm">#{selectedOrder.orderId}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Order Date:</span>
                    <div className="text-blue-900">{new Date(selectedOrder.orderDate).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Distance:</span>
                    <div className="text-blue-900">{selectedOrder.distance || 0} km</div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-green-50 p-5 rounded-lg">
                <h4 className="text-lg font-semibold text-green-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-green-700">Name:</span>
                    <div className="text-green-900">{selectedOrder.customerName}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Email:</span>
                    <div className="text-green-900">{selectedOrder.customerEmail}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Phone:</span>
                    <div className="text-green-900">{selectedOrder.customerPhone}</div>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Delivery Address:</span>
                    <div className="text-green-900">{selectedOrder.deliveryAddress}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 p-5 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Item:</span>
                            <div className="text-gray-900">{item.itemId?.name || 'Unknown Item'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Quantity:</span>
                            <div className="text-gray-900">{item.quantity}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Price:</span>
                            <div className="text-gray-900">₹{item.price}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Total:</span>
                            <div className="text-gray-900 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      {selectedOrder.itemsString || 'No items information available'}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-yellow-50 p-5 rounded-lg">
                <h4 className="text-lg font-semibold text-yellow-900 mb-3">Order Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-yellow-700">Order Status:</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus?.charAt(0).toUpperCase() + selectedOrder.orderStatus?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-700">Payment Status:</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-500' : 
                        selectedOrder.paymentStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        {selectedOrder.paymentStatus?.charAt(0).toUpperCase() + selectedOrder.paymentStatus?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-purple-50 p-5 rounded-lg">
                <h4 className="text-lg font-semibold text-purple-900 mb-4">Financial Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-purple-200">
                    <span className="font-medium text-purple-700">Subtotal:</span>
                    <span className="text-purple-900 font-semibold">₹{selectedOrder.subtotal || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-purple-200">
                    <span className="font-medium text-purple-700">Tax (5%):</span>
                    <span className="text-purple-900 font-semibold">₹{selectedOrder.tax || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-purple-200">
                    <span className="font-medium text-purple-700">Delivery Charge:</span>
                    <span className="text-purple-900 font-semibold">₹{selectedOrder.deliveryCharge || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-purple-100 rounded px-3">
                    <span className="font-bold text-purple-800 text-lg">Total Amount:</span>
                    <span className="text-purple-900 font-bold text-xl">₹{selectedOrder.totalAmount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setShowPaymentModal(true);
                }}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 font-medium"
              >
                View Payment Details
              </button>
              <button
                onClick={() => setShowOrderModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-medium"
              >
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