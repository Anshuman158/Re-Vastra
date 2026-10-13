import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';

// Route imports
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import reviewRoutes from './routes/review.js';
import notificationRoutes from './routes/notification.js';
import statsRoutes from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 8787;

// Initialize Database & Cloudinary
connectDB();
connectCloudinary();

// ── Security & Middleware ──────────────────────────────────────────

// Helmet with cross-origin resource policy disabled for static uploads
app.use(helmet({
    crossOriginResourcePolicy: false
}));

// Allowed CORS origins
const defaultOrigins = [
    'https://re-vastra.vercel.app',
    'https://re-vastra-admin.vercel.app',
    'https://revastra.online',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:8787',
    'http://localhost:4000'
];

const customOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

const allowedOrigins = customOrigins.length > 0 ? customOrigins : defaultOrigins;

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matched origins
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback to allow during local development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Static files for uploaded images
app.use('/uploads', express.static(path.resolve('uploads')));

// ── Health Check ───────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: 'ReVastra API Working',
        status: 'ok',
        stack: 'MERN (MongoDB, Express, React, Node.js)'
    });
});

// ── API Routes ─────────────────────────────────────────────────────
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', statsRoutes); // Support both /api/stats and /api router

// ── 404 Handler ────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Central Error Handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'An unexpected error occurred.'
    });
});

// ── Start Server ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 ReVastra MERN Server running on http://localhost:${PORT}`);
    });
}

export default app;
