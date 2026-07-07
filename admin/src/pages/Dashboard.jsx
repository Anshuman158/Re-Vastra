import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PackagePlus, List, ShoppingBag, Users, Box, ClipboardList, TrendingUp, RefreshCw, Store, Calendar, CheckCircle, Clock, Package, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { backEndURL, currency } from '../App';
import { useTheme } from '../context/ThemeContext';

const Dashboard = ({ token }) => {
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${backEndURL}/api/stats`, { headers: { token } }),
        axios.post(`${backEndURL}/api/order/list`, {}, { headers: { token } })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.orders.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const navItems = [
    { to: '/add', label: 'Add Product', icon: <PackagePlus size={28} />, desc: 'List new rental items' },
    { to: '/list', label: 'Products', icon: <List size={28} />, desc: 'Manage inventory' },
    { to: '/orders', label: 'Orders', icon: <ShoppingBag size={28} />, desc: 'Track all rentals' },
    { to: '/sellers', label: 'Sellers', icon: <Store size={28} />, desc: 'Manage lenders' },
  ];

  const statCards = [
    { label: 'Total Users', count: stats.users, icon: <Users size={32} />, color: 'from-blue-500 to-blue-600' },
    { label: 'Products', count: stats.products, icon: <Box size={32} />, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Orders', count: stats.orders, icon: <ClipboardList size={32} />, color: 'from-amber-500 to-amber-600' },
    { label: 'Delivered', count: stats.deliveredOrders, icon: <CheckCircle size={32} />, color: 'from-green-500 to-green-600' },
    { label: 'Pending', count: stats.pendingOrders, icon: <Clock size={32} />, color: 'from-orange-500 to-orange-600' },
    { label: 'Revenue', count: `${currency}${stats.totalRevenue?.toLocaleString() || 0}`, icon: <TrendingUp size={32} />, color: 'from-purple-500 to-purple-600' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Order Placed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'Shipped': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'Out for delivery': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Dashboard</h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50 ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-700'}`}>
          <AlertTriangle size={20} />
          {error}
          <button onClick={fetchStats} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, count, icon, color }) => (
          <div
            key={label}
            className={`relative overflow-hidden bg-gradient-to-br ${color} text-white rounded-2xl p-5 shadow-lg transform transition-all hover:scale-105`}
          >
            <div className="flex flex-col">
              <span className="text-white/80 text-sm font-medium">{label}</span>
              {loading ? (
                <div className="h-8 w-16 bg-white/30 animate-pulse rounded mt-1"></div>
              ) : (
                <span className="text-2xl font-bold mt-1">{count}</span>
              )}
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-20">
              {React.cloneElement(icon, { size: 64 })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h3>
          <div className="space-y-3">
            {navItems.map(({ to, label, icon, desc }) => (
              <NavLink
                key={label}
                to={to}
                className={`flex items-center gap-4 p-4 rounded-xl shadow-sm transition-all group ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-md'}`}
              >
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <div>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{label}</span>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Orders</h3>
            <NavLink to="/orders" className="text-red-500 hover:text-red-600 text-sm font-medium">View All →</NavLink>
          </div>
          <div className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="w-full">
              <thead className={`border-b ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <tr>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Order</th>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase hidden sm:table-cell ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customer</th>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount</th>
                  <th className={`text-left py-3 px-4 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td colSpan="4" className="py-4 px-4">
                        <div className={`h-6 animate-pulse rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                      </td>
                    </tr>
                  ))
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={`py-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      <Package size={40} className="mx-auto mb-2 opacity-50" />
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, idx) => (
                    <tr key={idx} className={`border-b transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="py-3 px-4">
                        <span className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>#{order._id?.slice(-6)}</span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{order.address?.fullName || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currency}{order.amount}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Platform Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
          <h4 className="font-bold text-lg mb-2">🏪 Rental Platform</h4>
          <p className="text-blue-100 text-sm">Premium fashion rental service for college campuses.</p>
        </div>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl p-6">
          <h4 className="font-bold text-lg mb-2">💰 Tiered Pricing</h4>
          <p className="text-emerald-100 text-sm">Day 1: Base | Days 2-3: +30% | Days 4-7: +50% | Day 8+: +72%</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6">
          <h4 className="font-bold text-lg mb-2">🔒 Security Deposit</h4>
          <p className="text-purple-100 text-sm">40% of product value, fully refundable after return.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
