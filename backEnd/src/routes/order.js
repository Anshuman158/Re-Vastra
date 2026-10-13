import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authUser, adminAuth, checkBanned, sanitizeError } from '../middleware/auth.js';

const router = express.Router();

const URGENT_FEE = 100;

// Helper: create a notification
const createNotification = async (userId, title, message, type = 'order', orderId = null) => {
    try {
        await Notification.create({
            userId,
            title,
            message,
            type,
            orderId: orderId ? orderId.toString() : null
        });
    } catch (e) {
        console.error('Failed to create notification:', e);
    }
};

const STATUS_MESSAGES = {
    'Order Placed': { title: '📦 Order Confirmed', message: 'Your order has been placed successfully!' },
    'Processing': { title: '⚙️ Order Processing', message: 'Your order is being processed.' },
    'Packing': { title: '📦 Packing Your Order', message: 'Your items are being packed and prepared for shipment.' },
    'Shipped': { title: '🚚 Order Shipped', message: 'Your order has been shipped and is on its way!' },
    'Out for Delivery': { title: '🏍️ Out for Delivery', message: 'Your order is out for delivery. Please be available to receive it.' },
    'Out for delivery': { title: '🏍️ Out for Delivery', message: 'Your order is out for delivery. Please be available to receive it.' },
    'Delivered': { title: '✅ Order Delivered', message: 'Your order has been delivered! You can now view and download your invoice from the Orders page.' },
    'Cancelled': { title: '❌ Order Cancelled', message: 'Your order has been cancelled.' },
    'Returned': { title: '🔄 Order Returned', message: 'Your order return has been processed.' }
};

// ── Auth: Place order ──────────────────────────────────────────────
router.post('/place', authUser, checkBanned, async (req, res) => {
    try {
        const userId = req.userId;
        const body = req.body;

        const {
            amount,
            items,
            address,
            washingFee,
            deliveryFee,
            securityDeposit,
            rentalStartDate,
            rentalEndDate,
            deliveryDate,
            urgentOrder,
            pricingBreakdown
        } = body;

        if (!amount || !items || !address) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
        }

        if (items.length > 50) {
            return res.status(400).json({ success: false, message: 'Too many items in order.' });
        }

        const numericAmount = Number(amount);
        if (numericAmount <= 0 || numericAmount > 10000000) {
            return res.status(400).json({ success: false, message: 'Invalid order amount.' });
        }

        // Validate that all items are active and available
        const unavailableItems = [];
        for (const item of items) {
            const itemId = item._id || item.productId;
            if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
                unavailableItems.push({ name: item.name || 'Unknown', reason: 'invalid item' });
                continue;
            }

            const product = await Product.findById(itemId);
            if (!product || !product.isActive) {
                unavailableItems.push({ name: item.name || 'Unknown Product', reason: 'not found' });
            } else if (product.status !== 'available') {
                unavailableItems.push({ name: product.name, reason: 'unavailable' });
            }
        }

        if (unavailableItems.length > 0) {
            const names = unavailableItems.map(i => `"${i.name}"`).join(', ');
            return res.status(400).json({
                success: false,
                message: `Cannot place order. The following item(s) are no longer available: ${names}. Please remove them from your cart and try again.`
            });
        }

        const urgentFee = urgentOrder ? URGENT_FEE : 0;

        const formattedItems = items.map(item => ({
            productId: item._id || item.productId,
            name: item.name,
            image: Array.isArray(item.image) ? item.image : (item.image ? [item.image] : []),
            size: item.size || '',
            quantity: Number(item.quantity) || 1,
            duration: Number(item.duration) || 1,
            rentalPrice: Number(item.rental_price || item.rentalPrice) || 0
        }));

        const newOrder = await Order.create({
            userId,
            items: formattedItems,
            amount: numericAmount,
            address,
            status: 'Order Placed',
            paymentMethod: 'COD',
            payment: false,
            washingFee: Number(washingFee) || 0,
            deliveryFee: Number(deliveryFee) || 0,
            securityDeposit: Number(securityDeposit) || 0,
            rentalStartDate: rentalStartDate || null,
            rentalEndDate: rentalEndDate || null,
            deliveryDate: deliveryDate || null,
            urgentOrder: Boolean(urgentOrder),
            urgentFee,
            pricingBreakdown: pricingBreakdown || null
        });

        // Clear user cart
        await User.findByIdAndUpdate(userId, { cartData: {} });

        // Auto-create confirmation notification for buyer
        const orderShortId = newOrder._id.toString().slice(-8);
        await createNotification(
            userId,
            '📦 Order Confirmed',
            `Your order #${orderShortId} has been placed successfully! ${urgentOrder ? '⚡ Urgent delivery requested.' : ''}`,
            'order',
            newOrder._id.toString()
        );

        return res.json({ success: true, message: 'Order Placed Successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Admin: Get all orders ──────────────────────────────────────────
router.post('/list', adminAuth, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        const formatted = orders.map(o => o.toClientJSON());

        return res.json({ success: true, orders: formatted });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Auth: Get user orders ──────────────────────────────────────────
router.post('/userorders', authUser, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
        const formatted = orders.map(o => o.toClientJSON());

        return res.json({ success: true, orders: formatted });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Admin: Update order status ─────────────────────────────────────
router.post('/status', adminAuth, async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: 'Order ID and status are required.' });
        }

        const validStatuses = [
            'Order Placed',
            'Processing',
            'Packing',
            'Shipped',
            'Out for Delivery',
            'Out for delivery',
            'Delivered',
            'Cancelled',
            'Returned'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid order status.' });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        order.status = status;
        await order.save();

        // Notify user about status change
        const statusMsg = STATUS_MESSAGES[status];
        if (statusMsg && order.userId) {
            const urgentNote = order.urgentOrder ? ' ⚡ Urgent' : '';
            await createNotification(
                order.userId,
                statusMsg.title + urgentNote,
                `${statusMsg.message} (Order #${order._id.toString().slice(-8)})`,
                status.toLowerCase().includes('delivered') ? 'delivery' : 'order',
                order._id.toString()
            );
        }

        return res.json({ success: true, message: 'Status Updated' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Auth: Get user earnings ────────────────────────────────────────
router.post('/my_earning', authUser, async (req, res) => {
    try {
        const userId = req.userId;

        // Find products belonging to this seller
        const userProducts = await Product.find({ userId }).select('_id name');
        const productIds = userProducts.map(p => p._id);

        if (productIds.length === 0) {
            return res.json({
                success: true,
                earnings: [],
                summary: {
                    totalEarnings: '0.00',
                    pendingEarnings: '0.00',
                    completedEarnings: '0.00',
                    totalOrders: 0
                }
            });
        }

        // Find all orders containing any of these products
        const orders = await Order.find({ 'items.productId': { $in: productIds } }).sort({ createdAt: -1 });

        const earnings = [];
        let totalEarnings = 0;
        let pendingEarnings = 0;
        let completedEarnings = 0;

        const prodIdSet = new Set(productIds.map(id => id.toString()));

        for (const order of orders) {
            for (const item of order.items) {
                if (item.productId && prodIdSet.has(item.productId.toString())) {
                    const itemDuration = item.duration || 1;
                    const itemRentalPrice = item.rentalPrice || 0;
                    const itemEarning = itemRentalPrice * itemDuration;
                    const platformCharge = itemEarning * 0.15;
                    const netEarning = itemEarning - platformCharge;

                    earnings.push({
                        orderId: order._id.toString(),
                        productId: item.productId.toString(),
                        productName: item.name,
                        productImage: (item.image && item.image[0]) || '',
                        size: item.size,
                        duration: itemDuration,
                        grossAmount: itemEarning,
                        platformFee: platformCharge.toFixed(2),
                        netEarning: netEarning.toFixed(2),
                        status: order.status || 'Processing',
                        orderDate: order.createdAt,
                        buyerAddress: order.address || {}
                    });

                    totalEarnings += netEarning;
                    if (order.status === 'Delivered') {
                        completedEarnings += netEarning;
                    } else {
                        pendingEarnings += netEarning;
                    }
                }
            }
        }

        earnings.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        return res.json({
            success: true,
            earnings,
            summary: {
                totalEarnings: totalEarnings.toFixed(2),
                pendingEarnings: pendingEarnings.toFixed(2),
                completedEarnings: completedEarnings.toFixed(2),
                totalOrders: earnings.length
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Auth: Get seller orders ────────────────────────────────────────
router.post('/seller-orders', authUser, async (req, res) => {
    try {
        const userId = req.userId;

        const sellerProducts = await Product.find({ userId }).select('_id');
        const productIds = sellerProducts.map(p => p._id);

        if (productIds.length === 0) {
            return res.json({ success: true, orders: [] });
        }

        const prodIdSet = new Set(productIds.map(id => id.toString()));
        const orders = await Order.find({ 'items.productId': { $in: productIds } }).sort({ createdAt: -1 });

        const sellerOrders = [];

        for (const order of orders) {
            for (const item of order.items) {
                if (item.productId && prodIdSet.has(item.productId.toString())) {
                    sellerOrders.push({
                        orderId: order._id.toString(),
                        productName: item.name,
                        productImage: (item.image && item.image[0]) || '',
                        size: item.size,
                        quantity: item.quantity,
                        duration: item.duration || 1,
                        orderDate: order.createdAt,
                        status: order.status,
                        payment: order.payment,
                        message: 'Please pack this item and mark as ready.'
                    });
                }
            }
        }

        return res.json({ success: true, orders: sellerOrders });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

export default router;
