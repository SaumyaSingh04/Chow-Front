import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm mb-4">
            <Link to="/" className="text-gray-600 hover:text-red-600">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800">About</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">About Us</h1>
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
        {/* Images */}
        <div className="flex justify-center mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <img 
              src="/assets/img/product/home-one/product-1.jpg" 
              alt="Sweet Box 1"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
            <img 
              src="/assets/img/product/home-one/product-2.jpg" 
              alt="Sweet Box 2"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            The Story of Chowdhry Sweet House — A Legacy of Sweetness Since 1970
          </h2>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            The heart of Gorakhpur, at Vijay Chowk, stands Chowdhry Sweet House, a name synonymous with tradition, taste, and trust. Since 1970, this beloved establishment has been serving generations with the finest Indian sweets and savory delights, making it a cherished part of the city's culinary heritage.
          </p>

          <h3 className="text-xl font-bold text-red-600 mb-4">A Tradition of Authenticity & Quality</h3>
          <p className="text-gray-700 mb-6">
            From the melt-in-your-mouth <strong>Rajbhog</strong> to the crisp, sweet <strong>Rasamalai</strong>, every sweet at Chowdhry Sweet House is crafted with love and perfection. Our commitment to using <strong>pure ingredients</strong> and maintaining the <strong>highest hygiene standards</strong> has earned us the trust of thousands of customers.
          </p>

          <h3 className="text-xl font-bold text-red-600 mb-4">A Culinary Destination Beyond Sweets</h3>
          <p className="text-gray-700 mb-6">
            More than just a sweet shop, Chowdhry Sweet House is a <strong>family-friendly vegetarian restaurant</strong>, offering a delightful mix of traditional <strong>North Indian dishes, snacks, and desserts</strong>. Whether you're craving a hearty meal, a quick snack, or something to satisfy your sweet tooth, we have it all under one roof for a <strong>World-class experience</strong>.
          </p>

          <h3 className="text-xl font-bold text-red-600 mb-4">Why Gorakhpur Loves Us?</h3>
          <ul className="text-gray-700 mb-6 space-y-2">
            <li>🏆 <strong>50+ Years of Excellence</strong></li>
            <li>🍯 <strong>4.4/5 Google / 4.3/5 Zomato | 5.5/5 Justdial</strong></li>
            <li>🎉 <strong>Top Choice for Festivals & Celebrations</strong></li>
            <li>🧼 <strong>Hygienic & Authentic Preparations</strong></li>
          </ul>

          <div className="bg-red-50 p-6 rounded-lg mb-8">
            <h4 className="font-bold text-red-600 mb-2">📍 Visit Us:</h4>
            <p className="text-gray-700 mb-2">Vijay Chowk, In front of Vijay Talkies, Golghar, Gorakhpur</p>
            
            <h4 className="font-bold text-red-600 mb-2">📞 Call Now:</h4>
            <p className="text-gray-700 mb-2">07525025100</p>
            
            <h4 className="font-bold text-red-600 mb-2">🛒 Order Online:</h4>
            <p className="text-gray-700">Google / Zomato</p>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-red-600 mb-4">
              "Taste the tradition, indulge in excellence! 🍬"
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-pink-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo */}
            <div>
              <div className="bg-red-600 text-white px-6 py-3 rounded-full inline-block mb-4">
                <span className="font-bold">Chowdhry</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Experience the delightful fusion of tradition and taste at Chowdhry Sweet House.
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Our handcrafted sweets, made with love and the finest ingredients, bring you a perfect blend of authentic flavors and fresh sweetness.
              </p>
              <p className="text-gray-600 text-sm">
                Visit us to indulge in the finest sweets and create memorable moments.
              </p>
            </div>

            {/* Information */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Information</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="#" className="hover:text-red-600">Custom Service</Link></li>
                <li><Link to="#" className="hover:text-red-600">FAQs</Link></li>
                <li><Link to="#" className="hover:text-red-600">Ordering Tracking</Link></li>
                <li><Link to="/contact" className="hover:text-red-600">Contacts</Link></li>
                <li><Link to="/about" className="hover:text-red-600">About</Link></li>
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4">My Account</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="#" className="hover:text-red-600">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-red-600">Terms & Condition</Link></li>
                <li><Link to="#" className="hover:text-red-600">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-bold text-gray-800 mb-4">Our</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><i className="fab fa-facebook mr-2"></i>Facebook</li>
                <li><i className="fab fa-dribbble mr-2"></i>Dribbble</li>
                <li><i className="fab fa-twitter mr-2"></i>Twitter</li>
                <li><i className="fab fa-behance mr-2"></i>Behance</li>
                <li><i className="fab fa-youtube mr-2"></i>YouTube</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-8 pt-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <i className="fas fa-phone mr-2"></i>
              <span className="font-bold">+91 7525025100</span>
            </div>
            <p className="text-sm text-gray-600">
              Copyright 2025 <span className="font-bold">Chowdhry Sweet House</span>. All rights reserved. Powered by <span className="font-bold">Shine Infosolutions</span>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;