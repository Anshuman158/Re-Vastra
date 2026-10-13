import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// ── JWT Token Management ───────────────────────────────────────────

export function getJwtSecret() {
    return process.env.JWT_SECRET || 'revastra_jwt_secret_key_2024';
}

// Create JWT token with expiry (7 days)
export function createToken(id) {
    return jwt.sign({ id }, getJwtSecret(), { expiresIn: '7d' });
}

// Create Admin token with expiry (1 day)
export function createAdminToken(payload = { role: 'admin' }) {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '1d' });
}

// Verify JWT token
export function verifyToken(token) {
    try {
        return jwt.verify(token, getJwtSecret());
    } catch {
        return null;
    }
}

// ── Password Hashing & Verification ────────────────────────────────

export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Verify password — supports modern bcrypt and legacy PBKDF2/SHA-256
export async function verifyPassword(password, storedHash) {
    if (!storedHash) return { valid: false, needsUpgrade: false };

    // Standard bcrypt hash starts with $2a$, $2b$, or $2y$
    if (storedHash.startsWith('$2')) {
        const isMatch = await bcrypt.compare(password, storedHash);
        return { valid: isMatch, needsUpgrade: false };
    }

    // Legacy PBKDF2 hash (pbkdf2:<salt>:<hash>)
    if (storedHash.startsWith('pbkdf2:')) {
        const parts = storedHash.slice('pbkdf2:'.length).split(':');
        const salt = parts[0];
        const expectedHash = parts[1];
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
        );
        const hashBuffer = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' },
            keyMaterial, 256
        );
        const computedHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        return { valid: computedHash === expectedHash, needsUpgrade: true };
    }

    // Legacy plain SHA-256 with revastra_salt_2024
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'revastra_salt_2024');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const computedHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        return { valid: computedHash === storedHash, needsUpgrade: true };
    } catch {
        return { valid: false, needsUpgrade: false };
    }
}

// ── Auth Middleware ────────────────────────────────────────────────

// User auth middleware — verifies JWT, extracts userId
export async function authUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.headers.token) {
            token = req.headers.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Login Again.' });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
        }

        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Authentication failed.' });
    }
}

// Admin auth middleware — verifies admin token
export async function adminAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        let token = null;

        if (req.headers.token) {
            token = req.headers.token;
        } else if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Admin login required.' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Invalid or expired admin token.' });
        }

        // Token is cryptographically valid signed with our secret
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Admin authentication failed.' });
    }
}

// Banned user check — runs AFTER authUser to block suspended accounts
export async function checkBanned(req, res, next) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not Authorized.' });
        }

        const user = await User.findById(userId).select('isBanned banReason');
        if (user && user.isBanned) {
            return res.status(403).json({
                success: false,
                message: `Your account has been suspended.${user.banReason ? ' Reason: ' + user.banReason : ''}`
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: sanitizeError(error) });
    }
}

// ── Security Helpers ──────────────────────────────────────────────

export function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '').trim();
}

export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sanitizeError(error) {
    console.error('Internal error:', error);
    return 'An unexpected error occurred. Please try again later.';
}
