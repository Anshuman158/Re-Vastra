import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { authUser, adminAuth, checkBanned, verifyToken, sanitizeInput, sanitizeError } from '../middleware/auth.js';
import { upload, uploadFileToCloudinary } from '../middleware/multer.js';

const router = express.Router();

// Helper: build map of seller info for products
async function buildSellerMap(products) {
    const sellerIds = [...new Set(products.map(p => p.userId?.toString()).filter(Boolean))];
    const sellerMap = {};

    if (sellerIds.length > 0) {
        const sellers = await User.find({ _id: { $in: sellerIds } }).select('name sellerProfile createdAt');
        sellers.forEach(s => {
            const profile = s.sellerProfile || {};
            sellerMap[s._id.toString()] = {
                _id: s._id.toString(),
                name: s.name,
                shopName: profile.shopName || s.name,
                isVerified: profile.isVerified || false,
                rating: profile.rating || { average: 0, count: 0 },
                totalRentals: profile.totalRentals || 0,
                memberSince: profile.memberSince || s.createdAt
            };
        });
    }

    return sellerMap;
}

// Flexible auth middleware that accepts either standard User auth or Admin auth
async function flexibleUserOrAdminAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.headers.token) {
            token = req.headers.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Token missing.' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        }

        if (decoded.role === 'admin') {
            // Find or use default system admin user ID
            let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@revastra.com' });
            if (!adminUser) {
                adminUser = await User.findOne();
            }
            req.userId = adminUser?._id?.toString() || new mongoose.Types.ObjectId().toString();
            req.isAdmin = true;
            return next();
        }

        if (decoded.id) {
            req.userId = decoded.id;
            return next();
        }

        return res.status(401).json({ success: false, message: 'Invalid token structure.' });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Authentication failed.' });
    }
}

// ── Public: List all active products ───────────────────────────────
router.get('/list', async (req, res) => {
    try {
        const bannedUsers = await User.find({ isBanned: true }).select('_id');
        const bannedIds = bannedUsers.map(u => u._id);

        const products = await Product.find({
            isActive: true,
            userId: { $nin: bannedIds }
        }).sort({
            status: 1, // 'available' comes first alphabetically before 'out_of_stock'/'rented'
            createdAt: -1
        });

        const sellerMap = await buildSellerMap(products);
        const formatted = products.map(p => p.toClientJSON(sellerMap[p.userId?.toString()]));

        return res.json({ success: true, products: formatted });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Public: Get single product ─────────────────────────────────────
router.get('/single/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const seller = await User.findById(product.userId).select('name sellerProfile createdAt');
        const profile = seller?.sellerProfile || {};
        const sellerInfo = seller ? {
            _id: seller._id.toString(),
            name: seller.name,
            shopName: profile.shopName || seller.name,
            isVerified: profile.isVerified || false,
            rating: profile.rating || { average: 0, count: 0 },
            totalRentals: profile.totalRentals || 0,
            memberSince: profile.memberSince || seller.createdAt
        } : null;

        return res.json({ success: true, product: product.toClientJSON(sellerInfo) });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Add product (supports both multipart FormData & application/json) ─
router.post(
    '/add',
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 }
    ]),
    flexibleUserOrAdminAuth,
    checkBanned,
    async (req, res) => {
        try {
            const userId = req.userId;
            const body = req.body;

            let {
                name,
                price,
                description,
                rental_price,
                rentalPrice,
                category,
                subCategory,
                sub_category,
                sizes,
                contactno,
                contactNo,
                contact_no,
                pickuplocation,
                pickupLocation,
                pickup_location,
                bestSeller,
                bestseller,
                best_seller,
                images
            } = body;

            name = sanitizeInput(name);
            description = sanitizeInput(description);
            category = sanitizeInput(category);
            const actualSubCategory = sanitizeInput(subCategory || sub_category || '');
            const actualPickupLocation = sanitizeInput(pickuplocation || pickupLocation || pickup_location);
            const actualContactNo = sanitizeInput(contactno || contactNo || contact_no);
            const actualRentalPrice = Number(rental_price || rentalPrice);
            const actualPrice = Number(price);
            const isBestSeller = bestSeller === 'true' || bestSeller === true || bestseller === true || best_seller === 1;

            if (!name || !description || !actualPrice || !category || !sizes || !actualRentalPrice || !actualContactNo || !actualPickupLocation) {
                return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
            }

            if (name.length > 200 || description.length > 5000) {
                return res.status(400).json({ success: false, message: 'Name or description is too long.' });
            }

            if (actualPrice <= 0 || actualRentalPrice <= 0 || actualPrice > 10000000 || actualRentalPrice > 10000000) {
                return res.status(400).json({ success: false, message: 'Invalid price value.' });
            }

            // Parse sizes
            let parsedSizes = [];
            if (Array.isArray(sizes)) {
                parsedSizes = sizes;
            } else if (typeof sizes === 'string') {
                try {
                    parsedSizes = JSON.parse(sizes);
                } catch {
                    parsedSizes = sizes.split(',').map(s => s.trim()).filter(Boolean);
                }
            }

            // Gather images from uploaded files or JSON payload
            const imageArray = [];

            // If files were uploaded via multer (e.g. from Admin portal)
            if (req.files) {
                const fileKeys = ['image1', 'image2', 'image3', 'image4'];
                for (const key of fileKeys) {
                    if (req.files[key] && req.files[key][0]) {
                        const file = req.files[key][0];
                        const url = await uploadFileToCloudinary(file.path);
                        if (url) imageArray.push(url);
                    }
                }
            }

            // If JSON images array was sent (e.g. from Storefront Lend form)
            if (images) {
                const rawImages = Array.isArray(images) ? images : [images];
                rawImages.forEach(img => {
                    if (img && typeof img === 'string') imageArray.push(img);
                });
            }

            if (imageArray.length === 0) {
                return res.status(400).json({ success: false, message: 'Please provide at least one product image.' });
            }

            if (imageArray.length > 10) {
                return res.status(400).json({ success: false, message: 'Maximum 10 images allowed.' });
            }

            const newProduct = await Product.create({
                userId,
                name,
                description,
                price: actualPrice,
                rentalPrice: actualRentalPrice,
                image: imageArray,
                category,
                subCategory: actualSubCategory,
                sizes: parsedSizes,
                bestSeller: isBestSeller,
                pickupLocation: actualPickupLocation,
                contactNo: actualContactNo,
                status: 'available',
                isActive: true
            });

            return res.json({
                success: true,
                message: 'Product added successfully',
                product: newProduct.toClientJSON()
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: sanitizeError(error) });
        }
    }
);

// ── Auth: Get user's active products (POST & GET) ───────────────────
const getMyProductsHandler = async (req, res) => {
    try {
        const products = await Product.find({ userId: req.userId, isActive: true }).sort({ createdAt: -1 });
        const formatted = products.map(p => p.toClientJSON());
        return res.json({ success: true, products: formatted });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
};

router.post('/myproducts', authUser, getMyProductsHandler);
router.get('/my-product', authUser, getMyProductsHandler);

// ── Auth: Soft-delete user's own product ───────────────────────────
const deleteUserProductHandler = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = await Product.findOne({ _id: id, isActive: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        if (product.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own products.' });
        }

        product.isActive = false;
        await product.save();

        return res.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
};

router.delete('/my-product/:id', authUser, checkBanned, deleteUserProductHandler);
router.delete('/user/:id', authUser, checkBanned, deleteUserProductHandler);

// ── Auth: Update product status (available / out_of_stock) ──────────
router.put('/status/:id', authUser, checkBanned, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['available', 'out_of_stock'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = await Product.findOne({ _id: id, isActive: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ success: false, message: 'You can only update your own products' });
        }

        product.status = status;
        await product.save();

        return res.json({
            success: true,
            message: 'Product status updated',
            product: product.toClientJSON()
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Admin: Soft-delete product ─────────────────────────────────────
router.post('/remove', adminAuth, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Valid Product ID is required' });
        }

        const product = await Product.findOne({ _id: id, isActive: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.isActive = false;
        await product.save();

        return res.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Admin: Update product status ───────────────────────────────────
router.put('/update-status/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['available', 'out_of_stock'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.status = status;
        await product.save();

        return res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Admin: List all deleted products ───────────────────────────────
router.get('/deleted', adminAuth, async (req, res) => {
    try {
        const products = await Product.find({ isActive: false }).sort({ createdAt: -1 });
        const sellerMap = await buildSellerMap(products);
        const formatted = products.map(p => p.toClientJSON(sellerMap[p.userId?.toString()]));

        return res.json({ success: true, products: formatted });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Admin: Restore a deleted product ───────────────────────────────
router.post('/restore', adminAuth, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Valid Product ID is required' });
        }

        const product = await Product.findOne({ _id: id, isActive: false });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Deleted product not found' });
        }

        product.isActive = true;
        await product.save();

        return res.json({ success: true, message: 'Product restored successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Admin: Permanently delete a product ────────────────────────────
router.delete('/permanent/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await Order.updateMany(
            { 'items.productId': id },
            { $pull: { items: { productId: id } } }
        );

        await Product.findByIdAndDelete(id);

        return res.json({ success: true, message: 'Product permanently deleted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

export default router;
