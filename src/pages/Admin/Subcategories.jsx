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
    category: ''
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
      setFormData({ name: '', description: '', category: '' });
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
      category: typeof subcategory.category === 'object' ? subcategory.category._id : subcategory.category || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await deleteSubcategory(id);
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

  const getCategoryName = (categoryRef) => {
    if (typeof categoryRef === 'object' && categoryRef?.name) {
      return categoryRef.name;
    }
    const category = categories.find(cat => cat._id === categoryRef);
    return category ? category.name : 'Unknown';
  };

  if (showModal) {
    return (
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 underline">
              {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
            </h1>
            <button 
              onClick={() => {
                setShowModal(false);
                setEditingSubcategory(null);
                setFormData({ name: '', description: '', category: '' });
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
                    placeholder="Subcategory Name"
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
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Subcategories Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e]"
        >
          Add Subcategory
        </button>
      </div>

      {/* Subcategories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#d80a4e] text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageItems().map((subcategory, index) => (
                <tr key={subcategory._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{subcategory.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{getCategoryName(subcategory.category)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{subcategory.description || 'No description'}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleEdit(subcategory)}
                      className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e] text-xs font-medium"
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

      {(subcategories || []).length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subcategories found. Add your first subcategory!</p>
        </div>
      )}
    </div>
  );
};

export default Subcategories;