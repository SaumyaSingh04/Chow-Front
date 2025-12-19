import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';
import ProductCard from '../../components/ProductCard.jsx';

const Specials = () => {
  const { fetchCategories, getFeaturedItems, getItemsByCategory, fetchItems, categories, loading } = useApi();
  const [specialProducts, setSpecialProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      let featured = await getFeaturedItems('popular');
      if (!featured || featured.length === 0) {
        const allItems = await fetchItems();
        featured = allItems.filter(item => item.isPopular);
      }
      setSpecialProducts(featured);
    };
    loadData();
  }, []);

  const handleCategoryFilter = async (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      let featured = await getFeaturedItems('popular');
      if (!featured || featured.length === 0) {
        const allItems = await fetchItems();
        featured = allItems.filter(item => item.isPopular);
      }
      setSpecialProducts(featured);
    } else {
      const categoryItems = await getItemsByCategory(catId);
      const popularItems = categoryItems.filter(item => item.isPopular);
      setSpecialProducts(popularItems);
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="bg-[#d80a4e] text-white p-3 sm:p-4">
                <h3 className="font-bold text-sm sm:text-base">Categories</h3>
              </div>
              <div className="p-3 sm:p-4">
                <ul className="space-y-2">
                  <li 
                    onClick={() => handleCategoryFilter('all')}
                    className={`p-2 rounded cursor-pointer text-sm sm:text-base ${
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
                      className={`p-2 rounded cursor-pointer text-sm sm:text-base ${
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {specialProducts.length > 0 ? specialProducts.map((product) => (
                <ProductCard key={product._id} product={product} showSpecialTag={true} />
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