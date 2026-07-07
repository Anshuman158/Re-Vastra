import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backEndURL, currency } from '../App';
import { toast } from 'react-toastify';
import { Store, MapPin, Phone, CreditCard, Search, RefreshCw, UserX, UserCheck, Package, TrendingUp, Ban, ShieldCheck, BadgeCheck, Star, Calendar, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sellers = ({ token }) => {
    const { darkMode } = useTheme();
    const [sellers, setSellers] = useState([]);
    const [filteredSellers, setFilteredSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(backEndURL + '/api/user/sellers', { headers: { token } });
            if (response.data.success) {
                setSellers(response.data.sellers);
                setFilteredSellers(response.data.sellers);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to fetch sellers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = sellers;
        if (searchQuery) {
            filtered = filtered.filter(s =>
                s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.sellerProfile?.shopName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (statusFilter === 'verified') filtered = filtered.filter(s => s.sellerProfile?.isVerified);
        else if (statusFilter === 'unverified') filtered = filtered.filter(s => !s.sellerProfile?.isVerified);
        else if (statusFilter === 'banned') filtered = filtered.filter(s => s.isBanned);
        setFilteredSellers(filtered);
    }, [searchQuery, statusFilter, sellers]);

    useEffect(() => { if (token) fetchSellers(); }, [token]);

    const handleBan = async (userId, currentStatus, shopName) => {
        const isBanning = !currentStatus;
        let reason = "";
        if (isBanning) {
            reason = prompt(`Enter reason for banning "${shopName}":`);
            if (!reason) return;
        } else {
            if (!window.confirm(`Unban "${shopName}"?`)) return;
        }
        try {
            const response = await axios.post(backEndURL + '/api/user/ban', { userId, isBanned: isBanning, banReason: reason }, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchSellers();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to update ban status.");
        }
    };

    const handleVerify = async (userId, currentStatus, shopName) => {
        const isVerifying = !currentStatus;
        if (!window.confirm(`${isVerifying ? 'Verify' : 'Remove verification from'} "${shopName}"?`)) return;

        try {
            const response = await axios.post(backEndURL + '/api/user/verify', { userId, isVerified: isVerifying }, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchSellers();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to update verification status.");
        }
    };

    // Get badge based on rental count
    const getBadge = (rentals) => {
        if (rentals >= 50) return { text: '💎 Top Seller', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' };
        if (rentals >= 25) return { text: '🔥 Popular', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' };
        if (rentals >= 5) return { text: '⭐ Rising', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' };
        return { text: '🆕 New', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
    };

    const stats = {
        total: sellers.length,
        verified: sellers.filter(s => s.sellerProfile?.isVerified).length,
        unverified: sellers.filter(s => !s.sellerProfile?.isVerified && !s.isBanned).length,
        banned: sellers.filter(s => s.isBanned).length
    };

    return (
        <div className="py-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        <Store className="text-blue-500" size={28} /> Seller Management
                    </h1>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Verify, manage, and monitor lenders</p>
                </div>
                <button onClick={fetchSellers} disabled={loading} className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow transition-all ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white hover:shadow-md'}`}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Sellers', value: stats.total, color: 'border-blue-500', icon: <Store size={18} /> },
                    { label: 'Verified', value: stats.verified, color: 'border-green-500', icon: <BadgeCheck size={18} className="text-green-500" /> },
                    { label: 'Pending', value: stats.unverified, color: 'border-yellow-500', icon: <ShieldCheck size={18} className="text-yellow-500" /> },
                    { label: 'Banned', value: stats.banned, color: 'border-red-500', icon: <Ban size={18} className="text-red-500" /> }
                ].map(stat => (
                    <div key={stat.label} className={`p-4 rounded-xl shadow-sm border-l-4 ${stat.color} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center gap-2"><span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</span></div>
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
                            placeholder="Search sellers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`px-4 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`}>
                        <option value="all">All Sellers</option>
                        <option value="verified">Verified Only</option>
                        <option value="unverified">Pending Verification</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
            </div>

            {/* Sellers Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`rounded-xl p-6 animate-pulse ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className={`h-14 w-14 rounded-full mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                            <div className={`h-6 rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        </div>
                    ))}
                </div>
            ) : filteredSellers.length === 0 ? (
                <div className={`text-center py-20 rounded-xl ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                    <Store size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xl">No sellers found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSellers.map((seller) => {
                        const rentals = seller.sellerProfile?.totalRentals || 0;
                        const badge = getBadge(rentals);
                        const rating = seller.sellerProfile?.rating || { average: 0, count: 0 };

                        return (
                            <div key={seller._id} className={`rounded-xl shadow-sm hover:shadow-md transition-all p-6 ${seller.isBanned ? 'border-2 border-red-400' : ''} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                                            {seller.sellerProfile?.shopName?.charAt(0).toUpperCase() || 'S'}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold flex items-center gap-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {seller.sellerProfile?.shopName || 'Unknown'}
                                                {seller.sellerProfile?.isVerified && <BadgeCheck size={16} className="text-blue-500" />}
                                            </h4>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{seller.email}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>{badge.text}</span>
                                </div>

                                {/* Stats Row */}
                                <div className={`flex items-center justify-between py-3 border-y ${darkMode ? 'border-gray-700' : 'border-gray-100'} mb-4`}>
                                    <div className="text-center">
                                        <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{rentals}</p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rentals</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-lg font-bold flex items-center justify-center gap-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                            {rating.average > 0 ? rating.average.toFixed(1) : '-'}
                                        </p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{rating.count} reviews</p>
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-lg font-bold flex items-center justify-center gap-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            <Calendar size={14} className="text-gray-400" />
                                            {seller.sellerProfile?.memberSince ? new Date(seller.sellerProfile.memberSince).getFullYear() : new Date(seller.createdAt).getFullYear()}
                                        </p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Since</p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className={`space-y-2 text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <p className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> {seller.sellerProfile?.address?.city || 'N/A'}</p>
                                    <p className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {seller.sellerProfile?.address?.phone || 'N/A'}</p>
                                </div>

                                {seller.isBanned && (
                                    <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded">
                                        <strong>Banned:</strong> {seller.banReason}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleVerify(seller._id, seller.sellerProfile?.isVerified, seller.sellerProfile?.shopName)}
                                        className={`py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${seller.sellerProfile?.isVerified
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                : 'bg-green-500 text-white hover:bg-green-600'
                                            }`}
                                    >
                                        <BadgeCheck size={16} />
                                        {seller.sellerProfile?.isVerified ? 'Verified ✓' : 'Verify'}
                                    </button>
                                    <button
                                        onClick={() => handleBan(seller._id, seller.isBanned, seller.sellerProfile?.shopName)}
                                        className={`py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${seller.isBanned
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200'
                                            }`}
                                    >
                                        {seller.isBanned ? <><UserCheck size={16} /> Unban</> : <><Ban size={16} /> Ban</>}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Sellers;
