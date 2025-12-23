import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const Profile = () => {
  const { getProfile, updateProfile, getUserAddresses, addUserAddress, updateUserAddress } = useApi();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [addressData, setAddressData] = useState({
    addressType: 'home',
    firstName: '',
    lastName: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postcode: '',
    email: '',
    phone: '',
    orderNotes: '',
    isDefault: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || ''
      });
      
      // Fetch user addresses
      const fetchAddresses = async () => {
        try {
          const userAddresses = await getUserAddresses(parsedUser._id || parsedUser.id);
          setAddresses(userAddresses.addresses || []);
          if (userAddresses.addresses && userAddresses.addresses.length > 0) {
            const addr = userAddresses.addresses[0];
            setAddressData({
              addressType: addr.addressType || 'home',
              firstName: addr.firstName || '',
              lastName: addr.lastName || '',
              street: addr.street || '',
              apartment: addr.apartment || '',
              city: addr.city || '',
              state: addr.state || '',
              postcode: addr.postcode || '',
              email: addr.email || parsedUser.email || '',
              phone: addr.phone || parsedUser.phone || '',
              orderNotes: addr.orderNotes || '',
              isDefault: addr.isDefault || true
            });
          } else {
            setAddressData(prev => ({
              ...prev,
              firstName: parsedUser.name?.split(' ')[0] || '',
              lastName: parsedUser.name?.split(' ').slice(1).join(' ') || '',
              email: parsedUser.email || '',
              phone: parsedUser.phone || ''
            }));
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
        }
      };
      fetchAddresses();
    }
  }, [getUserAddresses]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update basic profile info (without address)
      const profileData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };
      
      const response = await updateProfile(user._id || user.id, profileData);
      
      // Handle address separately if provided
      console.log('Profile: Current addressData:', addressData);
      console.log('Profile: Existing addresses:', addresses);
      
      if (addressData.street.trim() && addressData.city.trim()) {
        console.log('Profile: Address validation passed, saving address...');
        if (addresses.length > 0) {
          // Update existing address
          console.log('Profile: Updating existing address with ID:', addresses[0]._id);
          const addressResponse = await updateUserAddress(user._id || user.id, addresses[0]._id, addressData);
          console.log('Profile: Address update response:', addressResponse);
        } else {
          // Add new address
          console.log('Profile: Adding new address');
          const addressResponse = await addUserAddress(user._id || user.id, addressData);
          console.log('Profile: Address add response:', addressResponse);
        }
      } else {
        console.log('Profile: Address validation failed - missing street or city');
      }
      
      if (response.success || response.user) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        const updatedUser = response.user || { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 pb-8">
      <Breadcrumb currentPage="Profile" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-[#d80a4e] text-white px-4 py-2 rounded-lg hover:bg-[#b8083e] transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="sm:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={addressData.firstName}
                    onChange={(e) => setAddressData({...addressData, firstName: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={addressData.lastName}
                    onChange={(e) => setAddressData({...addressData, lastName: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={addressData.street}
                    onChange={(e) => setAddressData({...addressData, street: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                  <input
                    type="text"
                    value={addressData.postcode}
                    onChange={(e) => setAddressData({...addressData, postcode: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#d80a4e] text-white px-6 py-3 rounded-lg hover:bg-[#b8083e] transition-colors font-semibold disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    console.log('Test button clicked');
                    const testAddress = {
                      addressType: 'home',
                      firstName: 'Test',
                      lastName: 'User',
                      street: '123 Test St',
                      city: 'Test City',
                      state: 'Test State',
                      postcode: '12345',
                      email: user.email,
                      phone: user.phone || '1234567890'
                    };
                    try {
                      console.log('Testing address API with:', testAddress);
                      const result = await addUserAddress(user._id || user.id, testAddress);
                      console.log('Test result:', result);
                      alert('Test address added! Check console.');
                    } catch (error) {
                      console.error('Test failed:', error);
                      alert('Test failed: ' + error.message);
                    }
                  }}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Test Address API
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;