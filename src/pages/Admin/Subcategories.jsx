import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const Subcategories = () => {
  const { getAllSubcategories, addSubcategory, updateSubcategory, deleteSubcategory, fetchCategories, categories, loading } = useApi();
  const [subcategories, setSubcategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: []
  });
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchCategories();
      const subcats = await getAllSubcategories();
      console.log('Loaded subcategories:', subcats);
      // Ensure we always set an array
      setSubcategories(Array.isArray(subcats) ? subcats : subcats?.subcategories || []);
    } catch (error) {
      console.error('Error loading subcategories data:', error);
      setSubcategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      if (editingSubcategory) {
        await updateSubcategory(editingSubcategory._id, formData);
      } else {
        await addSubcategory(formData);
      }
      setShowModal(false);
      setEditingSubcategory(null);
      setFormData({ name: '', description: '', categories: [] });
      loadData();
    } catch (error) {
      console.error('Error saving subcategory:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      name: subcategory.name || '',
      description: subcategory.description || '',
      categories: Array.isArray(subcategory.categories) 
        ? subcategory.categories.map(cat => typeof cat === 'object' ? cat._id : cat)
        : subcategory.category 
          ? [typeof subcategory.category === 'object' ? subcategory.category._id : subcategory.category]
          : []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await deleteSubcategory(id);
        // Update local state immediately
        setSubcategories(prev => prev.filter(sub => sub._id !== id));
        loadData();
      } catch (error) {
        console.error('Error deleting subcategory:', error);
      }
    }
  };

  // Pagination functions
  const getTotalPages = () => Math.ceil((subcategories || []).length / itemsPerPage);
  
  const getCurrentPageItems = () => {
    if (!Array.isArray(subcategories)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return subcategories.slice(startIndex, endIndex);
  };
  
  const getPageInfo = () => {
    const length = (subcategories || []).length;
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, length);
    return `${startIndex} – ${endIndex} of ${length}`;
  };

  const getCategoryNames = (categoriesRef) => {
    if (!categoriesRef) return 'No categories';
    
    // Handle array of categories
    if (Array.isArray(categoriesRef)) {
      return categoriesRef.map(catRef => {
        if (typeof catRef === 'object' && catRef?.name) {
          return catRef.name;
        }
        const category = categories.find(cat => cat._id === catRef);
        return category ? category.name : 'Unknown';
      }).join(', ');
    }
    
    // Handle single category (backward compatibility)
    if (typeof categoriesRef === 'object' && categoriesRef?.name) {
      return categoriesRef.name;
    }
    const category = categories.find(cat => cat._id === categoriesRef);
    return category ? category.name : 'Unknown';
  };

  if (showModal) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 underline">
              {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
            </h1>
            <button 
              onClick={() => {
                setShowModal(false);
                setEditingSubcategory(null);
                setFormData({ name: '', description: '', categories: [] });
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
                {/* Categories Field - First */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories (Multiple) <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-md bg-gray-50 p-3 max-h-32 overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-gray-500 text-sm">No categories available</p>
                    ) : (
                      categories.map((cat) => (
                        <label key={cat._id} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(cat._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData, 
                                  categories: [...formData.categories, cat._id]
                                });
                              } else {
                                setFormData({
                                  ...formData, 
                                  categories: formData.categories.filter(id => id !== cat._id)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm">{cat.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Name Field - Second */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Subcategory Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Empty third column for layout */}
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
                  {updating ? 'Updating...' : (editingSubcategory ? 'Update Subcategory' : 'Add Subcategory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 px-4 pt-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Subcategories Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e] w-full sm:w-auto"
        >
          Add Subcategory
        </button>
      </div>

      {/* Subcategories Table */}
      <div className="bg-white rounded-lg shadow mx-4 mb-4 flex-1 min-h-0">
        <div className="h-full overflow-auto">
          <table className="min-w-[700px] w-full">
            <thead className="bg-[#d80a4e] text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Name</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Categories</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Description</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageItems().map((subcategory, index) => (
                <tr key={subcategory._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">{subcategory.name}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{getCategoryNames(subcategory.categories || subcategory.category)}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{subcategory.description || 'No description'}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(subcategory)}
                        className="bg-[#d80a4e] text-white px-2 md:px-4 py-1 md:py-2 rounded hover:bg-[#b8083e] text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subcategory._id)}
                        className="bg-red-500 text-white px-2 md:px-4 py-1 md:py-2 rounded hover:bg-red-600 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-3 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky bottom-0">
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

      {(subcategories || []).length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subcategories found. Add your first subcategory!</p>
        </div>
      )}
    </div>
  );
};

export default Subcategories;