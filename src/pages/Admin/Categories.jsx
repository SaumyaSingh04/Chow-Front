import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const Categories = () => {
  const { fetchCategories, addCategory, updateCategory, deleteCategory, categories, loading } = useApi();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      if (editingCategory) {
        await updateCategory(editingCategory._id, formData);
      } else {
        await addCategory(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  // Pagination functions
  const getTotalPages = () => Math.ceil(categories.length / itemsPerPage);
  
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return categories.slice(startIndex, endIndex);
  };
  
  const getPageInfo = () => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, categories.length);
    return `${startIndex} – ${endIndex} of ${categories.length}`;
  };

  if (showModal) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 underline">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h1>
            <button 
              onClick={() => {
                setShowModal(false);
                setEditingCategory(null);
                setFormData({ name: '', description: '' });
              }}
              className="bg-orange-400 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-orange-500 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              ← <span className="hidden sm:inline">Go Back</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-3 sm:p-6">
          <div className="bg-white rounded-lg border p-3 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Basic Information :</h3>
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
                    placeholder="Category Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Empty columns for layout */}
                <div></div>
                <div></div>
              </div>

              {/* Description Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="4"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-[#d80a4e] text-white px-8 py-3 rounded-md hover:bg-[#b8083e] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {updating ? 'Updating...' : (editingCategory ? 'Update Category' : 'Add Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Categories Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e] w-full sm:w-auto"
        >
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow">
        {/* Horizontal scroll wrapper */}
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full">
            <thead className="bg-[#d80a4e] text-white">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Name</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Description</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageItems().map((category, index) => (
                <tr key={category._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">
                    {category.description || 'No description'}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                    <button
                      onClick={() => handleEdit(category)}
                      className="bg-[#d80a4e] text-white px-2 md:px-4 py-1 md:py-2 rounded hover:bg-[#b8083e] text-xs font-medium"
                    >
                      Update / View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-3 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center text-xs md:text-sm text-gray-700 gap-2 sm:gap-0">
            <span>Items per page: {itemsPerPage}</span>
            <span className="sm:ml-8">{getPageInfo()}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs md:text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ◀
            </button>
            <span className="text-xs md:text-sm text-gray-600">
              {currentPage} / {getTotalPages()}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
              disabled={currentPage === getTotalPages()}
              className="px-3 py-1 text-xs md:text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No categories found. Add your first category!</p>
        </div>
      )}
    </div>
  );
};

export default Categories;