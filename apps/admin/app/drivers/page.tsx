'use client';

import AdminLayout from '../components/AdminLayout';

export default function DriversPage() {
  const drivers = [
    { id: 'D-3001', name: 'Mohammed Hassan', phone: '+967 777 111 222', vehicle: 'Toyota Corolla 2020', license: 'SAN-12345', status: 'Online', rating: 4.8, trips: 245, kyc: 'Approved' },
    { id: 'D-3002', name: 'Ali Abdullah', phone: '+967 777 222 333', vehicle: 'Hyundai Accent 2019', license: 'ADE-67890', status: 'Offline', rating: 4.6, trips: 189, kyc: 'Approved' },
    { id: 'D-3003', name: 'Hassan Ahmed', phone: '+967 777 333 444', vehicle: 'Nissan Sunny 2021', license: 'TAI-54321', status: 'Online', rating: 4.9, trips: 312, kyc: 'Approved' },
    { id: 'D-3004', name: 'Yusuf Mohammed', phone: '+967 777 444 555', vehicle: 'Kia Cerato 2018', license: 'HOD-98765', status: 'Busy', rating: 4.7, trips: 156, kyc: 'Pending' },
  ];

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
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              👥 All Drivers
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              ✅ KYC Approved
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              ⏳ KYC Pending
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              🟢 Online
            </button>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
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
              {drivers.map((driver) => (
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
