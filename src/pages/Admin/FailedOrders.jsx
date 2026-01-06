import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/index.jsx';

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
          loadFailedOrders();
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
                  <th className="px-2 py-3 text-left text-sm font-semibold uppercase min-w-[60px]">Distance</th>
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
                      <div className="max-w-[300px] truncate" title={order.items}>
                        {order.itemsString || order.items?.map(item => `${item.itemId?.name || 'Item'} (${item.quantity})`).join(', ') || 'N/A'}
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
                    <td className="px-2 py-2 text-sm text-gray-700">
                      {order.distance || 0} km
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700 font-semibold">
                      ₹{(order.totalAmount || 0).toFixed(2)}
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">All Order Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {Object.entries(selectedOrder).filter(([key]) => key !== 'razorpayData').map(([key, value]) => {
                    if (value === null || value === undefined) return null;
                    
                    const getFieldColor = (fieldKey) => {
                      if (fieldKey.includes('payment') || fieldKey.includes('Payment')) return 'bg-green-50 border-green-200';
                      if (fieldKey.includes('amount') || fieldKey.includes('Amount') || fieldKey.includes('price') || fieldKey.includes('Price')) return 'bg-emerald-50 border-emerald-200';
                      if (fieldKey.includes('id') || fieldKey.includes('Id') || fieldKey.includes('ID')) return 'bg-blue-50 border-blue-200';
                      if (fieldKey.includes('status') || fieldKey.includes('Status')) return 'bg-purple-50 border-purple-200';
                      if (fieldKey.includes('date') || fieldKey.includes('Date') || fieldKey.includes('time') || fieldKey.includes('Time') || fieldKey.includes('At')) return 'bg-indigo-50 border-indigo-200';
                      if (fieldKey.includes('address') || fieldKey.includes('Address')) return 'bg-orange-50 border-orange-200';
                      if (fieldKey.includes('customer') || fieldKey.includes('Customer') || fieldKey.includes('user') || fieldKey.includes('User')) return 'bg-pink-50 border-pink-200';
                      if (fieldKey.includes('item') || fieldKey.includes('Item')) return 'bg-yellow-50 border-yellow-200';
                      return 'bg-gray-50 border-gray-200';
                    };
                    
                    const formatValue = (val) => {
                      if (typeof val === 'object' && val !== null) {
                        if (Array.isArray(val)) {
                          if (key === 'items') {
                            return val.map(item => `${item.itemId?.name || 'Item'} (Qty: ${item.quantity})`).join(', ');
                          }
                          return val.length > 0 ? `${val.length} entries` : 'Empty';
                        }
                        if (key === 'shipping') {
                          return `Provider: ${val.provider || 'N/A'}, Total: ₹${val.total || 0}, Charged: ${val.charged ? 'Yes' : 'No'}`;
                        }
                        return JSON.stringify(val, null, 2);
                      }
                      if (key.includes('At') || key.includes('date') || key.includes('Date')) {
                        try {
                          return new Date(val).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          });
                        } catch {
                          return String(val);
                        }
                      }
                      if ((key.includes('amount') || key.includes('Amount') || key.includes('price') || key.includes('Price') || key.includes('fee') || key.includes('Fee')) && typeof val === 'number') {
                        return `₹${val.toFixed(2)}`;
                      }
                      return String(val);
                    };
                    
                    return (
                      <div key={key} className={`p-3 rounded border ${getFieldColor(key)} ${typeof value === 'object' || String(value).length > 50 ? 'col-span-full' : ''}`}>
                        <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:</span>
                        <div className={`mt-1 ${typeof value === 'object' ? 'font-mono text-xs whitespace-pre-wrap' : 'break-all'} text-gray-900`}>
                          {formatValue(value)}
                        </div>
                      </div>
                    );
                  })}  
                </div>
              </div>
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
