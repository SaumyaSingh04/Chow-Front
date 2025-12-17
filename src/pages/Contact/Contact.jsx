import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <Breadcrumb currentPage="Contact Us" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-8">Get In Touch</h2>

            <div className="space-y-6 text-gray-700">
              <p>
                <strong>📍 Address:</strong><br />
                Vijay Chowk, In front of Vijay Talkies,<br />
                Golghar, Gorakhpur, Uttar Pradesh – 273001
              </p>

              <p>
                <strong>📞 Phone:</strong><br />
                +91 7525025100
              </p>

              <p>
                <strong>⏰ Store Hours:</strong><br />
                08:00 AM – 11:30 PM (7 Days)
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <a href="tel:+917525025100" className="bg-[#d80a4e] text-white px-6 py-3 rounded w-fit inline-block hover:bg-[#b8083e] transition-colors">
                Get Support On Call
              </a>
              <a href="https://maps.google.com/?q=Chowdhry+Sweet+House+Vijay+Chowk+Gorakhpur" target="_blank" rel="noopener noreferrer" className="bg-[#d80a4e] text-white px-6 py-3 rounded w-fit inline-block hover:bg-[#b8083e] transition-colors ml-4">
                Get Direction
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Make Custom Request</h2>
            <p className="text-sm text-gray-600 mb-6">
              Must have please selected every month sugar style ideas and Treats?
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="border px-4 py-3 w-full"
                  required
                />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="border px-4 py-3 w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="border px-4 py-3 w-full"
                />
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject"
                  className="border px-4 py-3 w-full"
                />
              </div>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Enter message"
                className="border px-4 py-3 w-full"
              />

              {success && (
                <p className="text-green-600 text-sm">
                  Message sent successfully!
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-[#d80a4e] text-white px-8 py-3 font-semibold"
              >
                {loading ? "Sending..." : "Get A Quote →"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ✅ Google Map Section */}
      <div className="w-full h-[500px]">
        <iframe
          title="Chowdhry Sweet House Location"
          src="https://www.google.com/maps?q=Chowdhry%20Sweet%20House%20Vijay%20Chowk%20Gorakhpur&output=embed"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default Contact;
