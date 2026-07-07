import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { Bell, Check, CheckCheck, Package, Truck, ShoppingBag, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Title from '../components/Title';

const Notifications = () => {
    const { backEndURL, token, navigate } = useContext(ShopContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${backEndURL}/api/notification/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchNotifications();
    }, [token]);

    const markAsRead = async (id) => {
        try {
            await axios.post(`${backEndURL}/api/notification/read`,
                { notificationIds: [id] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post(`${backEndURL}/api/notification/read`, {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) markAsRead(notification._id);
        if (notification.orderId) {
            if (notification.type === 'delivery') {
                navigate(`/invoice/${notification.orderId}`);
            } else {
                navigate('/orders');
            }
        }
    };

    const getTimeAgo = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const getIcon = (type) => {
        switch (type) {
            case 'delivery': return <Truck size={18} className="text-green-500" />;
            case 'order': return <Package size={18} className="text-primary-500" />;
            default: return <Bell size={18} className="text-neutral-400" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-24 pb-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Title text1="MY" text2="NOTIFICATIONS" />
                        {unreadCount > 0 && (
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors">
                            <CheckCheck size={16} /> Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-neutral-800 rounded-xl p-5 animate-pulse">
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                        <Bell size={48} className="mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-2">No notifications yet</h3>
                        <p className="text-neutral-500 dark:text-neutral-400">You'll get notified when there's an update to your orders.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map(notification => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all duration-200 border ${notification.isRead
                                        ? 'bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 hover:shadow-sm'
                                        : 'bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800 hover:shadow-md shadow-sm'
                                    }`}
                            >
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.isRead
                                        ? 'bg-neutral-100 dark:bg-neutral-700'
                                        : 'bg-primary-100 dark:bg-primary-900/50'
                                    }`}>
                                    {getIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`font-semibold text-sm ${notification.isRead
                                                ? 'text-neutral-700 dark:text-neutral-300'
                                                : 'text-neutral-900 dark:text-neutral-100'
                                            }`}>
                                            {notification.title}
                                        </p>
                                        <span className="text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                                            {getTimeAgo(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 ${notification.isRead
                                            ? 'text-neutral-500 dark:text-neutral-400'
                                            : 'text-neutral-700 dark:text-neutral-300'
                                        }`}>
                                        {notification.message}
                                    </p>
                                    {notification.type === 'delivery' && !notification.isRead && (
                                        <p className="text-xs text-primary-500 font-medium mt-2">📄 Tap to view invoice →</p>
                                    )}
                                </div>

                                {/* Unread dot */}
                                {!notification.isRead && (
                                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full shrink-0 mt-1.5"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
