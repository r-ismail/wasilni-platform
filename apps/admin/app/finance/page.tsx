'use client';

import AdminLayout from '../components/AdminLayout';

export default function FinancePage() {
  const transactions = [
    { id: 'TXN-5001', type: 'Trip Payment', ref: 'T-1001', amount: '2,500 YER', status: 'Completed', date: '2025-12-15 10:30', method: 'Cash' },
    { id: 'TXN-5002', type: 'COD Collection', ref: 'P-2001', amount: '5,000 YER', status: 'Pending Settlement', date: '2025-12-15 09:15', method: 'COD' },
    { id: 'TXN-5003', type: 'Driver Payout', ref: 'D-3001', amount: '-1,800 YER', status: 'Completed', date: '2025-12-15 08:00', method: 'Bank Transfer' },
    { id: 'TXN-5004', type: 'Parcel Fee', ref: 'P-2002', amount: '1,200 YER', status: 'Completed', date: '2025-12-15 11:45', method: 'Cash' },
  ];

  return (
    <AdminLayout title="Finance Management" subtitle="Track revenue, expenses, COD settlements, and driver payouts">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue Today</h3>
          <p className="text-3xl font-bold text-green-600">125K YER</p>
          <p className="text-sm text-green-600 mt-1">+18% from yesterday</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">COD Collected</h3>
          <p className="text-3xl font-bold text-orange-600">85K YER</p>
          <p className="text-sm text-gray-500 mt-1">Pending settlement</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Driver Payouts</h3>
          <p className="text-3xl font-bold text-blue-600">45K YER</p>
          <p className="text-sm text-gray-500 mt-1">Processed today</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Net Profit</h3>
          <p className="text-3xl font-bold text-purple-600">35K YER</p>
          <p className="text-sm text-green-600 mt-1">+25% from yesterday</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              💰 All Transactions
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              📦 COD Settlements
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              👥 Driver Payouts
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              📊 Reports
            </button>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{txn.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{txn.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{txn.ref}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={txn.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}>
                      {txn.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{txn.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      txn.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{txn.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
                    <button className="text-gray-600 hover:text-gray-900 font-medium">Receipt</button>
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
