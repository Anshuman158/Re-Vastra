import { Hono } from 'hono';
import { adminAuth, sanitizeError } from '../middleware/auth.js';

const app = new Hono();

// Admin: Get platform statistics
app.get('/stats', adminAuth, async (c) => {
    try {
        const usersResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
        const productsResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').first();
        const ordersResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM orders').first();
        const deliveredResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'Delivered'").first();
        const pendingResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status != 'Delivered'").first();
        const revenueResult = await c.env.DB.prepare('SELECT COALESCE(SUM(amount), 0) as total_revenue FROM orders').first();

        return c.json({
            success: true,
            stats: {
                users: usersResult?.count || 0,
                products: productsResult?.count || 0,
                orders: ordersResult?.count || 0,
                deliveredOrders: deliveredResult?.count || 0,
                pendingOrders: pendingResult?.count || 0,
                totalRevenue: revenueResult?.total_revenue || 0
            }
        });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

export default app;
