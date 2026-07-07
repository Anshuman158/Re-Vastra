import { Hono } from 'hono';
import { generateId, authUser, sanitizeError, sanitizeInput } from '../middleware/auth.js';

const app = new Hono();

// ── Auth: Add review ───────────────────────────────────────────────
app.post('/add', authUser, async (c) => {
    try {
        const userId = c.get('userId'); // From auth token, NOT from request body
        const { orderId, rating, subRatings, comment, isAnonymous } = await c.req.json();

        if (!orderId || !rating) {
            return c.json({ success: false, message: 'Order ID and rating are required' }, 400);
        }

        // Validate rating range
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return c.json({ success: false, message: 'Rating must be between 1 and 5' }, 400);
        }

        // Check if order exists and belongs to the authenticated user
        const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
        if (!order) {
            return c.json({ success: false, message: 'Order not found' }, 404);
        }
        if (order.user_id !== userId) {
            return c.json({ success: false, message: 'You can only review your own orders' }, 403);
        }
        if (order.status !== 'Delivered') {
            return c.json({ success: false, message: 'Can only review after delivery' }, 400);
        }

        // Get seller from first item
        const firstItem = await c.env.DB.prepare('SELECT product_id FROM order_items WHERE order_id = ? LIMIT 1').bind(orderId).first();
        if (!firstItem) {
            return c.json({ success: false, message: 'No items found for this order' }, 404);
        }

        const product = await c.env.DB.prepare('SELECT user_id FROM products WHERE id = ?').bind(firstItem.product_id).first();
        if (!product) {
            return c.json({ success: false, message: 'Seller not found for this order' }, 404);
        }
        const sellerId = product.user_id;

        // Prevent duplicate reviews
        const existing = await c.env.DB.prepare('SELECT id FROM reviews WHERE order_id = ? AND reviewer_id = ?').bind(orderId, userId).first();
        if (existing) {
            return c.json({ success: false, message: 'You have already reviewed this order' }, 400);
        }

        // Create review with sanitized comment
        const reviewId = generateId();
        const cleanComment = sanitizeInput(comment) || '';
        if (cleanComment.length > 2000) {
            return c.json({ success: false, message: 'Review comment is too long (max 2000 characters)' }, 400);
        }

        await c.env.DB.prepare(
            `INSERT INTO reviews (id, order_id, reviewer_id, seller_id, rating, sub_ratings, comment, is_anonymous)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(reviewId, orderId, userId, sellerId, rating, JSON.stringify(subRatings || {}), cleanComment, isAnonymous ? 1 : 0).run();

        // Update seller's average rating
        const { results: allReviews } = await c.env.DB.prepare('SELECT rating FROM reviews WHERE seller_id = ?').bind(sellerId).all();
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        const seller = await c.env.DB.prepare('SELECT seller_profile FROM users WHERE id = ?').bind(sellerId).first();
        const sellerProfile = JSON.parse(seller.seller_profile || '{}');
        sellerProfile.rating = { average: Math.round(avgRating * 10) / 10, count: allReviews.length };

        await c.env.DB.prepare('UPDATE users SET seller_profile = ? WHERE id = ?')
            .bind(JSON.stringify(sellerProfile), sellerId).run();

        return c.json({ success: true, message: 'Review submitted successfully' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Public: Get seller reviews ─────────────────────────────────────
app.get('/seller/:sellerId', async (c) => {
    try {
        const sellerId = c.req.param('sellerId');

        const { results: reviews } = await c.env.DB.prepare(
            `SELECT r.*, u.name as reviewer_name 
             FROM reviews r 
             LEFT JOIN users u ON r.reviewer_id = u.id 
             WHERE r.seller_id = ? 
             ORDER BY r.created_at DESC 
             LIMIT 20`
        ).bind(sellerId).all();

        const formattedReviews = reviews.map(r => ({
            ...r, _id: r.id,
            sub_ratings: JSON.parse(r.sub_ratings || '{}'),
            reviewerName: r.is_anonymous ? 'Anonymous' : r.reviewer_name || 'User'
        }));

        return c.json({ success: true, reviews: formattedReviews });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Auth: Check if can review ──────────────────────────────────────
app.get('/can-review/:orderId', authUser, async (c) => {
    try {
        const orderId = c.req.param('orderId');
        const userId = c.get('userId'); // From auth token

        const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
        if (!order || order.user_id !== userId) {
            return c.json({ success: false, canReview: false });
        }

        const existing = await c.env.DB.prepare('SELECT id FROM reviews WHERE order_id = ? AND reviewer_id = ?').bind(orderId, userId).first();
        const canReview = order.status === 'Delivered' && !existing;

        return c.json({ success: true, canReview, hasReviewed: !!existing });
    } catch (error) {
        return c.json({ success: false, canReview: false });
    }
});

// ── Public: Get seller profile ─────────────────────────────────────
app.get('/profile/:sellerId', async (c) => {
    try {
        const sellerId = c.req.param('sellerId');

        const seller = await c.env.DB.prepare(
            'SELECT id, name, seller_profile, is_seller, created_at FROM users WHERE id = ?'
        ).bind(sellerId).first();

        if (!seller || !seller.is_seller) {
            return c.json({ success: false, message: 'Seller not found' }, 404);
        }

        const profile = JSON.parse(seller.seller_profile || '{}');
        const rentals = profile.totalRentals || 0;
        let badge = 'new';
        if (rentals >= 50) badge = 'top';
        else if (rentals >= 25) badge = 'popular';
        else if (rentals >= 5) badge = 'rising';

        return c.json({
            success: true,
            seller: {
                _id: seller.id, name: seller.name,
                shopName: profile.shopName || seller.name,
                isVerified: profile.isVerified || false,
                verificationDate: profile.verificationDate,
                totalRentals: rentals,
                avgResponseTime: profile.avgResponseTime || 0,
                memberSince: profile.memberSince || seller.created_at,
                rating: profile.rating || { average: 0, count: 0 },
                badge
            }
        });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

export default app;
