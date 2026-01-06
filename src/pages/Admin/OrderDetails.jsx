import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../contexts/index.jsx';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { service, updateOrderStatus, updatePaymentStatus, updateDeliveryStatus } = useApi();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await service.get(`/api/orders/${orderId}`);
      setOrder(response.order);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const handlePaymentStatusUpdate = async (newStatus) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
      setOrder(prev => ({ ...prev, paymentStatus: newStatus }));
      alert(`Payment status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update payment status');
    }
  };

  const handleDeliveryStatusUpdate = async (newStatus) => {
    try {
      await updateDeliveryStatus(orderId, newStatus);
      setOrder(prev => ({ ...prev, deliveryStatus: newStatus }));
      alert(`Delivery status updated to ${newStatus}`);
    } catch (error) {
      alert('Failed to update delivery status');
    }
  };

  const handleCreateShipment = async () => {
    try {
      const response = await service.post('/api/delhivery/create-shipment', { orderId });
      if (response.success) {
        await loadOrderDetails();
        alert('Shipment created successfully');
      } else {
        alert(response.message || 'Failed to create shipment');
      }
    } catch (error) {
      alert('Failed to create shipment');
    }
  };

  const handleTrackOrder = async () => {
    try {
      const response = await service.get(`/api/delhivery/track-order/${orderId}`);
      if (response.success) {
        alert(`Tracking Status: ${response.status}\nLocation: ${response.location}`);
      } else {
        alert('Failed to track order');
      }
    } catch (error) {
      alert('Failed to track order');
    }
  };

  const handleBack = () => {
    navigate('/admin/orders');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d80a4e]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <button onClick={handleBack} className="bg-[#d80a4e] text-white px-6 py-2 rounded-lg hover:bg-[#b8083e]">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-blue-100 mt-1">#{order._id?.slice(-8)}</p>
          </div>
          <button
            onClick={handleBack}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Order Information */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-blue-900">Order Info</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Order ID</span>
                <span className="text-blue-900 font-mono text-sm bg-white px-2 py-1 rounded">#{order._id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'delivered' ? 'bg-green-500 text-white' :
                  order.status === 'shipped' ? 'bg-purple-500 text-white' :
                  order.status === 'confirmed' ? 'bg-blue-500 text-white' :
                  'bg-yellow-500 text-white'
                }`}>
                  {order.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Payment Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {order.paymentStatus?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Total Amount</span>
                <span className="text-blue-900 font-bold text-lg">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700 font-medium">Created</span>
                <span className="text-blue-900 text-sm">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              {order.confirmedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Confirmed</span>
                  <span className="text-blue-900 text-sm">{new Date(order.confirmedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-indigo-900">Delivery</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-indigo-700 font-medium">Provider</span>
                <span className="text-indigo-900 capitalize">{order.deliveryProviderDisplay || 'Local Delivery'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-700 font-medium">Pincode</span>
                <span className="text-indigo-900">{order.deliveryPincode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-700 font-medium">Distance</span>
                <span className="text-indigo-900">{order.distance} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-700 font-medium">Delivery Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.deliveryStatus === 'DELIVERED' ? 'bg-green-500 text-white' :
                  order.deliveryStatus === 'IN_TRANSIT' ? 'bg-blue-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {order.deliveryStatus || 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-700 font-medium">Shipping Cost</span>
                <span className="text-indigo-900 font-bold">₹{(order.shipping?.total || 0).toFixed(2)}</span>
              </div>
              {order.waybill && (
                <div>
                  <span className="text-indigo-700 font-medium block">Waybill</span>
                  <span className="text-indigo-900 font-mono text-xs bg-white px-2 py-1 rounded">{order.waybill}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-orange-900">Items</h2>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {order.items?.map((item, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-orange-900">{item.itemId?.name || 'Unknown Item'}</div>
                      <div className="text-orange-700 text-sm">Qty: {item.quantity} | Weight: {item.weight}g</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-900">₹{item.price}</div>
                      <div className="text-orange-700 text-sm">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          {order.razorpayData?.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-emerald-900">Payments</h2>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {order.razorpayData.map((payment, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-emerald-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-emerald-700">Payment ID:</span>
                        <span className="text-emerald-900 font-mono text-xs">{payment.paymentId?.slice(-8) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-emerald-700">Amount:</span>
                        <span className="text-emerald-900 font-bold">₹{((payment.amount || 0) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-emerald-700">Method:</span>
                        <span className="text-emerald-900">{payment.method || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-emerald-700">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          payment.status === 'paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-purple-900">Summary</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-700 font-medium">Subtotal</span>
                <span className="text-purple-900">₹{(order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700 font-medium">GST (5%)</span>
                <span className="text-purple-900">₹{((order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0) * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700 font-medium">Delivery</span>
                <span className="text-purple-900">₹{(order.shipping?.total || 0).toFixed(2)}</span>
              </div>
              <div className="border-t border-purple-300 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-purple-900 font-bold text-lg">Total</span>
                  <span className="text-purple-900 font-bold text-xl">₹{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Actions</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Order Status</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Payment Status</label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {order.deliveryProvider === 'self' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Delivery Status</label>
                  <select
                    value={order.deliveryStatus || 'PENDING'}
                    onChange={(e) => handleDeliveryStatusUpdate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>
              )}

              {order.deliveryProvider === 'delhivery' && (
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Delhivery Status</label>
                  <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                    Auto-managed via webhook<br />
                    Status: {order.deliveryStatus || 'PENDING'}
                  </div>
                </div>
              )}

              {order.waybill && (
                <button
                  onClick={handleTrackOrder}
                  className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Track Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;