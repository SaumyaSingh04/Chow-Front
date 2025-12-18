import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApi } from '../../context/ApiContext.jsx';
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
  const categoryId = searchParams.get('category');
  const subcategoryId = searchParams.get('subcategory');
  const urlSearchQuery = searchParams.get('search');

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
    <div className="min-h-screen bg-white relative z-0">
      <Breadcrumb currentPage="Shop Now" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 py-1">
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
              onChange={async (e) => {
                const value = e.target.value;
                setSearchQuery(value);
                if (!value.trim()) {
                  const allItems = items.length > 0 ? items : await fetchItems();
                  setFilteredItems(allItems);
                  setActiveCategory('all');
                }
              }}
              onKeyPress={async (e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  try {
                    const results = await searchItems(searchQuery);
                    if (results && results.length > 0) {
                      setFilteredItems(results);
                    } else {
                      const allItems = items.length > 0 ? items : await fetchItems();
                      const localResults = allItems.filter(item => 
                        item.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      setFilteredItems(localResults);
                    }
                  } catch (error) {
                    const allItems = items.length > 0 ? items : await fetchItems();
                    const localResults = allItems.filter(item => 
                      item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    setFilteredItems(localResults);
                  }
                  setActiveCategory('search');
                }
              }}
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e]"  
            />
            <button
              onClick={async () => {
                if (searchQuery.trim()) {
                  try {
                    const results = await searchItems(searchQuery);
                    if (results && results.length > 0) {
                      setFilteredItems(results);
                    } else {
                      const allItems = items.length > 0 ? items : await fetchItems();
                      const localResults = allItems.filter(item => 
                        item.name.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      setFilteredItems(localResults);
                    }
                  } catch (error) {
                    const allItems = items.length > 0 ? items : await fetchItems();
                    const localResults = allItems.filter(item => 
                      item.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    setFilteredItems(localResults);
                  }
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
        <div className="flex justify-center mb-6">
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

        {/* Subcategory Tabs */}
        {subcategories.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4 flex-wrap">
              <button 
                onClick={() => handleCategoryFilter(activeCategory)}
                className={`text-sm font-medium pb-1 px-3 py-1 rounded-full ${
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
                  className={`text-sm font-medium pb-1 px-3 py-1 rounded-full ${
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {filteredItems.length > 0 ? filteredItems.map((product) => (
            <ProductCard key={product._id} product={product} />
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