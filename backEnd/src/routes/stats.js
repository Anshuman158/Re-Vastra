import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { adminAuth, sanitizeError } from '../middleware/auth.js';

const router = express.Router();

// ── Admin: Get platform statistics ─────────────────────────────────
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const [
            usersCount,
            productsCount,
            ordersCount,
            deliveredOrdersCount,
            pendingOrdersCount,
            revenueResult
        ] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments({ isActive: true }),
            Order.countDocuments(),
            Order.countDocuments({ status: 'Delivered' }),
            Order.countDocuments({ status: { $ne: 'Delivered' } }),
            Order.aggregate([
                { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
            ])
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        return res.json({
            success: true,
            stats: {
                users: usersCount,
                products: productsCount,
                orders: ordersCount,
                deliveredOrders: deliveredOrdersCount,
                pendingOrders: pendingOrdersCount,
                totalRevenue
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

export default router;
