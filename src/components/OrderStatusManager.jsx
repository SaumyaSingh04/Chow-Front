import React, { useState } from 'react';

const OrderStatusManager = ({ currentStatus, onStatusUpdate, disabled = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const statusFlow = {
    pending: { next: ['confirmed', 'cancelled'], color: 'bg-yellow-500' },
    confirmed: { next: ['shipped', 'delivered', 'cancelled'], color: 'bg-blue-500' },
    shipped: { next: ['delivered', 'cancelled'], color: 'bg-purple-500' },
    delivered: { next: [], color: 'bg-green-500' },
    cancelled: { next: [], color: 'bg-red-500' },
    failed: { next: ['pending'], color: 'bg-red-600' }
  };

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const nextStatuses = statusFlow[currentStatus]?.next || [];

  return (
    <div className="flex flex-col gap-1">
      <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${statusFlow[currentStatus]?.color || 'bg-gray-500'}`}>
        {currentStatus?.charAt(0).toUpperCase() + currentStatus?.slice(1)}
      </span>
      
      {nextStatuses.length > 0 && !disabled && (
        <div className="flex flex-col gap-1">
          {nextStatuses.map(status => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isUpdating}
              className={`px-2 py-1 rounded text-xs font-medium text-white hover:opacity-80 disabled:opacity-50 ${
                status === 'confirmed' ? 'bg-blue-600' :
                status === 'shipped' ? 'bg-purple-600' :
                status === 'delivered' ? 'bg-green-600' :
                status === 'cancelled' ? 'bg-red-600' : 'bg-gray-600'
              }`}
            >
              {isUpdating ? '...' : `→ ${status.charAt(0).toUpperCase() + status.slice(1)}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatusManager;