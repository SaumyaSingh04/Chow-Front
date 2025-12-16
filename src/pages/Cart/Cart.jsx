import React from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm mb-4">
            <Link to="/" className="text-gray-600 hover:text-red-600">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-800">Cart</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Product Cart</h1>
        </div>
        <div className="absolute top-0 right-0 mt-8 mr-16 hidden lg:block">
          <div className="bg-red-600 text-white px-8 py-4 rounded-full">
            <span className="text-2xl font-bold">Chowdhry</span>
            <div className="text-xs">Love at First Bite</div>
          </div>
        </div>
      </div>

      {/* Empty Cart Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Cart is Empty! 🍬
          </h2>
          <p className="text-gray-600 mb-8">
            It looks like your cart is missing some sweetness! Explore our delightful collection of traditional Indian sweets, from melt-in-the-mouth Besan Laddoo to rich and creamy Rajbhog. Add your favorites now and indulge in the authentic taste of pure joy. 🎂 🍰 Start Shopping & Savor the Sweetness! 🍭 😋
          </p>
          <Link 
            to="/shop" 
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Start Shopping
          </Link>
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

export default Cart;