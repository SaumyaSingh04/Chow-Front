import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';

const Login = () => {
  const { login, isAdmin } = useApi();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [user, setUser] = useState(null);

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
    
    console.log('Login form submitted:', formData);
    
    try {
      const response = await login(formData);
      console.log('Login response:', response);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.user) {
          console.log('Storing user data:', response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
        }
        setSuccess('Login successful! Redirecting...');
        setLoginSuccess(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loginSuccess && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [loginSuccess, user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-100 py-8 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center text-sm mb-4">
            <Link to="/" className="text-gray-600 hover:text-[#d80a4e]">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800">Login</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Login</h1>
        </div>
        <div className="absolute top-8 right-16 hidden lg:block">
          <div className="bg-[#d80a4e] text-white px-8 py-4 rounded-full">
            <span className="text-2xl font-bold">Chowdhry</span>
            <div className="text-xs">Love at First Bite</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-6">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-user text-[#d80a4e] text-xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>
                <p className="text-gray-600 text-sm">
                  Welcome back! Please login to your account.
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent"
                      required
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
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link to="/signup" className="text-[#d80a4e] hover:underline">Sign up</Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#d80a4e] text-white py-3 rounded-lg hover:bg-[#b8083e] transition-colors font-semibold flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Logging in...' : 'Login'}
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;