import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const Products = () => {
  const { fetchItems, addItem, updateItem, deleteItem, fetchCategories, getAllSubcategories, searchItems, items, categories, loading } = useApi();
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stockQty: '',
    shortDesc: '',
    longDesc: '',
    category: '',
    subcategory: '',
    images: [],
    video: null,
    isBestRated: false,
    isBestSeller: false,
    isOnSale: false,
    isPopular: false,
    status: 'active'
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchItems();
    fetchCategories();
    loadSubcategories();
  }, []);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const results = await searchItems(searchQuery);
        setFilteredItems(Array.isArray(results) ? results : results?.items || []);
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to local search
        const localResults = items.filter(item => 
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredItems(localResults);
      }
    } else {
      setFilteredItems(items);
    }
  };

  const loadSubcategories = async () => {
    try {
      const subcats = await getAllSubcategories();
      setSubcategories(Array.isArray(subcats) ? subcats : subcats?.subcategories || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && key !== 'video' && formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add images
      selectedImages.forEach(image => {
        submitData.append('images', image);
      });
      
      // Add video
      if (selectedVideo) {
        submitData.append('video', selectedVideo);
      }
      
      if (editingProduct) {
        await updateItem(editingProduct._id, submitData);
      } else {
        await addItem(submitData);
      }
      
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', discountPrice: '', stockQty: '', shortDesc: '', longDesc: '', category: '', subcategory: '', images: [], video: null, isBestRated: false, isBestSeller: false, isOnSale: false, isPopular: false, status: 'active' });
      setSelectedImages([]);
      setSelectedVideo(null);
      fetchItems();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (product) => {
    try {
      console.log('Editing product:', product);
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        discountPrice: product.discountPrice || '',
        stockQty: product.stockQty || '',
        shortDesc: product.shortDesc || '',
        longDesc: product.longDesc || '',
        category: typeof product.category === 'object' ? product.category._id : product.category || '',
        subcategory: typeof product.subcategory === 'object' ? product.subcategory._id : product.subcategory || '',
        images: product.images || [],
        video: product.video || null,
        isBestRated: product.isBestRated || false,
        isBestSeller: product.isBestSeller || false,
        isOnSale: product.isOnSale || false,
        isPopular: product.isPopular || false,
        status: product.status || 'active'
      });
      
      // Set filtered subcategories if category exists
      if (product.category && Array.isArray(subcategories)) {
        const categoryId = typeof product.category === 'object' ? product.category._id : product.category;
        const filtered = subcategories.filter(subcat => {
          const subcatCategoryId = typeof subcat.category === 'object' ? subcat.category._id : subcat.category;
          return subcatCategoryId === categoryId;
        });
        setFilteredSubcategories(filtered);
      } else {
        setFilteredSubcategories([]);
      }
      
      setShowModal(true);
      console.log('Modal should be shown now');
    } catch (error) {
      console.error('Error in handleEdit:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteItem(id);
        fetchItems();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Pagination functions
  const getTotalPages = () => Math.ceil(filteredItems.length / itemsPerPage);
  
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };
  
  const getPageInfo = () => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredItems.length);
    return `${startIndex} – ${endIndex} of ${filteredItems.length}`;
  };

  console.log('showModal state:', showModal);
  console.log('editingProduct:', editingProduct);
  
  if (showModal) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 underline">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h1>
            <button 
              onClick={() => {
                setShowModal(false);
                setEditingProduct(null);
                setFormData({ name: '', description: '', price: '', discountPrice: '', stockQty: '', shortDesc: '', longDesc: '', category: '', subcategory: '', images: [], video: null, isBestRated: false, isBestSeller: false, isOnSale: false, isPopular: false, status: 'active' });
                setSelectedImages([]);
                setSelectedVideo(null);
              }}
              className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 flex items-center gap-2"
            >
              ← Go Back
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information :</h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Premium Patisa"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Category Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const selectedCategory = e.target.value;
                      setFormData({...formData, category: selectedCategory, subcategory: ''});
                      
                      // Filter subcategories based on selected category
                      if (selectedCategory) {
                        const filtered = subcategories.filter(subcat => {
                          const subcatCategoryId = typeof subcat.category === 'object' ? subcat.category._id : subcat.category;
                          return subcatCategoryId === selectedCategory;
                        });
                        setFilteredSubcategories(filtered);
                      } else {
                        setFilteredSubcategories([]);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={!formData.category}
                  >
                    <option value="">{!formData.category ? 'Select Category First' : 'Select Subcategory (Optional)'}</option>
                    {filteredSubcategories.map((subcat) => (
                      <option key={subcat._id} value={subcat._id}>{subcat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Price Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value);
                      const discountPrice = parseFloat(formData.discountPrice);
                      setFormData({...formData, price: e.target.value});
                      
                      // Clear discount price if it becomes >= price
                      if (discountPrice >= price && price > 0) {
                        setFormData(prev => ({...prev, price: e.target.value, discountPrice: ''}));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                {/* Discount Price Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Discount Price"
                    value={formData.discountPrice}
                    onChange={(e) => {
                      const discountPrice = parseFloat(e.target.value);
                      const price = parseFloat(formData.price);
                      if (discountPrice >= price && price > 0) {
                        alert('Discount price must be less than the original price!');
                        return;
                      }
                      setFormData({...formData, discountPrice: e.target.value});
                    }}
                    max={formData.price ? parseFloat(formData.price) - 1 : undefined}
                    className={`w-full px-4 py-3 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent ${
                      formData.discountPrice && formData.price && parseFloat(formData.discountPrice) >= parseFloat(formData.price)
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-red-500'
                    }`}
                  />
                  {formData.discountPrice && formData.price && parseFloat(formData.discountPrice) >= parseFloat(formData.price) && (
                    <p className="text-red-500 text-xs mt-1">Discount price must be less than ₹{formData.price}</p>
                  )}
                </div>

                {/* Stock Qty Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Qty <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ex.. 100"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({...formData, stockQty: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                {/* Short Desc Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Desc <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Short Description"
                    value={formData.shortDesc}
                    onChange={(e) => setFormData({...formData, shortDesc: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
              </div>

              {/* Long Description Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Long Desc <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Long Description"
                  value={formData.longDesc}
                  onChange={(e) => setFormData({...formData, longDesc: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="4"
                />
              </div>

              {/* Images Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images (Max 3 Images) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files).slice(0, 3);
                    setSelectedImages(files);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {selectedImages.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedImages.length} image(s) selected
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video (Max 1 Video, Size &lt; 10MB):
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.size <= 10 * 1024 * 1024) {
                      setSelectedVideo(file);
                    } else if (file) {
                      alert('Video size must be less than 10MB');
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {selectedVideo && (
                  <div className="mt-2 text-sm text-gray-600">
                    Video selected: {selectedVideo.name}
                  </div>
                )}
              </div>

              {/* Product Features */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Product Features:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isBestRated}
                      onChange={(e) => setFormData({...formData, isBestRated: e.target.checked})}
                      className="mr-2"
                    />
                    Best Rated
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})}
                      className="mr-2"
                    />
                    Best Seller
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isOnSale}
                      onChange={(e) => setFormData({...formData, isOnSale: e.target.checked})}
                      className="mr-2"
                    />
                    On Sale
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                      className="mr-2"
                    />
                    Popular
                  </label>
                </div>
              </div>



              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating || (formData.discountPrice && formData.price && parseFloat(formData.discountPrice) >= parseFloat(formData.price))}
                  className="bg-[#d80a4e] text-white px-8 py-3 rounded-md hover:bg-[#b8083e] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {updating ? 'Updating...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
        <button
          onClick={() => {
            console.log('Add Product clicked');
            setShowModal(true);
          }}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e]"
        >
          Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const query = e.target.value;
              setSearchQuery(query);
              console.log('Search query:', query);
              console.log('Items to search:', items);
              
              // Real-time search
              if (!query.trim()) {
                console.log('Empty query, showing all items');
                setFilteredItems(items);
                setCurrentPage(1);
              } else {
                const localResults = items.filter(item => {
                  const nameMatch = item.name?.toLowerCase().includes(query.toLowerCase());
                  const descMatch = item.description?.toLowerCase().includes(query.toLowerCase());
                  const shortDescMatch = item.shortDesc?.toLowerCase().includes(query.toLowerCase());
                  const categoryMatch = (typeof item.category === 'object' ? item.category?.name : item.category)?.toLowerCase().includes(query.toLowerCase());
                  
                  return nameMatch || descMatch || shortDescMatch || categoryMatch;
                });
                console.log('Search results:', localResults);
                setFilteredItems(localResults);
                setCurrentPage(1);
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products by name, description, or category..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d80a4e]"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 text-gray-400 hover:text-[#d80a4e]"
          >
            🔍
          </button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          {filteredItems.length > 0 
            ? `Found ${filteredItems.length} product(s) matching "${searchQuery}"`
            : `No products found matching "${searchQuery}"`
          }
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#d80a4e] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Discount Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Stock Qty</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageItems().length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? `No products found matching "${searchQuery}"` : 'No products available'}
                  </td>
                </tr>
              ) : (
                getCurrentPageItems().map((product, index) => (
                <tr key={product._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{typeof product.category === 'object' ? product.category?.name : product.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₹{product.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">₹{product.discountPrice || product.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{product.stockQty || 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(product);
                      }}
                      className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e] text-xs font-medium transition-colors duration-200"
                    >
                      Update / View
                    </button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700">
            <span>Items per page: {itemsPerPage}</span>
            <span className="ml-8">{getPageInfo()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ◀
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
              disabled={currentPage === getTotalPages()}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;