import React, { createContext, useContext, useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ApiContext = createContext();

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return context;
};

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const isFormData = options.body instanceof FormData;
    
    const config = {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

const apiService = new ApiService();

export const ApiProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const api = {
    baseUrl: BASE_URL,
    service: apiService,
    
    // State
    categories,
    items,
    loading,
    
    // Categories
    fetchCategories: async () => {
      setLoading(true);
      try {
        const data = await apiService.get('/api/categories/all');
        setCategories(data.categories || data);
        return data.categories || data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    
    getCategoryById: async (id) => {
      try {
        return await apiService.get(`/api/categories/get/${id}`);
      } catch (error) {
        console.error('Error fetching category:', error);
        return null;
      }
    },
    
    // Items
    fetchItems: async () => {
      setLoading(true);
      try {
        const data = await apiService.get('/api/items/all');
        setItems(data.items || data);
        return data.items || data;
      } catch (error) {
        console.error('Error fetching items:', error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    
    getItemById: async (id) => {
      try {
        return await apiService.get(`/api/items/get/${id}`);
      } catch (error) {
        console.error('Error fetching item:', error);
        return null;
      }
    },
    
    getItemsByCategory: async (categoryId) => {
      try {
        const data = await apiService.get(`/api/items/category/${categoryId}`);
        return data.items || data;
      } catch (error) {
        console.error('Error fetching items by category:', error);
        return [];
      }
    },
    
    getFeaturedItems: async (type = 'bestseller') => {
      try {
        const data = await apiService.get(`/api/items/featured/${type}`);
        return data.items || data;
      } catch (error) {
        console.error('Error fetching featured items:', error);
        return [];
      }
    },
    
    // Subcategories
    getSubcategories: async () => {
      try {
        const data = await apiService.get('/api/subcategories/all');
        return data.subcategories || data;
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        return [];
      }
    },
    
    getSubcategoriesByCategory: async (categoryId) => {
      try {
        const data = await apiService.get(`/api/subcategories/category/${categoryId}`);
        return data.subcategories || data;
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        return [];
      }
    },
    
    // Auth
    register: async (userData) => {
      try {
        return await apiService.post('/api/auth/register', userData);
      } catch (error) {
        console.error('Error registering:', error);
        throw error;
      }
    },
    
    login: async (credentials) => {
      try {
        return await apiService.post('/api/auth/login', credentials);
      } catch (error) {
        console.error('Error logging in:', error);
        throw error;
      }
    },
    
    getCurrentUser: async () => {
      try {
        return await apiService.get('/api/auth/me');
      } catch (error) {
        console.error('Error getting current user:', error);
        throw error;
      }
    },
    
    getProfile: async (id) => {
      try {
        return await apiService.get(`/api/auth/profile/${id}`);
      } catch (error) {
        console.error('Error getting profile:', error);
        throw error;
      }
    },
    
    updateProfile: async (id, profileData) => {
      try {
        console.log('API: Updating profile for ID:', id, 'with data:', profileData);
        const response = await apiService.put(`/api/auth/profile/${id}`, profileData);
        console.log('API: Profile update response:', response);
        return response;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    },
    
    // Address APIs
    getUserAddresses: async (userId) => {
      try {
        console.log('API: Fetching addresses for user:', userId);
        const response = await apiService.get(`/api/auth/address/${userId}`);
        console.log('API: Get addresses response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching addresses:', error);
        return { addresses: [] };
      }
    },
    
    addUserAddress: async (userId, addressData) => {
      try {
        console.log('API: Adding address for user:', userId, 'Data:', addressData);
        const response = await apiService.post(`/api/auth/address/${userId}`, addressData);
        console.log('API: Add address response:', response);
        return response;
      } catch (error) {
        console.error('Error adding address:', error);
        throw error;
      }
    },
    
    updateUserAddress: async (userId, addressId, addressData) => {
      try {
        console.log('API: Updating address for user:', userId, 'Address ID:', addressId, 'Data:', addressData);
        const response = await apiService.put(`/api/auth/address/${userId}/${addressId}`, addressData);
        console.log('API: Update address response:', response);
        return response;
      } catch (error) {
        console.error('Error updating address:', error);
        throw error;
      }
    },
    
    deleteUserAddress: async (userId, addressId) => {
      try {
        console.log('API: Deleting address for user:', userId, 'Address ID:', addressId);
        const response = await apiService.delete(`/api/auth/address/${userId}/${addressId}`);
        console.log('API: Delete address response:', response);
        return response;
      } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
      }
    },
    
    // Categories CRUD
    addCategory: async (categoryData) => {
      try {
        return await apiService.post('/api/categories/add', categoryData);
      } catch (error) {
        console.error('Error adding category:', error);
        throw error;
      }
    },
    
    updateCategory: async (id, categoryData) => {
      try {
        return await apiService.put(`/api/categories/update/${id}`, categoryData);
      } catch (error) {
        console.error('Error updating category:', error);
        throw error;
      }
    },
    
    deleteCategory: async (id) => {
      try {
        return await apiService.delete(`/api/categories/delete/${id}`);
      } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
      }
    },
    
    getAllCategories: async () => {
      try {
        return await apiService.get('/api/categories/all');
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    
    // Subcategories CRUD
    getAllSubcategories: async () => {
      try {
        return await apiService.get('/api/subcategories/all');
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        return [];
      }
    },
    
    getSubcategoryById: async (id) => {
      try {
        return await apiService.get(`/api/subcategories/get/${id}`);
      } catch (error) {
        console.error('Error fetching subcategory:', error);
        return null;
      }
    },
    
    addSubcategory: async (subcategoryData) => {
      try {
        return await apiService.post('/api/subcategories/add', subcategoryData);
      } catch (error) {
        console.error('Error adding subcategory:', error);
        throw error;
      }
    },
    
    updateSubcategory: async (id, subcategoryData) => {
      try {
        return await apiService.put(`/api/subcategories/update/${id}`, subcategoryData);
      } catch (error) {
        console.error('Error updating subcategory:', error);
        throw error;
      }
    },
    
    deleteSubcategory: async (id) => {
      try {
        return await apiService.delete(`/api/subcategories/delete/${id}`);
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        throw error;
      }
    },
    
    // Items CRUD
    getAllItems: async () => {
      try {
        return await apiService.get('/api/items/all');
      } catch (error) {
        console.error('Error fetching items:', error);
        return [];
      }
    },
    
    getItemsBySubcategory: async (subcategoryId) => {
      try {
        const data = await apiService.get(`/api/items/subcategory/${subcategoryId}`);
        return data.items || data;
      } catch (error) {
        console.error('Error fetching items by subcategory:', error);
        return [];
      }
    },
    
    addItem: async (itemData) => {
      try {
        return await apiService.post('/api/items/add', itemData);
      } catch (error) {
        console.error('Error adding item:', error);
        throw error;
      }
    },
    
    updateItem: async (id, itemData) => {
      try {
        return await apiService.put(`/api/items/update/${id}`, itemData);
      } catch (error) {
        console.error('Error updating item:', error);
        throw error;
      }
    },
    
    deleteItem: async (id) => {
      try {
        return await apiService.delete(`/api/items/delete/${id}`);
      } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
      }
    },
    
    // Search
    search: async (query) => {
      try {
        const data = await apiService.get(`/api/search?q=${encodeURIComponent(query)}`);
        return data;
      } catch (error) {
        console.error('Error searching:', error);
        return [];
      }
    },
    
    searchItems: async (query) => {
      try {
        const data = await apiService.get(`/api/search/items?q=${encodeURIComponent(query)}`);
        return data.items || data;
      } catch (error) {
        console.error('Error searching items:', error);
        return [];
      }
    },
    
    searchCustomers: async (query) => {
      try {
        const data = await apiService.get(`/api/search/customers?q=${encodeURIComponent(query)}`);
        return data.customers || data;
      } catch (error) {
        console.error('Error searching customers:', error);
        return [];
      }
    },
    
    searchOrders: async (query) => {
      try {
        const data = await apiService.get(`/api/search/orders?q=${encodeURIComponent(query)}`);
        return data.orders || data;
      } catch (error) {
        console.error('Error searching orders:', error);
        return [];
      }
    },
    
    // Tickets
    createTicket: async (ticketData) => {
      try {
        return await apiService.post('/api/tickets', ticketData);
      } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
      }
    },
    
    getTickets: async () => {
      try {
        const data = await apiService.get('/api/tickets');
        return data.tickets || data;
      } catch (error) {
        console.error('Error fetching tickets:', error);
        return [];
      }
    },
    
    getTicketById: async (id) => {
      try {
        return await apiService.get(`/api/tickets/${id}`);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        return null;
      }
    },
    
    updateTicket: async (id, ticketData) => {
      try {
        return await apiService.put(`/api/tickets/${id}`, ticketData);
      } catch (error) {
        console.error('Error updating ticket:', error);
        throw error;
      }
    },
    
    deleteTicket: async (id) => {
      try {
        return await apiService.delete(`/api/tickets/${id}`);
      } catch (error) {
        console.error('Error deleting ticket:', error);
        throw error;
      }
    },
    
    // Admin Dashboard APIs
    getDashboardStats: async () => {
      try {
        return await apiService.get('/api/dashboard/stats');
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
      }
    },
    
    getFailedOrders: async () => {
      try {
        return await apiService.get('/api/dashboard/failed-orders');
      } catch (error) {
        console.error('Error fetching failed orders:', error);
        return null;
      }
    },
    
    getAdminDashboard: async () => {
      try {
        return await apiService.get('/admin');
      } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        return null;
      }
    },
    
    // Check if user is admin
    isAdmin: (user) => {
      return user && user.role === 'admin';
    },
    
    // Orders
    getAllOrders: async () => {
      try {
        const data = await apiService.get('/api/orders/all');
        return data.orders || data;
      } catch (error) {
        console.error('Error fetching all orders:', error);
        return [];
      }
    },
    
    updateOrderStatus: async (orderId, status) => {
      try {
        const response = await apiService.put(`/api/orders/update/${orderId}`, { status });
        return response;
      } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
    },
    
    updateItemStock: async (itemId, quantity) => {
      try {
        const response = await apiService.put(`/api/items/update-stock/${itemId}`, { quantity });
        return response;
      } catch (error) {
        console.error('Error updating item stock:', error);
        throw error;
      }
    },
    
    getMyOrders: async (customerId) => {
      try {
        const data = await apiService.get(`/api/orders/my/${customerId}`);
        return data.orders || data;
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        return [];
      }
    },
    
    createOrder: async (orderData) => {
      try {
        console.log('API: Creating order with data:', orderData);
        const response = await apiService.post('/api/orders/add', orderData);
        console.log('API: Order creation response:', response);
        return response;
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },
    
    // Basic API info
    getApiInfo: async () => {
      try {
        return await apiService.get('/');
      } catch (error) {
        console.error('Error fetching API info:', error);
        return null;
      }
    }
  };

  return (
    <ApiContext.Provider value={api}>
      {children}
    </ApiContext.Provider>
  );
};