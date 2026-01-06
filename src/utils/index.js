// ============================================================================
// RAZORPAY UTILITIES
// ============================================================================
export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ============================================================================
// COMMON UTILITIES
// ============================================================================
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ============================================================================
// ADMIN UTILITIES
// ============================================================================
export const formatObjectValue = (val, key = '', options = {}) => {
  if (val === null || val === undefined) return 'N/A';
  
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      if (key === 'items' && options.formatItems) {
        return val.map(item => `${item.itemId?.name || 'Item'} (Qty: ${item.quantity})`).join(', ');
      }
      return val.length > 0 ? `${val.length} entries` : 'Empty';
    }
    
    if (key === 'shipping' && options.formatShipping) {
      return `Provider: ${val.provider || 'N/A'}, Total: ₹${val.total || 0}, Charged: ${val.charged ? 'Yes' : 'No'}`;
    }
    
    return JSON.stringify(val, null, 2);
  }
  
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'number' && key.toLowerCase().includes('price')) return `₹${val}`;
  if (key.toLowerCase().includes('date')) {
    try {
      return new Date(val).toLocaleString();
    } catch {
      return String(val);
    }
  }
  
  return String(val);
};