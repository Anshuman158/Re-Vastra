# ReVastra 👗🌿 — MERN Stack Fashion Rental Marketplace

<div align="center">

![ReVastra Banner](frontEnd/src/assets/hero_img.png)

### **Sustainable, Peer-to-Peer Clothing Rental & Resale Platform**

[![Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://en.wikipedia.org/wiki/MERN_(solution_stack))
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend%20API-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%20ODM-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📖 Table of Contents

1. [Overview & Core Concept](#-overview--core-concept)
2. [MERN Stack Architecture](#-mern-stack-architecture)
3. [Key Features](#-key-features)
4. [Project Directory Structure](#-project-directory-structure)
5. [Database Schemas & Data Models](#-database-schemas--data-models)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Installation & Setup](#-installation--setup)
8. [Environment Variables Configuration](#-environment-variables-configuration)
9. [Running the Application](#-running-the-application)
10. [Security, Pricing Engine & Business Rules](#-security-pricing-engine--business-rules)
11. [Deployment Guide](#-deployment-guide)
12. [Contributing & License](#-contributing--license)

---

## 🌟 Overview & Core Concept

**ReVastra** (*"Re"* + *"Vastra"*, meaning renewed apparel) is a full-featured, peer-to-peer (P2P) sustainable fashion marketplace. It tackles fast-fashion waste by letting users:
- **Rent Designer & Traditional Clothing:** Borrow high-end outfits for weddings, parties, photoshoots, or festivals for a fraction of the retail price.
- **Lend & Monetize Wardrobes:** Everyday users and boutiques can list their unworn garments, set daily rental rates, earn passive income, and track their payouts.
- **Transparent Pricing Breakdown:** Automatic dynamic pricing calculations including duration-based rental fees, refundable security deposits, washing/sanitization fees, and express delivery charges.
- **Complete Dual-Panel Ecosystem:** Includes a customer-facing storefront and a separate, dedicated Admin moderation portal.

---

## 🏗️ MERN Stack Architecture

The ReVastra platform is built on the battle-tested **MERN (MongoDB, Express.js, React.js, Node.js)** full-stack architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPLICATIONS                           │
│                                                                        │
│   ┌──────────────────────────────┐    ┌────────────────────────────┐   │
│   │   Storefront Client (React)  │    │   Admin Dashboard (React)  │   │
│   │   - Vite 6 + React 18        │    │   - Vite 6 + React 18      │   │
│   │   - Tailwind CSS + Framer    │    │   - Moderation & Metrics   │   │
│   │   - Google OAuth + Context   │    │   - Order & Listing Flow   │   │
│   └──────────────┬───────────────┘    └─────────────┬──────────────┘   │
└──────────────────┼──────────────────────────────────┼──────────────────┘
                   │                                  │
                   ▼  HTTPS / REST APIs + JWT Auth    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS & EXPRESS BACKEND                       │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Express REST API Server                                        │   │
│   │ - Routers: /api/user, /api/product, /api/order, /api/cart, etc.│   │
│   │ - Middlewares: JWT Verification, Role Guards, Rate Limiter     │   │
│   │ - Security: Helmet, CORS Whitelisting, Body-Parser Limits      │   │
│   └────────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ Mongoose ODM
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          MONGODB DATABASE                              │
│                                                                        │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │
│   │ Users & Auth │  │   Products   │  │    Orders    │  │ Reviews  │   │
│   │ Collections  │  │ (Garments)   │  │  & Bookings  │  │ & Alerts │   │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. MongoDB (Database Layer)
- High-flexibility NoSQL document database powered by **Mongoose ODM**.
- Optimized collections with compound indexes for rapid filtering by categories, rental availability, status, and user references.
- Schema validation, timestamps, and sub-document nesting for pricing breakdowns and address records.

### 2. Express.js (RESTful API Service)
- Modular routing architecture separating concerns across `controllers`, `routes`, and `middlewares`.
- Fine-grained role-based access control (`authUser`, `adminAuth`, `checkBanned`).
- Rate limiting protection on sensitive authentication endpoints (`login`, `register`, `admin-login`).

### 3. React.js (Frontend & Admin UI)
- Fast build times with **Vite**, React 18, and modern declarative routing via **React Router DOM v6**.
- **Tailwind CSS** styling with full responsive design and dynamic Dark/Light mode theme switching.
- Micro-animations via **Framer Motion** and interactive notifications with **React Toastify**.

### 4. Node.js (Runtime Environment)
- Non-blocking, event-driven JavaScript runtime running asynchronous database operations and JWT cryptographic signing.

---

## ⚡ Key Features

### 👗 1. Garment Catalog & P2P Lending
- **Multi-Category Browsing:** Filter by Men, Women, Kids, Ethnic wear, Western wear, Formal, Partywear, and Seasonal Collections.
- **Dynamic Product States:** Sellers can mark items as `available` or `rented`, toggle item activation, or delete listings.
- **Lend Wardrobe Workflow (`/lend`):** Upload multiple garment images, specify size options (S, M, L, XL, XXL), fabric details, pickup address, purchase price, and per-day rental price.
- **Seller Inventory & Payouts (`/my-products`, `/earning`):** Real-time calculations of completed rentals, net earnings, pending payouts, and item status.

### ⏱️ 2. Dynamic Rental Booking & Pricing Engine
- **Flexible Rental Period:** Date picker selection for custom rental start and return dates.
- **Itemized Checkout Breakdown:**
  - Base Rental Fee $\times$ Number of Days
  - Mandatory Sanitization & Professional Washing Fee
  - Refundable Security Deposit
  - Standard Delivery or Express/Urgent Processing Fee
- **Order Lifecycle Tracking:** Buyer order states (`Order Placed`, `Packing`, `Shipped`, `Out for delivery`, `Delivered`, `Returned`, `Completed`, `Cancelled`).
- **Digital Invoice Generation (`/invoice`):** Printable, client-side downloadable PDF/invoice receipt with tax breakdowns and garment details.

### 🔐 3. Authentication & Security
- **Email/Password Registration & Login:** Password hashing using `bcryptjs` with JWT token expiration.
- **Google OAuth 2.0 Integration:** Seamless single-sign-on (SSO) using `@react-oauth/google`.
- **Role-Based Permissions:** Clear separation between standard Customers, Verified Sellers, and Platform Administrators.
- **Anti-Abuse Controls:** IP & email-based rate limiting, input body truncation, sanitized error reporting, and admin account ban toggles.

### ⭐ 4. Community Reviews & Trust System
- **Verified Order Reviews:** Only users with completed orders can submit a rating and review for an outfit and its lender.
- **Multi-Criteria Scoring:** Granular feedback for Garment Condition, Hygiene/Cleanliness, Fitting Accuracy, and Lender Communication.
- **Lender Public Profiles:** View total clothes listed, average seller rating, and community feedback.

### 🛡️ 5. Dedicated Admin Dashboard (`admin/`)
- **Key Metrics Overview:** Total active products, registered users, order volume, total platform revenue, and platform commission.
- **Product Listing Moderation:** Approve listings, toggle active status, soft delete suspicious garments, or permanently purge products.
- **Soft Delete & Recovery Center:** Dedicated deleted products bin allowing instant restoration.
- **Seller Verification & User Moderation:** Verify seller credentials or ban abusive accounts with custom ban reasons.
- **Order Processing:** Update order fulfillment stages and verify return inspections.

---

## 📁 Project Directory Structure

```
ReVastra/
├── backEnd/                      # Node.js + Express / MERN REST API
│   ├── src/
│   │   ├── config/               # Database connection & environmental constants
│   │   ├── controllers/          # Business logic handlers
│   │   ├── db/                   # MongoDB/Mongoose connection or D1 schemas
│   │   ├── middleware/           # authUser, adminAuth, rateLimiter, securityHeaders
│   │   │   └── auth.js
│   │   ├── models/               # Mongoose Schemas (User, Product, Order, Review)
│   │   ├── routes/               # Express route endpoints
│   │   │   ├── user.js           # Auth, profile, seller registration, admin users
│   │   │   ├── product.js        # Garment listing, searching, seller products, admin
│   │   │   ├── cart.js           # Persistent user cart operations
│   │   │   ├── order.js          # Rental booking, status updates, earnings, seller orders
│   │   │   ├── review.js         # Ratings, review eligibility, seller profiles
│   │   │   ├── notification.js   # User notifications & unread counts
│   │   │   └── stats.js          # Admin dashboard metrics and analytics
│   │   └── index.js              # Server entry point & Express application setup
│   ├── uploads/                  # Local media uploads directory (or Cloudinary / S3)
│   ├── package.json              # Backend dependencies and scripts
│   └── .env.example              # Sample backend environment variables
│
├── frontEnd/                     # Main Customer-Facing React Application
│   ├── public/                   # Static icons and assets
│   ├── src/
│   │   ├── assets/               # Branding logos, placeholders, media clips
│   │   ├── components/           # Reusable UI components
│   │   │   ├── NavBar.jsx        # Navigation bar with badges, search bar, & profile menu
│   │   │   ├── Footer.jsx        # Brand footer with legal links & newsletter
│   │   │   ├── Hero.jsx          # Animated landing hero section
│   │   │   ├── CartTotal.jsx     # Dynamic pricing breakdown card
│   │   │   ├── ProtectedRoute.jsx# Auth route guard for authenticated pages
│   │   │   ├── ThemeToggle.jsx   # Dark / Light mode toggle
│   │   │   └── SearchBar.jsx     # Instant live catalog filter
│   │   ├── context/
│   │   │   └── ShopContext.jsx   # Global cart, currency, search, and auth state
│   │   ├── pages/                # Storefront pages
│   │   │   ├── Home.jsx          # Landing page with latest & best-seller collections
│   │   │   ├── Collection.jsx    # Garment catalog with multi-facet filters
│   │   │   ├── Product.jsx       # Garment details, rental calendar, & review list
│   │   │   ├── Cart.jsx          # Shopping cart with duration modifiers
│   │   │   ├── PlaceOrder.jsx    # Checkout, delivery address, payment selection
│   │   │   ├── Orders.jsx        # Buyer rental orders & delivery status tracking
│   │   │   ├── Invoice.jsx       # Digital receipt & tax invoice
│   │   │   ├── Lend.jsx          # Peer-to-peer wardrobe listing form
│   │   │   ├── BecomeSeller.jsx  # Seller onboarding & business verification
│   │   │   ├── MyProducts.jsx    # Seller inventory management
│   │   │   ├── Earning.jsx       # Seller earnings, ledger & payout status
│   │   │   ├── SellerOrders.jsx  # Orders placed on seller's garments
│   │   │   ├── Notifications.jsx # Real-time notification center
│   │   │   └── Profile.jsx       # User profile details and settings
│   │   ├── utils/
│   │   │   └── pricingUtils.js   # Rental fee, deposit & washing fee calculations
│   │   ├── App.jsx               # Application routes & layout wrapper
│   │   ├── config.js             # API base URL & global constants
│   │   ├── index.css             # Tailwind base and custom CSS utilities
│   │   └── main.jsx              # React DOM root entry
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── admin/                        # Admin Portal React Application
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, Login modal, Metric cards
│   │   ├── context/
│   │   │   └── ThemeContext.jsx  # Admin dark/light theme state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # High-level platform metrics & revenue charts
│   │   │   ├── Add.jsx           # Direct admin product creation
│   │   │   ├── List.jsx          # Garment catalog moderation & soft delete
│   │   │   ├── DeletedProducts.jsx # Soft-deleted listings recovery vault
│   │   │   ├── Orders.jsx        # Platform-wide order status management
│   │   │   └── Sellers.jsx       # Seller approvals & user moderation (ban/unban)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md                     # Comprehensive project documentation
```

---

## 🗄️ Database Schemas & Data Models

In the MERN stack, data is modeled using **Mongoose** with the following schema definitions:

### 1. `User` Schema
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  address: {
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  cartData: { type: Map, of: Object, default: {} },
  isSeller: { type: Boolean, default: false },
  sellerProfile: {
    storeName: String,
    bio: String,
    idProofUrl: String,
    isVerified: { type: Boolean, default: false }
  },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: "" }
}, { timestamps: true });
```

### 2. `Product` Schema (Garments)
```javascript
const ProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },               // Full purchase/replacement value
  rentalPrice: { type: Number, required: true },         // Per-day rental rate
  image: [{ type: String, required: true }],             // Array of image URLs
  category: { type: String, required: true },            // Men, Women, Kids, Ethnic, etc.
  subCategory: { type: String },                         // Topwear, Bottomwear, Festive, etc.
  sizes: [{ type: String, required: true }],             // ['S', 'M', 'L', 'XL']
  bestseller: { type: Boolean, default: false },
  pickupLocation: { type: String, required: true },
  contactNo: { type: String, required: true },
  status: { type: String, enum: ['available', 'rented'], default: 'available' },
  isActive: { type: Boolean, default: true }             // Soft deletion flag
}, { timestamps: true });
```

### 3. `Order` Schema
```javascript
const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    size: String,
    quantity: { type: Number, default: 1 },
    duration: { type: Number, default: 1 },             // Rental days
    rentalPrice: Number
  }],
  amount: { type: Number, required: true },              // Total order payable
  address: { type: Object, required: true },
  status: {
    type: String,
    enum: ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Returned', 'Completed', 'Cancelled'],
    default: 'Order Placed'
  },
  paymentMethod: { type: String, required: true },       // 'COD', 'Stripe', 'Razorpay'
  payment: { type: Boolean, default: false },
  washingFee: { type: Number, default: 25 },
  deliveryFee: { type: Number, default: 10 },
  securityDeposit: { type: Number, default: 0 },
  urgentOrder: { type: Boolean, default: false },
  urgentFee: { type: Number, default: 0 },
  rentalStartDate: { type: Date },
  rentalEndDate: { type: Date },
  pricingBreakdown: { type: Object }
}, { timestamps: true });
```

### 4. `Review` Schema
```javascript
const ReviewSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  subRatings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    fitting: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 }
  },
  comment: { type: String, default: "" },
  isAnonymous: { type: Boolean, default: false }
}, { timestamps: true });
```

### 5. `Notification` Schema
```javascript
const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'rental', 'alert'], default: 'order' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
```

---

## 📡 API Endpoints Reference

All endpoints expect JSON payloads with `Content-Type: application/json`. Protected routes require JWT authorization passed via header (`Authorization: Bearer <token>` or `token: <token>`).

### 👤 Authentication & User Routes (`/api/user`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/user/register` | Public | Register new user with name, email & password |
| `POST` | `/api/user/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/user/google-login` | Public | Authenticate or register via Google OAuth |
| `POST` | `/api/user/admin` | Public | Authenticate platform administrator |
| `GET` | `/api/user/profile` | User | Get authenticated user profile & addresses |
| `POST` | `/api/user/update` | User | Update personal profile details |
| `POST` | `/api/user/apply-seller`| User | Submit seller application with store details |
| `POST` | `/api/user/become-seller`| User | Instantly upgrade account to seller role |
| `GET` | `/api/user/sellers` | Admin | Retrieve list of all platform sellers |
| `POST` | `/api/user/sellers` | Admin | Approve or modify seller account status |
| `POST` | `/api/user/ban` | Admin | Ban or unban a user with a stated reason |
| `POST` | `/api/user/verify` | Admin | Verify a seller's KYC credentials |

### 👗 Garment & Product Routes (`/api/product`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/product/list` | Public | List all active garment catalog items |
| `GET` | `/api/product/single/:productId` | Public | Get specific garment details by ID |
| `POST` | `/api/product/add` | Seller | Add a new garment listing to marketplace |
| `GET` | `/api/product/my-product` | Seller | Fetch all items listed by the logged-in seller |
| `POST` | `/api/product/myproducts` | Seller | Alternative endpoint to fetch seller's items |
| `PUT` | `/api/product/status/:id` | Seller | Toggle availability (`available` / `rented`) |
| `DELETE`| `/api/product/my-product/:id` | Seller | Soft-delete a seller's own garment listing |
| `POST` | `/api/product/remove` | Admin | Soft-delete any garment from marketplace |
| `PUT` | `/api/product/update-status/:id` | Admin | Admin override of product status |
| `GET` | `/api/product/deleted` | Admin | View soft-deleted garments in the trash bin |
| `POST` | `/api/product/restore` | Admin | Restore a soft-deleted garment back to active |
| `DELETE`| `/api/product/permanent/:id` | Admin | Permanently purge a product from the database |

### 🛒 Shopping Cart Routes (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/cart/get` | User | Retrieve current user's persisted shopping cart |
| `POST` | `/api/cart/add` | User | Add garment to cart with size and rental days |
| `POST` | `/api/cart/update` | User | Update item quantity or rental duration |

### 📦 Orders & Rentals Routes (`/api/order`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/order/place` | User | Create a rental order with fee breakdown |
| `POST` | `/api/order/userorders`| User | Retrieve order history for the logged-in buyer |
| `POST` | `/api/order/my_earning`| Seller | Calculate total earnings & order ledger for seller |
| `POST` | `/api/order/seller-orders` | Seller | Fetch orders placed on seller's listings |
| `POST` | `/api/order/list` | Admin | Retrieve all platform orders with full metadata |
| `POST` | `/api/order/status` | Admin | Update status (`Shipped`, `Delivered`, etc.) |

### ⭐ Reviews & Reputation Routes (`/api/review`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/review/add` | User | Submit rating & review for completed rental |
| `GET` | `/api/review/seller/:sellerId` | Public | Get all reviews received by a seller |
| `GET` | `/api/review/can-review/:orderId` | User | Validate if user is eligible to review an order |
| `GET` | `/api/review/profile/:sellerId` | Public | Summary rating statistics for a lender |

### 🔔 Notifications & Analytics (`/api/notification` & `/api/stats`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notification/list` | User | Fetch user notification alerts |
| `GET` | `/api/notification/unread-count`| User | Get number of unread alerts for badge |
| `POST` | `/api/notification/read` | User | Mark notifications as read |
| `GET` | `/api/stats` | Admin | Platform metrics (revenue, orders, users, items) |

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Local MongoDB Community Server or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Anshuman158/Re-Vastra.git
cd ReVastra
```

### 2. Backend Setup
```bash
cd backEnd
npm install
```
Create a `.env` file in `backEnd/`:
```env
PORT=8787
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/revastra?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_EMAIL=admin@revastra.com
ADMIN_PASSWORD=your_secure_admin_password
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 3. Storefront Frontend Setup
```bash
cd ../frontEnd
npm install
```
Create a `.env` file in `frontEnd/`:
```env
VITE_BACKEND_URL=http://localhost:8787
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

### 4. Admin Dashboard Setup
```bash
cd ../admin
npm install
```
Create a `.env` file in `admin/`:
```env
VITE_BACKEND_URL=http://localhost:8787
```

---

## ⚙️ Environment Variables Configuration

### `backEnd/.env`
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | Port number for Express server | `8787` |
| `MONGODB_URI` | Yes | MongoDB connection string | `mongodb://localhost:27017/revastra` |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens | `jwt_secret_revastra_2026` |
| `ADMIN_EMAIL` | Yes | Super Admin authentication email | `admin@revastra.com` |
| `ADMIN_PASSWORD` | Yes | Super Admin authentication password | `AdminSecurePass123` |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS allowed origins | `http://localhost:5173,http://localhost:5174` |
| `CLOUDINARY_CLOUD_NAME` | Optional | For garment image hosting | `revastra-cloud` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API Key | `1234567890` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API Secret | `abcdef123456` |

### `frontEnd/.env`
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_BACKEND_URL` | Yes | Base URL of the backend API | `http://localhost:8787` |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth 2.0 Web Client ID | `xxx.apps.googleusercontent.com` |

### `admin/.env`
| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_BACKEND_URL` | Yes | Base URL of the backend API | `http://localhost:8787` |

---

## 🚀 Running the Application

For a complete local testing environment, run all three applications simultaneously in separate terminals:

### Terminal 1: Backend API
```bash
cd backEnd
npm run dev
# Server running at http://localhost:8787
# Health check available at http://localhost:8787/
```

### Terminal 2: Storefront UI (Buyer & Seller)
```bash
cd frontEnd
npm run dev
# Vite storefront running at http://localhost:5173
```

### Terminal 3: Admin Moderation Portal
```bash
cd admin
npm run dev
# Vite admin running at http://localhost:5174
```

---

## 🔒 Security, Pricing Engine & Business Rules

### 1. Pricing Engine Specification
ReVastra calculates order totals using transparent, itemized fees to protect both renters and lenders:
```
Total Order Payable = (Daily Rental Price × Duration in Days × Quantity)
                    + Professional Washing & Sanitization Fee (₹25)
                    + Standard Delivery Fee (₹10)
                    + Refundable Security Deposit
                    + Express / Urgent Delivery Fee (if requested)
```
- **Security Deposit:** Held during the rental duration and refunded automatically upon return verification.
- **Washing Fee:** Ensures garments are hygienically sanitized before and after every rental.
- **Urgent Order:** Expedited 24-48h rush delivery option for emergency fashion needs.

### 2. Multi-tier Security Architecture
- **JWT Verification & Role Gates:** Authentication middleware verifies bearer tokens before passing requests to route handlers.
- **Body Size Caps:** Requests larger than 1MB are rejected to prevent denial-of-service memory exhaustion.
- **Sanitized Error Responses:** Sensitive database query errors or stack traces are logged internally while clients receive clean, uniform JSON responses.
- **Banned User Enforcement:** The `checkBanned` middleware immediately halts banned accounts from creating orders, listing garments, or modifying carts.

---

## 🌐 Deployment Guide

### Backend Deployment (Node.js / Express)
The backend can be deployed to any standard Node.js hosting platform:
- **Render / Railway / AWS Elastic Beanstalk / Heroku:**
  1. Link your GitHub repository.
  2. Set Root Directory to `backEnd`.
  3. Set Build Command: `npm install`.
  4. Set Start Command: `node src/index.js` (or `npm start`).
  5. Add environment variables (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ALLOWED_ORIGINS`).

### Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User and whitelist your deployment IP addresses (or `0.0.0.0/0` for cloud PaaS).
3. Copy the connection string to `MONGODB_URI`.

### Frontend & Admin Deployment (Vercel / Netlify)
- **Storefront (`frontEnd/`):**
  1. Set Root Directory to `frontEnd`.
  2. Build Command: `npm run build`.
  3. Output Directory: `dist`.
  4. Set `VITE_BACKEND_URL` to your production backend URL.
- **Admin (`admin/`):**
  1. Set Root Directory to `admin`.
  2. Build Command: `npm run build`.
  3. Output Directory: `dist`.
  4. Set `VITE_BACKEND_URL` to your production backend URL.

---

## 🤝 Contributing & License

### Contributing
Contributions to improve ReVastra are welcome!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

### License
This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

<div align="center">
  <b>ReVastra</b> — Redefining Sustainable Wardrobes & Ethical Fashion 👗✨
</div>
