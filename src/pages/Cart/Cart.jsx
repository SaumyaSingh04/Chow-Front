import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const Cart = () => {
  return (
<div className="min-h-screen overflow-x-hidden bg-white flex flex-col">
<Breadcrumb currentPage="Product Cart" />

      {/* Empty Cart Content */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-x-hidden">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Cart is Empty! 🍬
          </h2>
          <p className="text-gray-600 mb-8">
            It looks like your cart is missing some sweetness! Explore our delightful collection of traditional Indian sweets, from melt-in-the-mouth Besan Laddoo to rich and creamy Rajbhog. Add your favorites now and indulge in the authentic taste of pure joy. 🎂 🍰 Start Shopping & Savor the Sweetness! 🍭 😋
          </p>
          <Link 
            to="/shop" 
            className="bg-[#d80a4e] text-white px-8 py-3 rounded-lg hover:bg-[#b8083e] transition-colors font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      </div>


    </div>
  );
};

export default Cart;