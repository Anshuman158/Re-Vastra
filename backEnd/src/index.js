import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { securityHeaders, limitBodySize } from './middleware/auth.js';
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import reviewRoutes from './routes/review.js';
import statsRoutes from './routes/stats.js';
import notificationRoutes from './routes/notification.js';

const app = new Hono();

// Security: Request body size limit (1MB)
app.use('*', limitBodySize(1_048_576));

// Security: Add security headers to all responses
app.use('*', securityHeaders);

// CORS middleware — locked to allowed origins
app.use('*', async (c, next) => {
    const allowedOrigins = (c.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);

    // If no origins configured, fall back to open (dev mode)
    const origin = c.req.header('origin') || '';
    const isAllowed = allowedOrigins.length === 0 || allowedOrigins.includes(origin);

    const corsMiddleware = cors({
        origin: isAllowed ? origin : allowedOrigins[0] || '*',
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'token'],
        maxAge: 86400 // preflight cache 24h
    });

    return corsMiddleware(c, next);
});

// Health check
app.get('/', (c) => c.json({ message: 'ReVastra API Working', status: 'ok' }));

// API routes
app.route('/api/user', userRoutes);
app.route('/api/product', productRoutes);
app.route('/api/cart', cartRoutes);
app.route('/api/order', orderRoutes);
app.route('/api/review', reviewRoutes);
app.route('/api/notification', notificationRoutes);
app.route('/api', statsRoutes);

// 404 handler
app.notFound((c) => c.json({ success: false, message: 'Route not found' }, 404));

// Error handler — sanitized, no internal details leaked
app.onError((err, c) => {
    console.error('Unhandled error:', err);
    return c.json({ success: false, message: 'An unexpected error occurred.' }, 500);
});

export default app;
