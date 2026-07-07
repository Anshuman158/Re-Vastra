import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DollarSign, Package, Clock, TrendingUp, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { ProductSkeleton } from '../components/Skeleton';

const Earning = () => {
    const { backEndURL, token, currency } = useContext(ShopContext);
    const [earnings, setEarnings] = useState([]);
    const [summary, setSummary] = useState({
        totalEarnings: "0.00",
        pendingEarnings: "0.00",
        completedEarnings: "0.00",
        totalOrders: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadEarningData = async () => {
        try {
            if (!token) return;

            setLoading(true);
            setError(null);

            const response = await axios.post(
                `${backEndURL}/api/order/my_earning`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setEarnings(response.data.earnings || []);
                setSummary(response.data.summary || {
                    totalEarnings: "0.00",
                    pendingEarnings: "0.00",
                    completedEarnings: "0.00",
                    totalOrders: 0
                });
            } else {
                setError(response.data.message || 'Failed to fetch earnings.');
            }
        } catch (err) {
            console.error(err);
            setError('Error fetching earnings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEarningData();
    }, [token]);

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-700 flex items-start justify-between group hover:shadow-medium transition-all duration-300">
            <div>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mb-1">{title}</p>
                <h3 className="text-2xl font-display font-bold text-neutral-800 dark:text-neutral-200">{value}</h3>
                {subtext && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-lg text-neutral-800 font-medium mb-2">{error}</p>
                <button onClick={loadEarningData} className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">Try Again</button>
            </div>
        );
    }

    return (
        <div className='container-custom pt-10 pb-20'>
            <div className='flex justify-between items-center mb-10'>
                <Title text1={'MY'} text2={'EARNINGS'} />
                <button
                    onClick={loadEarningData}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-primary-500 transition-all shadow-sm"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Earnings"
                    value={`${currency}${summary.totalEarnings}`}
                    subtext="Net profit after fees"
                    icon={DollarSign}
                    colorClass="bg-green-500 shadow-green-200"
                />
                <StatCard
                    title="Completed"
                    value={`${currency}${summary.completedEarnings}`}
                    subtext="Paid out earnings"
                    icon={TrendingUp}
                    colorClass="bg-blue-500 shadow-blue-200"
                />
                <StatCard
                    title="Pending"
                    value={`${currency}${summary.pendingEarnings}`}
                    subtext="Orders in progress"
                    icon={Clock}
                    colorClass="bg-amber-500 shadow-amber-200"
                />
                <StatCard
                    title="Total Orders"
                    value={summary.totalOrders}
                    subtext="Items rented out"
                    icon={Package}
                    colorClass="bg-purple-500 shadow-purple-200"
                />
            </div>

            {/* Earnings List */}
            <h3 className="text-xl font-display font-semibold text-neutral-800 dark:text-neutral-200 mb-6">Rental History</h3>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <ProductSkeleton key={i} />)}
                </div>
            ) : earnings.length === 0 ? (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-12 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                        <DollarSign size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-2">No earnings yet</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">When users rent your listed items, your earnings will appear here. Start listing today!</p>
                    <a href="/lend" className="btn-primary inline-flex items-center gap-2">
                        List Your First Item
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {earnings.map((earning, index) => (
                        <div key={index} className="bg-white dark:bg-neutral-800 rounded-xl shadow-soft hover:shadow-medium border border-neutral-100 dark:border-neutral-700 p-5 transition-all duration-300 group">
                            <div className="flex gap-4 mb-4">
                                <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                                    {earning.productImage ? (
                                        <img src={earning.productImage} alt={earning.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400"><Package size={20} /></div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1">{earning.productName}</h4>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                        <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">Size: {earning.size}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {earning.duration} days</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm border-t border-dashed border-neutral-200 dark:border-neutral-700 pt-4">
                                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                                    <span>Rent Amount</span>
                                    <span>{currency}{earning.grossAmount}</span>
                                </div>
                                <div className="flex justify-between text-red-400 text-xs">
                                    <span>Platform Fee</span>
                                    <span>-{currency}{earning.platformFee}</span>
                                </div>
                                <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg mt-2">
                                    <span className="font-semibold text-green-700">Net Earning</span>
                                    <span className="font-bold text-green-700 text-lg">{currency}{earning.netEarning}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${earning.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                                    earning.status === 'Order Placed' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                        'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}>
                                    {earning.status}
                                </span>
                                <span className="text-[10px] text-neutral-400 font-medium">{new Date(earning.orderDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Earning;
