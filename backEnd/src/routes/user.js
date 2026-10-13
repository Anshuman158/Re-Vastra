import express from 'express';
import User from '../models/User.js';
import {
    createToken,
    createAdminToken,
    authUser,
    adminAuth,
    checkBanned,
    hashPassword,
    verifyPassword,
    isValidEmail,
    sanitizeInput,
    sanitizeError
} from '../middleware/auth.js';

const router = express.Router();

// ── Register ───────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        let { name, email, password } = req.body;

        name = sanitizeInput(name);
        email = sanitizeInput(email)?.toLowerCase();

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (name.length > 100) {
            return res.status(400).json({ success: false, message: 'Name is too long' });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        if (password.length > 128) {
            return res.status(400).json({ success: false, message: 'Password is too long' });
        }

        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            sellerProfile: {
                shopName: '',
                shopDescription: '',
                bankingInfo: {},
                address: {},
                isVerified: false,
                verificationDate: null,
                totalRentals: 0,
                avgResponseTime: 0,
                memberSince: new Date(),
                rating: { average: 0, count: 0 }
            }
        });

        const token = createToken(newUser._id);

        return res.json({ success: true, token, user: newUser.toClientJSON() });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Login ──────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Block banned users
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: `Your account has been suspended.${user.banReason ? ' Reason: ' + user.banReason : ''}`
            });
        }

        const { valid, needsUpgrade } = await verifyPassword(password, user.password);
        if (!valid) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        // Transparently upgrade legacy hash to bcrypt
        if (needsUpgrade) {
            user.password = await hashPassword(password);
            await user.save();
        }

        const token = createToken(user._id);

        return res.json({ success: true, token, user: user.toClientJSON() });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Google OAuth Login ─────────────────────────────────────────────
router.post('/google-login', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: 'Google credential is required' });
        }

        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!googleRes.ok) {
            return res.status(400).json({ success: false, message: 'Invalid Google token' });
        }

        const googleUser = await googleRes.json();
        const { email, name, aud } = googleUser;

        if (process.env.GOOGLE_CLIENT_ID && aud !== process.env.GOOGLE_CLIENT_ID) {
            return res.status(400).json({ success: false, message: 'Invalid Google token audience' });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: 'Could not retrieve email from Google' });
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user && user.isBanned) {
            return res.status(403).json({
                success: false,
                message: `Your account has been suspended.${user.banReason ? ' Reason: ' + user.banReason : ''}`
            });
        }

        if (!user) {
            const randomPassword = await hashPassword(crypto.randomUUID());
            user = await User.create({
                name: sanitizeInput(name) || email.split('@')[0],
                email: email.toLowerCase(),
                password: randomPassword,
                sellerProfile: {
                    shopName: '',
                    shopDescription: '',
                    bankingInfo: {},
                    address: {},
                    isVerified: false,
                    verificationDate: null,
                    totalRentals: 0,
                    avgResponseTime: 0,
                    memberSince: new Date(),
                    rating: { average: 0, count: 0 }
                }
            });
        }

        const token = createToken(user._id);

        return res.json({ success: true, token, user: user.toClientJSON() });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Admin Login ────────────────────────────────────────────────────
router.post('/admin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@revastra.com').toLowerCase().trim();
        const adminPassword = (process.env.ADMIN_PASSWORD || 'admin@0027').trim();

        const inputEmail = (email || '').toLowerCase().trim();
        const inputPassword = (password || '').trim();

        if (inputEmail === adminEmail && inputPassword === adminPassword) {
            const token = createAdminToken({ role: 'admin', email: adminEmail });
            return res.json({ success: true, token });
        }

        // Also check if user exists in DB with matching credentials
        const dbUser = await User.findOne({ email: inputEmail });
        if (dbUser && dbUser.email === adminEmail) {
            const { valid } = await verifyPassword(inputPassword, dbUser.password);
            if (valid) {
                const token = createAdminToken({ role: 'admin', email: dbUser.email, id: dbUser._id });
                return res.json({ success: true, token });
            }
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid Credentials. Default admin is admin@revastra.com'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── User Profile ───────────────────────────────────────────────────
router.get('/profile', authUser, checkBanned, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.json({ success: true, user: user.toClientJSON() });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Update Profile ─────────────────────────────────────────────────
router.post('/update', authUser, checkBanned, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name) {
            const cleanName = sanitizeInput(name);
            if (cleanName.length > 100) return res.status(400).json({ success: false, message: 'Name is too long' });
            user.name = cleanName;
        }

        if (phone) {
            const cleanPhone = sanitizeInput(phone);
            if (cleanPhone.length > 20) return res.status(400).json({ success: false, message: 'Invalid phone number' });
            user.phone = cleanPhone;
        }

        if (address) {
            user.address = address;
        }

        await user.save();

        return res.json({
            success: true,
            message: 'Profile updated successfully.',
            user: user.toClientJSON()
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Apply for Seller ───────────────────────────────────────────────
const becomeSellerHandler = async (req, res) => {
    try {
        const { shopName, shopDescription, bankingInfo, address } = req.body;

        if (!shopName || !bankingInfo || !address) {
            return res.status(400).json({ success: false, message: 'Missing required seller details.' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isSeller = true;
        user.sellerProfile = {
            shopName: sanitizeInput(shopName),
            shopDescription: sanitizeInput(shopDescription) || '',
            bankingInfo,
            address,
            isVerified: false,
            verificationDate: null,
            totalRentals: 0,
            avgResponseTime: 0,
            memberSince: new Date(),
            rating: { average: 0, count: 0 }
        };

        await user.save();

        return res.json({
            success: true,
            message: 'Congratulations! You are now a seller. 🚀',
            user: user.toClientJSON()
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
};

router.post('/apply-seller', authUser, checkBanned, becomeSellerHandler);
router.post('/become-seller', authUser, checkBanned, becomeSellerHandler);

// ── Admin: Get All Sellers ─────────────────────────────────────────
const getSellersHandler = async (req, res) => {
    try {
        const sellers = await User.find({ isSeller: true }).sort({ createdAt: -1 });

        const formatted = sellers.map(s => {
            const cUser = s.toClientJSON();
            return {
                _id: cUser._id,
                name: cUser.name,
                email: cUser.email,
                phone: cUser.phone,
                isBanned: cUser.isBanned,
                banReason: cUser.banReason,
                createdAt: cUser.createdAt,
                sellerProfile: cUser.sellerProfile
            };
        });

        return res.json({ success: true, sellers: formatted });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
};

router.get('/sellers', adminAuth, getSellersHandler);
router.post('/sellers', adminAuth, getSellersHandler);

// ── Admin: Ban / Unban Seller ──────────────────────────────────────
router.post('/ban', adminAuth, async (req, res) => {
    try {
        const { userId, isBanned, banReason } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isBanned = Boolean(isBanned);
        user.banReason = isBanned ? (sanitizeInput(banReason) || '') : '';
        await user.save();

        return res.json({
            success: true,
            message: isBanned ? 'Seller banned successfully.' : 'Seller unbanned successfully.'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

// ── Admin: Verify Seller ───────────────────────────────────────────
router.post('/verify', adminAuth, async (req, res) => {
    try {
        const { userId, isVerified } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const user = await User.findOne({ _id: userId, isSeller: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Seller not found.' });
        }

        const profile = user.sellerProfile || {};
        profile.isVerified = Boolean(isVerified);
        if (isVerified) {
            profile.verificationDate = new Date();
        }
        user.sellerProfile = profile;
        user.markModified('sellerProfile');
        await user.save();

        return res.json({
            success: true,
            message: isVerified ? 'Seller verified successfully! ✓' : 'Seller verification removed.'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
});

export default router;
