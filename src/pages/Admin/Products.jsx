import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const Products = () => {
  const { fetchItems, addItem, updateItem, deleteItem, fetchCategories, getAllSubcategories, items, categories, loading } = useApi();
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

  useEffect(() => {
    fetchItems();
    fetchCategories();
    loadSubcategories();
  }, []);

  const loadSubcategories = async () => {
    const subcats = await getAllSubcategories();
    setSubcategories(subcats || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
    }
  };

  const handleEdit = (product) => {
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
    if (product.category) {
      const categoryId = typeof product.category === 'object' ? product.category._id : product.category;
      const filtered = subcategories.filter(subcat => {
        const subcatCategoryId = typeof subcat.category === 'object' ? subcat.category._id : subcat.category;
        return subcatCategoryId === categoryId;
      });
      setFilteredSubcategories(filtered);
    }
    
    setShowModal(true);
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
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
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
                  className="bg-[#d80a4e] text-white px-8 py-3 rounded-md hover:bg-[#b8083e] font-medium"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
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
          onClick={() => setShowModal(true)}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e]"
        >
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4">
                  <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">₹{product.price}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{typeof product.category === 'object' ? product.category?.name : product.category}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;