import { Hono } from 'hono';
import { generateId, createToken, authUser, adminAuth, checkBanned, hashPassword, verifyPassword, rateLimit, sanitizeError, sanitizeInput } from '../middleware/auth.js';

const app = new Hono();

// Validate email format
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Format user object for frontend (camelCase compatibility)
function formatUser(user) {
    return {
        ...user,
        _id: user.id,
        isSeller: user.is_seller === 1 || user.is_seller === true,
        isBanned: user.is_banned === 1 || user.is_banned === true,
        sellerProfile: user.seller_profile,
        cartData: user.cart_data,
        banReason: user.ban_reason,
        createdAt: user.created_at,
        is_seller: user.is_seller,
        seller_profile: user.seller_profile,
        cart_data: user.cart_data
    };
}

// ── Register ───────────────────────────────────────────────────────
app.post('/register', rateLimit('register', 5), async (c) => {
    try {
        let { name, email, password } = await c.req.json();

        // Input sanitization
        name = sanitizeInput(name);
        email = sanitizeInput(email)?.toLowerCase();

        if (!name || !email || !password) {
            return c.json({ success: false, message: 'All fields are required' }, 400);
        }

        if (name.length > 100) {
            return c.json({ success: false, message: 'Name is too long' }, 400);
        }

        if (!isValidEmail(email)) {
            return c.json({ success: false, message: 'Please enter a valid email' }, 400);
        }

        if (password.length < 8) {
            return c.json({ success: false, message: 'Password must be at least 8 characters' }, 400);
        }

        if (password.length > 128) {
            return c.json({ success: false, message: 'Password is too long' }, 400);
        }

        // Check if user exists
        const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) {
            return c.json({ success: false, message: 'User already exists' }, 400);
        }

        const id = generateId();
        const hashedPassword = await hashPassword(password);
        const sellerProfile = JSON.stringify({
            shopName: "", shopDescription: "", bankingInfo: {}, address: {},
            isVerified: false, verificationDate: null, totalRentals: 0,
            avgResponseTime: 0, memberSince: new Date().toISOString(),
            rating: { average: 0, count: 0 }
        });

        await c.env.DB.prepare(
            `INSERT INTO users (id, name, email, password, seller_profile) VALUES (?, ?, ?, ?, ?)`
        ).bind(id, name, email, hashedPassword, sellerProfile).run();

        const token = await createToken(id, c.env.JWT_SECRET);
        const user = formatUser({ id, name, email, is_seller: 0, seller_profile: JSON.parse(sellerProfile), cart_data: {} });

        return c.json({ success: true, token, user });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Login ──────────────────────────────────────────────────────────
app.post('/login', rateLimit('login', 10), async (c) => {
    try {
        const { email, password } = await c.req.json();

        if (!email || !password) {
            return c.json({ success: false, message: 'Email and password are required' }, 400);
        }

        const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email?.toLowerCase()).first();
        if (!user) {
            return c.json({ success: false, message: 'Invalid email or password.' }, 400);
        }

        // Block banned users at login
        if (user.is_banned === 1) {
            return c.json({
                success: false,
                message: `Your account has been suspended.${user.ban_reason ? ' Reason: ' + user.ban_reason : ''}`
            }, 403);
        }

        const { valid, needsUpgrade } = await verifyPassword(password, user.password);
        if (!valid) {
            return c.json({ success: false, message: 'Invalid email or password.' }, 400);
        }

        // Migrate legacy SHA-256 hash to PBKDF2 on successful login
        if (needsUpgrade) {
            const newHash = await hashPassword(password);
            await c.env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(newHash, user.id).run();
        }

        const token = await createToken(user.id, c.env.JWT_SECRET);
        delete user.password;
        user.seller_profile = JSON.parse(user.seller_profile || '{}');
        user.address = JSON.parse(user.address || '{}');
        user.cart_data = JSON.parse(user.cart_data || '{}');

        return c.json({ success: true, token, user: formatUser(user) });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Google OAuth Login ─────────────────────────────────────────────
app.post('/google-login', rateLimit('google-login', 10), async (c) => {
    try {
        const { credential } = await c.req.json();
        if (!credential) {
            return c.json({ success: false, message: 'Google credential is required' }, 400);
        }

        // Verify the Google ID token via Google's tokeninfo endpoint
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!googleRes.ok) {
            return c.json({ success: false, message: 'Invalid Google token' }, 400);
        }

        const googleUser = await googleRes.json();
        const { email, name, aud } = googleUser;

        // Verify the token was issued for OUR app (audience check)
        if (c.env.GOOGLE_CLIENT_ID && aud !== c.env.GOOGLE_CLIENT_ID) {
            return c.json({ success: false, message: 'Invalid Google token audience' }, 400);
        }

        if (!email) {
            return c.json({ success: false, message: 'Could not retrieve email from Google' }, 400);
        }

        // Check if user already exists
        let user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email.toLowerCase()).first();

        // Block banned users
        if (user && user.is_banned === 1) {
            return c.json({
                success: false,
                message: `Your account has been suspended.${user.ban_reason ? ' Reason: ' + user.ban_reason : ''}`
            }, 403);
        }

        if (!user) {
            const id = generateId();
            const randomPassword = await hashPassword(crypto.randomUUID());
            const sellerProfile = JSON.stringify({
                shopName: "", shopDescription: "", bankingInfo: {}, address: {},
                isVerified: false, verificationDate: null, totalRentals: 0,
                avgResponseTime: 0, memberSince: new Date().toISOString(),
                rating: { average: 0, count: 0 }
            });

            await c.env.DB.prepare(
                `INSERT INTO users (id, name, email, password, seller_profile) VALUES (?, ?, ?, ?, ?)`
            ).bind(id, sanitizeInput(name) || email.split('@')[0], email.toLowerCase(), randomPassword, sellerProfile).run();

            user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
        }

        const token = await createToken(user.id, c.env.JWT_SECRET);
        delete user.password;
        user.seller_profile = JSON.parse(user.seller_profile || '{}');
        user.address = JSON.parse(user.address || '{}');
        user.cart_data = JSON.parse(user.cart_data || '{}');

        return c.json({ success: true, token, user: formatUser(user) });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Admin Login ────────────────────────────────────────────────────
app.post('/admin', rateLimit('admin-login', 5), async (c) => {
    try {
        const { email, password } = await c.req.json();

        if (email === c.env.ADMIN_EMAIL && password === c.env.ADMIN_PASSWORD) {
            const secretKey = new TextEncoder().encode(c.env.JWT_SECRET);
            const token = await new (await import('jose')).SignJWT({ role: 'admin' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('8h')
                .sign(secretKey);
            return c.json({ success: true, token });
        }

        return c.json({ success: false, message: 'Invalid Credentials' }, 401);
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── User Profile ───────────────────────────────────────────────────
app.get('/profile', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const user = await c.env.DB.prepare(
            'SELECT id, name, email, phone, address, cart_data, is_seller, seller_profile, is_banned, ban_reason, created_at FROM users WHERE id = ?'
        ).bind(userId).first();

        if (!user) {
            return c.json({ success: false, message: 'User not found' }, 404);
        }

        user.seller_profile = JSON.parse(user.seller_profile || '{}');
        user.address = JSON.parse(user.address || '{}');
        user.cart_data = JSON.parse(user.cart_data || '{}');

        return c.json({ success: true, user: formatUser(user) });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Update Profile ─────────────────────────────────────────────────
app.post('/update', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const { name, phone, address } = await c.req.json();

        const updates = [];
        const values = [];

        if (name) {
            const cleanName = sanitizeInput(name);
            if (cleanName.length > 100) return c.json({ success: false, message: 'Name is too long' }, 400);
            updates.push('name = ?'); values.push(cleanName);
        }
        if (phone) {
            const cleanPhone = sanitizeInput(phone);
            if (cleanPhone.length > 20) return c.json({ success: false, message: 'Invalid phone number' }, 400);
            updates.push('phone = ?'); values.push(cleanPhone);
        }
        if (address) { updates.push('address = ?'); values.push(JSON.stringify(address)); }

        if (updates.length > 0) {
            values.push(userId);
            await c.env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();
        }

        const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        delete user.password;
        user.seller_profile = JSON.parse(user.seller_profile || '{}');
        user.address = JSON.parse(user.address || '{}');

        return c.json({ success: true, message: 'Profile updated successfully.', user });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Apply for Seller ───────────────────────────────────────────────
app.post('/apply-seller', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const { shopName, shopDescription, bankingInfo, address } = await c.req.json();

        if (!shopName || !bankingInfo || !address) {
            return c.json({ success: false, message: 'Missing required seller details.' }, 400);
        }

        const sellerProfile = JSON.stringify({
            shopName: sanitizeInput(shopName), shopDescription: sanitizeInput(shopDescription) || "",
            bankingInfo, address, isVerified: false, verificationDate: null,
            totalRentals: 0, avgResponseTime: 0, memberSince: new Date().toISOString(),
            rating: { average: 0, count: 0 }
        });

        await c.env.DB.prepare('UPDATE users SET is_seller = 1, seller_profile = ? WHERE id = ?')
            .bind(sellerProfile, userId).run();

        const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        delete user.password;
        user.seller_profile = JSON.parse(user.seller_profile || '{}');
        user.cart_data = JSON.parse(user.cart_data || '{}');

        return c.json({ success: true, message: 'Congratulations! You are now a seller. 🚀', user: formatUser(user) });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// Alias for become-seller (frontend uses this route)
app.post('/become-seller', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const { shopName, shopDescription, bankingInfo, address } = await c.req.json();

        if (!shopName || !bankingInfo || !address) {
            return c.json({ success: false, message: 'Missing required seller details.' }, 400);
        }

        const sellerProfile = JSON.stringify({
            shopName: sanitizeInput(shopName), shopDescription: sanitizeInput(shopDescription) || "",
            bankingInfo, address, isVerified: false, verificationDate: null,
            totalRentals: 0, avgResponseTime: 0, memberSince: new Date().toISOString(),
            rating: { average: 0, count: 0 }
        });

        await c.env.DB.prepare('UPDATE users SET is_seller = 1, seller_profile = ? WHERE id = ?')
            .bind(sellerProfile, userId).run();

        const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
        delete user.password;
        user.seller_profile = JSON.parse(user.seller_profile || '{}');
        user.cart_data = JSON.parse(user.cart_data || '{}');

        return c.json({ success: true, message: 'Congratulations! You are now a seller. 🚀', user: formatUser(user) });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Admin: Get All Sellers ─────────────────────────────────────────
app.get('/sellers', adminAuth, async (c) => {
    try {
        const { results } = await c.env.DB.prepare(
            'SELECT id, name, email, phone, is_seller, seller_profile, is_banned, ban_reason, created_at FROM users WHERE is_seller = 1'
        ).all();

        const sellers = results.map(s => {
            const profile = JSON.parse(s.seller_profile || '{}');
            return {
                _id: s.id, name: s.name, email: s.email, phone: s.phone,
                isBanned: s.is_banned === 1, banReason: s.ban_reason,
                createdAt: s.created_at, sellerProfile: profile
            };
        });

        return c.json({ success: true, sellers });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

app.post('/sellers', adminAuth, async (c) => {
    try {
        const { results } = await c.env.DB.prepare(
            'SELECT id, name, email, phone, is_seller, seller_profile, is_banned, ban_reason, created_at FROM users WHERE is_seller = 1'
        ).all();

        const sellers = results.map(s => {
            const profile = JSON.parse(s.seller_profile || '{}');
            return {
                _id: s.id, name: s.name, email: s.email, phone: s.phone,
                isBanned: s.is_banned === 1, banReason: s.ban_reason,
                createdAt: s.created_at, sellerProfile: profile
            };
        });

        return c.json({ success: true, sellers });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Admin: Ban Seller ──────────────────────────────────────────────
app.post('/ban', adminAuth, async (c) => {
    try {
        const { userId, isBanned, banReason } = await c.req.json();

        if (!userId) {
            return c.json({ success: false, message: 'User ID is required' }, 400);
        }

        await c.env.DB.prepare('UPDATE users SET is_banned = ?, ban_reason = ? WHERE id = ?')
            .bind(isBanned ? 1 : 0, isBanned ? sanitizeInput(banReason) || '' : '', userId).run();

        return c.json({ success: true, message: isBanned ? 'Seller banned successfully.' : 'Seller unbanned successfully.' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Admin: Verify Seller ───────────────────────────────────────────
app.post('/verify', adminAuth, async (c) => {
    try {
        const { userId, isVerified } = await c.req.json();

        if (!userId) {
            return c.json({ success: false, message: 'User ID is required' }, 400);
        }

        const user = await c.env.DB.prepare('SELECT seller_profile FROM users WHERE id = ? AND is_seller = 1').bind(userId).first();
        if (!user) {
            return c.json({ success: false, message: 'Seller not found.' }, 404);
        }

        const sellerProfile = JSON.parse(user.seller_profile || '{}');
        sellerProfile.isVerified = isVerified;
        if (isVerified) sellerProfile.verificationDate = new Date().toISOString();

        await c.env.DB.prepare('UPDATE users SET seller_profile = ? WHERE id = ?')
            .bind(JSON.stringify(sellerProfile), userId).run();

        return c.json({ success: true, message: isVerified ? 'Seller verified successfully! ✓' : 'Seller verification removed.' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

export default app;
