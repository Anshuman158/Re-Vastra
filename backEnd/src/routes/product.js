import { Hono } from 'hono';
import { generateId, authUser, adminAuth, checkBanned, sanitizeError, sanitizeInput } from '../middleware/auth.js';

const app = new Hono();

// Helper: parse product fields
function formatProduct(p, sellerInfo) {
    return {
        ...p,
        _id: p.id,
        image: JSON.parse(p.image || '[]'),
        sizes: JSON.parse(p.sizes || '[]'),
        seller: sellerInfo || null
    };
}

// Helper: fetch seller map for a set of products
async function buildSellerMap(db, products) {
    const sellerIds = [...new Set(products.map(p => p.user_id))];
    const sellerMap = {};
    if (sellerIds.length > 0) {
        const placeholders = sellerIds.map(() => '?').join(',');
        const { results: sellers } = await db.prepare(
            `SELECT id, name, seller_profile FROM users WHERE id IN (${placeholders})`
        ).bind(...sellerIds).all();

        sellers.forEach(s => {
            const profile = JSON.parse(s.seller_profile || '{}');
            sellerMap[s.id] = {
                name: s.name,
                shopName: profile.shopName || s.name,
                isVerified: profile.isVerified || false,
                rating: profile.rating || { average: 0, count: 0 },
                totalRentals: profile.totalRentals || 0
            };
        });
    }
    return sellerMap;
}

// ── Public: List all active products ───────────────────────────────
app.get('/list', async (c) => {
    try {
        const { results: bannedUsers } = await c.env.DB.prepare('SELECT id FROM users WHERE is_banned = 1').all();
        const bannedIds = bannedUsers.map(u => u.id);

        let products;
        if (bannedIds.length > 0) {
            const placeholders = bannedIds.map(() => '?').join(',');
            const { results } = await c.env.DB.prepare(
                `SELECT * FROM products WHERE user_id NOT IN (${placeholders}) AND is_active = 1 ORDER BY CASE WHEN status = 'available' THEN 0 ELSE 1 END, created_at DESC`
            ).bind(...bannedIds).all();
            products = results;
        } else {
            const { results } = await c.env.DB.prepare(
                `SELECT * FROM products WHERE is_active = 1 ORDER BY CASE WHEN status = 'available' THEN 0 ELSE 1 END, created_at DESC`
            ).all();
            products = results;
        }

        const sellerMap = await buildSellerMap(c.env.DB, products);
        const productsWithSeller = products.map(p => formatProduct(p, sellerMap[p.user_id]));

        return c.json({ success: true, products: productsWithSeller });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Public: Get single product ─────────────────────────────────────
app.get('/single/:productId', async (c) => {
    try {
        const productId = c.req.param('productId');
        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();

        if (!product) {
            return c.json({ success: false, message: 'Product not found.' }, 404);
        }

        const seller = await c.env.DB.prepare(
            'SELECT id, name, seller_profile, created_at FROM users WHERE id = ?'
        ).bind(product.user_id).first();

        const profile = seller ? JSON.parse(seller.seller_profile || '{}') : {};
        const sellerInfo = seller ? {
            _id: seller.id, name: seller.name,
            shopName: profile.shopName || seller.name,
            isVerified: profile.isVerified || false,
            rating: profile.rating || { average: 0, count: 0 },
            totalRentals: profile.totalRentals || 0,
            memberSince: profile.memberSince || seller.created_at
        } : null;

        return c.json({ success: true, product: formatProduct(product, sellerInfo) });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Auth: Add product ──────────────────────────────────────────────
app.post('/add', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const body = await c.req.json();

        let { name, price, description, rental_price, category, subCategory, sizes, contactno, pickuplocation, bestSeller, images } = body;

        // Input validation
        name = sanitizeInput(name);
        description = sanitizeInput(description);
        category = sanitizeInput(category);
        contactno = sanitizeInput(contactno);
        pickuplocation = sanitizeInput(pickuplocation);

        if (!name || !description || !price || !category || !sizes || !rental_price || !contactno || !pickuplocation) {
            return c.json({ success: false, message: 'All required fields must be provided.' }, 400);
        }

        if (name.length > 200 || description.length > 5000) {
            return c.json({ success: false, message: 'Name or description is too long.' }, 400);
        }

        if (Number(price) <= 0 || Number(rental_price) <= 0 || Number(price) > 1000000 || Number(rental_price) > 1000000) {
            return c.json({ success: false, message: 'Invalid price value.' }, 400);
        }

        const id = generateId();
        const parsedSizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
        const imageArray = Array.isArray(images) ? images : [images];

        if (imageArray.length > 10) {
            return c.json({ success: false, message: 'Maximum 10 images allowed.' }, 400);
        }

        await c.env.DB.prepare(
            `INSERT INTO products (id, user_id, name, description, price, rental_price, image, category, sub_category, sizes, best_seller, pickup_location, contact_no, status, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            id, userId, name, description, Number(price), Number(rental_price),
            JSON.stringify(imageArray), category, sanitizeInput(subCategory) || null,
            JSON.stringify(parsedSizes), bestSeller ? 1 : 0, pickuplocation, contactno, 'available', 1
        ).run();

        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();

        return c.json({ success: true, message: 'Product added successfully', product: formatProduct(product) });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Auth: Get user's active products (POST) ────────────────────────
app.post('/myproducts', authUser, async (c) => {
    try {
        const userId = c.get('userId');
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM products WHERE user_id = ? AND is_active = 1'
        ).bind(userId).all();

        const products = results.map(p => formatProduct(p));
        return c.json({ success: true, products });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Auth: Get user's active products (GET) ─────────────────────────
app.get('/my-product', authUser, async (c) => {
    try {
        const userId = c.get('userId');
        const { results } = await c.env.DB.prepare(
            'SELECT * FROM products WHERE user_id = ? AND is_active = 1'
        ).bind(userId).all();

        const products = results.map(p => formatProduct(p));
        return c.json({ success: true, products });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Auth: Soft-delete user's product ───────────────────────────────
app.delete('/my-product/:id', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const productId = c.req.param('id');

        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').bind(productId).first();
        if (!product) {
            return c.json({ success: false, message: 'Product not found.' }, 404);
        }

        if (product.user_id !== userId) {
            return c.json({ success: false, message: 'You can only delete your own products.' }, 403);
        }

        await c.env.DB.prepare('UPDATE products SET is_active = 0 WHERE id = ?').bind(productId).run();
        return c.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Auth: Update product status ────────────────────────────────────
app.put('/status/:id', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const productId = c.req.param('id');
        const { status } = await c.req.json();

        if (!['available', 'out_of_stock'].includes(status)) {
            return c.json({ success: false, message: 'Invalid status value' }, 400);
        }

        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').bind(productId).first();
        if (!product) {
            return c.json({ success: false, message: 'Product not found' }, 404);
        }

        if (product.user_id !== userId) {
            return c.json({ success: false, message: 'You can only update your own products' }, 403);
        }

        await c.env.DB.prepare('UPDATE products SET status = ? WHERE id = ?').bind(status, productId).run();
        product.status = status;

        return c.json({ success: true, message: 'Product status updated', product: formatProduct(product) });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Auth: Soft-delete user's own product (alt route) ───────────────
app.delete('/user/:id', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const productId = c.req.param('id');

        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').bind(productId).first();
        if (!product) {
            return c.json({ success: false, message: 'Product not found.' }, 404);
        }

        if (product.user_id !== userId) {
            return c.json({ success: false, message: 'You can only delete your own products.' }, 403);
        }

        await c.env.DB.prepare('UPDATE products SET is_active = 0 WHERE id = ?').bind(productId).run();
        return c.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Admin: Soft-delete product ─────────────────────────────────────
app.post('/remove', adminAuth, async (c) => {
    try {
        const { id } = await c.req.json();
        if (!id) {
            return c.json({ success: false, message: 'Product ID is required' }, 400);
        }

        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').bind(id).first();
        if (!product) {
            return c.json({ success: false, message: 'Product not found' }, 404);
        }

        await c.env.DB.prepare('UPDATE products SET is_active = 0 WHERE id = ?').bind(id).run();
        return c.json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Admin: Update product status ───────────────────────────────────
app.put('/update-status/:id', adminAuth, async (c) => {
    try {
        const productId = c.req.param('id');
        const { status } = await c.req.json();

        if (!['available', 'out_of_stock'].includes(status)) {
            return c.json({ success: false, message: 'Invalid status' }, 400);
        }

        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();
        if (!product) {
            return c.json({ success: false, message: 'Product not found' }, 404);
        }

        await c.env.DB.prepare('UPDATE products SET status = ? WHERE id = ?').bind(status, productId).run();
        return c.json({ success: true, message: 'Status updated' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Admin: List all deleted products ───────────────────────────────
app.get('/deleted', adminAuth, async (c) => {
    try {
        const { results: products } = await c.env.DB.prepare(
            'SELECT * FROM products WHERE is_active = 0 ORDER BY created_at DESC'
        ).all();

        const sellerMap = await buildSellerMap(c.env.DB, products);
        const productsWithSeller = products.map(p => formatProduct(p, sellerMap[p.user_id]));

        return c.json({ success: true, products: productsWithSeller });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Admin: Restore a deleted product ───────────────────────────────
app.post('/restore', adminAuth, async (c) => {
    try {
        const { id } = await c.req.json();
        if (!id) {
            return c.json({ success: false, message: 'Product ID is required' }, 400);
        }

        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ? AND is_active = 0').bind(id).first();
        if (!product) {
            return c.json({ success: false, message: 'Deleted product not found' }, 404);
        }

        await c.env.DB.prepare('UPDATE products SET is_active = 1 WHERE id = ?').bind(id).run();
        return c.json({ success: true, message: 'Product restored successfully' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// ── Admin: Permanently delete a product ────────────────────────────
app.delete('/permanent/:id', adminAuth, async (c) => {
    try {
        const productId = c.req.param('id');
        const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();
        if (!product) {
            return c.json({ success: false, message: 'Product not found' }, 404);
        }

        // Delete related records first
        await c.env.DB.prepare('DELETE FROM order_items WHERE product_id = ?').bind(productId).run();
        await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(productId).run();

        return c.json({ success: true, message: 'Product permanently deleted' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

export default app;
