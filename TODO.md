# Algerian E-Commerce Platform - Phase 1 (Admin Dashboard) Tasks

Use this file to track your progress. Check off items by changing `[ ]` to `[x]`.

## 1. Initial Setup & Auth
- [x] `middleware.ts` + Auth routing setup
- [x] `/auth/login` page implementation
- [x] Supabase clients (browser + server) setup
- [x] TypeScript types initial generation

## 2. Design System & Layout
- [x] Configure Tailwind CSS + global CSS variables (Light theme only, Teal primary color)
- [x] Build shared UI components:
  - [x] Button
  - [x] Input / Forms
  - [x] Badge
  - [x] Modal
  - [x] Table
  - [x] Skeleton Loader
  - [x] Empty State
- [x] Admin Layout (`/admin/layout.tsx`): Sidebar navigation + Top header

## 3. Admin Dashboard Pages
- [x] **Dashboard Home** (`/admin`): KPI cards, Weekly sales chart, Top articles, Recent activity
- [x] **Products** (`/admin/products`):
  - [x] List view (table, search, filters)
  - [x] Add Product form (Photos upload, sizes/colors, barcode generation)      
  - [x] Edit Product form (CRUD)
- [x] **Stock** (`/admin/stock`): Read-only table with inline quantity editing
- [x] **Employees** (`/admin/employees`): CRUD using Supabase Auth Admin API
- [x] **Purchase Vouchers** (`/admin/vouchers`): Create vouchers, auto-update stock, PDF export
- [x] **Sales History** (`/admin/history`): Filterable sessions/bons table + Excel/PDF export
- [x] **Online Orders** (`/admin/orders`): Order listing, status management (pending->delivered)
- [x] **Monthly Reports** (`/admin/reports`): Auto-generated monthly summary + export
- [x] **Store Settings** (`/admin/settings`): Store info, delivery fees (58 wilayas)

## 4. Final Polish
- [x] Verify all empty states and skeleton loaders
- [x] Responsive design check (Mobile-first, touch targets)
- [x] Test RLS and error handling boundaries

---

# Phase 2: Khadem (Employee) Dashboard & Client Storefront

## 5. Khadem Dashboard (Point of Sale) - `/khadem`
- [x] **Auth & Layout**: Restrict access to `khadem` role, setup POS specific layout.
- [x] **Session Management**: Open daily session, close session at the end of the day.
- [x] **Point of Sale (POS)**:
  - [x] Product search & Barcode scanner integration
  - [x] Cart management (add/remove items, update quantity, select variants)
  - [x] Checkout & generate `bon` (receipt), auto-deduct stock
- [ ] **Today's Bons**: View today's receipts, soft-delete (cancel) current day's mistake bons (restores stock).

## 6. Client Storefront (Public E-Commerce) - `/`
- [ ] **Layout & UI**: Public header, category navigation, footer, cart drawer.
- [ ] **Home Page**: Hero banner (from store settings), new/featured products.
- [ ] **Product Catalog**: Browse products with filters (category, model).
- [ ] **Product Detail Page**: Photos gallery, sizes/colors selection, add to cart.
- [ ] **Checkout Flow**: 
  - [ ] Cart state management (LocalStorage/Zustand)
  - [ ] Checkout form (Name, Phone, Wilaya, Delivery option)
  - [ ] Dynamic total calculation based on delivery fees
  - [ ] Submit COD (Cash on Delivery) order.
- [ ] **Order Tracking (Optional)**: Check order status with ID/Phone.
