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
