import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const Account = () => {
  const { register, login } = useApi();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
  }, []);

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
      if (isLogin) {
        const response = await login({ email: formData.email, password: formData.password });
        if (response.token) {
          localStorage.setItem('token', response.token);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
            setUser(response.user);
          }
          setIsLoggedIn(true);
          setSuccess('Login successful!');
        }
      } else {
        const response = await register(formData);
        if (response.success || response.message) {
          setSuccess('Registration successful!');
          setIsLogin(true);
          setFormData({ name: '', email: '', phone: '', password: '' });
        }
      }
    } catch (error) {
      setError(error.message || `${isLogin ? 'Login' : 'Registration'} failed`);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', phone: '', password: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    setSuccess('Logged out successfully!');
  };

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Breadcrumb currentPage="My Profile" />

        <div className="max-w-7xl mx-auto px-6 py-1">
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user text-[#d80a4e] text-3xl"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name}!</h2>
                  <p className="text-gray-600">Manage your account and preferences</p>
                </div>

                {success && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200 mb-6">
                    <i className="fas fa-check-circle mr-2"></i>
                    {success}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <i className="fas fa-user text-gray-400 w-5"></i>
                        <span className="ml-3 text-gray-700">{user.name}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-envelope text-gray-400 w-5"></i>
                        <span className="ml-3 text-gray-700">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center">
                          <i className="fas fa-phone text-gray-400 w-5"></i>
                          <span className="ml-3 text-gray-700">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Link to="/" className="flex items-center text-gray-700 hover:text-[#d80a4e] transition-colors">
                        <i className="fas fa-home text-gray-400 w-5"></i>
                        <span className="ml-3">Go to Home</span>
                      </Link>
                      <Link to="/shop" className="flex items-center text-gray-700 hover:text-[#d80a4e] transition-colors">
                        <i className="fas fa-utensils text-gray-400 w-5"></i>
                        <span className="ml-3">Browse Menu</span>
                      </Link>
                      <Link to="/profile" className="flex items-center text-gray-700 hover:text-[#d80a4e] transition-colors">
                        <i className="fas fa-user text-gray-400 w-5"></i>
                        <span className="ml-3">Edit Profile</span>
                      </Link>
                      <Link to="/contact" className="flex items-center text-gray-700 hover:text-[#d80a4e] transition-colors">
                        <i className="fas fa-phone text-gray-400 w-5"></i>
                        <span className="ml-3">Contact Us</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center mx-auto"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Breadcrumb currentPage={isLogin ? 'Login' : 'Sign Up'} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="flex">
                <div className="w-1/2 hidden md:block">
                  <img 
                    src="/assets/img/product/home-one/product-1.jpg" 
                    alt="Sweet Box"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="w-full md:w-1/2 p-8">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                      <i className={`fas ${isLogin ? 'fa-user' : 'fa-user-plus'} text-[#d80a4e] text-xl`}></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{isLogin ? 'Login' : 'Sign Up'}</h2>
                    <p className="text-gray-600 text-sm">
                      {isLogin 
                        ? 'Welcome back! Please login to your account.' 
                        : 'Your personal data will be used to support your experience throughout this website.'
                      }
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div>
                        <div className="relative">
                          <i className="fas fa-user absolute left-3 top-3 text-gray-400"></i>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="relative">
                        <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email address"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {!isLogin && (
                      <div>
                        <div className="relative">
                          <i className="fas fa-phone absolute left-3 top-3 text-gray-400"></i>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter Phone Number eg: 9923998344"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="relative">
                        <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Password"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                        <i className="fas fa-check-circle mr-2"></i>
                        {success}
                      </div>
                    )}

                    <div className="text-sm">
                      <button 
                        type="button"
                        onClick={toggleForm}
                        className="text-gray-600 hover:text-[#d80a4e] cursor-pointer bg-transparent border-none p-0"
                      >
                        {isLogin ? 'Don\'t have an account? ' : 'Already Have Account? '}
                        <span className="text-[#d80a4e] font-medium">
                          {isLogin ? 'Sign up' : 'Login'}
                        </span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#d80a4e] text-white py-3 rounded-lg hover:bg-[#b8083e] transition-colors font-semibold flex items-center justify-center disabled:opacity-50"
                    >
                      {loading ? (isLogin ? 'Logging in...' : 'Registering...') : (isLogin ? 'Login' : 'Register Now')}
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;