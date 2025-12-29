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

  // Get current user ID from localStorage - check on every render
  useEffect(() => {
    const checkUserStatus = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          const userId = userData.id || userData._id;
          if (userId !== currentUserId) {
            setCurrentUserId(userId);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          if (currentUserId !== null) {
            setCurrentUserId(null);
          }
        }
      } else {
        if (currentUserId !== null) {
          setCurrentUserId(null);
        }
      }
    };
    
    checkUserStatus();
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkUserStatus);
    
    return () => {
      window.removeEventListener('storage', checkUserStatus);
    };
  }, [currentUserId]);

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
      // For guest users, load from generic cart key
      try {
        const savedCart = localStorage.getItem('guest_cart');
        setCartItems(savedCart ? JSON.parse(savedCart) : []);
      } catch (error) {
        console.error('Error loading guest cart from localStorage:', error);
        setCartItems([]);
      }
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
    } else {
      // For guest users, save to generic cart key
      try {
        localStorage.setItem('guest_cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving guest cart to localStorage:', error);
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

  const updateQuantity = async (productId, quantity, maxStock = null) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const item = cartItems.find(item => item._id === productId);
    if (!item) return;
    
    let stockLimit = maxStock || item.stockQty || item.stock || item.quantity_available || item.quantityAvailable || item.availableQuantity;
    
    // If no stock info in cart, fetch from API
    if (stockLimit === null || stockLimit === undefined) {
      try {
        console.log('Fetching stock for product:', productId);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/items/get/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          console.log('All product fields:', Object.keys(productData));
          console.log('Full product data:', productData);
          stockLimit = productData.stockQty || productData.stock || productData.quantity_available || productData.quantityAvailable || productData.availableQuantity || productData.quantity || productData.stockQuantity;
          console.log('Stock limit found:', stockLimit);
        }
      } catch (error) {
        console.error('Error fetching stock:', error);
      }
    }
    
    if (stockLimit !== null && stockLimit !== undefined && quantity > stockLimit) {
      setTimeout(() => {
        showNotification(`Only ${stockLimit} items available in stock!`, 'error');
      }, 0);
      return;
    }
    
    setCartItems(prevItems => {
      setTimeout(() => {
        showNotification(`${item.name} quantity updated!`);
      }, 0);
      return prevItems.map(cartItem =>
        cartItem._id === productId ? { ...cartItem, quantity } : cartItem
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (currentUserId) {
      localStorage.removeItem(`cart_${currentUserId}`);
    } else {
      localStorage.removeItem('guest_cart');
    }
    showNotification('Cart cleared!');
  };

  const clearUserCart = () => {
    if (currentUserId) {
      localStorage.removeItem(`cart_${currentUserId}`);
      setCartItems([]);
    }
  };

  const transferGuestCartToUser = (userId) => {
    try {
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart && userId) {
        const guestItems = JSON.parse(guestCart);
        if (guestItems.length > 0) {
          // Check if user already has a cart
          const existingUserCart = localStorage.getItem(`cart_${userId}`);
          if (existingUserCart) {
            // Merge carts if user already has items
            const existingItems = JSON.parse(existingUserCart);
            const mergedItems = [...existingItems];
            
            guestItems.forEach(guestItem => {
              const existingIndex = mergedItems.findIndex(item => item._id === guestItem._id);
              if (existingIndex >= 0) {
                mergedItems[existingIndex].quantity += guestItem.quantity;
              } else {
                mergedItems.push(guestItem);
              }
            });
            
            localStorage.setItem(`cart_${userId}`, JSON.stringify(mergedItems));
            setCartItems(mergedItems);
          } else {
            // No existing cart, just transfer guest cart
            localStorage.setItem(`cart_${userId}`, guestCart);
            setCartItems(guestItems);
          }
          
          localStorage.removeItem('guest_cart');
          setCurrentUserId(userId);
        }
      }
    } catch (error) {
      console.error('Error transferring guest cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.discountPrice * item.quantity), 0);
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
    transferGuestCartToUser,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};