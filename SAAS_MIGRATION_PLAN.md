# Roadmap: Converting the Project to a Multi-Tenant SaaS Platform

This file contains all the necessary steps to convert the "Hanot" project into a full-fledged SaaS platform, where each client can have their own store (Subdomain) and their own dashboard (Admin Dashboard).

---

## Phase 1: Database Update (Supabase)
The goal here is to link every piece of data in the database to a specific store.

- [ ] **Create the Stores table (`stores`):**
  - Fields: `id`, `name`, `subdomain` (Unique), `owner_id`, `is_active`, `created_at`.
- [ ] **Update existing tables:**
  - Add `store_id` as a Foreign Key in all tables: `products`, `categories`, `orders`, `clients`, `employees`, `stock`, `history`, `reports`, `vouchers`, `suppliers`.
- [ ] **Update the Roles system:**
  - Add a new Role: `super_admin` (Platform owner).
  - Define other user roles: `store_admin` (Store owner) and `employee` (Store worker).
- [ ] **Enable Row Level Security (RLS):**
  - Program security policies in Supabase so that no `store_admin` or `employee` can view or edit data that does not belong to their `store_id`.

---

## Phase 2: Middleware & Routing (Next.js)
The goal is to capture the Subdomain and redirect the user to the correct page.

- [ ] **Setup `middleware.ts`:**
  - Modify the Middleware to detect the URL (e.g., `boutique1.tonsite.com`).
  - Perform an internal Rewrite and pass the store name (`subdomain`) to the Router.
- [ ] **Restructure App Routing:**
  - Move current store files to a dynamic route like `app/[subdomain]/(store)`.
  - Update Data Fetching to rely on the `subdomain` instead of fetching all products globally.

---

## Phase 3: Dashboards

### 1. Super Admin Dashboard (Platform Manager)
- [ ] Create route `app/(super-admin)`.
- [ ] Interface to create a new store, assign a `subdomain`, and link it to a new admin account.
- [ ] Store management interface: Deactivate or activate a store.
- [ ] General platform statistics (number of stores, total revenue, etc.).

### 2. Store Admin Dashboard (Tenant)
- [ ] Update route `app/(admin)` to load data based on the logged-in user's `store_id`.
- [ ] When adding a new product/employee, the `store_id` should be attached automatically (hidden from the user).
- [ ] The interface should only display data related to their specific store.

---

## Phase 4: Hosting & DNS (DevOps)
Technical steps to deploy the project and make the subdomains work.

- [ ] **Purchase a Domain Name:** like `tonsite.com`.
- [ ] **Setup DNS Wildcard:**
  - In the domain registrar's DNS settings (e.g., Cloudflare), add an `A` or `CNAME` record with the name `*` (asterisk) to point all subdomains to the server.
- [ ] **Hosting (Vercel / Custom VPS):**
  - Add the domain to the platform and enable the Wildcard Subdomains option.

---

## Phase 5: Subscription System (Optional later)
- [ ] Integrate the platform with Stripe or a local payment gateway to allow store owners to pay a monthly/yearly subscription automatically so their store stays `is_active: true`.

---

## How to begin?
If you are ready, **we will enter Phase 1** and start writing the SQL commands (to create the `stores` table and add the Foreign Keys to the other tables).
