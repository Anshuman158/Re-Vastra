import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { authUser, checkBanned, sanitizeError } from '../middleware/auth.js';

const router = express.Router();

// ── Add to cart ────────────────────────────────────────────────────
router.post('/add', authUser, checkBanned, async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId, size } = req.body;

        if (!itemId || !size) {
            return res.status(400).json({ success: false, message: 'Item ID and size are required.' });
        }

        // Check if product exists and is available
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = await Product.findById(itemId);
        if (!product || !product.isActive) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        if (product.status !== 'available') {
            return res.status(400).json({
                success: false,
                message: `Sorry, "${product.name}" is currently unavailable for rent.`
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const cartData = user.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = { [size]: 1 };
        }

        user.cartData = cartData;
        user.markModified('cartData');
        await user.save();

        return res.json({ success: true, message: 'Added To Cart' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Update cart ───────────────────────────────────────────────────
router.post('/update', authUser, checkBanned, async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId, size, duration } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const cartData = user.cartData || {};

        if (cartData[itemId]) {
            if (Number(duration) <= 0) {
                delete cartData[itemId][size];
                if (Object.keys(cartData[itemId]).length === 0) {
                    delete cartData[itemId];
                }
            } else {
                cartData[itemId][size] = Number(duration);
            }
        }

        user.cartData = cartData;
        user.markModified('cartData');
        await user.save();

        return res.json({ success: true, message: 'Cart Updated' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Get cart ──────────────────────────────────────────────────────
router.post('/get', authUser, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('cartData');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.json({ success: true, cartData: user.cartData || {} });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

export default router;
