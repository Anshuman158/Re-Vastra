-- ReVastra D1 Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '{}',
    cart_data TEXT DEFAULT '{}',
    is_seller INTEGER DEFAULT 0,
    seller_profile TEXT DEFAULT '{}',
    is_banned INTEGER DEFAULT 0,
    ban_reason TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    rental_price REAL NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    sizes TEXT NOT NULL,
    best_seller INTEGER DEFAULT 0,
    pickup_location TEXT NOT NULL,
    contact_no TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Migration for existing databases (run manually if table already exists):
-- ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    address TEXT NOT NULL,
    status TEXT DEFAULT 'Order Placed',
    payment_method TEXT NOT NULL,
    payment INTEGER DEFAULT 0,
    washing_fee REAL DEFAULT 0,
    delivery_fee REAL DEFAULT 0,
    rental_start_date TEXT,
    rental_end_date TEXT,
    delivery_date TEXT,
    urgent_order INTEGER DEFAULT 0,
    urgent_fee REAL DEFAULT 0,
    pricing_breakdown TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT,
    size TEXT,
    quantity INTEGER DEFAULT 1,
    duration INTEGER DEFAULT 1,
    rental_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    rating INTEGER NOT NULL,
    sub_ratings TEXT DEFAULT '{}',
    comment TEXT,
    is_anonymous INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id),
    UNIQUE(order_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'order',
    order_id TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Migration for existing databases:
-- ALTER TABLE orders ADD COLUMN security_deposit REAL DEFAULT 0;
