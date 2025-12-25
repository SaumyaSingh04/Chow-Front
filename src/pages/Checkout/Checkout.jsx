import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_o05Pgdf286j2Pl';
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const GST_RATE = 0.05;
const REQUIRED_FIELDS = ['addressType', 'firstName', 'lastName', 'address', 'city', 'state', 'postcode', 'email', 'phone'];

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { getUserAddresses, service } = useApi();
  const navigate = useNavigate();
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [distance, setDistance] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
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

  const validatePincode = useCallback((pincode) => /^[1-9][0-9]{5}$/.test(pincode), []);

  const calculateDeliveryFee = useCallback(async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      setDistance(0);
      setDeliveryFee(0);
      setPincodeError(pincode && pincode.length !== 6 ? 'Pincode must be 6 digits' : '');
      return;
    }

    if (!validatePincode(pincode)) {
      setDistance(0);
      setDeliveryFee(0);
      setPincodeError('Invalid pincode format');
      return;
    }

    try {
      const data = await service.post('/api/calculate-distance', { pincode });
      
      if (!data || data.error || data.success === false) {
        setDistance(0);
        setDeliveryFee(0);
        setPincodeError('Pincode not serviceable in our delivery area');
        return;
      }
      
      setDistance(data.distance);
      setDeliveryFee(data.fee);
      setPincodeError('');
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      setDistance(0);
      setDeliveryFee(0);
      setPincodeError('Pincode not serviceable in our delivery area');
    }
  }, [service, validatePincode]);

  const getUserData = useCallback(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user._id) {
      navigate('/account');
      return null;
    }
    
    return { token, user };
  }, [navigate]);

  const loadRazorpayScript = useCallback(async () => {
    if (window.Razorpay) return;
    
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
    await new Promise(resolve => script.onload = resolve);
  }, []);

  const handlePaymentFailure = useCallback(async (dbOrderId, orderId, errorReason, showAlert = true) => {
    try {
      await service.post('/api/payment/failure', {
        dbOrderId,
        razorpay_order_id: orderId,
        error_reason: errorReason
      });
      
      if (showAlert) {
        alert(errorReason.includes('cancelled') 
          ? 'Payment was cancelled. You can try placing the order again.'
          : `Payment failed: ${errorReason}`);
      }
    } catch (error) {
      console.error('Failed to handle payment failure:', error);
      if (showAlert) {
        alert('Payment failed and could not save order details.');
      }
    }
  }, [service]);

  const getOrCreateAddress = useCallback(async (userId) => {
    const userAddresses = await getUserAddresses(userId);
    const addresses = userAddresses.addresses || userAddresses.address || [];
    
    const existingAddress = addresses.find(addr => 
      addr.firstName === formData.firstName &&
      addr.lastName === formData.lastName &&
      addr.street === formData.address &&
      addr.city === formData.city &&
      addr.state === formData.state &&
      addr.postcode === formData.postcode &&
      addr.phone === formData.phone
    );
    
    if (existingAddress) {
      return existingAddress._id;
    }
    
    const addressData = {
      addressType: formData.addressType,
      firstName: formData.firstName,
      lastName: formData.lastName,
      street: formData.address,
      apartment: formData.apartment || '',
      city: formData.city,
      state: formData.state,
      postcode: formData.postcode,
      email: formData.email,
      phone: formData.phone,
      orderNotes: formData.orderNotes || ''
    };
    
    const response = await service.post(`/api/users/${userId}/addresses`, addressData);
    return response.address?._id || response.addressId || response._id;
  }, [formData, getUserAddresses, service]);

  useEffect(() => {
    if (formData.postcode) {
      calculateDeliveryFee(formData.postcode);
    }
  }, [formData.postcode, calculateDeliveryFee]);

  useEffect(() => {
    const userData = getUserData();
    if (!userData) return;
    
    const fetchSavedAddresses = async () => {
      try {
        const response = await getUserAddresses(userData.user._id);
        const addresses = response.addresses || response.address || userData.user.address || [];
        setSavedAddresses(addresses);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setSavedAddresses(userData.user.address || []);
      }
    };
    
    fetchSavedAddresses();
  }, [getUserAddresses, getUserData]);

  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);
    
    if (addressId) {
      const selectedAddress = savedAddresses.find(addr => addr._id === addressId);
      if (selectedAddress) {
        setFormData({
          addressType: selectedAddress.addressType || selectedAddress.type || '',
          firstName: selectedAddress.firstName || '',
          lastName: selectedAddress.lastName || '',
          address: selectedAddress.street || selectedAddress.address || '',
          apartment: selectedAddress.apartment || '',
          city: selectedAddress.city || '',
          state: selectedAddress.state || '',
          postcode: selectedAddress.postcode || selectedAddress.pincode || '',
          email: selectedAddress.email || '',
          phone: selectedAddress.phone || '',
          orderNotes: formData.orderNotes
        });
        setIsAddressSaved(true);
      }
    } else {
      setIsAddressSaved(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearAddress = () => {
    setSelectedAddressId('');
    setIsAddressSaved(false);
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
      orderNotes: formData.orderNotes
    });
  };

  const handlePlaceOrder = async () => {
    const userData = getUserData();
    if (!userData) return;
    
    const missingFields = REQUIRED_FIELDS.filter(field => !formData[field]?.trim());
    if (missingFields.length > 0) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const addressId = await getOrCreateAddress(userData.user._id);
      const totalAmount = getCartTotal() * (1 + GST_RATE) + deliveryFee;
      
      const orderData = {
        userId: userData.user._id,
        addressId,
        items: cartItems.map(item => ({
          itemId: item._id,
          quantity: item.quantity,
          price: item.discountPrice
        })),
        totalAmount,
        distance,
        deliveryFee
      };
      
      const razorpayOrder = await service.post('/api/payment/create-order', {
        amount: totalAmount,
        currency: 'INR',
        orderData
      });

      await loadRazorpayScript();

      let paymentCompleted = false;

      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayOrder.order.amount,
        currency: razorpayOrder.order.currency,
        name: 'Chowdhry',
        description: 'Order Payment',
        order_id: razorpayOrder.order.id,
        handler: async function (response) {
          try {
            paymentCompleted = true;
            const verifyResponse = await service.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: razorpayOrder.dbOrderId,
              payment_data: {
                amount: response.amount || razorpayOrder.order.amount,
                currency: response.currency || razorpayOrder.order.currency,
                method: response.method,
                bank: response.bank,
                wallet: response.wallet,
                vpa: response.vpa,
                email: response.email,
                contact: response.contact,
                fee: response.fee,
                tax: response.tax
              }
            });

            if (verifyResponse.success) {
              alert('Payment successful! Order placed.');
              clearCart();
              navigate('/orders');
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            alert('Payment verification failed. Please contact support.');
            console.error('Payment verification error:', error);
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#d80a4e'
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', async function (response) {
        paymentCompleted = true;
        await handlePaymentFailure(
          razorpayOrder.dbOrderId,
          razorpayOrder.order.id,
          `${response.error.code}: ${response.error.description}`
        );
      });
      
      rzp.on('payment.cancel', async function () {
        paymentCompleted = true;
        await handlePaymentFailure(
          razorpayOrder.dbOrderId,
          razorpayOrder.order.id,
          'Payment cancelled by user'
        );
      });
      
      // Backup cancel detection
      const originalClose = rzp.close;
      rzp.close = function() {
        if (!paymentCompleted) {
          setTimeout(() => {
            handlePaymentFailure(
              razorpayOrder.dbOrderId,
              razorpayOrder.order.id,
              'Payment cancelled by user',
              false
            );
          }, 100);
        }
        originalClose.call(this);
      };
      
      rzp.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  const isOrderDisabled = () => {
    const hasEmptyFields = REQUIRED_FIELDS.some(field => !formData[field]?.trim());
    const isPincodeInvalid = !formData.postcode || !validatePincode(formData.postcode) || deliveryFee === 0;
    return hasEmptyFields || isPincodeInvalid;
  };

  return (
    <div className="bg-white pb-8">
      <Breadcrumb currentPage="Checkout" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          
          {/* Left Side - Address Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Billing Details</h2>
            
            <form className="space-y-6">
              {/* Saved Addresses Dropdown */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">
                    Use Saved Address ({savedAddresses.length} found)
                  </label>
                  {isAddressSaved && (
                    <button
                      type="button"
                      onClick={clearAddress}
                      className="text-sm text-[#d80a4e] hover:underline"
                    >
                      Clear Address
                    </button>
                  )}
                </div>
                <select
                  value={selectedAddressId}
                  onChange={handleAddressSelect}
                  disabled={isAddressSaved}
                  className={`w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e] ${isAddressSaved ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select a saved address or enter new</option>
                  {savedAddresses.map((address) => (
                    <option key={address._id} value={address._id}>
                      {address.type || 'Address'} - {address.street || address.address}, {address.city}
                    </option>
                  ))}
                </select>
              </div>
              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="addressType"
                  value={formData.addressType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
                >
                  <option value="">Select</option>
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e] mb-3"
                />
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, unit etc. (optional)"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Town / City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State / County <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
                  />
                </div>
              </div>

              {/* Postcode */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Postcode / Zip <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleInputChange}
                  placeholder="Enter postcode"
                  className={`w-full p-3 border rounded focus:outline-none ${
                    pincodeError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#d80a4e]'
                  }`}
                />
                {pincodeError && (
                  <p className="text-red-500 text-sm mt-1">{pincodeError}</p>
                )}
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
                  />
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Order Notes
                </label>
                <textarea
                  name="orderNotes"
                  value={formData.orderNotes}
                  onChange={handleInputChange}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e] resize-vertical"
                />
              </div>
            </form>
          </div>

          {/* Right Side - Order Summary */}
          <div>
            <div className="border-2 border-pink-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-6">Your order</h3>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                  <span>Product</span>
                  <span>Quantity</span>
                  <span>Total</span>
                </div>
                
                {cartItems.map((item) => (
                  <div key={item._id} className="grid grid-cols-3 gap-4 text-sm">
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>INR {(item.discountPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span>INR {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{(getCartTotal() * 0.05).toFixed(2)}</span>
                </div>
                {distance > 0 && (
                  <>
                    <div className="flex justify-between text-blue-600">
                      <span>Distance</span>
                      <span>{distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-3">
                  <span>Order Total</span>
                  <span>₹{(getCartTotal() * 1.05 + deliveryFee).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isOrderDisabled()}
                className={`w-full mt-6 py-3 rounded font-semibold transition-colors ${
                  isOrderDisabled() 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-[#d80a4e] text-white hover:bg-[#b8083e]'
                }`}
              >
                {pincodeError ? 'Please Enter valid pincode' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;