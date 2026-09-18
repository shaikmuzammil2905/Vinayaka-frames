# Vinayaka Frames - Full-Stack E-Commerce & Admin Platform

A premium, full-stack e-commerce web application and administrative management system for Vinayaka Frames. Built with React, TypeScript, Tailwind CSS, Supabase (Database, Auth, RLS), and Cloudinary (Media management).

---

## 🌟 Key Features

### 🛍️ Customer Frontend (Source of Truth)
- **Responsive Navigation & Category Slider:** Dynamic loading of categories and product showcases.
- **Dynamic Product Filtering & Search:** Real-time search, sorting by featured, price low-to-high, high-to-low, newest arrivals, and category multi-filtering.
- **Frame Thickness Logic:**
  - `8 × 12` & `12 × 18` auto-switches to **1 Inch** frame selections.
  - `16 × 24`, `20 × 30` & `24 × 36` auto-switches to **1.5 Inch** frame selections.
  - Smooth carousel showcasing 1-inch and 1.5-inch finish variations.
- **Product Personalization:** Custom photo upload, recipient name, and heartfelt custom message inputs.
- **Dynamic Customer Reviews:** Real-time approved reviews powered by Supabase with verified buyer ratings.
- **Seamless Offline/Fallback Resilience:** If database connection is empty or undergoing maintenance, pages automatically fallback gracefully to curated defaults without UI disruptions.

### 🛡️ Admin Dashboard (`/admin`)
- **Authentication & Security:** Supabase Auth-based login (`/admin/login`), session persistence, and Row Level Security (RLS).
- **Dashboard Overview:** Real-time statistics on total products, active categories, customer reviews, and pending approvals.
- **Product Management (`/admin/products`):** Full CRUD for products, multi-image upload via Cloudinary, multi-size pricing (Frame & LED sizes), finish types, and stock/trending toggles.
- **Category Management (`/admin/categories`):** Create, update, toggle visibility, and upload category thumbnails.
- **Review Moderation (`/admin/reviews`):** Approve, reject, or delete customer reviews and ratings before they appear on the storefront.
- **Media Library (`/admin/media`):** Upload, browse, preview, copy URLs, and manage assets stored on Cloudinary.
- **Site Settings (`/admin/settings`):** Manage hero banner copy, contact phone/WhatsApp/email numbers, social media links, and promo announcements.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Hot Toast
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Media Storage:** Cloudinary (Unsigned upload preset & secure CDN)
- **Serverless (Optional):** Vercel Serverless Functions (`/api`)

---

## 🚀 Setup & Deployment Guide

### 1. Environment Variables Configuration

Copy `.env.example` to `.env.local` for local development:
```bash
cp .env.example .env.local
```

Populate the variables:
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# For Serverless / Admin Scripts (Server-Side Only - Never commit)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 2. Database Migrations (Supabase)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor**.
2. Open and run the migration files in order:
   - `supabase/migrations/00001_initial_schema.sql` (Creates tables, indexes, triggers, and Row Level Security policies).
   - `supabase/migrations/00002_seed_data.sql` (Populates initial categories, products, sizes, finishes, reviews, and site settings).

### 3. Creating the First Admin Account

You can create an admin user in either of two ways:

#### Method A: Via Supabase Dashboard (Recommended)
1. In your Supabase project, navigate to **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
3. Enter your admin email and password.
4. Uncheck "Auto Confirm User?" if you want email verification, or leave it enabled for instant login.
5. You can now log in at `/admin/login` on the website!

#### Method B: Via CLI Script
Run the helper script with your service role key:
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-key node scripts/create_admin.js admin@vinayakaframes.com YourSecurePassword123!
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build test
npm run build
```

---

## 🔒 Security Best Practices

- **Client-Side:** Only the Supabase `anon` key and Cloudinary unsigned upload preset are exposed to the client.
- **Row Level Security (RLS):** Enabled on all database tables. Public users can only read active products, categories, approved reviews, and settings. Write/Update/Delete operations require an authenticated admin session.
- **Server-Side Credentials:** Service Role Keys and Cloudinary API Secrets are kept strictly in server-side environments or serverless endpoints and are excluded from Git via `.gitignore`.
