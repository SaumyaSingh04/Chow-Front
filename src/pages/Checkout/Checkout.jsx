import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../contexts/index.jsx';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../contexts/index.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const GST_RATE = 0.05;

const REQUIRED_FIELDS = [
  'addressType',
  'firstName',
  'lastName',
  'address',
  'city',
  'state',
  'postcode',
  'email',
  'phone'
];

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { getUserAddresses, service, checkPincode, calculateShippingRate } = useApi();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [isAddressSelected, setIsAddressSelected] = useState(false);

  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [pincodeError, setPincodeError] = useState('');

  const [formData, setFormData] = useState({
    addressType: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postcode: '',
    email: '',
    phone: '',
    orderNotes: ''
  });

  /* ----------------------- helpers ----------------------- */

  const validatePincode = useCallback(
    (pincode) => /^[1-9][0-9]{5}$/.test(pincode),
    []
  );

  const getUserData = useCallback(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user?._id) {
      navigate('/account');
      return null;
    }

    return { token, user };
  }, [navigate]);

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();

      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }, []);

  /* -------------------- distance + fee -------------------- */

  const checkDeliveryOptions = useCallback(
    async (pincode) => {
      if (!pincode || pincode.length !== 6 || !validatePincode(pincode)) {
        setDeliveryInfo(null);
        setPincodeError('Invalid pincode');
        return;
      }

      try {
        // Calculate total weight from cart items
        const totalWeight = cartItems.reduce((sum, item) => {
          return sum + (item.weight || 500) * item.quantity;
        }, 0);

        // Check delivery options using the new API
        const response = await service.get(`/api/delivery/check/${pincode}?weight=${totalWeight}`);
        
        if (!response.success || !response.serviceable) {
          setDeliveryInfo(null);
          setPincodeError(response.message || 'Delivery not available to this pincode');
          return;
        }

        setDeliveryInfo({
          provider: response.provider,
          providerDisplay: response.providerDisplay,
          charge: response.charge,
          eta: response.eta,
          distance: response.distance,
          breakdown: response.breakdown
        });
        setPincodeError('');
      } catch (error) {
        setDeliveryInfo(null);
        setPincodeError('Failed to check delivery options');
      }
    },
    [service, cartItems, validatePincode]
  );

  useEffect(() => {
    if (formData.postcode) {
      checkDeliveryOptions(formData.postcode);
    }
  }, [formData.postcode, checkDeliveryOptions]);

  /* ---------------------- addresses ----------------------- */

  useEffect(() => {
    const userData = getUserData();
    if (!userData) return;

    (async () => {
      try {
        const res = await getUserAddresses(userData.user._id);
        setSavedAddresses(res.addresses || []);
      } catch {
        setSavedAddresses([]);
      }
    })();
  }, [getUserAddresses, getUserData]);

  const getOrCreateAddress = useCallback(
    async (userId) => {
      const res = await getUserAddresses(userId);
      const addresses = res.addresses || [];

      const match = addresses.find(
        (a) =>
          a.firstName === formData.firstName &&
          a.lastName === formData.lastName &&
          a.street === formData.address &&
          a.city === formData.city &&
          a.state === formData.state &&
          a.postcode === formData.postcode &&
          a.phone === formData.phone
      );

      if (match) return match._id;

      const payload = {
        addressType: formData.addressType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        street: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        postcode: formData.postcode,
        email: formData.email,
        phone: formData.phone,
        orderNotes: formData.orderNotes
      };

      const created = await service.post(`/api/users/${userId}/addresses`, payload);
      return created.address?._id;
    },
    [formData, getUserAddresses, service]
  );

  /* ---------------------- payment ------------------------- */

  const handlePaymentFailure = useCallback(
    async (dbOrderId, razorpayOrderId, reason) => {
      try {
        await service.post('/api/payment/failure', {
          dbOrderId,
          razorpay_order_id: razorpayOrderId,
          error_reason: reason
        });
      } catch {}
    },
    [service]
  );

  const handlePlaceOrder = async () => {
    const userData = getUserData();
    if (!userData) return;

    if (REQUIRED_FIELDS.some((f) => !formData[f]?.trim())) {
      alert('Please fill all required fields');
      return;
    }

    if (!deliveryInfo || deliveryInfo.charge <= 0) {
      alert('Invalid delivery location or shipping rate not available');
      return;
    }

    const addressId = await getOrCreateAddress(userData.user._id);

    const subtotal = getCartTotal();
    const gst = subtotal * GST_RATE;
    const totalAmount = subtotal + gst + deliveryInfo.charge;

    const razorpayRes = await service.post('/api/payment/create-order', {
      orderData: {
        userId: userData.user._id,
        addressId,
        deliveryPincode: formData.postcode,
        items: cartItems.map((i) => ({
          itemId: i._id,
          quantity: i.quantity,
          price: i.discountPrice,
          weight: i.weight || 500
        })),
        paymentMode: 'PREPAID'
      }
    });

    await loadRazorpayScript();

    const rzp = new window.Razorpay({
      key: RAZORPAY_KEY,
      amount: razorpayRes.order.amount,
      currency: 'INR',
      name: 'Chowdhry',
      description: 'Order Payment',
      order_id: razorpayRes.order.id,
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone
      },
      theme: { color: '#d80a4e' },
      handler: async (response) => {
        try {
          const verify = await service.post('/api/payment/verify', {
            dbOrderId: razorpayRes.dbOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verify.success) {
            clearCart();
            navigate('/orders');
          } else {
            alert('Payment verification failed');
          }
        } catch {
          alert('Payment verification failed');
        }
      },
      modal: {
        ondismiss: async () => {
          await handlePaymentFailure(
            razorpayRes.dbOrderId,
            razorpayRes.order.id,
            'User cancelled payment'
          );
          alert('Payment cancelled');
        }
      }
    });

    rzp.on('payment.failed', (res) => {
      handlePaymentFailure(
        razorpayRes.dbOrderId,
        razorpayRes.order.id,
        res.error.description
      );
      alert('Payment failed');
    });

    rzp.open();
  };

  const isOrderDisabled = () => {
    return (
      REQUIRED_FIELDS.some((f) => !formData[f]?.trim()) ||
      !!pincodeError ||
      !deliveryInfo ||
      deliveryInfo.charge <= 0
    );
  };

  /* ----------------------- UI ----------------------------- */

  const subtotal = getCartTotal();
  const gst = subtotal * GST_RATE;
  const deliveryFee = deliveryInfo?.charge || 0;
  const total = subtotal + gst + deliveryFee;

  return (
    <div className="bg-white pb-8">
      <Breadcrumb currentPage="Checkout" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Billing Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Billing Details</h2>
            
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Saved Addresses</label>
                <div className="flex gap-2">
                  <select 
                    value={selectedAddressId}
                    disabled={isAddressSelected}
                    onChange={(e) => {
                      const addr = savedAddresses.find(a => a._id === e.target.value);
                      if (addr) {
                        setFormData({
                          addressType: addr.addressType || '',
                          firstName: addr.firstName || '',
                          lastName: addr.lastName || '',
                          address: addr.street || '',
                          apartment: addr.apartment || '',
                          city: addr.city || '',
                          state: addr.state || '',
                          postcode: addr.postcode || '',
                          email: addr.email || '',
                          phone: addr.phone || '',
                          orderNotes: ''
                        });
                        setIsAddressSelected(true);
                      }
                      setSelectedAddressId(e.target.value);
                    }}
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      isAddressSelected ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">Select saved address</option>
                    {savedAddresses.map(addr => (
                      <option key={addr._id} value={addr._id}>
                        {addr.firstName} {addr.lastName} - {addr.city}, {addr.postcode}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        addressType: '',
                        firstName: '',
                        lastName: '',
                        address: '',
                        apartment: '',
                        city: '',
                        state: '',
                        postcode: '',
                        email: '',
                        phone: '',
                        orderNotes: ''
                      });
                      setSelectedAddressId('');
                      setIsAddressSelected(false);
                      setDeliveryInfo(null);
                      setPincodeError('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 whitespace-nowrap"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type *</label>
                <select
                  value={formData.addressType}
                  onChange={(e) => setFormData({...formData, addressType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                >
                  <option value="">Select type</option>
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apartment (Optional)</label>
              <input
                type="text"
                value={formData.apartment}
                onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                {pincodeError && (
                  <p className="text-red-500 text-sm mt-1">{pincodeError}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
              <textarea
                value={formData.orderNotes}
                onChange={(e) => setFormData({...formData, orderNotes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Notes about your order, e.g. special notes for delivery."
              />
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.images?.[0]}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-900">
                      ₹{(item.discountPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Order Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="font-medium">₹{gst.toFixed(2)}</span>
                </div>
                
                {deliveryInfo && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-medium">₹{deliveryInfo.charge.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="font-medium text-gray-700">{deliveryInfo.providerDisplay}</div>
                      <div>ETA: {deliveryInfo.eta}</div>
                      <div>Distance: {deliveryInfo.distance} km</div>
                      {deliveryInfo.breakdown && (
                        <div className="text-xs bg-gray-100 p-2 rounded mt-2">
                          <div>Base Rate: ₹{deliveryInfo.breakdown.baseRate}</div>
                          {deliveryInfo.breakdown.distanceRate > 0 && (
                            <div>Distance Charge: ₹{deliveryInfo.breakdown.distanceRate}</div>
                          )}
                          {deliveryInfo.breakdown.weightRate > 0 && (
                            <div>Weight Charge: ₹{deliveryInfo.breakdown.weightRate}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isOrderDisabled()}
                className={`w-full mt-6 py-3 px-4 rounded-md font-medium transition-colors ${
                  isOrderDisabled()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                Place Order - ₹{total.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
