# Project Specification — Algerian E-Commerce Platform
**Document for AI Coding Agent — Phase 2: Client Storefront**

---

## Overview

Build the public-facing client storefront for the same Supabase backend used in Phase 1 (Admin Dashboard).
This is the online boutique that clients visit to browse products and place orders.

**Same tech stack as Phase 1. Same Supabase project. No new backend.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Backend / DB | Supabase (same project as admin) |
| Styling | Tailwind CSS v3 |
| Forms | react-hook-form + zod |
| Icons | Lucide React (exclusively) |
| State (Cart) | Zustand (persist to localStorage) |
| Type generation | supabase gen types typescript |

---

## DB Migrations Required Before Starting

```sql
-- 1. Hero fields in store_settings
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS hero_subtitle text,
  ADD COLUMN IF NOT EXISTS hero_cta_text text DEFAULT 'تسوقي الآن',
  ADD COLUMN IF NOT EXISTS hero_cta_link text DEFAULT '/boutique';

-- 2. Featured + sale flags on articles
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_on_sale boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sale_percentage integer DEFAULT NULL
    CHECK (sale_percentage > 0 AND sale_percentage <= 100);
```

---

## Admin Settings Updates (Phase 1 extension)

In `/admin/settings`, add section **"Storefront Config"**:

| Field | Input Type | Column |
|---|---|---|
| Hero Image | Image upload → Supabase Storage: store-assets | hero_image_url |
| Hero Title | Text input | hero_banner_text |
| Hero Subtitle | Text input | hero_subtitle |
| CTA Button Text | Text input | hero_cta_text |
| CTA Button Link | Text input | hero_cta_link |

In `/admin/products` product edit form, add:
- **"Mettre en avant"** toggle → `is_featured`
- **"En solde"** toggle → `is_on_sale`
- **"Pourcentage de réduction"** number input (shown only when is_on_sale = true) → `sale_percentage`

---

## Route Structure

```
src/app/
├── (store)/
│   ├── layout.tsx
│   ├── page.tsx                         ← homepage
│   ├── boutique/page.tsx                ← all products
│   ├── category/[slug]/page.tsx         ← category (models OR articles)
│   ├── category/[slug]/[modelId]/page.tsx ← model articles
│   ├── article/[id]/page.tsx            ← product detail
│   ├── panier/page.tsx                  ← cart
│   ├── commande/page.tsx                ← checkout
│   ├── confirmation/[orderId]/page.tsx  ← post-order
│   ├── suivi/page.tsx                   ← order tracking (no login)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── compte/page.tsx                  ← client account (protected)
```

---

## Design System

Same palette and fonts as Admin Dashboard.

```css
--color-bg:           #ffffff;
--color-surface:      #f9f9f9;
--color-surface-2:    #f3f3f3;
--color-border:       #e5e5e5;
--color-text:         #111111;
--color-text-muted:   #6b6b6b;
--color-text-faint:   #ababab;
--color-primary:      #01696f;
--color-primary-hover:#0c4e54;
--color-success:      #437a22;
--color-warning:      #b45309;
--color-error:        #b91c1c;
--color-sale:         #dc2626;
--font-body:    'Satoshi', 'Inter', sans-serif;
--font-display: 'General Sans', 'Inter', sans-serif;
```

Rules: No dark mode. No gradients. No emoji. No colored card borders. Mobile-first.

---

## Shared Layout (`/store/layout.tsx`)

### Header (sticky)

```
[ Logo ] [ Smart Search Bar ] [ Nav Links ] [ Cart Icon + count ] [ Account Icon ]
```

- **Logo** — from `store_settings.store_logo_url`
- **Smart Search Bar**:
  - Debounced 300ms
  - Searches: `articles.title`, `categories.name`, `articles.barcode`
  - Only `is_published = true` articles
  - Inline dropdown: product thumbnail + name + price
  - "Voir tous les résultats" link at bottom
  - Press Enter → redirect to `/boutique?q=query`
- **Nav links** — from `categories` table ordered by `position`
- **Cart icon** — badge with item count from Zustand
- **Account icon** — if logged in: initials + dropdown (Mon compte / Déconnexion); else: "Connexion" link

### Footer
- Store name + phone + address (from `store_settings`)
- Category links
- "Suivre ma commande" → `/suivi`

---

## Pages Specification

---

### 1. Homepage (`/`)

Data fetched server-side.

#### Hero Section

```
┌──────────────────────────────────────────┐
│  [ hero_image_url — full width ]         │
│  [ hero_banner_text ]  ← big heading     │
│  [ hero_subtitle ]     ← smaller text    │
│  [ hero_cta_text → hero_cta_link ] ← btn │
└──────────────────────────────────────────┘
```

- hero_image_url null → teal gradient fallback
- hero_banner_text null → skip hero, show categories directly
- Image as `<img object-fit: cover>` NOT CSS background

#### Categories Grid

Title: **"Nos Catégories"**
- All categories from DB ordered by `position`
- Card: photo + name — click → `/category/[slug]`
- image_url null → teal placeholder with initial letter
- Grid: 2 cols mobile, 4 cols desktop
- No categories → skip section

#### Products Section

Title: **"Nos Produits"**

Priority order (max 12 products total):

```
1. is_on_sale = true  →  SOLDE badge with sale_percentage
2. is_featured = true →  selected by admin
3. Best sellers       →  ORDER BY (bon_items count + order_items count) DESC LIMIT 8
4. Random fill        →  ORDER BY RANDOM() until total = 12
```

Zero published articles → empty state: Lucide ShoppingBag icon + "Bientôt disponible"

---

### 2. Category Page (`/category/[slug]`)

```typescript
// Logic
const models = await supabase
  .from('models').select('*').eq('category_id', category.id)

if (models.length === 0) {
  // Show articles grid directly
} else {
  // Show models grid first
}
```

**No models case:**
- Articles grid + filter chips (Prix croissant/décroissant, En solde, En stock)
- Pagination 20/page

**Has models case:**
- Models displayed as cards (use category image as fallback photo)
- Click model → `/category/[slug]/[modelId]`

Note: `models` table has no slug — use `models.id` in URL.

---

### 3. Model Page (`/category/[slug]/[modelId]`)

- Articles filtered by `model_id`
- Breadcrumb: Accueil > [Category] > [Model]
- Filter chips + pagination 20/page

---

### 4. Product Detail Page (`/article/[id]`)

Query:
```typescript
supabase.from('articles').select(`
  *, category:categories(name,slug), model:models(name),
  photos:article_photos(photo_url, position),
  sizes:article_sizes(
    id, size_label, is_standard, price_override,
    colors:article_size_colors(id, color_name, color_hex, quantity)
  )
`).eq('id', id).eq('is_published', true).single()
```

Layout:
```
┌──────────────────────┬──────────────────────────┐
│  Photo Gallery       │  Title                   │
│  (main + thumbs)     │  Category > Model        │
│                      │  Price (with old if sale)│
│                      │  Size selector (chips)   │
│                      │  Color selector (swatches)│
│                      │  Quantity +/−            │
│                      │  Add to Cart button      │
│                      │  Stock badge             │
└──────────────────────┴──────────────────────────┘
│  Description                                    │
```

Price logic:
```typescript
const displayPrice = selectedSize?.price_override ?? article.base_price
const salePrice = article.is_on_sale
  ? displayPrice * (1 - article.sale_percentage / 100)
  : null
```

Stock badge:
- qty > threshold → "En stock" green
- 0 < qty <= threshold → "Stock limité" orange
- qty = 0 → "Rupture de stock" red, Add to Cart disabled

Add to Cart stores: article_id, size_id, color_id, quantity, unit_price, title, photo_url, size_label, color_name, color_hex.

---

### 5. Boutique Page (`/boutique`)

- Search input debounced 300ms
- Filter: category, model (filtered by category), En solde, En stock, Nouveautés (last 30 days)
- Sort: Pertinence | Prix ↑ | Prix ↓ | Nouveautés
- URL-synced filters via useSearchParams
- Grid + pagination 24/page

---

### 6. Cart Page (`/panier`)

State from Zustand (localStorage).

Each item row:
```
[ Photo ] [ Title + Size + Color ] [ −qty+ ] [ Price ] [ Remove ]
```

- Quantity limits: min 1, max = available stock (revalidate from DB on page load)
- Coupon code input → validate against `promotions` table server-side
- Order summary: subtotal + delivery (shown as "Calculé à la commande") + discount + Total
- "Passer la commande" → `/commande`
- Empty cart → empty state + "Continuer les achats" → `/boutique`

---

### 7. Checkout Page (`/commande`)

No auth required. Guest checkout allowed.

Zod schema:
```typescript
z.object({
  client_name: z.string().min(2),
  client_lastname: z.string().min(2),
  phone: z.string().regex(/^(05|06|07)[0-9]{8}$/, 'Numéro invalide'),
  address: z.string().min(5),
  wilaya: z.string().min(1),
  delivery_type: z.enum(['domicile', 'bureau']),
  notes: z.string().optional(),
})
```

- Wilaya dropdown from `delivery_fees` table (58 wilayas)
- On wilaya select → fetch delivery fee for chosen delivery_type
- Delivery type: radio "À domicile — X DA" / "Au bureau — X DA"

On submit (server action):
1. Validate coupon server-side if applied
2. `INSERT INTO orders` (client_id nullable for guests)
3. `INSERT INTO order_items` (all cart items)
4. Increment `promotions.used_count` if coupon used
5. Clear Zustand cart
6. Redirect to `/confirmation/[order.id]`

---

### 8. Confirmation Page (`/confirmation/[orderId]`)

```
✓  Commande confirmée !
Numéro: #[orderId short]
Nous vous contacterons sur [phone] pour confirmer.
[ Voir mes commandes ]  [ Continuer les achats ]
```

---

### 9. Order Tracking Page (`/suivi`)

No login required.

Form: phone + order ID (or last 6 digits)
Query: `orders WHERE phone = ? AND id LIKE ?`

Status timeline:
```
● Commande reçue    [date]
● Confirmée         [date or —]
○ Expédiée          [tracking ID if available]
○ Livrée
```

Badge colors: pending→grey, confirmed→blue, shipped→orange, delivered→green, cancelled→red.

---

### 10. Auth Pages

`/auth/login`:
- Email + password → `supabase.auth.signInWithPassword()`
- After login → `/compte`

`/auth/register`:
- full_name, phone, email, password, confirm_password
- `supabase.auth.signUp()` → DB trigger creates profile with role: client
- After register → `/compte`

---

### 11. Client Account (`/compte`) — Protected

Redirect to `/auth/login` if not authenticated.

- Profile info (full_name, phone editable; email read-only)
- Orders table: ID, date, status badge, total, "Voir détails"
- Order detail modal: items list + status timeline + tracking ID
- Pagination 10/page

---

## Product Card Component (reusable)

Used on homepage, category, model, boutique pages.

```
┌──────────────────────┐
│  [Product Photo]     │
│  [SOLDE -XX%] badge  │  ← top-left, only if is_on_sale
└──────────────────────┘
  [Title]
  [Category · Model]
  [Sale price]  [Original striked]
  [Stock badge]  ← only if low/out
```

- Click → `/article/[id]`
- Photo: first from article_photos ordered by position, fallback placeholder
- No "Add to cart" on card — must go to detail page to select size+color
- Hover: subtle shadow lift

---

## Cart Store (Zustand)

```typescript
interface CartItem {
  article_id: string; size_id: string; color_id: string
  quantity: number; unit_price: number
  title: string; photo_url: string | null
  size_label: string; color_name: string; color_hex: string
}

interface CartStore {
  items: CartItem[]
  coupon: { id: string; code: string; type: 'percent'|'fixed'; value: number } | null
  addItem: (item: CartItem) => void
  removeItem: (article_id: string, size_id: string, color_id: string) => void
  updateQuantity: (article_id: string, size_id: string, color_id: string, qty: number) => void
  clearCart: () => void
  setCoupon: (coupon: CartStore['coupon']) => void
}
```

Use Zustand `persist` middleware → localStorage.

---

## Cross-Cutting Rules

- COD only — no payment gateway
- No dark mode
- No emoji — Lucide React only
- Guest checkout allowed — `orders.client_id` nullable
- `dir="auto"` on text inputs (Arabic product names)
- Mobile-first — test at 375px first, 44px minimum touch targets
- Skeleton loaders on all server-fetched lists
- Never show raw Supabase errors to client

---

## Build Order (Phase 2)

1. DB migrations
2. Admin settings update (hero fields + is_featured + is_on_sale in product form)
3. Zustand cart store
4. Store layout (header + footer)
5. Homepage
6. Category page (models OR articles logic)
7. Model page
8. Product detail page
9. Boutique page
10. Cart page
11. Checkout page
12. Confirmation page
13. Order tracking page
14. Auth pages (login + register)
15. Client account page

---

## Notes

- `models` table has no slug → use `models.id` in URLs
- `categories` has `slug` → use for category URLs
- `store_settings` is single row → always `.single()`
- Stock managed by DB triggers → never update `article_size_colors.quantity` manually from frontend
- Coupon validation MUST happen server-side before order insertion

---

*End of Phase 2 specification.*
