# Bekollo Clone — Telegram Mini App E-Commerce Platform

A full-stack Telegram Mini App e-commerce platform built with Next.js, Express.js, Prisma, and MySQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL database
- Telegram Bot Token (from @BotFather)
- Cloudinary account (optional, for image uploads)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd frontend
npm install
```

### 2. Set Up Database

```bash
cd backend

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed with sample data
npm run db:seed
```

### 3. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Store**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:5000/api

### 4. Default Admin Login

```
Email: admin@bekollo.com
Password: admin123
```

## 🏗️ Project Structure

```
bekollo-clone/
├── frontend/          # Next.js 14 (App Router, TypeScript, Tailwind)
│   ├── src/
│   │   ├── app/              # Pages (shop + admin)
│   │   ├── components/
│   │   │   ├── shop/         # Customer UI (WelcomeScreen, StorePage, etc.)
│   │   │   └── admin/        # Admin UI (Dashboard, Products, Orders, etc.)
│   │   ├── config/           # branding.ts — ONE FILE to customize everything
│   │   ├── lib/              # API client, Telegram utilities
│   │   ├── providers/        # React Context (Cart, Telegram, Toast)
│   │   └── types/            # TypeScript definitions
│
├── backend/           # Express.js REST API
│   ├── src/
│   │   ├── routes/           # Public + Admin API endpoints
│   │   ├── middleware/       # Auth (Telegram + JWT), validation
│   │   ├── lib/              # Prisma, Cloudinary
│   │   └── bot/              # Telegram bot (Telegraf)
│   └── prisma/
│       ├── schema.prisma     # Database models
│       └── seed.ts           # Sample data
```

## 🎨 Customization

Edit `frontend/src/config/branding.ts` to change:

| Setting | Description |
|---------|-------------|
| `storeName` | Your store name |
| `storeTagline` | Subtitle/tagline |
| `colors.primary` | CTA button color (default: gold #F5A623) |
| `colors.secondary` | Dark elements |
| `currency` | Currency symbol and code |
| `welcomeTitle` | Welcome screen heading |
| `productCard.buttonText` | Product card CTA |
| `botUsername` | Your Telegram bot username |

## 📱 Customer Features

- ✅ Telegram authentication (auto-detect user)
- ✅ Welcome screen with user greeting
- ✅ Product browsing with category & price filters
- ✅ Product details with size/color/quantity selection
- ✅ Shopping cart with real-time sync
- ✅ Multi-step checkout
- ✅ Order tracking
- ✅ Wishlist
- ✅ Product search
- ✅ Account page with order history

## 🔧 Admin Features

- ✅ Secure JWT authentication
- ✅ Dashboard with stats (products, orders, revenue, customers)
- ✅ Product CRUD (create, edit, delete, toggle status)
- ✅ Category management
- ✅ Order management with status updates
- ✅ Customer list with search
- ✅ Store settings

## 🔌 API Endpoints

### Public
- `GET /api/products` — List products (filter, search, paginate)
- `GET /api/products/:slug` — Product details + related
- `GET /api/categories` — All categories

### Customer (Telegram Auth)
- `GET/POST/PUT/DELETE /api/cart` — Cart CRUD
- `GET/POST /api/orders` — Create & list orders
- `GET/POST /api/users/wishlist` — Wishlist toggle
- `GET/POST/PUT/DELETE /api/users/addresses` — Addresses

### Admin (JWT Auth)
- `POST /api/admin/auth/login` — Admin login
- `GET /api/admin/dashboard` — Dashboard stats
- `CRUD /api/admin/products` — Product management
- `CRUD /api/admin/categories` — Category management
- `GET/PUT /api/admin/orders` — Order management
- `GET /api/admin/customers` — Customer list
- `GET/PUT /api/admin/settings` — Store settings

## 📦 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: MySQL + Prisma ORM
- **Auth**: Telegram initData HMAC + JWT
- **Images**: Cloudinary
- **Bot**: Telegraf
