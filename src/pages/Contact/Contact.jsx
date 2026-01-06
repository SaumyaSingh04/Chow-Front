import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../contexts/index.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';

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
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await createTicket({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });
      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Failed to send message. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 pb-8">
      <Breadcrumb currentPage="Contact Us" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-[#d80a4e]">Get In Touch</h2>

            <div className="space-y-4 sm:space-y-6 text-gray-700">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="text-[#d80a4e] text-lg sm:text-xl mt-1">📍</span>
                <div>
                  <strong className="text-gray-900 block mb-1 text-sm sm:text-base">Address:</strong>
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed">
                    Vijay Chowk, In front of Vijay Talkies,<br />
                    Golghar, Gorakhpur, Uttar Pradesh – 273001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <span className="text-[#d80a4e] text-lg sm:text-xl mt-1">📞</span>
                <div>
                  <strong className="text-gray-900 block mb-1 text-sm sm:text-base">Phone:</strong>
                  <p className="text-xs sm:text-sm md:text-base">+91 7525025100</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <span className="text-[#d80a4e] text-lg sm:text-xl mt-1">⏰</span>
                <div>
                  <strong className="text-gray-900 block mb-1 text-sm sm:text-base">Store Hours:</strong>
                  <p className="text-xs sm:text-sm md:text-base">08:00 AM – 11:30 PM (7 Days)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="tel:+917525025100" className="bg-[#d80a4e] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-center hover:bg-[#b8083e] transition-colors font-medium text-sm sm:text-base">
                  Get Support On Call
                </a>
                <a href="https://maps.google.com/?q=Chowdhry+Sweet+House+Vijay+Chowk+Gorakhpur" target="_blank" rel="noopener noreferrer" className="bg-gray-800 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-center hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base">
                  Get Direction
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-[#d80a4e]">Make Custom Request</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
              Have a special request? We'd love to help you create the perfect sweet experience!
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent text-sm sm:text-base"
                  required
                />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent text-sm sm:text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent text-sm sm:text-base"
                />
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Enter your message..."
                className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#d80a4e] focus:border-transparent resize-none text-sm sm:text-base"
              />

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-[#d80a4e] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#b8083e] transition-colors disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base"
              >
                {loading ? "Sending..." : "Send Message →"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Google Map Section */}
      <div className="w-full h-80 sm:h-96 md:h-[500px] mt-6 sm:mt-8">
        <iframe
          title="Chowdhry Sweet House Location"
          src="https://www.google.com/maps?q=Chowdhry%20Sweet%20House%20Vijay%20Chowk%20Gorakhpur&output=embed"
          className="w-full h-full border-0 rounded-t-lg"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default Contact;
