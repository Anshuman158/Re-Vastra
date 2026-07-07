import * as jose from 'jose';

// ── ID Generation ──────────────────────────────────────────────────
export function generateId() {
    return crypto.randomUUID();
}

// ── JWT Token Management ───────────────────────────────────────────

// Create JWT token with expiry
export async function createToken(id, secret) {
    const secretKey = new TextEncoder().encode(secret);
    const token = await new jose.SignJWT({ id })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(secretKey);
    return token;
}

// Verify JWT token
export async function verifyToken(token, secret) {
    try {
        const secretKey = new TextEncoder().encode(secret);
        const { payload } = await jose.jwtVerify(token, secretKey);
        return payload;
    } catch (error) {
        return null;
    }
}

// ── Password Hashing (PBKDF2 with per-user salt) ──────────────────

const PBKDF2_ITERATIONS = 100000;
const HASH_PREFIX = 'pbkdf2:';
const LEGACY_SALT = 'revastra_salt_2024'; // for backward compat

// Hash password using PBKDF2 with random salt
export async function hashPassword(password) {
    const salt = crypto.randomUUID(); // unique per-user salt
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const hashBuffer = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial, 256
    );
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${HASH_PREFIX}${salt}:${hashHex}`;
}

// Legacy SHA-256 hash (for verifying old passwords)
async function legacyHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + LEGACY_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password — supports both PBKDF2 (new) and SHA-256 (legacy)
// Returns { valid: boolean, needsUpgrade: boolean }
export async function verifyPassword(password, storedHash) {
    if (storedHash.startsWith(HASH_PREFIX)) {
        // New PBKDF2 format: "pbkdf2:<salt>:<hash>"
        const parts = storedHash.slice(HASH_PREFIX.length).split(':');
        const salt = parts[0];
        const expectedHash = parts[1];
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
        );
        const hashBuffer = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
            keyMaterial, 256
        );
        const computedHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        return { valid: computedHash === expectedHash, needsUpgrade: false };
    } else {
        // Legacy SHA-256 format
        const computedHash = await legacyHash(password);
        return { valid: computedHash === storedHash, needsUpgrade: true };
    }
}

// ── Rate Limiting (in-memory, per-worker) ──────────────────────────

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 10;   // max attempts per window

function cleanupRateLimits() {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
        if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
            rateLimitMap.delete(key);
        }
    }
}

// Get client IP from Cloudflare headers
function getClientIP(c) {
    return c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// Rate limit middleware factory
export function rateLimit(routeKey, maxAttempts = RATE_LIMIT_MAX_ATTEMPTS) {
    return async (c, next) => {
        const ip = getClientIP(c);
        const key = `${routeKey}:${ip}`;
        const now = Date.now();

        // Periodic cleanup
        if (rateLimitMap.size > 10000) cleanupRateLimits();

        let entry = rateLimitMap.get(key);
        if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
            entry = { windowStart: now, attempts: 0 };
        }

        entry.attempts++;
        rateLimitMap.set(key, entry);

        if (entry.attempts > maxAttempts) {
            const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 1000);
            return c.json(
                { success: false, message: `Too many requests. Please try again in ${retryAfter} seconds.` },
                429
            );
        }

        await next();
    };
}

// ── Auth Middleware ────────────────────────────────────────────────

// User auth middleware — verifies JWT, extracts userId
export async function authUser(c, next) {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ success: false, message: 'Not Authorized. Login Again.' }, 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token, c.env.JWT_SECRET);

    if (!payload || !payload.id) {
        return c.json({ success: false, message: 'Invalid or expired token. Please login again.' }, 401);
    }

    c.set('userId', payload.id);
    await next();
}

// Admin auth middleware — verifies admin JWT signature
export async function adminAuth(c, next) {
    const token = c.req.header('token');

    if (!token) {
        return c.json({ success: false, message: 'Not Authorized. Admin login required.' }, 401);
    }

    try {
        const secretKey = new TextEncoder().encode(c.env.JWT_SECRET);
        await jose.jwtVerify(token, secretKey);
        // Token signature is valid — allow request
        await next();
    } catch (error) {
        return c.json({ success: false, message: 'Invalid or expired admin token.' }, 401);
    }
}

// Banned user check — runs AFTER authUser to block banned accounts
export async function checkBanned(c, next) {
    const userId = c.get('userId');
    if (!userId) {
        return c.json({ success: false, message: 'Not Authorized.' }, 401);
    }

    const user = await c.env.DB.prepare('SELECT is_banned, ban_reason FROM users WHERE id = ?').bind(userId).first();

    if (user && user.is_banned === 1) {
        return c.json({
            success: false,
            message: `Your account has been suspended.${user.ban_reason ? ' Reason: ' + user.ban_reason : ''}`
        }, 403);
    }

    await next();
}

// ── Security Helpers ──────────────────────────────────────────────

// Sanitize errors — never leak internal details to clients
export function sanitizeError(error) {
    console.error('Internal error:', error);
    return 'An unexpected error occurred. Please try again later.';
}

// Request body size limiter middleware (default 1MB)
export function limitBodySize(maxBytes = 1_048_576) {
    return async (c, next) => {
        const contentLength = c.req.header('content-length');
        if (contentLength && parseInt(contentLength) > maxBytes) {
            return c.json({ success: false, message: 'Request body too large.' }, 413);
        }
        await next();
    };
}

// Security headers middleware
export async function securityHeaders(c, next) {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

// Sanitize string input — strip HTML tags to prevent XSS in stored data
export function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '').trim();
}
