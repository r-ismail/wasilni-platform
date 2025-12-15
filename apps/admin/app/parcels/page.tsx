'use client';

import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { useState } from 'react';
import { api } from '../lib/api';

export default function ParcelsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  const parcels = [
    { id: 'P-2001', sender: 'Ahmed Store', receiver: 'Fatima Ali', from: 'Sana\'a', to: 'Taiz', size: 'Medium', cod: '5,000 YER', status: 'Delivered', driver: 'Mohammed Hassan' },
    { id: 'P-2002', sender: 'Tech Shop', receiver: 'Omar Khalid', from: 'Aden', to: 'Sana\'a', size: 'Small', cod: 'N/A', status: 'In Transit', driver: 'Ali Abdullah' },
    { id: 'P-2003', sender: 'Fashion Boutique', receiver: 'Layla Said', from: 'Hodeidah', to: 'Mukalla', size: 'Large', cod: '12,000 YER', status: 'Picked Up', driver: 'Hassan Ahmed' },
    { id: 'P-2004', sender: 'Electronics Hub', receiver: 'Yusuf Mohammed', from: 'Sana\'a', to: 'Aden', size: 'Medium', cod: '8,500 YER', status: 'Created', driver: 'Unassigned' },
  ];

  const handleCreateParcel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parcelData = Object.fromEntries(formData);
    
    try {
      await api.createParcel(parcelData);
      alert('Parcel created successfully!');
      setShowCreateModal(false);
    } catch (error) {
      alert('Failed to create parcel');
    }
  };

  const handleTrack = (parcel: any) => {
    setSelectedParcel(parcel);
    setShowTrackModal(true);
  };

  const handleDetails = (parcel: any) => {
    alert(`Full details for parcel ${parcel.id} will be shown here`);
  };

  const handleCODReport = () => {
    alert('Generating COD report...');
  };

  return (
    <AdminLayout title="Parcels Management" subtitle="Track and manage parcel deliveries with COD support">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Parcels Today</h3>
          <p className="text-3xl font-bold text-gray-900">28</p>
          <p className="text-sm text-green-600 mt-1">+8% from yesterday</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">In Transit</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-sm text-gray-500 mt-1">Currently moving</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Delivered</h3>
          <p className="text-3xl font-bold text-green-600">15</p>
          <p className="text-sm text-gray-500 mt-1">Successfully delivered</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">COD Collected</h3>
          <p className="text-3xl font-bold text-purple-600">85K YER</p>
          <p className="text-sm text-orange-600 mt-1">Pending settlement</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              📦 All Parcels
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              💰 COD Parcels
            </button>
            <button onClick={handleCODReport} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              📊 Reports
            </button>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            + Create Parcel
          </button>
        </div>
      </div>

      {/* Parcels Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcel ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receiver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COD Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {parcels.map((parcel) => (
                <tr key={parcel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{parcel.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parcel.sender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parcel.receiver}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div>{parcel.from}</div>
                    <div className="text-gray-500">→ {parcel.to}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parcel.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {parcel.cod === 'N/A' ? (
                      <span className="text-gray-400">N/A</span>
                    ) : (
                      <span className="text-orange-600">{parcel.cod}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      parcel.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      parcel.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      parcel.status === 'Picked Up' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {parcel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parcel.driver}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button 
                      onClick={() => handleTrack(parcel)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Track
                    </button>
                    <button 
                      onClick={() => handleDetails(parcel)}
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Parcel Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Parcel">
        <form onSubmit={handleCreateParcel} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sender Name</label>
              <input name="senderName" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sender Phone</label>
              <input name="senderPhone" type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Name</label>
              <input name="receiverName" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Phone</label>
              <input name="receiverPhone" type="tel" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
              <input name="from" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location</label>
              <input name="to" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parcel Size</label>
              <select name="size" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">COD Amount (YER)</label>
              <input name="codAmount" type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="0 for no COD" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Create Parcel
            </button>
          </div>
        </form>
      </Modal>

      {/* Track Parcel Modal */}
      <Modal isOpen={showTrackModal} onClose={() => setShowTrackModal(false)} title="Track Parcel">
        {selectedParcel && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-blue-700">Tracking ID: <strong>{selectedParcel.id}</strong></p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                <div className="ml-4">
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-gray-500">Parcel registered in system</p>
                </div>
              </div>
              {selectedParcel.status !== 'Created' && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                  <div className="ml-4">
                    <p className="font-medium">Picked Up</p>
                    <p className="text-sm text-gray-500">Driver: {selectedParcel.driver}</p>
                  </div>
                </div>
              )}
              {(selectedParcel.status === 'In Transit' || selectedParcel.status === 'Delivered') && (
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 ${selectedParcel.status === 'Delivered' ? 'bg-green-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white`}>
                    {selectedParcel.status === 'Delivered' ? '✓' : '→'}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">In Transit</p>
                    <p className="text-sm text-gray-500">En route to destination</p>
                  </div>
                </div>
              )}
              {selectedParcel.status === 'Delivered' && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</div>
                  <div className="ml-4">
                    <p className="font-medium">Delivered</p>
                    <p className="text-sm text-gray-500">Parcel delivered successfully</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowTrackModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
