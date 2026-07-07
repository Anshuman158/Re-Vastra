import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backEndURL, currency } from '../App';
import { toast } from 'react-toastify';
import { Search, RotateCcw, Trash2, RefreshCw, Package, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DeletedProducts = ({ token }) => {
    const { darkMode } = useTheme();
    const [list, setList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [restoringId, setRestoringId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchDeletedProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(backEndURL + '/api/product/deleted', {
                headers: { token }
            });
            if (response.data.success) {
                const products = response.data.products;
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

    const restoreProduct = async (id, name) => {
        if (!confirm(`Restore "${name}" back to active products?`)) return;
        setRestoringId(id);
        try {
            const response = await axios.post(backEndURL + '/api/product/restore', { id }, { headers: { token } });
            if (response.data.success) {
                toast.success('Product restored successfully!');
                await fetchDeletedProducts();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setRestoringId(null);
        }
    };

    const permanentlyDelete = async (id, name) => {
        if (!confirm(`⚠️ PERMANENTLY delete "${name}"? This cannot be undone!`)) return;
        setDeletingId(id);
        try {
            const response = await axios.delete(backEndURL + `/api/product/permanent/${id}`, { headers: { token } });
            if (response.data.success) {
                toast.success('Product permanently deleted');
                await fetchDeletedProducts();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeletingId(null);
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
        setFilteredList(filtered);
    }, [searchQuery, categoryFilter, list]);

    useEffect(() => { fetchDeletedProducts(); }, []);

    return (
        <div className="py-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Deleted Products</h1>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Manage soft-deleted products — restore or permanently remove them</p>
                </div>
                <button onClick={fetchDeletedProducts} disabled={loading} className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-all ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white hover:shadow-md'}`}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className={`p-4 rounded-xl shadow-sm mb-6 border-l-4 border-red-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                    <AlertTriangle size={24} className="text-red-500" />
                    <div>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{list.length}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Deleted Products</p>
                    </div>
                </div>
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
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                    </div>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}>
                        <option value="all">All Categories</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <p className={`text-sm mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Showing {filteredList.length} of {list.length} deleted products</p>
            </div>

            {/* Products Table */}
            <div className={`rounded-xl shadow-sm overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <table className="w-full">
                    <thead className={`border-b ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50'}`}>
                        <tr>
                            <th className={`text-left py-4 px-4 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Product</th>
                            <th className={`text-left py-4 px-4 text-xs font-semibold uppercase hidden md:table-cell ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</th>
                            <th className={`text-left py-4 px-4 text-xs font-semibold uppercase hidden md:table-cell ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Seller</th>
                            <th className={`text-left py-4 px-4 text-xs font-semibold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price</th>
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
                                    <p>No deleted products found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredList.map((item) => (
                                <tr key={item._id} className={`border-b transition-colors ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <img src={item.image[0]} alt={item.name} className="w-12 h-12 object-cover rounded-lg border opacity-60" />
                                            <div>
                                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.name}</p>
                                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: {item._id.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 hidden md:table-cell">
                                        <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{item.category}</span>
                                    </td>
                                    <td className="py-4 px-4 hidden md:table-cell">
                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.seller?.shopName || item.seller?.name || '—'}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currency}{item.price}</p>
                                        <p className="text-xs text-blue-500">Rental: {currency}{item.rental_price}/day</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => restoreProduct(item._id, item.name)}
                                                disabled={restoringId === item._id}
                                                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${restoringId === item._id ? 'opacity-50 cursor-wait' : ''} ${darkMode ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                                title="Restore Product"
                                            >
                                                <RotateCcw size={16} />
                                                <span className="hidden sm:inline">Restore</span>
                                            </button>
                                            <button
                                                onClick={() => permanentlyDelete(item._id, item.name)}
                                                disabled={deletingId === item._id}
                                                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${deletingId === item._id ? 'opacity-50 cursor-wait' : ''} ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                title="Permanently Delete"
                                            >
                                                <Trash2 size={16} />
                                                <span className="hidden sm:inline">Delete</span>
                                            </button>
                                        </div>
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

export default DeletedProducts;
