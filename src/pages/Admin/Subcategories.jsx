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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchCategories();
    const subcats = await getAllSubcategories();
    setSubcategories(subcats);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
                  className="bg-[#d80a4e] text-white px-8 py-3 rounded-md hover:bg-[#b8083e] font-medium"
                >
                  {editingSubcategory ? 'Update Subcategory' : 'Add Subcategory'}
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
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subcategories.map((subcategory) => (
              <tr key={subcategory._id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{subcategory.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{getCategoryName(subcategory.category)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{subcategory.description || 'No description'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(subcategory)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subcategory._id)}
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

      {subcategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subcategories found. Add your first subcategory!</p>
        </div>
      )}
    </div>
  );
};

export default Subcategories;