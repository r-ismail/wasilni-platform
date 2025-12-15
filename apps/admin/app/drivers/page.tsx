'use client';

import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { useState } from 'react';
import { api } from '../lib/api';

export default function DriversPage() {
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const drivers = [
    { id: 'D-3001', name: 'Mohammed Hassan', phone: '+967 777 111 222', vehicle: 'Toyota Corolla 2020', license: 'SAN-12345', status: 'Online', rating: 4.8, trips: 245, kyc: 'Approved' },
    { id: 'D-3002', name: 'Ali Abdullah', phone: '+967 777 222 333', vehicle: 'Hyundai Accent 2019', license: 'ADE-67890', status: 'Offline', rating: 4.6, trips: 189, kyc: 'Approved' },
    { id: 'D-3003', name: 'Hassan Ahmed', phone: '+967 777 333 444', vehicle: 'Nissan Sunny 2021', license: 'TAI-54321', status: 'Online', rating: 4.9, trips: 312, kyc: 'Approved' },
    { id: 'D-3004', name: 'Yusuf Mohammed', phone: '+967 777 444 555', vehicle: 'Kia Cerato 2018', license: 'HOD-98765', status: 'Busy', rating: 4.7, trips: 156, kyc: 'Pending' },
  ];

  const filteredDrivers = filter === 'all' ? drivers : 
    filter === 'kyc-approved' ? drivers.filter(d => d.kyc === 'Approved') :
    filter === 'kyc-pending' ? drivers.filter(d => d.kyc === 'Pending') :
    filter === 'online' ? drivers.filter(d => d.status === 'Online') : drivers;

  const handleAddDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const driverData = Object.fromEntries(formData);
    
    try {
      await api.createDriver(driverData);
      alert('Driver added successfully! KYC review required.');
      setShowAddModal(false);
    } catch (error) {
      alert('Failed to add driver');
    }
  };

  const handleView = (driver: any) => {
    setSelectedDriver(driver);
    setShowViewModal(true);
  };

  const handleEdit = (driver: any) => {
    alert(`Edit functionality for driver ${driver.name} will be implemented`);
  };

  const handleApproveKYC = (driver: any) => {
    alert(`KYC approved for driver ${driver.name}`);
  };

  const handleRejectKYC = (driver: any) => {
    alert(`KYC rejected for driver ${driver.name}`);
  };

  return (
    <AdminLayout title="Drivers Management" subtitle="Manage driver accounts, KYC verification, and performance">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Drivers</h3>
          <p className="text-3xl font-bold text-gray-900">89</p>
          <p className="text-sm text-green-600 mt-1">+5 this week</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Online Now</h3>
          <p className="text-3xl font-bold text-green-600">42</p>
          <p className="text-sm text-gray-500 mt-1">Available for trips</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">KYC Pending</h3>
          <p className="text-3xl font-bold text-orange-600">7</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Avg Rating</h3>
          <p className="text-3xl font-bold text-yellow-600">4.7</p>
          <p className="text-sm text-gray-500 mt-1">⭐ Platform average</p>
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
              👥 All Drivers
            </button>
            <button 
              onClick={() => setFilter('kyc-approved')}
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'kyc-approved' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              ✅ KYC Approved
            </button>
            <button 
              onClick={() => setFilter('kyc-pending')}
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'kyc-pending' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              ⏳ KYC Pending
            </button>
            <button 
              onClick={() => setFilter('online')}
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'online' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🟢 Online
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            + Add Driver
          </button>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trips</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{driver.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{driver.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{driver.vehicle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{driver.license}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      driver.status === 'Online' ? 'bg-green-100 text-green-800' :
                      driver.status === 'Busy' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ⭐ {driver.rating}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{driver.trips}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      driver.kyc === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {driver.kyc}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button 
                      onClick={() => handleView(driver)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleEdit(driver)}
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

      {/* Add Driver Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Driver">
        <form onSubmit={handleAddDriver} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input name="name" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input name="phone" type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="+967 777 123 456" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
              <input name="vehicle" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Toyota Corolla 2020" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
              <input name="license" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="SAN-12345" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Driver License Number</label>
            <input name="driverLicense" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">National ID Number</label>
            <input name="nationalId" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm text-yellow-700">Driver will need to complete KYC verification before they can accept trips.</p>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Add Driver
            </button>
          </div>
        </form>
      </Modal>

      {/* View Driver Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Driver Details" size="lg">
        {selectedDriver && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Driver ID</p>
                <p className="font-medium">{selectedDriver.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{selectedDriver.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedDriver.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedDriver.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                <p className="font-medium">{selectedDriver.vehicle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">License Plate</p>
                <p className="font-medium">{selectedDriver.license}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="font-medium">⭐ {selectedDriver.rating}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Trips</p>
                <p className="font-medium">{selectedDriver.trips}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">KYC Status</p>
                <p className="font-medium">{selectedDriver.kyc}</p>
              </div>
            </div>
            {selectedDriver.kyc === 'Pending' && (
              <div className="flex space-x-3 mt-6 pt-6 border-t">
                <button 
                  onClick={() => handleApproveKYC(selectedDriver)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ✓ Approve KYC
                </button>
                <button 
                  onClick={() => handleRejectKYC(selectedDriver)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  ✗ Reject KYC
                </button>
              </div>
            )}
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
