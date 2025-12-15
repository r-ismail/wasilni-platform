'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const stats = [
    { label: 'Total Trips', value: '1,234', change: '+12%', color: 'blue' },
    { label: 'Active Drivers', value: '89', change: '+5%', color: 'green' },
    { label: 'Parcels Delivered', value: '567', change: '+18%', color: 'purple' },
    { label: 'Revenue (YER)', value: '2.5M', change: '+23%', color: 'orange' },
  ];

  const recentTrips = [
    { id: 'T-1001', customer: 'Ahmed Ali', driver: 'Mohammed Hassan', status: 'Completed', amount: '2,500 YER' },
    { id: 'T-1002', customer: 'Fatima Said', driver: 'Ali Abdullah', status: 'In Progress', amount: '3,200 YER' },
    { id: 'T-1003', customer: 'Omar Khalid', driver: 'Hassan Ahmed', status: 'Assigned', amount: '1,800 YER' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-600 to-purple-700 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-2xl font-bold">وصلني Wasilni</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-white/10 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { icon: '📊', label: 'Dashboard', href: '/' },
            { icon: '🚗', label: 'Trips', href: '/trips' },
            { icon: '📦', label: 'Parcels', href: '/parcels' },
            { icon: '👥', label: 'Drivers', href: '/drivers' },
            { icon: '🏢', label: 'Agencies', href: '/agencies' },
            { icon: '💰', label: 'Finance', href: '/finance' },
            { icon: '⚙️', label: 'Settings', href: '/settings' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">👤</div>
            {sidebarOpen && (
              <div>
                <p className="font-medium">Super Admin</p>
                <p className="text-sm text-white/70">+967 771 111 111</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
              <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                + New Trip
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
                  <span className={`text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded text-xs font-semibold`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Trips */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Recent Trips</h3>
              <Link href="/trips" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trip.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trip.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{trip.driver}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trip.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          trip.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trip.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-3">🚗</div>
              <h4 className="text-lg font-bold mb-2">Create New Trip</h4>
              <p className="text-blue-100 text-sm">Book a new trip for a customer</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-3">📦</div>
              <h4 className="text-lg font-bold mb-2">Add Parcel</h4>
              <p className="text-purple-100 text-sm">Register a new parcel delivery</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-3xl mb-3">👥</div>
              <h4 className="text-lg font-bold mb-2">Add Driver</h4>
              <p className="text-green-100 text-sm">Onboard a new driver to the platform</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
