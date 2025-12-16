import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';

const Contact = () => {
  const { createTicket } = useApi();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTicket({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });
      setSuccess(true);
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm mb-4">
            <Link to="/" className="text-gray-600 hover:text-red-600">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800">Contact</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Contact Us</h1>
        </div>
        <div className="absolute top-0 right-0 mt-8 mr-16 hidden lg:block">
          <div className="bg-red-600 text-white px-8 py-4 rounded-full">
            <span className="text-2xl font-bold">Chowdhry</span>
            <div className="text-xs">Love at First Bite</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Get In Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <i className="fas fa-map-marker-alt text-red-600 mt-1 mr-4"></i>
                <div>
                  <p className="text-gray-700">
                    Vijay Chowk, In front of Vijay Talkies,<br/>
                    Golghar, Gorakhpur, Uttar Pradesh<br/>
                    273001
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <i className="fas fa-phone text-red-600 mt-1 mr-4"></i>
                <div>
                  <p className="text-gray-700">+91 7525025100</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <i className="fas fa-clock text-red-600 mt-1 mr-4"></i>
                <div>
                  <p className="text-gray-700">
                    Store Hours:<br/>
                    08 am - 11:30 pm EST, 7 days a week
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition-colors mb-4 block">
                Get Support On Call
              </button>
              <button className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition-colors block">
                Get Direction
              </button>
            </div>
          </div>
          
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Make Custom Request</h2>
            <p className="text-gray-600 text-sm mb-6">
              Must have please selected every month sugar style ideas and Treats?
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter message"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              ></textarea>
              
              {success && (
                <div className="text-green-600 text-sm">Message sent successfully!</div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 text-white px-8 py-3 rounded hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Get A Quote →'}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Contact;