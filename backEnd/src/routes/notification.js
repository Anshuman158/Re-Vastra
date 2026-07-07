import { Hono } from 'hono';
import { authUser, sanitizeError } from '../middleware/auth.js';

const app = new Hono();

// ── Auth: Get notifications ───────────────────────────────────────
app.get('/list', authUser, async (c) => {
    try {
        const userId = c.get('userId');
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
        ).bind(userId).all();

        const notifications = results.map(n => ({
            _id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            orderId: n.order_id,
            isRead: n.is_read === 1,
            createdAt: n.created_at
        }));

        return c.json({ success: true, notifications });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Auth: Get unread count ────────────────────────────────────────
app.get('/unread-count', authUser, async (c) => {
    try {
        const userId = c.get('userId');
        const result = await c.env.DB.prepare(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0'
        ).bind(userId).first();

        return c.json({ success: true, count: result?.count || 0 });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Auth: Mark notifications as read ──────────────────────────────
app.post('/read', authUser, async (c) => {
    try {
        const userId = c.get('userId');
        const { notificationIds } = await c.req.json();

        if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
            // Mark specific notifications as read
            const placeholders = notificationIds.map(() => '?').join(',');
            await c.env.DB.prepare(
                `UPDATE notifications SET is_read = 1 WHERE id IN (${placeholders}) AND user_id = ?`
            ).bind(...notificationIds, userId).run();
        } else {
            // Mark all as read
            await c.env.DB.prepare(
                'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0'
            ).bind(userId).run();
        }

        return c.json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

export default app;
