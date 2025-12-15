'use client';

import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { useState } from 'react';

export default function FinancePage() {
  const [filter, setFilter] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const transactions = [
    { id: 'TXN-5001', type: 'Trip Payment', ref: 'T-1001', amount: '2,500 YER', status: 'Completed', date: '2025-12-15 10:30', method: 'Cash', customer: 'Ahmed Ali' },
    { id: 'TXN-5002', type: 'COD Collection', ref: 'P-2001', amount: '5,000 YER', status: 'Pending Settlement', date: '2025-12-15 09:15', method: 'COD', customer: 'Fatima Ali' },
    { id: 'TXN-5003', type: 'Driver Payout', ref: 'D-3001', amount: '-1,800 YER', status: 'Completed', date: '2025-12-15 08:00', method: 'Bank Transfer', customer: 'Mohammed Hassan' },
    { id: 'TXN-5004', type: 'Parcel Fee', ref: 'P-2002', amount: '1,200 YER', status: 'Completed', date: '2025-12-15 11:45', method: 'Cash', customer: 'Omar Khalid' },
  ];

  const filteredTransactions = filter === 'all' ? transactions :
    filter === 'cod' ? transactions.filter(t => t.type === 'COD Collection') :
    filter === 'payouts' ? transactions.filter(t => t.type === 'Driver Payout') : transactions;

  const handleView = (txn: any) => {
    setSelectedTransaction(txn);
    setShowViewModal(true);
  };

  const handleReceipt = (txn: any) => {
    alert(`Generating receipt for transaction ${txn.id}...`);
  };

  const handleExportCSV = () => {
    alert('Exporting financial data to CSV...');
  };

  const handleSettleCOD = (txn: any) => {
    alert(`Settling COD for transaction ${txn.id}...`);
  };

  const handleProcessPayout = () => {
    alert('Processing driver payouts...');
  };

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
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              💰 All Transactions
            </button>
            <button 
              onClick={() => setFilter('cod')}
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'cod' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              📦 COD Settlements
            </button>
            <button 
              onClick={() => setFilter('payouts')}
              className={`px-4 py-2 rounded-lg font-medium ${filter === 'payouts' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              👥 Driver Payouts
            </button>
            <button 
              onClick={handleProcessPayout}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              📊 Reports
            </button>
          </div>
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
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
              {filteredTransactions.map((txn) => (
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
                    <button 
                      onClick={() => handleView(txn)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => handleReceipt(txn)}
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Transaction Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Transaction Details">
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="font-medium">{selectedTransaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{selectedTransaction.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{selectedTransaction.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="font-medium">{selectedTransaction.ref}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className={`font-medium ${selectedTransaction.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                  {selectedTransaction.amount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{selectedTransaction.method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer/Driver</p>
                <p className="font-medium">{selectedTransaction.customer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">{selectedTransaction.date}</p>
              </div>
            </div>
            {selectedTransaction.status === 'Pending Settlement' && (
              <div className="flex space-x-3 mt-6 pt-6 border-t">
                <button 
                  onClick={() => handleSettleCOD(selectedTransaction)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Settled
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
