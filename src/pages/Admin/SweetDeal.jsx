import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/index.jsx';
import { useNotification } from '../../contexts/index.jsx';

const SweetDeal = () => {
  const { baseUrl } = useApi();
  const { showNotification } = useNotification();
  
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    salePrice: '',
    endDate: '',
    videoFile: null,
    isActive: true
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/sweet-deals`);
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      showNotification('Error fetching deals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.originalPrice || !formData.salePrice || !formData.endDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setUpdating(true);
      setError('');
      const url = editingDeal 
        ? `${baseUrl}/api/sweet-deals/${editingDeal._id}`
        : `${baseUrl}/api/sweet-deals`;
      
      const method = editingDeal ? 'PUT' : 'POST';
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('originalPrice', formData.originalPrice);
      formDataToSend.append('salePrice', formData.salePrice);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('isActive', formData.isActive);
      
      if (formData.videoFile) {
        formDataToSend.append('video', formData.videoFile);
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        showNotification(`Deal ${editingDeal ? 'updated' : 'created'} successfully`, 'success');
        resetForm();
        fetchDeals();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save deal');
      }
    } catch (error) {
      setError(error.message || 'Error saving deal');
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      ...deal,
      endDate: new Date(deal.endDate).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleToggleActive = async (dealId, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/sweet-deals/${dealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (response.ok) {
        showNotification(`Deal ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchDeals();
      } else {
        throw new Error('Failed to update deal status');
      }
    } catch (error) {
      showNotification('Error updating deal status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/sweet-deals/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Deal deleted successfully', 'success');
        fetchDeals();
      } else {
        throw new Error('Failed to delete deal');
      }
    } catch (error) {
      showNotification('Error deleting deal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      originalPrice: '',
      salePrice: '',
      endDate: '',
      videoFile: null,
      isActive: true
    });
    setEditingDeal(null);
    setShowModal(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const getTotalPages = () => Math.ceil(deals.length / itemsPerPage);
  
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return deals.slice(startIndex, endIndex);
  };
  
  const getPageInfo = () => {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, deals.length);
    return `${startIndex} – ${endIndex} of ${deals.length}`;
  };

  if (showModal) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="bg-white border-b px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 underline">
              {editingDeal ? 'Edit Sweet Deal' : 'Add Sweet Deal'}
            </h1>
            <button 
              onClick={() => {
                setShowModal(false);
                setEditingDeal(null);
                resetForm();
              }}
              className="bg-orange-400 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-orange-500 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              ← <span className="hidden sm:inline">Go Back</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 sm:p-6">
          <div className="bg-white rounded-lg border p-3 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Deal Information :</h3>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File
                  </label>
                  <input
                    type="file"
                    name="videoFile"
                    accept="video/*"
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active Deal</label>
                  {formData.isActive && (
                    <p className="text-xs text-orange-600 ml-2">(This will deactivate other deals)</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-[#d80a4e] text-white px-8 py-3 rounded-md hover:bg-[#b8083e] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {updating ? 'Saving...' : (editingDeal ? 'Update Deal' : 'Create Deal')}
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
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Sweet Deals Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e] w-full sm:w-auto"
        >
          Create New Deal
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mx-4 mb-4 flex-1 min-h-0">
        <div className="h-full overflow-auto">
          <table className="min-w-[700px] w-full">
            <thead className="bg-[#d80a4e] text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Title</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Price</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">End Date</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Status</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageItems().map((deal, index) => (
                <tr key={deal._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                    {deal.title}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">
                    <span className="line-through text-gray-500">₹{deal.originalPrice}</span>
                    <span className="ml-2 text-green-600 font-medium">₹{deal.salePrice}</span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">
                    {new Date(deal.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                    <button
                      onClick={() => {
                        if (!deal.isActive || window.confirm('This will deactivate other active deals. Continue?')) {
                          handleToggleActive(deal._id, !deal.isActive);
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        deal.isActive ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          deal.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(deal)}
                        className="bg-[#d80a4e] text-white px-2 md:px-4 py-1 md:py-2 rounded hover:bg-[#b8083e] text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(deal._id)}
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

      {deals.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No deals found. Add your first sweet deal!</p>
        </div>
      )}
    </div>
  );
};

export default SweetDeal;
