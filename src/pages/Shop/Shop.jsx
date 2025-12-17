import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';

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
      <Breadcrumb currentPage="Shop Now" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">
            Popular <span className="text-[#d80a4e]">Sweets</span>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e]"  
            />
            <button
              onClick={async () => {
                if (searchQuery.trim()) {
                  const results = await searchItems(searchQuery);
                  setFilteredItems(results);
                  setActiveCategory('search');
                }
              }}
              className="absolute right-2 top-2 text-gray-400 hover:text-[#d80a4e]"
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
                  ? 'text-[#d80a4e] border-b-2 border-[#d80a4e]' 
                  : 'text-gray-600 hover:text-[#d80a4e]'
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
                    ? 'text-[#d80a4e] border-b-2 border-[#d80a4e]' 
                    : 'text-gray-600 hover:text-[#d80a4e]'
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
                  <div className="bg-[#d80a4e] text-white px-3 py-1 rounded-full text-sm font-semibold">
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
                  <Link to="/cart" className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e] transition-colors text-center">
                    Add To Cart
                  </Link>
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


    </div>
  );
};

export default Shop;