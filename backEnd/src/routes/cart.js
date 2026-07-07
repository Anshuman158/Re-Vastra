import { Hono } from 'hono';
import { authUser, checkBanned, sanitizeError } from '../middleware/auth.js';

const app = new Hono();

// Add to cart
app.post('/add', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const { itemId, size } = await c.req.json();

        // Check if product exists and is available
        const product = await c.env.DB.prepare('SELECT id, status, name FROM products WHERE id = ?').bind(itemId).first();
        if (!product) {
            return c.json({ success: false, message: 'Product not found.' }, 404);
        }

        if (product.status !== 'available') {
            return c.json({ success: false, message: `Sorry, "${product.name}" is currently unavailable for rent.` }, 400);
        }

        const user = await c.env.DB.prepare('SELECT cart_data FROM users WHERE id = ?').bind(userId).first();
        if (!user) {
            return c.json({ success: false, message: 'User not found.' }, 404);
        }

        let cartData = JSON.parse(user.cart_data || '{}');

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = { [size]: 1 };
        }

        await c.env.DB.prepare('UPDATE users SET cart_data = ? WHERE id = ?')
            .bind(JSON.stringify(cartData), userId).run();

        return c.json({ success: true, message: 'Added To Cart' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// Update cart
app.post('/update', authUser, checkBanned, async (c) => {
    try {
        const userId = c.get('userId');
        const { itemId, size, duration } = await c.req.json();

        const user = await c.env.DB.prepare('SELECT cart_data FROM users WHERE id = ?').bind(userId).first();
        if (!user) {
            return c.json({ success: false, message: 'User not found.' }, 404);
        }

        let cartData = JSON.parse(user.cart_data || '{}');

        if (cartData[itemId]) {
            cartData[itemId][size] = duration;
        }

        await c.env.DB.prepare('UPDATE users SET cart_data = ? WHERE id = ?')
            .bind(JSON.stringify(cartData), userId).run();

        return c.json({ success: true, message: 'Cart Updated' });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

// Get cart
app.post('/get', authUser, async (c) => {
    try {
        const userId = c.get('userId');

        const user = await c.env.DB.prepare('SELECT cart_data FROM users WHERE id = ?').bind(userId).first();
        if (!user) {
            return c.json({ success: false, message: 'User not found.' }, 404);
        }

        const cartData = JSON.parse(user.cart_data || '{}');

        return c.json({ success: true, cartData });
    } catch (error) {
        return c.json({ success: false, message: sanitizeError(error) }, 500);
    }
});

export default app;
