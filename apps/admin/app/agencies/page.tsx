'use client';

import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { useState } from 'react';
import { api } from '../lib/api';

export default function AgenciesPage() {
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);

  const agencies = [
    { id: 'A-4001', name: 'Sana\'a Transport Agency', city: 'Sana\'a', drivers: 45, trips: 1234, revenue: '2.5M YER', status: 'Active', type: 'Taxi' },
    { id: 'A-4002', name: 'Aden Express Services', city: 'Aden', drivers: 32, trips: 987, revenue: '1.8M YER', status: 'Active', type: 'Mixed' },
    { id: 'A-4003', name: 'Taiz Delivery Hub', city: 'Taiz', drivers: 28, trips: 756, revenue: '1.2M YER', status: 'Active', type: 'Parcels' },
    { id: 'A-4004', name: 'Hodeidah VIP Transport', city: 'Hodeidah', drivers: 15, trips: 432, revenue: '950K YER', status: 'Pending', type: 'VIP' },
  ];

  const filteredAgencies = filter === 'all' ? agencies :
    filter === 'taxi' ? agencies.filter(a => a.type === 'Taxi') :
    filter === 'parcels' ? agencies.filter(a => a.type === 'Parcels') : agencies;

  const handleAddAgency = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const agencyData = Object.fromEntries(formData);
    
    try {
      await api.createAgency(agencyData);
      alert('Agency added successfully!');
      setShowAddModal(false);
    } catch (error) {
      alert('Failed to add agency');
    }
  };

  const handleView = (agency: any) => {
    setSelectedAgency(agency);
    setShowViewModal(true);
  };

  const handleEdit = (agency: any) => {
    alert(`Edit functionality for agency ${agency.name} will be implemented`);
  };

  const handleActivate = (agency: any) => {
    alert(`Agency ${agency.name} has been activated`);
  };

  const handleSuspend = (agency: any) => {
    alert(`Agency ${agency.name} has been suspended`);
  };

  return (
    <AdminLayout title="Agencies Management" subtitle="Manage transport agencies and their operations">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Agencies</h3>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-green-600 mt-1">+2 this month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Active Agencies</h3>
          <p className="text-3xl font-bold text-green-600">10</p>
          <p className="text-sm text-gray-500 mt-1">Currently operating</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Drivers</h3>
          <p className="text-3xl font-bold text-blue-600">120</p>
          <p className="text-sm text-gray-500 mt-1">Across all agencies</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">6.5M YER</p>
          <p className="text-sm text-green-600 mt-1">+15% this month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🏢 All Agencies
            </button>
            <button 
              onClick={() => setFilter('taxi')}
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'taxi' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🚗 Taxi Agencies
            </button>
            <button 
              onClick={() => setFilter('parcels')}
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'parcels' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              📦 Parcel Agencies
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            + Add Agency
          </button>
        </div>
      </div>

      {/* Agencies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agency ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drivers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Trips</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAgencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agency.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agency.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agency.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {agency.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agency.drivers}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{agency.trips}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agency.revenue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      agency.status === 'Active' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {agency.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button 
                      onClick={() => handleView(agency)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEdit(agency)}
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

      {/* Add Agency Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Agency">
        <form onSubmit={handleAddAgency} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agency Name</label>
            <input name="name" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select name="city" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">Select City</option>
                <option value="Sana'a">Sana'a</option>
                <option value="Aden">Aden</option>
                <option value="Taiz">Taiz</option>
                <option value="Hodeidah">Hodeidah</option>
                <option value="Mukalla">Mukalla</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agency Type</label>
              <select name="type" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Type</option>
                <option value="Taxi">Taxi</option>
                <option value="VIP">VIP</option>
                <option value="Parcels">Parcels</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
            <input name="contactPerson" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input name="phone" type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="+967 777 123 456" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input name="email" type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea name="address" rows={3} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Add Agency
            </button>
          </div>
        </form>
      </Modal>

      {/* View Agency Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Agency Details" size="lg">
        {selectedAgency && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Agency ID</p>
                <p className="font-medium">{selectedAgency.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{selectedAgency.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedAgency.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{selectedAgency.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{selectedAgency.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Drivers</p>
                <p className="font-medium">{selectedAgency.drivers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Trips</p>
                <p className="font-medium">{selectedAgency.trips}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="font-medium">{selectedAgency.revenue}</p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6 pt-6 border-t">
              {selectedAgency.status === 'Active' ? (
                <button 
                  onClick={() => handleSuspend(selectedAgency)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Suspend Agency
                </button>
              ) : (
                <button 
                  onClick={() => handleActivate(selectedAgency)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Activate Agency
                </button>
              )}
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
