import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/index.jsx';

const AdminOrders = () => {
  const { getAllOrders, updateOrderStatus, updatePaymentStatus, createShipment, trackOrder } = useApi();
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

  const handleTrackOrder = async (orderId) => {
    try {
      const result = await trackOrder(orderId);
      if (result.success) {
        setTrackingData(prev => ({
          ...prev,
          [orderId]: result
        }));
        alert('Tracking information updated!');
      } else {
        alert(`Tracking failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      alert(`Error tracking order: ${error.message}`);
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
                        {(order.orderStatus === 'confirmed' || order.orderStatus === 'shipped') && (
                          <button
                            onClick={() => handleStatusUpdate(order.orderId, 'delivered')}
                            disabled={updatingOrder === order.orderId}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50"
                          >
                            {updatingOrder === order.orderId ? 'Updating...' : 'Deliver'}
                          </button>
                        )}
                        {order.orderStatus === 'confirmed' && order.paymentStatus === 'paid' && (
                          <button
                            onClick={() => handleCreateShipment(order.orderId)}
                            disabled={updatingOrder === order.orderId}
                            className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 disabled:opacity-50"
                          >
                            {updatingOrder === order.orderId ? 'Creating...' : 'Create Shipment'}
                          </button>
                        )}
                        {(order.orderStatus === 'shipped' || order.orderStatus === 'delivered') && (
                          <button
                            onClick={() => handleTrackOrder(order.orderId)}
                            className="bg-cyan-500 text-white px-2 py-1 rounded text-xs hover:bg-cyan-600"
                          >
                            Track Order
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
              {/* Complete Order Data Table */}
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-6 rounded-xl border border-slate-300 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📋</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">Complete Order Data</h4>
                </div>
                <div className="bg-white rounded-lg border border-slate-300 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Field</th>
                        <th className="px-4 py-3 text-left font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(selectedOrder).filter(([key]) => key !== 'razorpayData').map(([key, value], index) => {
                        const formatValue = (val) => {
                          if (val === null || val === undefined) return 'N/A';
                          if (typeof val === 'object') {
                            if (Array.isArray(val)) {
                              if (key === 'razorpayData') {
                                return val.map((item, idx) => (
                                  <div key={idx} className="mb-2 p-2 bg-gray-100 rounded text-xs">
                                    {Object.entries(item).map(([k, v]) => (
                                      <div key={k}><strong>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                                    ))}
                                  </div>
                                ));
                              }
                              if (key === 'items') {
                                return val.map((item, idx) => (
                                  <div key={idx} className="mb-1 text-xs">
                                    {item.itemId?.name || 'Unknown'} (Qty: {item.quantity}, ₹{item.price})
                                  </div>
                                ));
                              }
                              return `${val.length} items`;
                            }
                            if (key === 'shipping') {
                              return (
                                <div className="text-xs space-y-1">
                                  <div><strong>Provider:</strong> {val.provider}</div>
                                  <div><strong>Total:</strong> ₹{val.total}</div>
                                  {val.breakdown && (
                                    <div><strong>Breakdown:</strong> Base: ₹{val.breakdown.baseRate}, Weight: ₹{val.breakdown.weightRate}, Fuel: ₹{val.breakdown.fuelSurcharge}</div>
                                  )}
                                </div>
                              );
                            }
                            return JSON.stringify(val, null, 2);
                          }
                          if (key.includes('At') || key.includes('date') || key.includes('Date')) {
                            try {
                              return new Date(val).toLocaleString('en-IN');
                            } catch { return String(val); }
                          }
                          if ((key.includes('amount') || key.includes('Amount') || key.includes('price') || key.includes('Price') || key.includes('fee') || key.includes('Fee') || key.includes('Charge')) && typeof val === 'number') {
                            if (key === 'paymentAmount') {
                              return `₹${val.toFixed(2)}`;
                            }
                            if (key === 'totalAmount') {
                              return `₹${val.toFixed(2)}`;
                            }
                            if (key === 'deliveryFee' || key === 'deliveryCharge') {
                              return `₹${val.toFixed(2)}`;
                            }
                            return val;
                          }
                          if (key === 'totalWeight') {
                            return `${val} grams`;
                          }
                          return String(val);
                        };
                        
                        const getRowColor = (idx) => idx % 2 === 0 ? 'bg-white' : 'bg-slate-50';
                        const getValueColor = (fieldKey, val) => {
                          if (val === null || val === undefined) return 'text-gray-400';
                          if (fieldKey.includes('status') || fieldKey.includes('Status')) return 'text-purple-700 font-semibold';
                          if (fieldKey.includes('amount') || fieldKey.includes('Amount') || fieldKey.includes('price') || fieldKey.includes('Price')) return 'text-green-700 font-semibold';
                          if (fieldKey.includes('id') || fieldKey.includes('Id') || fieldKey.includes('ID')) return 'text-blue-600 font-mono text-sm';
                          return 'text-gray-800';
                        };
                        
                        return (
                          <tr key={key} className={getRowColor(index)}>
                            <td className="px-4 py-3 font-medium text-slate-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                            </td>
                            <td className={`px-4 py-3 ${getValueColor(key, value)} max-w-xs truncate`} title={formatValue(value)}>
                              {formatValue(value)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <div>
                    <span className="font-medium text-blue-700">Total Weight:</span>
                    <div className="text-blue-900">{selectedOrder.totalWeight || 0}g</div>
                  </div>
                </div>
                {selectedOrder.confirmedAt && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <span className="font-medium text-blue-700">Confirmed At:</span>
                    <div className="text-blue-900">{new Date(selectedOrder.confirmedAt).toLocaleString()}</div>
                  </div>
                )}
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
                <h4 className="text-lg font-semibold text-yellow-900 mb-3">Order & Delivery Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div>
                    <span className="font-medium text-yellow-700">Delivery Status:</span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                        selectedOrder.deliveryStatus === 'DELIVERED' ? 'bg-green-500' :
                        selectedOrder.deliveryStatus === 'IN_TRANSIT' ? 'bg-blue-500' :
                        selectedOrder.deliveryStatus === 'SHIPMENT_CREATED' ? 'bg-purple-500' :
                        selectedOrder.deliveryStatus === 'PENDING' ? 'bg-yellow-500' :
                        selectedOrder.deliveryStatus === 'RTO' ? 'bg-red-500' : 'bg-gray-500'
                      }`}>
                        {selectedOrder.deliveryStatus || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <span className="font-medium text-yellow-700">Payment Mode:</span>
                    <div className="text-yellow-900">{selectedOrder.paymentMode || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-700">Delivery Provider:</span>
                    <div className="text-yellow-900">{selectedOrder.deliveryProvider || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-700">Shipment Attempts:</span>
                    <div className="text-yellow-900">{selectedOrder.shipmentAttempts || 0}</div>
                  </div>
                </div>
                {selectedOrder.waybill && (
                  <div className="mt-4 pt-3 border-t border-yellow-200">
                    <span className="font-medium text-yellow-700">Waybill:</span>
                    <div className="text-yellow-900 font-mono text-sm">{selectedOrder.waybill}</div>
                  </div>
                )}
                {selectedOrder.rtoHandled && (
                  <div className="mt-2">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                      RTO Handled
                    </span>
                  </div>
                )}
              </div>

              {/* Shipping Details */}
              {selectedOrder.shipping && (
                <div className="bg-indigo-50 p-5 rounded-lg">
                  <h4 className="text-lg font-semibold text-indigo-900 mb-4">Shipping Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-indigo-700">Provider:</span>
                      <div className="text-indigo-900">{selectedOrder.shipping.provider}</div>
                    </div>
                    <div>
                      <span className="font-medium text-indigo-700">Total Shipping Cost:</span>
                      <div className="text-indigo-900 font-semibold">₹{selectedOrder.shipping.total}</div>
                    </div>
                  </div>
                  {selectedOrder.shipping.breakdown && (
                    <div className="mt-4">
                      <span className="font-medium text-indigo-700">Cost Breakdown:</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                        <div className="bg-white p-3 rounded border">
                          <span className="text-sm text-indigo-600">Base Rate:</span>
                          <div className="font-semibold text-indigo-900">₹{selectedOrder.shipping.breakdown.baseRate}</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <span className="text-sm text-indigo-600">Weight Rate:</span>
                          <div className="font-semibold text-indigo-900">₹{selectedOrder.shipping.breakdown.weightRate}</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <span className="text-sm text-indigo-600">Fuel Surcharge:</span>
                          <div className="font-semibold text-indigo-900">₹{selectedOrder.shipping.breakdown.fuelSurcharge}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Razorpay Transaction Details */}
              {selectedOrder.razorpayData && selectedOrder.razorpayData.length > 0 && (
                <div className="bg-emerald-50 p-5 rounded-lg">
                  <h4 className="text-lg font-semibold text-emerald-900 mb-4">Razorpay Transaction History</h4>
                  <div className="space-y-3">
                    {selectedOrder.razorpayData.map((transaction, idx) => (
                      <div key={idx} className="bg-white p-4 rounded border border-emerald-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {transaction.orderId && (
                            <div>
                              <span className="font-medium text-emerald-700">Razorpay Order ID:</span>
                              <div className="text-emerald-900 font-mono text-xs">{transaction.orderId}</div>
                            </div>
                          )}
                          {transaction.paymentId && (
                            <div>
                              <span className="font-medium text-emerald-700">Payment ID:</span>
                              <div className="text-emerald-900 font-mono text-xs">{transaction.paymentId}</div>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-emerald-700">Amount:</span>
                            <div className="text-emerald-900 font-semibold">₹{(transaction.amount / 100).toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="font-medium text-emerald-700">Status:</span>
                            <div className="text-emerald-900">{transaction.status}</div>
                          </div>
                          {transaction.method && (
                            <div>
                              <span className="font-medium text-emerald-700">Payment Method:</span>
                              <div className="text-emerald-900">{transaction.method}</div>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-emerald-700">Created At:</span>
                            <div className="text-emerald-900">{new Date(transaction.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="bg-purple-50 p-5 rounded-lg">
                <h4 className="text-lg font-semibold text-purple-900 mb-4">Financial Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-purple-200">
                    <span className="font-medium text-purple-700">Subtotal:</span>
                    <span className="text-purple-900 font-semibold">₹{(() => {
                      const subtotal = selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                      return subtotal.toFixed(2);
                    })()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-purple-200">
                    <span className="font-medium text-purple-700">Tax (5%):</span>
                    <span className="text-purple-900 font-semibold">₹{(() => {
                      const subtotal = selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                      return (subtotal * 0.05).toFixed(2);
                    })()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-purple-200">
                    <span className="font-medium text-purple-700">Delivery Charge:</span>
                    <span className="text-purple-900 font-semibold">₹{(selectedOrder.shipping?.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-purple-100 rounded px-3">
                    <span className="font-bold text-purple-800 text-lg">Total Amount:</span>
                    <span className="text-purple-900 font-bold text-xl">₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
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
