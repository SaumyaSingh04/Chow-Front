import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/index.jsx';
import Breadcrumb from '../../components/Breadcrumb';

const Orders = () => {
  const { getMyOrders, getUserAddresses, trackOrder } = useApi();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (user._id || user.id) {
          const userId = user._id || user.id;
          
          const [userOrders, userAddresses] = await Promise.all([
            getMyOrders(userId),
            getUserAddresses(userId)
          ]);
          
          setOrders(Array.isArray(userOrders) ? userOrders : []);
          
          const addressList = userAddresses.addresses || userAddresses.address || [];
          const addressMap = {};
          addressList.forEach(addr => {
            addressMap[addr._id] = addr;
          });
          setAddresses(addressMap);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [getMyOrders, getUserAddresses]);

  const getStatusIcon = (status, deliveryStatus) => {
    // Use delivery status if available, otherwise use order status
    const currentStatus = deliveryStatus || status;
    const icons = {
      pending: 'fa-clock',
      PENDING: 'fa-clock',
      confirmed: 'fa-check-circle',
      SHIPMENT_CREATED: 'fa-shipping-fast',
      shipped: 'fa-truck',
      IN_TRANSIT: 'fa-truck',
      delivered: 'fa-check-circle',
      DELIVERED: 'fa-check-circle',
      cancelled: 'fa-times-circle',
      RTO: 'fa-undo',
      default: 'fa-info-circle'
    };
    return icons[currentStatus] || icons.default;
  };

  const getStatusColor = (status, deliveryStatus) => {
    // Use delivery status if available, otherwise use order status
    const currentStatus = deliveryStatus || status;
    const colors = {
      pending: 'bg-yellow-500 text-white',
      PENDING: 'bg-yellow-500 text-white',
      confirmed: 'bg-blue-500 text-white',
      SHIPMENT_CREATED: 'bg-purple-500 text-white',
      shipped: 'bg-indigo-500 text-white',
      IN_TRANSIT: 'bg-indigo-500 text-white',
      delivered: 'bg-green-500 text-white',
      DELIVERED: 'bg-green-500 text-white',
      cancelled: 'bg-red-500 text-white',
      RTO: 'bg-orange-500 text-white',
      default: 'bg-gray-500 text-white'
    };
    return colors[currentStatus] || colors.default;
  };

  const getStatusText = (status, deliveryStatus) => {
    // Use delivery status if available, otherwise use order status
    const currentStatus = deliveryStatus || status;
    const statusTexts = {
      pending: 'Pending',
      PENDING: 'Order Placed',
      confirmed: 'Confirmed',
      SHIPMENT_CREATED: 'Shipped',
      shipped: 'Shipped',
      IN_TRANSIT: 'In Transit',
      delivered: 'Delivered',
      DELIVERED: 'Delivered',
      cancelled: 'Cancelled',
      RTO: 'Returned'
    };
    return statusTexts[currentStatus] || currentStatus;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'text-green-600',
      failed: 'text-red-600',
      default: 'text-yellow-600'
    };
    return colors[status] || colors.default;
  };

  const getPaymentStatusIcon = (status) => {
    const icons = {
      paid: 'fa-check-circle',
      failed: 'fa-times-circle',
      default: 'fa-clock'
    };
    return icons[status] || icons.default;
  };

  const handleTrackOrder = async (orderId) => {
    try {
      const result = await trackOrder(orderId);
      if (result.success) {
        setTrackingData(prev => ({
          ...prev,
          [orderId]: result
        }));
      }
    } catch (error) {
      console.error('Tracking failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#d80a4e] mx-auto"></div>
          <p className="mt-4">Loading Orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-8">
      <Breadcrumb currentPage="My Orders" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shopping-bag text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-500 text-lg mb-2">No orders found</p>
            <p className="text-gray-400">Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-[#d80a4e] to-[#b8083e] text-white p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-1">Order #{order._id?.slice(-8)}</h3>
                      <p className="text-pink-100">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status, order.deliveryStatus)}`}>
                        <i className={`fas ${getStatusIcon(order.status, order.deliveryStatus)} mr-2`}></i>
                        {getStatusText(order.status, order.deliveryStatus)}
                      </span>
                      {order.waybill && (
                        <div className="mt-2">
                          <button
                            onClick={() => handleTrackOrder(order._id)}
                            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            Track Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <i className="fas fa-utensils text-[#d80a4e] mr-2"></i>
                      Order Items
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-[#d80a4e] rounded-lg flex items-center justify-center mr-3">
                                <i className="fas fa-cookie-bite text-white"></i>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                              <p className="text-sm text-gray-500">₹{item.price} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Payment & Billing */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-credit-card text-blue-600 mr-2"></i>
                        Payment Details
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>₹{(() => {
                            const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                            return subtotal.toFixed(2);
                          })()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST (5%):</span>
                          <span>₹{(() => {
                            const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                            return (subtotal * 0.05).toFixed(2);
                          })()}</span>
                        </div>
                        {order.distance && order.distance > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Distance:</span>
                            <span className="text-blue-600 font-medium">{order.distance} km</span>
                          </div>
                        )}
                        {(order.shipping?.total || order.deliveryFee) && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Fee:</span>
                            <span>₹{(order.shipping?.total || order.deliveryFee || 0).toFixed(2)}</span>
                          </div>
                        )}
                        {order.totalWeight && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Weight:</span>
                            <span className="text-blue-600 font-medium">{order.totalWeight}g</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total Amount:</span>
                          <span className="text-[#d80a4e]">₹{(order.totalAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                          <span>Payment Status:</span>
                          <span className={`font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            <i className={`fas ${getPaymentStatusIcon(order.paymentStatus)} mr-1`}></i>
                            {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                          </span>
                        </div>
                        {order.paymentMode && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Payment Mode:</span>
                            <span className="font-medium">{order.paymentMode}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-map-marker-alt text-green-600 mr-2"></i>
                        Delivery Information
                      </h5>
                      <div className="space-y-2 text-sm">
                        {addresses[order.addressId] ? (
                          <>
                            <p className="font-medium">{addresses[order.addressId].firstName} {addresses[order.addressId].lastName}</p>
                            <p className="text-gray-600">{addresses[order.addressId].street}</p>
                            {addresses[order.addressId].apartment && <p className="text-gray-600">{addresses[order.addressId].apartment}</p>}
                            <p className="text-gray-600">{addresses[order.addressId].city}, {addresses[order.addressId].state} {addresses[order.addressId].postcode}</p>
                            <p className="text-gray-600">
                              <i className="fas fa-phone mr-1"></i>
                              {addresses[order.addressId].phone}
                            </p>
                            <p className="text-gray-600">
                              <i className="fas fa-envelope mr-1"></i>
                              {addresses[order.addressId].email}
                            </p>
                            {order.waybill && (
                              <div className="mt-3 pt-3 border-t border-green-200">
                                <p className="text-gray-600">
                                  <i className="fas fa-barcode mr-1"></i>
                                  Waybill: <span className="font-mono text-sm">{order.waybill}</span>
                                </p>
                                {order.deliveryStatus && (
                                  <p className="text-gray-600 mt-1">
                                    <i className="fas fa-truck mr-1"></i>
                                    Status: <span className="font-medium">{getStatusText('', order.deliveryStatus)}</span>
                                  </p>
                                )}
                                {order.deliveryProvider && (
                                  <p className="text-gray-600 mt-1">
                                    <i className="fas fa-shipping-fast mr-1"></i>
                                    Provider: <span className="font-medium">{order.deliveryProvider}</span>
                                  </p>
                                )}
                                {order.totalWeight && (
                                  <p className="text-gray-600 mt-1">
                                    <i className="fas fa-weight mr-1"></i>
                                    Weight: <span className="font-medium">{order.totalWeight}g</span>
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-gray-500 italic">Delivery details not available</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  {addresses[order.addressId]?.orderNotes && (
                    <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <i className="fas fa-sticky-note text-yellow-600 mr-2"></i>
                        Order Notes
                      </h5>
                      <p className="text-sm text-gray-700">{addresses[order.addressId].orderNotes}</p>
                    </div>
                  )}

                  {/* Tracking Information */}
                  {trackingData[order._id] && (
                    <div className="mt-6 bg-blue-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <i className="fas fa-route text-blue-600 mr-2"></i>
                        Tracking Information
                      </h5>
                      <div className="space-y-2 text-sm">
                        {trackingData[order._id].waybill && (
                          <p className="text-gray-600">
                            <i className="fas fa-barcode mr-2"></i>
                            Waybill: <span className="font-mono">{trackingData[order._id].waybill}</span>
                          </p>
                        )}
                        {trackingData[order._id].deliveryStatus && (
                          <p className="text-gray-600">
                            <i className="fas fa-info-circle mr-2"></i>
                            Status: <span className="font-medium">{getStatusText('', trackingData[order._id].deliveryStatus)}</span>
                          </p>
                        )}
                        {trackingData[order._id].tracking?.location && (
                          <p className="text-gray-600">
                            <i className="fas fa-map-marker-alt mr-2"></i>
                            Location: <span className="font-medium">{trackingData[order._id].tracking.location}</span>
                          </p>
                        )}
                        {trackingData[order._id].tracking?.expectedDelivery && (
                          <p className="text-gray-600">
                            <i className="fas fa-calendar-alt mr-2"></i>
                            Expected Delivery: <span className="font-medium">
                              {new Date(trackingData[order._id].tracking.expectedDelivery).toLocaleDateString('en-IN')}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
