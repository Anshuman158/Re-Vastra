import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { authUser, sanitizeInput, sanitizeError } from '../middleware/auth.js';

const router = express.Router();

// ── Auth: Add review ───────────────────────────────────────────────
router.post('/add', authUser, async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId, rating, subRatings, comment, isAnonymous } = req.body;

        if (!orderId || !rating) {
            return res.status(400).json({ success: false, message: 'Order ID and rating are required' });
        }

        const numRating = Number(rating);
        if (numRating < 1 || numRating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'You can only review your own orders' });
        }

        if (order.status !== 'Delivered') {
            return res.status(400).json({ success: false, message: 'Can only review after delivery' });
        }

        if (!order.items || order.items.length === 0) {
            return res.status(404).json({ success: false, message: 'No items found for this order' });
        }

        const firstProductId = order.items[0].productId;
        const product = await Product.findById(firstProductId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Seller not found for this order' });
        }

        const sellerId = product.userId;

        // Prevent duplicate reviews
        const existing = await Review.findOne({ orderId, reviewerId: userId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this order' });
        }

        const cleanComment = sanitizeInput(comment) || '';
        if (cleanComment.length > 2000) {
            return res.status(400).json({ success: false, message: 'Review comment is too long (max 2000 characters)' });
        }

        await Review.create({
            orderId,
            reviewerId: userId,
            sellerId,
            rating: numRating,
            subRatings: subRatings || {},
            comment: cleanComment,
            isAnonymous: Boolean(isAnonymous)
        });

        // Update seller's average rating
        const allReviews = await Review.find({ sellerId }).select('rating');
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        const seller = await User.findById(sellerId);
        if (seller) {
            const profile = seller.sellerProfile || {};
            profile.rating = {
                average: Math.round(avgRating * 10) / 10,
                count: allReviews.length
            };
            seller.sellerProfile = profile;
            seller.markModified('sellerProfile');
            await seller.save();
        }

        return res.json({ success: true, message: 'Review submitted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Public: Get seller reviews ─────────────────────────────────────
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(404).json({ success: false, message: 'Invalid seller ID' });
        }

        const reviews = await Review.find({ sellerId })
            .populate('reviewerId', 'name')
            .sort({ createdAt: -1 })
            .limit(20);

        const formatted = reviews.map(r => {
            const reviewerName = r.reviewerId?.name || 'User';
            return r.toClientJSON(reviewerName);
        });

        return res.json({ success: true, reviews: formatted });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Auth: Check if user can review order ───────────────────────────
router.get('/can-review/:orderId', authUser, async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.json({ success: false, canReview: false });
        }

        const order = await Order.findById(orderId);
        if (!order || order.userId.toString() !== userId.toString()) {
            return res.json({ success: false, canReview: false });
        }

        const existing = await Review.findOne({ orderId, reviewerId: userId });
        const canReview = order.status === 'Delivered' && !existing;

        return res.json({ success: true, canReview, hasReviewed: Boolean(existing) });
    } catch {
        return res.json({ success: false, canReview: false });
    }
});

// ── Public: Get seller public profile ──────────────────────────────
router.get('/profile/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        const seller = await User.findOne({ _id: sellerId, isSeller: true });
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        const profile = seller.sellerProfile || {};
        const rentals = profile.totalRentals || 0;

        let badge = 'new';
        if (rentals >= 50) badge = 'top';
        else if (rentals >= 25) badge = 'popular';
        else if (rentals >= 5) badge = 'rising';

        return res.json({
            success: true,
            seller: {
                _id: seller._id.toString(),
                name: seller.name,
                shopName: profile.shopName || seller.name,
                isVerified: profile.isVerified || false,
                verificationDate: profile.verificationDate,
                totalRentals: rentals,
                avgResponseTime: profile.avgResponseTime || 0,
                memberSince: profile.memberSince || seller.createdAt,
                rating: profile.rating || { average: 0, count: 0 },
                badge
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

export default router;
