import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Search } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-[#d80a4e] text-white text-sm h-10 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 flex justify-between">
          <span>About Us</span>
          <span>Enjoy free shipping on orders INR 1000 & up.</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/src/assets/logo.png"
              alt="Chowdhry Sweet House"
              className="h-20 object-contain"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex gap-8 font-medium text-gray-800">
            <Link to="/" className="hover:text-[#d80a4e]">Home</Link>
            <Link to="/specials" className="hover:text-[#d80a4e]">Our Specials</Link>
            <Link to="/about" className="hover:text-[#d80a4e]">About</Link>
            <Link to="/contact" className="hover:text-[#d80a4e]">Contact</Link>
            <Link to="/shop" className="hover:text-[#d80a4e]">Shop Now</Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            
            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-2 -right-2 bg-[#d80a4e] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {/* User */}
            <Link to="/account">
              <User className="w-6 h-6 text-gray-700" />
            </Link>

            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border rounded-md w-56 text-sm focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
