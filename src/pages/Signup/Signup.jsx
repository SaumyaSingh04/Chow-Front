import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';

const Signup = () => {
  const { register } = useApi();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    try {
      await register(formData);
      navigate('/login');
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Breadcrumb */}
      <div className="bg-gray-200 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm mb-4">
            <Link to="/" className="text-gray-600 hover:text-red-600">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800">Login / Signup</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Sign Up</h1>
        </div>
        <div className="absolute top-0 right-0 mt-16 mr-16 hidden lg:block">
          <div className="w-64 h-32 bg-gradient-to-r from-orange-200 to-blue-200 rounded-lg opacity-50"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="flex">
                {/* Left Side - Image */}
                <div className="w-1/2 hidden md:block">
                  <img 
                    src="/assets/img/product/home-one/product-1.jpg" 
                    alt="Sweet Box"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <i className="fas fa-user-plus text-red-600 text-xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign Up</h2>
                    <p className="text-gray-600 text-sm">
                      Your personal data will be used to support your experience throughout this website, to 
                      manage access to your account.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <div className="relative">
                        <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email address"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <i className="fas fa-phone absolute left-3 top-3 text-gray-400"></i>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter Phone Number eg: 9923998344"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Password"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm">{error}</div>
                    )}

                    <div className="text-sm">
                      <span className="text-gray-600">Already Have Account? </span>
                      <Link to="/login" className="text-red-600 hover:underline">Login</Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center disabled:opacity-50"
                    >
                      {loading ? 'Registering...' : 'Register Now'}
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

export default Signup;