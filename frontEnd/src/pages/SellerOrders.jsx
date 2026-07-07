import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Package, Clock, CheckCircle } from 'lucide-react';

const SellerOrders = () => {
    const { backEndURL, token } = useContext(ShopContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellerOrders = async () => {
        try {
            const response = await axios.post(
                backEndURL + '/api/order/seller-orders',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setOrders(response.data.orders);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load your orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchSellerOrders();
        }
    }, [token]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="container-custom py-12 min-h-screen">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Package className="text-primary-500" /> Incoming Rentals (To Pack)
            </h2>

            {orders.length === 0 ? (
                <div className="text-center bg-neutral-50 dark:bg-neutral-800 p-12 rounded-2xl">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-xl text-gray-500">No rental requests yet.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order, index) => (
                        <div key={index} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 flex flex-col md:flex-row gap-6 items-start">
                            <img
                                src={order.productImage}
                                alt={order.productName}
                                className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                            />

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{order.productName}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div>
                                        <p className="font-semibold text-gray-500">Size</p>
                                        <p>{order.size}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-500">Quantity</p>
                                        <p>{order.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-500">Duration</p>
                                        <p>{order.duration} Days</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-500">Order Date</p>
                                        <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3">
                                    <CheckCircle size={20} className="text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-blue-700 dark:text-blue-300">Action Required</p>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">{order.message}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
