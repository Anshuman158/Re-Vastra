import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { FileText, Download, ArrowLeft, Calendar, MapPin, Phone, User, Zap, Package } from 'lucide-react';

const Invoice = () => {
    const { orderId } = useParams();
    const { backEndURL, token, currency } = useContext(ShopContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.post(
                    `${backEndURL}/api/order/userorders`, {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data.success) {
                    const found = response.data.orders.find(o => o._id === orderId);
                    setOrder(found || null);
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchOrder();
    }, [token, orderId]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
                <div className="text-neutral-500 dark:text-neutral-400">Loading invoice...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 gap-4">
                <Package size={48} className="text-neutral-400" />
                <p className="text-neutral-500 dark:text-neutral-400">Order not found</p>
                <Link to="/orders" className="btn-primary">Back to Orders</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-24 pb-12 px-4">
            {/* Action buttons - hidden in print */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link to="/orders" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-500 transition-colors">
                    <ArrowLeft size={18} /> Back to Orders
                </Link>
                <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                    <Download size={18} /> Download Invoice
                </button>
            </div>

            {/* Invoice Card */}
            <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-soft border border-neutral-100 dark:border-neutral-700 overflow-hidden print:shadow-none print:border-none print:rounded-none">

                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white p-8 print:bg-red-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-display font-bold">ReVastra</h1>
                            <p className="text-primary-100 text-sm mt-1">Fashion Rental Platform</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <FileText size={24} /> INVOICE
                            </h2>
                            <p className="text-primary-100 text-sm mt-1">#{order._id?.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Order Info Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 border-b border-neutral-100 dark:border-neutral-700">
                    <div>
                        <p className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-1 flex items-center gap-1">
                            <Calendar size={12} /> Order Date
                        </p>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">{formatDate(order.date)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-1 flex items-center gap-1">
                            <Calendar size={12} /> Rental Period
                        </p>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {formatDate(order.rentalStartDate)} — {formatDate(order.rentalEndDate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                }`}>{order.status}</span>
                            {order.urgentOrder === 1 && (
                                <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                    <Zap size={10} /> Urgent
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="p-8 border-b border-neutral-100 dark:border-neutral-700">
                    <h3 className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-3 flex items-center gap-1">
                        <User size={12} /> Billed To
                    </h3>
                    <p className="font-bold text-lg text-neutral-800 dark:text-neutral-200">{order.address?.fullName}</p>
                    <p className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {order.address?.hostel}, {order.address?.block}, Room {order.address?.room}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1 mt-1">
                        <Phone size={14} /> {order.address?.phone}
                    </p>
                </div>

                {/* Items Table */}
                <div className="p-8 border-b border-neutral-100 dark:border-neutral-700">
                    <h3 className="text-xs font-bold uppercase text-neutral-400 dark:text-neutral-500 mb-4 flex items-center gap-1">
                        <Package size={12} /> Items
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-600">
                                    <th className="text-left py-3 font-semibold text-neutral-600 dark:text-neutral-400">Item</th>
                                    <th className="text-center py-3 font-semibold text-neutral-600 dark:text-neutral-400">Size</th>
                                    <th className="text-center py-3 font-semibold text-neutral-600 dark:text-neutral-400">Duration</th>
                                    <th className="text-center py-3 font-semibold text-neutral-600 dark:text-neutral-400">Rate/Day</th>
                                    <th className="text-right py-3 font-semibold text-neutral-600 dark:text-neutral-400">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, idx) => (
                                    <tr key={idx} className="border-b border-neutral-100 dark:border-neutral-700">
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                {item.image?.[0] && (
                                                    <img src={item.image[0]} alt={item.name} className="w-10 h-10 rounded-lg object-cover print:hidden" />
                                                )}
                                                <span className="font-medium text-neutral-800 dark:text-neutral-200">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-center text-neutral-600 dark:text-neutral-400">{item.size}</td>
                                        <td className="text-center text-neutral-600 dark:text-neutral-400">{item.duration || 1} days</td>
                                        <td className="text-center text-neutral-600 dark:text-neutral-400">{currency}{item.rental_price}</td>
                                        <td className="text-right font-semibold text-neutral-800 dark:text-neutral-200">
                                            {currency}{((item.rental_price || 0) * (item.duration || 1)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Charges Summary */}
                <div className="p-8">
                    <div className="max-w-xs ml-auto space-y-3">
                        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                            <span>Rental Subtotal</span>
                            <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                {currency}{(order.amount - (order.washing_fee || 0) - (order.delivery_fee || 0) - (order.urgent_fee || 0)).toFixed(2)}
                            </span>
                        </div>
                        {order.delivery_fee > 0 && (
                            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                                <span>🚚 Platform Charge</span>
                                <span>{currency}{order.delivery_fee}</span>
                            </div>
                        )}
                        {order.washing_fee > 0 && (
                            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                                <span>🧺 Washing Fee</span>
                                <span>{currency}{order.washing_fee}</span>
                            </div>
                        )}
                        {order.urgent_fee > 0 && (
                            <div className="flex justify-between text-sm text-yellow-600 dark:text-yellow-400">
                                <span>⚡ Urgent Delivery Fee</span>
                                <span>{currency}{order.urgent_fee}</span>
                            </div>
                        )}
                        {order.security_deposit > 0 && (
                            <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                                <span>🛡️ Security Deposit (refundable)</span>
                                <span>{currency}{order.security_deposit}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-3 border-t border-neutral-200 dark:border-neutral-600">
                            <span className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Total</span>
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{currency}{order.amount}</span>
                        </div>
                        <div className="text-xs text-neutral-400 dark:text-neutral-500 text-right">
                            Payment: {order.payment ? 'Paid' : 'Cash on Delivery'}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-neutral-50 dark:bg-neutral-900 p-6 text-center text-xs text-neutral-400 dark:text-neutral-500 border-t border-neutral-100 dark:border-neutral-700">
                    <p className="font-semibold mb-1">Thank you for renting with ReVastra!</p>
                    <p>This is a computer-generated invoice. For queries, contact us at revastra.online</p>
                    <p className="mt-2">© {new Date().getFullYear()} ReVastra — Campus Fashion Rental</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
