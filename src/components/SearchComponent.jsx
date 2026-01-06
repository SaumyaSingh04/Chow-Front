import React, { useState } from 'react';
import { useApi } from '../contexts/index.jsx';

const SearchComponent = ({ onResults }) => {
  const { search, searchItems, searchCustomers, searchOrders } = useApi();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('items');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      let results;
      switch (searchType) {
        case 'general':
          results = await search(query);
          break;
        case 'items':
          results = await searchItems(query);
          break;
        case 'customers':
          results = await searchCustomers(query);
          break;
        case 'orders':
          results = await searchOrders(query);
          break;
        default:
          results = await searchItems(query);
      }
      onResults && onResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="items">Items</option>
        <option value="customers">Customers</option>
        <option value="orders">Orders</option>
        <option value="general">All</option>
      </select>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search..."
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <button
        onClick={handleSearch}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
      </button>
    </div>
  );
};

export default SearchComponent;