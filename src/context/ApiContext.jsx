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
        let errorData;
        try {
          errorData = await response.json();
          console.error('Server error response:', errorData);
        } catch (e) {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          errorData: errorData
        });
        
        throw new Error(errorMessage);
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

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
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
  const [dashboardRefreshTrigger, setDashboardRefreshTrigger] = useState(0);

  const api = {
    baseUrl: BASE_URL,
    service: apiService,
    
    // State
    categories,
    items,
    loading,
    dashboardRefreshTrigger,
    
    // Categories
    fetchCategories: async () => {
      setLoading(true);
      try {
        console.log('Fetching categories from API...');
        const data = await apiService.get('/api/categories?limit=1000');
        console.log('Categories API response:', data);
        const categoriesData = data.categories || data;
        console.log('Processed categories:', categoriesData);
        setCategories(categoriesData);
        return categoriesData;
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
      if (items.length > 0) return items;
      setLoading(true);
      try {
        const data = await apiService.get('/api/items/all?limit=1000');
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
    
    getItemsBySubcategory: async (subcategoryId) => {
      try {
        const allItems = await apiService.get('/api/items/all');
        const items = allItems.items || allItems;
        
        const filtered = items.filter(item => {
          const itemSubcategories = Array.isArray(item.subcategories) ? item.subcategories : [];
          
          return itemSubcategories.some(subcat => {
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
        
        return filtered;
      } catch (error) {
        console.error('Error filtering items by subcategory:', error);
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
        const response = await apiService.get(`/api/users/${userId}/addresses`);
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
        const response = await apiService.post(`/api/users/${userId}/addresses`, addressData);
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
        const response = await apiService.put(`/api/users/${userId}/addresses/${addressId}`, addressData);
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
        const response = await apiService.delete(`/api/users/${userId}/addresses/${addressId}`);
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
        console.log('Updating category:', id, 'with data:', categoryData);
        const response = await apiService.put(`/api/categories/update/${id}`, categoryData);
        console.log('Update category response:', response);
        return response;
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
    getAllSubcategories: async (page = 1, limit = 10) => {
      try {
        const data = await apiService.get(`/api/subcategories/all?page=${page}&limit=${limit}`);
        return data;
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        return { subcategories: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
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
    
    getTickets: async (page = 1, limit = 10) => {
      try {
        const data = await apiService.get(`/api/tickets?page=${page}&limit=${limit}`);
        return data;
      } catch (error) {
        console.error('Error fetching tickets:', error);
        return { tickets: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
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
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Dashboard API - Token exists:', !!token);
        console.log('Dashboard API - User role:', user.role);
        
        const response = await apiService.get('/api/dashboard/stats');
        console.log('Dashboard API response:', response);
        return response;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // If token is invalid, clear localStorage and redirect to login
        if (error.message === 'Invalid token') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/account';
        }
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
    getAllOrders: async (page = 1, limit = 10) => {
      try {
        const data = await apiService.get(`/api/orders?page=${page}&limit=${limit}`);
        return data;
      } catch (error) {
        console.error('Error fetching all orders:', error);
        return { orders: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
      }
    },
    
    getFailedOrders: async (page = 1, limit = 10) => {
      try {
        const data = await apiService.get(`/api/orders/failed?page=${page}&limit=${limit}`);
        return data;
      } catch (error) {
        console.error('Error fetching failed orders:', error);
        return { orders: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };
      }
    },
    
    updateOrderStatus: async (orderId, status) => {
      try {
        console.log('API: Updating order status for ID:', orderId, 'Status:', status);
        const response = await apiService.patch(`/api/orders/${orderId}/status`, { status });
        console.log('API: Order status update response:', response);
        return response;
      } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
    },
    
    updatePaymentStatus: async (orderId, paymentStatus) => {
      try {
        const response = await apiService.patch(`/api/orders/${orderId}/payment-status`, { paymentStatus });
        // Trigger dashboard refresh when payment is marked as paid
        if (paymentStatus === 'paid') {
          setDashboardRefreshTrigger(prev => prev + 1);
        }
        return response;
      } catch (error) {
        console.error('Error updating payment status:', error);
        throw error;
      }
    },
    
    refreshDashboard: () => {
      setDashboardRefreshTrigger(prev => prev + 1);
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
    
    getMyOrders: async (userId) => {
      try {
        console.log('API: Fetching orders for user ID:', userId);
        
        // Try specific user endpoint first
        try {
          const data = await apiService.get(`/api/orders/my/${userId}`);
          console.log('API: Orders response:', data);
          const orders = data.orders || data;
          console.log('API: Processed orders:', orders);
          return orders;
        } catch (specificError) {
          console.log('Specific endpoint failed, trying getAllOrders and filtering...');
          
          // Fallback: Get all orders and filter by userId
          const allOrdersData = await apiService.get('/api/orders');
          const allOrders = allOrdersData.orders || allOrdersData;
          console.log('API: All orders received:', allOrders);
          
          // Filter orders by userId
          const userOrders = Array.isArray(allOrders) 
            ? allOrders.filter(order => 
                (order.userId === userId) || 
                (typeof order.userId === 'object' && order.userId._id === userId)
              )
            : [];
          
          console.log('API: Filtered user orders:', userOrders);
          return userOrders;
        }
      } catch (error) {
        console.error('Error fetching user orders:', error);
        console.error('User ID used:', userId);
        return [];
      }
    },
    

    cleanFailedOrders: async () => {
      try {
        const response = await apiService.post('/api/payment/clean-failed');
        return response;
      } catch (error) {
        console.error('Error cleaning failed orders:', error);
        throw error;
      }
    },
    
    createOrder: async (orderData) => {
      try {
        console.log('API: Creating order with data:', orderData);
        
        // Validate required fields before sending
        if (!orderData.userId) {
          throw new Error('User ID is required');
        }
        if (!orderData.items || orderData.items.length === 0) {
          throw new Error('Order items are required');
        }
        if (!orderData.totalAmount) {
          throw new Error('Total amount is required');
        }
        
        const response = await apiService.post('/api/orders', orderData);
        console.log('API: Order creation response:', response);
        return response;
      } catch (error) {
        console.error('Error creating order:', error);
        console.error('Order data that failed:', orderData);
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