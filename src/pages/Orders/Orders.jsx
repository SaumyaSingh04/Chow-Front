import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext';
import Breadcrumb from '../../components/Breadcrumb';

const Orders = () => {
  const { getMyOrders, getUserAddresses } = useApi();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [loading, setLoading] = useState(true);

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

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'fa-clock',
      confirmed: 'fa-check-circle',
      delivered: 'fa-truck',
      default: 'fa-info-circle'
    };
    return icons[status] || icons.default;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500 text-white',
      confirmed: 'bg-blue-500 text-white',
      delivered: 'bg-green-500 text-white',
      default: 'bg-gray-500 text-white'
    };
    return colors[status] || colors.default;
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
    <div className="min-h-screen bg-gray-50">
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
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        <i className={`fas ${getStatusIcon(order.status)} mr-2`}></i>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
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
                          <span>₹{((order.totalAmount - (order.deliveryFee || 0)) / 1.05).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST (5%):</span>
                          <span>₹{(((order.totalAmount - (order.deliveryFee || 0)) / 1.05) * 0.05).toFixed(2)}</span>
                        </div>
                        {order.distance && order.distance > 0 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Distance:</span>
                              <span className="text-blue-600 font-medium">{order.distance} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Delivery Fee:</span>
                              <span>₹{(order.deliveryFee || 0).toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total Amount:</span>
                          <span className="text-[#d80a4e]">₹{order.totalAmount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                          <span>Payment Status:</span>
                          <span className={`font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            <i className={`fas ${getPaymentStatusIcon(order.paymentStatus)} mr-1`}></i>
                            {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                          </span>
                        </div>
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