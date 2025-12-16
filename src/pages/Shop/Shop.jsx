import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';

const Shop = () => {
  const { fetchItems, fetchCategories, getItemsByCategory, searchItems, categories, items, loading } = useApi();
  const [searchParams] = useSearchParams();
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categoryId = searchParams.get('category');

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      if (categoryId) {
        const categoryItems = await getItemsByCategory(categoryId);
        setFilteredItems(categoryItems);
        setActiveCategory(categoryId);
      } else {
        const allItems = await fetchItems();
        setFilteredItems(allItems);
      }
    };
    loadData();
  }, [categoryId]);

  const handleCategoryFilter = async (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      setFilteredItems(items);
    } else {
      const categoryItems = await getItemsByCategory(catId);
      setFilteredItems(categoryItems);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">
            Popular <span className="text-red-600">Sweets</span>
          </h2>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={async (e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  const results = await searchItems(searchQuery);
                  setFilteredItems(results);
                  setActiveCategory('search');
                }
              }}
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={async () => {
                if (searchQuery.trim()) {
                  const results = await searchItems(searchQuery);
                  setFilteredItems(results);
                  setActiveCategory('search');
                }
              }}
              className="absolute right-2 top-2 text-gray-400 hover:text-red-600"
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-6 flex-wrap">
            <button 
              onClick={() => handleCategoryFilter('all')}
              className={`font-medium pb-1 ${
                activeCategory === 'all' 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button 
                key={category._id}
                onClick={() => handleCategoryFilter(category._id)}
                className={`font-medium pb-1 ${
                  activeCategory === category._id 
                    ? 'text-red-600 border-b-2 border-red-600' 
                    : 'text-gray-600 hover:text-red-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {filteredItems.length > 0 ? filteredItems.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={product.images?.[0] || '/assets/img/product/home-one/product-1.jpg'} 
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Chowdhry
                  </div>
                </div>
                {product.discount && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      {product.discount}% OFF
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                    )}
                  </div>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    Add To Cart
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-pink-100 py-16 mt-16">
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

export default Shop;