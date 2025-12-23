import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const Tickets = () => {
  const { getTickets, updateTicket, deleteTicket } = useApi();
  const [tickets, setTickets] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchTickets();
  }, [currentPage]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getTickets(currentPage, itemsPerPage);
      setTickets(response.tickets || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      await updateTicket(ticketId, { status });
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === ticketId ? { ...ticket, status } : ticket
        )
      );
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDelete = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(ticketId);
        fetchTickets();
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d80a4e]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Contact Messages</h2>
        <button
          onClick={fetchTickets}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e] w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No messages found</p>
        </div>
      ) : (
        <>
          <div className="mb-2 text-sm text-gray-600">
            Total Messages: {totalItems}
          </div>
          <div className="bg-white rounded-lg shadow">
          {/* Horizontal scroll wrapper */}
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full">
              <thead className="bg-[#d80a4e] text-white">
                <tr>
                  <th className="px-3 md:px-4 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Name</th>
                  <th className="px-3 md:px-4 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Email</th>
                  <th className="px-3 md:px-4 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Phone</th>
                  <th className="px-3 md:px-4 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Subject</th>
                  <th className="px-3 md:px-4 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Message</th>
                  <th className="px-3 md:px-4 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Date</th>
                  <th className="px-3 md:px-4 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Status</th>
                  <th className="px-3 md:px-4 py-3 md:py-4 text-left text-xs md:text-sm font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket, index) => (
                  <tr key={ticket._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900 truncate">{ticket.fullName}</td>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm text-gray-700 truncate">{ticket.email}</td>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm text-gray-700">{ticket.phone || 'N/A'}</td>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm text-gray-700 truncate">{ticket.subject || 'N/A'}</td>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm">
                      <button
                        onClick={() => {
                          setSelectedMessage(ticket);
                          setShowModal(true);
                        }}
                        className="bg-blue-500 text-white px-2 md:px-3 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm text-gray-700">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm">
                      <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                        ticket.status === 'resolved' ? 'bg-green-500' : 
                        ticket.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {ticket.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <select
                          value={ticket.status || 'open'}
                          onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                          className="text-xs border rounded px-1 sm:px-2 py-1 flex-1 min-w-0"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={() => handleDelete(ticket._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 whitespace-nowrap"
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
          </div>
        </>
      )}
      
      {/* Pagination */}
      <div className="bg-white rounded-lg shadow mt-4">
        <div className="bg-white px-3 md:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center text-xs md:text-sm text-gray-700 gap-2 sm:gap-0">
            <span>Items per page: {itemsPerPage}</span>
            <span className="sm:ml-8">{(currentPage - 1) * itemsPerPage + 1} – {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</span>
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
              {currentPage} / {totalItems > 0 ? Math.ceil(totalItems / itemsPerPage) : 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalItems / itemsPerPage)))}
              disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
              className="px-3 py-1 text-xs md:text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
      
      {/* Message Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-md sm:max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Message Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl p-1"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium">From:</span> {selectedMessage.fullName}</div>
              <div><span className="font-medium">Email:</span> {selectedMessage.email}</div>
              {selectedMessage.phone && <div><span className="font-medium">Phone:</span> {selectedMessage.phone}</div>}
              {selectedMessage.subject && <div><span className="font-medium">Subject:</span> {selectedMessage.subject}</div>}
              <div><span className="font-medium">Date:</span> {new Date(selectedMessage.createdAt).toLocaleDateString()}</div>
              <div className="pt-2">
                <div className="font-medium mb-2">Message:</div>
                <div className="p-3 bg-gray-50 rounded text-sm leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;