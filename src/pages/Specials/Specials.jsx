import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';
import ProductCard from '../../components/ProductCard.jsx';

const Specials = () => {
  const { fetchCategories, getFeaturedItems, getItemsByCategory, fetchItems, categories, loading } = useApi();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      const allItems = await fetchItems();
      setAllProducts(allItems);
      setFilteredProducts(allItems);
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...allProducts];

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategories = Array.isArray(item.categories) ? item.categories : [item.category];
        return itemCategories.some(cat => 
          (typeof cat === 'object' ? cat._id : cat) === activeCategory
        );
      });
    }

    // Price range filter
    filtered = filtered.filter(item => {
      const price = item.discountPrice || item.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      
      switch (sortBy) {
        case 'price-low': return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [allProducts, activeCategory, sortBy, priceRange, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#d80a4e] mx-auto"></div>
          <p className="mt-4">Loading Specials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pb-8">
      <Breadcrumb currentPage="Specials" />
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          
          {/* Mobile Filters Toggle */}
          <div className="lg:hidden">
            <button 
              onClick={() => document.getElementById('filters').classList.toggle('hidden')}
              className="w-full bg-[#d80a4e] text-white px-4 py-3 rounded-lg font-medium mb-4"
            >
              Show Filters
            </button>
          </div>
          
          {/* Filters Sidebar */}
          <div id="filters" className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-4 space-y-4">
              
              {/* Categories Filter */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="bg-[#d80a4e] text-white p-3 rounded-t-lg">
                  <h3 className="font-bold text-sm sm:text-base">Categories</h3>
                </div>
                <div className="p-3 max-h-48 sm:max-h-64 overflow-y-auto">
                  <ul className="space-y-1">
                    <li 
                      onClick={() => setActiveCategory('all')}
                      className={`p-2 rounded cursor-pointer text-xs sm:text-sm ${
                        activeCategory === 'all' 
                          ? 'text-[#d80a4e] bg-pink-50' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      All Products
                    </li>
                    {categories.map((category) => (
                      <li 
                        key={category._id}
                        onClick={() => setActiveCategory(category._id)}
                        className={`p-2 rounded cursor-pointer text-xs sm:text-sm ${
                          activeCategory === category._id 
                            ? 'text-[#d80a4e] bg-pink-50' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {category.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sort By & Price Range */}
              <div className="bg-white rounded-lg border shadow-sm p-3 sm:p-4">
                <div className="space-y-4">
                  {/* Sort By */}
                  <div>
                    <h3 className="font-bold text-[#d80a4e] mb-2 text-sm sm:text-base">Sort By</h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] text-sm"
                    >
                      <option value="name">Name</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-bold text-[#d80a4e] mb-2 text-sm sm:text-base">Price Range</h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-full px-2 py-1 border rounded text-xs sm:text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                          className="w-full px-2 py-1 border rounded text-xs sm:text-sm"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                      <div className="text-xs sm:text-sm text-gray-600">
                        ₹{priceRange[0]} - ₹{priceRange[1]}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border shadow-sm p-3 sm:p-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Products ({filteredProducts.length})
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 lg:w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e] text-sm"
                  />
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setSortBy('name');
                      setPriceRange([0, 10000]);
                      setSearchQuery('');
                    }}
                    className="text-sm text-[#d80a4e] hover:underline whitespace-nowrap px-2 py-1"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              )) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-sm sm:text-base">No products found matching your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Specials;