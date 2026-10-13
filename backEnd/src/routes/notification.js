import express from 'express';
import Notification from '../models/Notification.js';
import { authUser, sanitizeError } from '../middleware/auth.js';

const router = express.Router();

// ── Auth: Get notifications ───────────────────────────────────────
router.get('/list', authUser, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const formatted = notifications.map(n => n.toClientJSON());

        return res.json({ success: true, notifications: formatted });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Auth: Get unread count ────────────────────────────────────────
router.get('/unread-count', authUser, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.userId,
            isRead: false
        });

        return res.json({ success: true, count });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Auth: Mark notifications as read ──────────────────────────────
router.post('/read', authUser, async (req, res) => {
    try {
        const userId = req.userId;
        const { notificationIds } = req.body;

        if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
            await Notification.updateMany(
                { _id: { $in: notificationIds }, userId },
                { isRead: true }
            );
        } else {
            await Notification.updateMany(
                { userId, isRead: false },
                { isRead: true }
            );
        }

        return res.json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

export default router;
