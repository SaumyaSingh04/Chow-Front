import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { showNotification } = useNotification();
  const [cartItems, setCartItems] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUserId(userData.id || userData._id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Load user-specific cart when user changes
  useEffect(() => {
    if (currentUserId) {
      try {
        const savedCart = localStorage.getItem(`cart_${currentUserId}`);
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [currentUserId]);

  // Save user-specific cart to localStorage whenever it changes
  useEffect(() => {
    if (currentUserId) {
      try {
        localStorage.setItem(`cart_${currentUserId}`, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, currentUserId]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        showNotification(`${product.name} quantity updated in cart!`);
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        showNotification(`${product.name} added to cart!`);
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item._id === productId);
      if (item) {
        showNotification(`${item.name} removed from cart!`);
      }
      return prevItems.filter(item => item._id !== productId);
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      const item = prevItems.find(item => item._id === productId);
      if (item) {
        showNotification(`${item.name} quantity updated!`);
      }
      return prevItems.map(item =>
        item._id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (currentUserId) {
      localStorage.removeItem(`cart_${currentUserId}`);
    }
    showNotification('Cart cleared!');
  };

  const clearUserCart = () => {
    if (currentUserId) {
      localStorage.removeItem(`cart_${currentUserId}`);
      setCartItems([]);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearUserCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};