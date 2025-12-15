'use client';

import AdminLayout from '../components/AdminLayout';

export default function AgenciesPage() {
  const agencies = [
    { id: 'A-4001', name: 'Sana\'a Transport Agency', city: 'Sana\'a', drivers: 45, trips: 1234, revenue: '2.5M YER', status: 'Active', type: 'Taxi' },
    { id: 'A-4002', name: 'Aden Express Services', city: 'Aden', drivers: 32, trips: 987, revenue: '1.8M YER', status: 'Active', type: 'Mixed' },
    { id: 'A-4003', name: 'Taiz Delivery Hub', city: 'Taiz', drivers: 28, trips: 756, revenue: '1.2M YER', status: 'Active', type: 'Parcels' },
    { id: 'A-4004', name: 'Hodeidah VIP Transport', city: 'Hodeidah', drivers: 15, trips: 432, revenue: '950K YER', status: 'Pending', type: 'VIP' },
  ];

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
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              🏢 All Agencies
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              🚗 Taxi Agencies
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              📦 Parcel Agencies
            </button>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
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
              {agencies.map((agency) => (
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
                    <button className="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
                    <button className="text-gray-600 hover:text-gray-900 font-medium">Edit</button>
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
