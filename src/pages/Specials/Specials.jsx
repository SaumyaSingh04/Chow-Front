import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';

const Specials = () => {
  const { fetchCategories, getFeaturedItems, getItemsByCategory, categories, loading } = useApi();
  const [specialProducts, setSpecialProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      const featured = await getFeaturedItems('special');
      setSpecialProducts(featured);
    };
    loadData();
  }, []);

  const handleCategoryFilter = async (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      const featured = await getFeaturedItems('special');
      setSpecialProducts(featured);
    } else {
      const categoryItems = await getItemsByCategory(catId);
      setSpecialProducts(categoryItems);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#d80a4e] mx-auto"></div>
          <p className="mt-4">Loading Specials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Breadcrumb currentPage="Specials" />
      
      <div className="max-w-7xl mx-auto px-6 py-8 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="bg-[#d80a4e] text-white p-4">
                <h3 className="font-bold">Categories</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  <li 
                    onClick={() => handleCategoryFilter('all')}
                    className={`p-2 rounded cursor-pointer ${
                      activeCategory === 'all' 
                        ? 'text-[#d80a4e] bg-pink-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Specials
                  </li>
                  {categories.map((category) => (
                    <li 
                      key={category._id}
                      onClick={() => handleCategoryFilter(category._id)}
                      className={`p-2 rounded cursor-pointer ${
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
          </div>
          
          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {specialProducts.length > 0 ? specialProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="relative">
                    <img 
                      src={product.images?.[0] || '/assets/img/product/home-one/product-1.jpg'} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <div className="bg-[#d80a4e] text-white px-2 py-1 rounded text-xs font-semibold">
                        Special
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                      <Link to="/cart" className="bg-[#d80a4e] text-white px-3 py-1 rounded text-sm hover:bg-[#b8083e] transition-colors inline-block">
                        Add To Cart
                      </Link>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No special products available.</p>
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