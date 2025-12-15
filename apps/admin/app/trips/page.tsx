'use client';

import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { useState } from 'react';
import { api } from '../lib/api';

export default function TripsPage() {
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const trips = [
    { id: 'T-1001', customer: 'Ahmed Ali', driver: 'Mohammed Hassan', from: 'Sana\'a Downtown', to: 'Airport', type: 'In-Town Taxi', status: 'Completed', amount: '2,500 YER', date: '2025-12-15 10:30' },
    { id: 'T-1002', customer: 'Fatima Said', driver: 'Ali Abdullah', from: 'Taiz', to: 'Aden', type: 'Out-Town VIP', status: 'In Progress', amount: '15,000 YER', date: '2025-12-15 09:15' },
    { id: 'T-1003', customer: 'Omar Khalid', driver: 'Hassan Ahmed', from: 'Sana\'a', to: 'Hodeidah', type: 'Out-Town Shared', status: 'Assigned', amount: '8,500 YER', date: '2025-12-15 08:00' },
    { id: 'T-1004', customer: 'Layla Mohammed', driver: 'Unassigned', from: 'Mukalla', to: 'Sana\'a', type: 'Out-Town VIP', status: 'Requested', amount: '18,000 YER', date: '2025-12-15 11:45' },
  ];

  const filteredTrips = filter === 'all' ? trips : trips.filter(t => t.status.toLowerCase().replace(' ', '-') === filter);

  const handleCreateTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tripData = Object.fromEntries(formData);
    
    try {
      await api.createTrip(tripData);
      alert('Trip created successfully!');
      setShowCreateModal(false);
      // Reload trips data here
    } catch (error) {
      alert('Failed to create trip');
    }
  };

  const handleViewTrip = (trip: any) => {
    setSelectedTrip(trip);
    setShowViewModal(true);
  };

  const handleEditTrip = (trip: any) => {
    alert(`Edit functionality for trip ${trip.id} will be implemented`);
  };

  return (
    <AdminLayout title="Trips Management" subtitle="Monitor and manage all trips across the platform">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Trips Today</h3>
          <p className="text-3xl font-bold text-gray-900">47</p>
          <p className="text-sm text-green-600 mt-1">+12% from yesterday</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600">8</p>
          <p className="text-sm text-gray-500 mt-1">Currently active</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">35</p>
          <p className="text-sm text-gray-500 mt-1">Successfully finished</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Revenue Today</h3>
          <p className="text-3xl font-bold text-purple-600">125K YER</p>
          <p className="text-sm text-green-600 mt-1">+18% from yesterday</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {['all', 'requested', 'assigned', 'in-progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            + Create Trip
          </button>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trip.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trip.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trip.driver}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div>{trip.from}</div>
                    <div className="text-gray-500">→ {trip.to}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trip.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      trip.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      trip.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      trip.status === 'Assigned' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trip.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button 
                      onClick={() => handleViewTrip(trip)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEditTrip(trip)}
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Trip Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Trip">
        <form onSubmit={handleCreateTrip} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
            <input name="customerPhone" type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="+967 777 123 456" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
            <input name="from" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Location</label>
            <input name="to" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
            <select name="type" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="In-Town Taxi">In-Town Taxi</option>
              <option value="Out-Town VIP">Out-Town VIP</option>
              <option value="Out-Town Shared">Out-Town Shared</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Create Trip
            </button>
          </div>
        </form>
      </Modal>

      {/* View Trip Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Trip Details">
        {selectedTrip && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Trip ID</p>
                <p className="font-medium">{selectedTrip.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{selectedTrip.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{selectedTrip.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Driver</p>
                <p className="font-medium">{selectedTrip.driver}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">From</p>
                <p className="font-medium">{selectedTrip.from}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">To</p>
                <p className="font-medium">{selectedTrip.to}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{selectedTrip.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium">{selectedTrip.amount}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
