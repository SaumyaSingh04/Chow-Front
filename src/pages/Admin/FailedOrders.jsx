import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const FailedOrders = () => {
  const { getFailedOrders, cleanFailedOrders } = useApi();
  const [failedOrders, setFailedOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadFailedOrders();
  }, [currentPage]);

  const loadFailedOrders = async () => {
    try {
      setLoading(true);
      const response = await getFailedOrders(currentPage, itemsPerPage);
      setFailedOrders(response.orders || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading failed orders:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleCleanFailedOrders = async () => {
    if (window.confirm('Are you sure you want to delete all failed orders? This action cannot be undone.')) {
      try {
        const response = await cleanFailedOrders();
        if (response.success) {
          alert(response.message);
          loadFailedOrders(); // Refresh list
        }
      } catch (error) {
        console.error('Error cleaning failed orders:', error);
        alert('Failed to clean failed orders');
      }
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
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 px-4 pt-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Failed Orders Management</h2>
        <div className="flex gap-2">
          <button
            onClick={loadFailedOrders}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Refresh
          </button>
          <button
            onClick={handleCleanFailedOrders}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Clean Failed Orders
          </button>
        </div>
      </div>

      {failedOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No failed orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow mx-4 mb-4 flex-1 min-h-0">
          <div className="h-full overflow-auto">
            <table className="min-w-[1400px] w-full">
              <thead className="bg-red-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[100px]">Order ID</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[150px]">Customer</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[200px]">Address</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[300px]">Items</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[80px]">Subtotal</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[80px]">Tax (5%)</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[80px]">Delivery</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[80px]">Total</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[100px]">Status</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[200px]">Error</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[100px]">Date</th>
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {failedOrders.map((order, index) => (
                  <tr key={order._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-red-50`}>
                    <td className="px-2 py-2 text-sm font-medium text-gray-900">
                      #{order._id?.slice(-8) || 'N/A'}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      <div className="font-medium">{order.customerName || order.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.customerEmail || order.userId?.email || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone || order.userId?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      <div className="max-w-[200px] truncate" title={order.deliveryAddress || order.address}>
                        {order.deliveryAddress || order.address || 'N/A'}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      <div className="max-w-[300px] truncate" title={order.itemsString}>
                        {order.itemsString || order.items?.map(item => `${item.itemId?.name || 'Item'} (${item.quantity})`).join(', ') || 'N/A'}
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
                      <span className="px-2 py-1 rounded-full text-white text-xs font-medium bg-red-600">
                        {order.status || 'Failed'}/{order.paymentStatus || 'Failed'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm text-red-600">
                      <div className="max-w-[200px] truncate" title={order.razorpayData?.[0]?.errorDescription || order.errorMessage}>
                        {order.razorpayData?.[0]?.errorDescription || order.errorMessage || 'Unknown error'}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      <div className="bg-white rounded-lg shadow mt-4">
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
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs md:text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
      
      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-red-900">Failed Order Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-red-50 p-5 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium text-red-700">Order ID:</span>
                    <div className="text-red-900 font-mono text-sm">#{selectedOrder._id}</div>
                  </div>
                  <div>
                    <span className="font-medium text-red-700">Order Date:</span>
                    <div className="text-red-900">{new Date(selectedOrder.createdAt || selectedOrder.orderDate).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium text-red-700">Status:</span>
                    <div className="text-red-900 font-bold">{selectedOrder.status || 'Failed'}</div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-blue-50 p-5 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-blue-700">Name:</span>
                    <div className="text-blue-900">{selectedOrder.customerName || selectedOrder.userId?.name || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Email:</span>
                    <div className="text-blue-900">{selectedOrder.customerEmail || selectedOrder.userId?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Phone:</span>
                    <div className="text-blue-900">{selectedOrder.customerPhone || selectedOrder.userId?.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Delivery Address:</span>
                    <div className="text-blue-900">{selectedOrder.deliveryAddress || selectedOrder.address || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Error Information */}
              <div className="bg-red-100 p-5 rounded-lg border-l-4 border-red-500">
                <h4 className="text-lg font-semibold text-red-900 mb-3">Error Details</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-red-700">Payment Status:</span>
                    <div className="text-red-900">{selectedOrder.paymentStatus || 'Failed'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-red-700">Error Description:</span>
                    <div className="text-red-900 bg-red-50 p-3 rounded mt-1">
                      {selectedOrder.razorpayData?.[0]?.errorDescription || selectedOrder.errorMessage || 'Payment processing failed'}
                    </div>
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

              {/* Financial Summary */}
              <div className="bg-yellow-50 p-5 rounded-lg">
                <h4 className="text-lg font-semibold text-yellow-900 mb-4">Financial Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                    <span className="font-medium text-yellow-700">Subtotal:</span>
                    <span className="text-yellow-900 font-semibold">₹{selectedOrder.subtotal || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                    <span className="font-medium text-yellow-700">Tax (5%):</span>
                    <span className="text-yellow-900 font-semibold">₹{selectedOrder.tax || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                    <span className="font-medium text-yellow-700">Delivery Charge:</span>
                    <span className="text-yellow-900 font-semibold">₹{selectedOrder.deliveryCharge || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-yellow-100 rounded px-3">
                    <span className="font-bold text-yellow-800 text-lg">Total Amount:</span>
                    <span className="text-yellow-900 font-bold text-xl">₹{selectedOrder.totalAmount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Razorpay Transaction Details */}
              {selectedOrder.razorpayData && selectedOrder.razorpayData.length > 0 && (
                <div className="bg-purple-50 p-5 rounded-lg">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4">Payment Transaction Details</h4>
                  {selectedOrder.razorpayData.map((transaction, idx) => (
                    <div key={idx} className="bg-white p-4 rounded border mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-purple-600">Razorpay Order ID:</span>
                          <div className="text-purple-900 font-mono text-xs">{transaction.orderId || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="font-medium text-purple-600">Payment ID:</span>
                          <div className="text-purple-900 font-mono text-xs">{transaction.paymentId || 'Not Generated'}</div>
                        </div>
                        <div>
                          <span className="font-medium text-purple-600">Error Code:</span>
                          <div className="text-red-600">{transaction.errorCode || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="font-medium text-purple-600">Error Source:</span>
                          <div className="text-red-600">{transaction.errorSource || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
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

export default FailedOrders;