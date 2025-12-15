'use client';

import AdminLayout from '../components/AdminLayout';

export default function ParcelsPage() {
  const parcels = [
    { id: 'P-2001', sender: 'Ahmed Store', receiver: 'Fatima Ali', from: 'Sana\'a', to: 'Taiz', size: 'Medium', cod: '5,000 YER', status: 'Delivered', driver: 'Mohammed Hassan' },
    { id: 'P-2002', sender: 'Tech Shop', receiver: 'Omar Khalid', from: 'Aden', to: 'Sana\'a', size: 'Small', cod: 'N/A', status: 'In Transit', driver: 'Ali Abdullah' },
    { id: 'P-2003', sender: 'Fashion Boutique', receiver: 'Layla Said', from: 'Hodeidah', to: 'Mukalla', size: 'Large', cod: '12,000 YER', status: 'Picked Up', driver: 'Hassan Ahmed' },
    { id: 'P-2004', sender: 'Electronics Hub', receiver: 'Yusuf Mohammed', from: 'Sana\'a', to: 'Aden', size: 'Medium', cod: '8,500 YER', status: 'Created', driver: 'Unassigned' },
  ];

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
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              📦 All Parcels
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              💰 COD Parcels
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              📊 Reports
            </button>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
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
                    <button className="text-indigo-600 hover:text-indigo-900 font-medium">Track</button>
                    <button className="text-gray-600 hover:text-gray-900 font-medium">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
