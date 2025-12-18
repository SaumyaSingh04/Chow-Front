import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/ApiContext.jsx';

const Tickets = () => {
  const { getTickets, updateTicket, deleteTicket } = useApi();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await getTickets();
      setTickets(Array.isArray(ticketsData) ? ticketsData : ticketsData?.tickets || []);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
        <button
          onClick={fetchTickets}
          className="bg-[#d80a4e] text-white px-4 py-2 rounded hover:bg-[#b8083e]"
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
            Total Messages: {tickets.length}
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#d80a4e] text-white">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase w-1/8">Name</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase w-1/6">Email</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase w-1/8">Phone</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase w-1/6">Subject</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase w-1/8">Message</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase w-1/8">Date</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase w-1/8">Status</th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((ticket, index) => (
                  <tr key={ticket._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 truncate">{ticket.fullName}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 truncate">{ticket.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{ticket.phone || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 truncate">{ticket.subject || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm">
                      <button
                        onClick={() => {
                          setSelectedMessage(ticket);
                          setShowModal(true);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                        ticket.status === 'resolved' ? 'bg-green-500' : 
                        ticket.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {ticket.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className="flex gap-2">
                        <select
                          value={ticket.status || 'open'}
                          onChange={(e) => handleStatusUpdate(ticket._id, e.target.value)}
                          className="text-xs border rounded px-2 py-1 flex-1"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={() => handleDelete(ticket._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
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
      
      {/* Message Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs w-200 mx-4 max-h-64 overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Message Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-xs">
              <div><span className="font-medium">From:</span> {selectedMessage.fullName}</div>
              <div><span className="font-medium">Email:</span> {selectedMessage.email}</div>
              {selectedMessage.phone && <div><span className="font-medium">Phone:</span> {selectedMessage.phone}</div>}
              {selectedMessage.subject && <div><span className="font-medium">Subject:</span> {selectedMessage.subject}</div>}
              <div><span className="font-medium">Date:</span> {new Date(selectedMessage.createdAt).toLocaleDateString()}</div>
              <div className="pt-1">
                <div className="font-medium mb-1">Message:</div>
                <div className="p-2 bg-gray-50 rounded text-xs leading-relaxed">
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