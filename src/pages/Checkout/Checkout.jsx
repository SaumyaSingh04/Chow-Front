import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();
  const { getUserAddresses } = useApi();
  const navigate = useNavigate();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
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

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User from localStorage:', user);
    if (user._id) {
      try {
        const response = await getUserAddresses(user._id);
        console.log('Addresses response:', response);
        // Handle different response structures
        const addresses = response.addresses || response.address || user.address || [];
        setSavedAddresses(addresses);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        // Fallback to user addresses from localStorage if API fails
        setSavedAddresses(user.address || []);
      }
    }
  };

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
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = () => {
    const requiredFields = ['addressType', 'firstName', 'lastName', 'address', 'city', 'state', 'postcode', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      alert('Please fill all required fields');
      return;
    }
    
    // Save billing details to localStorage for order creation
    localStorage.setItem('billingDetails', JSON.stringify(formData));
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb currentPage="Checkout" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          
          {/* Left Side - Address Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Billing Details</h2>
            
            <form className="space-y-6">
              {/* Saved Addresses Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Use Saved Address ({savedAddresses.length} found)
                </label>
                <select
                  value={selectedAddressId}
                  onChange={handleAddressSelect}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
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
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#d80a4e]"
                />
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
                    <span>INR {(item.price * item.quantity).toFixed(2)}</span>
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
                  <span>INR {(getCartTotal() * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-3">
                  <span>Order Total</span>
                  <span>INR {(getCartTotal() * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full mt-6 bg-[#d80a4e] text-white py-3 rounded font-semibold hover:bg-[#b8083e] transition-colors"
              >
                Place order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;