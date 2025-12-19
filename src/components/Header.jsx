import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X } from "lucide-react";
import { useCart } from '../context/CartContext.jsx';

const Header = () => {
  const { getCartItemsCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlSearch = params.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    } else {
      setSearchQuery('');
    }
  }, [location.search]);
  
  return (
    <header className="w-full bg-white fixed top-0 left-0 right-0 z-[100] shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-[#d80a4e] text-white text-xs sm:text-sm h-8 sm:h-10 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 flex justify-between">
          <span className="hidden sm:block">About Us</span>
          <span className="text-center w-full sm:w-auto">Enjoy free shipping on orders INR 1000 & up.</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/src/assets/logo.png"
              alt="Chowdhry Sweet House"
              className="h-12 sm:h-16 lg:h-20 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-4 lg:gap-8 font-medium text-gray-800 text-sm lg:text-base">
            <Link to="/" className="hover:text-[#d80a4e]">Home</Link>
            <Link to="/specials" className="hover:text-[#d80a4e]">Our Specials</Link>
            <Link to="/about" className="hover:text-[#d80a4e]">About</Link>
            <Link to="/contact" className="hover:text-[#d80a4e]">Contact</Link>
            <Link to="/shop" className="hover:text-[#d80a4e]">Shop Now</Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-visible mr-2">
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Cart */}
            <Link to="/cart" className="relative flex-shrink-0 z-20 p-2">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="absolute top-0 right-0 bg-[#d80a4e] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center z-30">
                {getCartItemsCount()}
              </span>
            </Link>

            {/* User */}
            <Link to="/account" className="flex-shrink-0">
              <User className="w-6 h-6 text-gray-700" />
            </Link>

            {/* Search */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  if (!value.trim()) {
                    navigate('/shop');
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && searchQuery.trim() && navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)}
                placeholder="Search products..."
                className="pl-8 pr-3 py-1.5 lg:py-2 border rounded-md w-40 lg:w-56 text-xs lg:text-sm focus:outline-none"
              />
              <Search 
                className="absolute left-2 lg:left-3 top-1.5 lg:top-2.5 w-3 lg:w-4 h-3 lg:h-4 text-gray-400 cursor-pointer" 
                onClick={() => searchQuery.trim() && navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)}
              />
            </div>

          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="px-4 py-4 space-y-3">
            <Link to="/" className="block py-2 hover:text-[#d80a4e]" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/specials" className="block py-2 hover:text-[#d80a4e]" onClick={() => setMobileMenuOpen(false)}>Our Specials</Link>
            <Link to="/about" className="block py-2 hover:text-[#d80a4e]" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block py-2 hover:text-[#d80a4e]" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link to="/shop" className="block py-2 hover:text-[#d80a4e]" onClick={() => setMobileMenuOpen(false)}>Shop Now</Link>
            
            {/* Mobile Search */}
            <div className="pt-3 border-t">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                      setMobileMenuOpen(false);
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none"
                />
                <Search 
                  className="absolute left-2 top-2.5 w-4 h-4 text-gray-400 cursor-pointer" 
                  onClick={() => {
                    if (searchQuery.trim()) {
                      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                      setMobileMenuOpen(false);
                    }
                  }}
                />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
