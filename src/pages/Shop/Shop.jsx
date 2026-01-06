import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../contexts/index.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';
import ProductCard from '../../components/ProductCard.jsx';

const Shop = () => {
  const { fetchItems, fetchCategories, getItemsByCategory, getSubcategoriesByCategory, getSubcategories, searchItems, categories, items, loading } = useApi();
  const [searchParams] = useSearchParams();
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');
  const urlSearchQuery = searchParams.get('search');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const results = await searchItems(query);
          if (results && results.length > 0) {
            setFilteredItems(results);
          } else {
            const allItems = items.length > 0 ? items : await fetchItems();
            const localResults = allItems.filter(item => 
              item.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredItems(localResults);
          }
        } catch (error) {
          const allItems = items.length > 0 ? items : await fetchItems();
          const localResults = allItems.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
          );
          setFilteredItems(localResults);
        } finally {
          setIsSearching(false);
        }
        setActiveCategory('search');
      } else {
        setIsSearching(false);
        const allItems = items.length > 0 ? items : await fetchItems();
        setFilteredItems(allItems);
        setActiveCategory('all');
      }
    }, 300),
    [searchItems, items, fetchItems]
  );

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  useEffect(() => {
    const loadData = async () => {
      if (categories.length === 0) {
        await fetchCategories();
      }
      
      if (urlSearchQuery) {
        setSearchQuery(urlSearchQuery);
        try {
          const results = await searchItems(urlSearchQuery);
          if (results && results.length > 0) {
            setFilteredItems(results);
          } else {
            const allItems = items.length > 0 ? items : await fetchItems();
            const localResults = allItems.filter(item => 
              item.name.toLowerCase().includes(urlSearchQuery.toLowerCase())
            );
            setFilteredItems(localResults);
          }
        } catch (error) {
          const allItems = items.length > 0 ? items : await fetchItems();
          const localResults = allItems.filter(item => 
            item.name.toLowerCase().includes(urlSearchQuery.toLowerCase())
          );
          setFilteredItems(localResults);
        }
        setActiveCategory('search');
      } else {
        setSearchQuery('');
        if (subcategoryId) {
          const allItems = items.length > 0 ? items : await fetchItems();
          
          const subcategoryItems = allItems.filter(item => {
            if (!item.subcategories || !Array.isArray(item.subcategories)) return false;
            
            return item.subcategories.some(subcat => {
              let subcatId;
              if (typeof subcat === 'string') {
                subcatId = subcat;
              } else if (subcat && subcat._id) {
                subcatId = subcat._id;
              } else if (subcat && subcat.$oid) {
                subcatId = subcat.$oid;
              } else {
                subcatId = subcat;
              }
              
              return subcatId === subcategoryId;
            });
          });
          
          setFilteredItems(subcategoryItems);
          setActiveSubcategory(subcategoryId);
          
          const allSubcats = await getSubcategories();
          setSubcategories(Array.isArray(allSubcats) ? allSubcats : allSubcats?.subcategories || []);
          setActiveCategory('subcategory');
        } else if (categoryId) {
          const categoryItems = await getItemsByCategory(categoryId);
          setFilteredItems(categoryItems);
          setActiveCategory(categoryId);
          setActiveSubcategory(null);
          // Load subcategories for this category
          const categorySubcats = await getSubcategoriesByCategory(categoryId);
          setSubcategories(categorySubcats);
        } else {
          const allItems = items.length > 0 ? items : await fetchItems();
          setFilteredItems(allItems);
          setActiveCategory('all');
          setActiveSubcategory(null);
          setSubcategories([]);
        }
      }
    };
    loadData();
  }, [categoryId, subcategoryId, urlSearchQuery]);

  const handleCategoryFilter = async (catId) => {
    setActiveCategory(catId);
    setActiveSubcategory(null);
    if (catId === 'all') {
      const allItems = items.length > 0 ? items : await fetchItems();
      setFilteredItems(allItems);
      setSubcategories([]);
    } else {
      const categoryItems = await getItemsByCategory(catId);
      setFilteredItems(categoryItems);
      // Load subcategories for this category
      const categorySubcats = await getSubcategoriesByCategory(catId);
      setSubcategories(categorySubcats);
    }
  };

  const handleSubcategoryFilter = async (subcatId) => {
    setActiveSubcategory(subcatId);
    
    const allItems = items.length > 0 ? items : await fetchItems();
    const subcategoryItems = allItems.filter(item => {
      if (!item.subcategories || !Array.isArray(item.subcategories)) return false;
      
      return item.subcategories.some(subcat => {
        let subcatId_inner;
        if (typeof subcat === 'string') {
          subcatId_inner = subcat;
        } else if (subcat && subcat._id) {
          subcatId_inner = subcat._id;
        } else if (subcat && subcat.$oid) {
          subcatId_inner = subcat.$oid;
        } else {
          subcatId_inner = subcat;
        }
        
        return subcatId_inner === subcatId;
      });
    });
    
    setFilteredItems(subcategoryItems);
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
    <div className="bg-white">
      <Breadcrumb currentPage="Shop Now" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold">
            Popular <span className="text-[#d80a4e]">Sweets</span>
          </h2>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-4 md:mb-6 px-2">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e]"
            />
            {isSearching ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#d80a4e]"></div>
              </div>
            ) : (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <i className="fas fa-search"></i>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-6 px-4">
          <div className="flex flex-wrap justify-center gap-3 md:gap-6">
            <button 
              onClick={() => handleCategoryFilter('all')}
              className={`font-medium pb-1 whitespace-nowrap ${
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
                className={`font-medium pb-1 whitespace-nowrap ${
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

        {/* Subcategory Tabs */}
        {subcategories.length > 0 && (
          <div className="flex justify-center mb-8 px-4">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              <button 
                onClick={() => handleCategoryFilter(activeCategory)}
                className={`text-xs md:text-sm font-medium px-3 py-2 rounded-full whitespace-nowrap ${
                  !activeSubcategory 
                    ? 'bg-[#d80a4e] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All {categories.find(c => c._id === activeCategory)?.name}
              </button>
              {subcategories.map((subcategory) => (
                <button 
                  key={subcategory._id}
                  onClick={() => handleSubcategoryFilter(subcategory._id)}
                  className={`text-xs md:text-sm font-medium px-3 py-2 rounded-full whitespace-nowrap ${
                    activeSubcategory === subcategory._id 
                      ? 'bg-[#d80a4e] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 max-w-6xl mx-auto">
          {filteredItems.length > 0 ? filteredItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          )) : (
            <div className="col-span-full text-center py-8 md:py-12">
              <p className="text-gray-500 text-sm md:text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
