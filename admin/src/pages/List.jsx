import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backEndURL, currency } from '../App';
import { toast } from 'react-toastify';
import { Search, Trash2, RefreshCw, Package } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const List = ({ token }) => {
  const { darkMode } = useTheme();
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(backEndURL + '/api/product/list');
      if (response.data.success) {
        const products = response.data.products.reverse();
        setList(products);
        setFilteredList(products);
        const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedCount = async () => {
    try {
      const response = await axios.get(backEndURL + '/api/product/deleted', { headers: { token } });
      if (response.data.success) {
        setDeletedCount(response.data.products.length);
      }
    } catch (error) {
      console.error('Failed to fetch deleted count');
    }
  };

  const removeProduct = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const response = await axios.post(backEndURL + '/api/product/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateProductStatus = async (id, status) => {
    try {
      const response = await axios.put(backEndURL + `/api/product/update-status/${id}`, { status }, { headers: { token } });
      if (response.data.success) {
        toast.success(`Status updated`);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    let filtered = list;
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item._id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => (item.status || 'available') === statusFilter);
    }
    setFilteredList(filtered);
  }, [searchQuery, categoryFilter, statusFilter, list]);

  useEffect(() => { fetchList(); fetchDeletedCount(); }, []);

  const stats = {
    total: list.length,
    available: list.filter(p => (p.status || 'available') === 'available').length,
    outOfStock: list.filter(p => p.status === 'out_of_stock').length,
    deleted: deletedCount
  };

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Product Inventory</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Manage all listed products</p>
        </div>
        <button onClick={fetchList} disabled={loading} className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-all ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white hover:shadow-md'}`}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: stats.total, color: 'border-blue-500' },
          { label: 'Available', value: stats.available, color: 'border-green-500' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'border-orange-500' },
          { label: 'Deleted', value: stats.deleted, color: 'border-red-500', onClick: () => navigate('/deleted') }
        ].map(stat => (
          <div
            key={stat.label}
            onClick={stat.onClick}
            className={`p-4 rounded-xl shadow-sm border-l-4 ${stat.color} ${darkMode ? 'bg-gray-800' : 'bg-white'} ${stat.onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          >
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl shadow-sm mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}>
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <p className={`text-sm mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Showing {filteredList.length} of {list.length} products</p>
      </div>

      {/* Products Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="w-full">
          <thead className={`border-b ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`text-left py-4 px-4 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Product</th>
              <th className={`text-left py-4 px-4 text-xs font-semibold uppercase hidden md:table-cell ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</th>
              <th className={`text-left py-4 px-4 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price</th>
              <th className={`text-left py-4 px-4 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
              <th className={`text-center py-4 px-4 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className={`border-b ${darkMode ? 'border-gray-700' : ''}`}>
                  <td colSpan="5" className="py-4 px-4"><div className={`h-12 animate-pulse rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div></td>
                </tr>
              ))
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan="5" className={`py-12 text-center ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                  <Package size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No products found</p>
                </td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <tr key={item._id} className={`border-b transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={item.image[0]} alt={item.name} className="w-12 h-12 object-cover rounded-lg border" />
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.name}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: {item._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{item.category}</span>
                  </td>
                  <td className="py-4 px-4">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currency}{item.price}</p>
                    <p className="text-xs text-blue-500">Rental: {currency}{item.rental_price}/day</p>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={item.status || 'available'}
                      onChange={(e) => updateProductStatus(item._id, e.target.value)}
                      className={`text-sm px-3 py-1.5 rounded-full border-0 font-medium cursor-pointer ${(item.status || 'available') === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'}`}
                    >
                      <option value="available">✓ Available</option>
                      <option value="out_of_stock">✗ Out of Stock</option>
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <button onClick={() => removeProduct(item._id, item.name)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
