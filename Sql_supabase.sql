-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.article_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  photo_url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT article_photos_pkey PRIMARY KEY (id),
  CONSTRAINT article_photos_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id)
);
CREATE TABLE public.article_size_colors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  size_id uuid NOT NULL,
  color_name text NOT NULL,
  color_hex text NOT NULL,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT article_size_colors_pkey PRIMARY KEY (id),
  CONSTRAINT article_size_colors_size_id_fkey FOREIGN KEY (size_id) REFERENCES public.article_sizes(id)
);
CREATE TABLE public.article_sizes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  size_label text NOT NULL,
  is_standard boolean NOT NULL DEFAULT true,
  price_override numeric DEFAULT NULL::numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT article_sizes_pkey PRIMARY KEY (id),
  CONSTRAINT article_sizes_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id)
);
CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  model_id uuid,
  charika text,
  title text NOT NULL,
  description text,
  base_price numeric NOT NULL CHECK (base_price >= 0::numeric),
  barcode text UNIQUE,
  is_published boolean NOT NULL DEFAULT true,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT articles_pkey PRIMARY KEY (id),
  CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT articles_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(id)
);
CREATE TABLE public.bon_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  bon_id uuid NOT NULL,
  article_id uuid NOT NULL,
  size_id uuid NOT NULL,
  color_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  discount_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bon_items_pkey PRIMARY KEY (id),
  CONSTRAINT bon_items_bon_id_fkey FOREIGN KEY (bon_id) REFERENCES public.bons(id),
  CONSTRAINT bon_items_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id),
  CONSTRAINT bon_items_size_id_fkey FOREIGN KEY (size_id) REFERENCES public.article_sizes(id),
  CONSTRAINT bon_items_color_id_fkey FOREIGN KEY (color_id) REFERENCES public.article_size_colors(id)
);
CREATE TABLE public.bons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  khadem_id uuid NOT NULL,
  total_price numeric NOT NULL DEFAULT 0,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bons_pkey PRIMARY KEY (id),
  CONSTRAINT bons_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.daily_sessions(id),
  CONSTRAINT bons_khadem_id_fkey FOREIGN KEY (khadem_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.daily_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  khadem_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT daily_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT daily_sessions_khadem_id_fkey FOREIGN KEY (khadem_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.delivery_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  wilaya_code text NOT NULL,
  wilaya_name text NOT NULL,
  fee_domicile numeric NOT NULL DEFAULT 0,
  fee_bureau numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT delivery_fees_pkey PRIMARY KEY (id)
);
CREATE TABLE public.models (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT models_pkey PRIMARY KEY (id),
  CONSTRAINT models_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  article_id uuid NOT NULL,
  size_id uuid NOT NULL,
  color_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id),
  CONSTRAINT order_items_size_id_fkey FOREIGN KEY (size_id) REFERENCES public.article_sizes(id),
  CONSTRAINT order_items_color_id_fkey FOREIGN KEY (color_id) REFERENCES public.article_size_colors(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid,
  client_name text NOT NULL,
  client_lastname text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  wilaya text NOT NULL,
  delivery_type text NOT NULL CHECK (delivery_type = ANY (ARRAY['domicile'::text, 'bureau'::text, 'point_relais'::text])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])),
  total_price numeric NOT NULL,
  delivery_fee numeric NOT NULL DEFAULT 0,
  coupon_id uuid,
  discount_amount numeric NOT NULL DEFAULT 0,
  courier_tracking_id text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.promotions(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'client'::text CHECK (role = ANY (ARRAY['admin'::text, 'khadem'::text, 'client'::text])),
  can_add_products boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type = ANY (ARRAY['percent'::text, 'fixed'::text])),
  value numeric NOT NULL CHECK (value > 0::numeric),
  min_order numeric NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.purchase_voucher_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL,
  article_id uuid NOT NULL,
  size_id uuid NOT NULL,
  color_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  purchase_price numeric NOT NULL,
  sale_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT purchase_voucher_items_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_voucher_items_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.purchase_vouchers(id),
  CONSTRAINT purchase_voucher_items_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id),
  CONSTRAINT purchase_voucher_items_size_id_fkey FOREIGN KEY (size_id) REFERENCES public.article_sizes(id),
  CONSTRAINT purchase_voucher_items_color_id_fkey FOREIGN KEY (color_id) REFERENCES public.article_size_colors(id)
);
CREATE TABLE public.purchase_vouchers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT purchase_vouchers_pkey PRIMARY KEY (id),
  CONSTRAINT purchase_vouchers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.store_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'My Store'::text,
  store_logo_url text,
  store_phone text,
  store_address text,
  hero_banner_text text,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT store_settings_pkey PRIMARY KEY (id)
);
 - -   C r e a t e   a r t i c l e - p h o t o s   b u c k e t 
 I N S E R T   I N T O   s t o r a g e . b u c k e t s   ( i d ,   n a m e ,   p u b l i c )   V A L U E S   ( ' a r t i c l e - p h o t o s ' ,   ' a r t i c l e - p h o t o s ' ,   t r u e )   O N   C O N F L I C T   D O   N O T H I N G ; 
 
 - -   A l l o w   p u b l i c   a c c e s s   t o   t h e   b u c k e t 
 C R E A T E   P O L I C Y   \  
 P u b l i c  
 A c c e s s \   O N   s t o r a g e . o b j e c t s   F O R   S E L E C T   U S I N G   ( b u c k e t _ i d   =   ' a r t i c l e - p h o t o s ' ) ; 
 C R E A T E   P O L I C Y   \ U p l o a d  
 A c c e s s \   O N   s t o r a g e . o b j e c t s   F O R   I N S E R T   W I T H   C H E C K   ( b u c k e t _ i d   =   ' a r t i c l e - p h o t o s ' ) ; 
 C R E A T E   P O L I C Y   \ U p d a t e  
 A c c e s s \   O N   s t o r a g e . o b j e c t s   F O R   U P D A T E   U S I N G   ( b u c k e t _ i d   =   ' a r t i c l e - p h o t o s ' ) ; 
 C R E A T E   P O L I C Y   \ D e l e t e  
 A c c e s s \   O N   s t o r a g e . o b j e c t s   F O R   D E L E T E   U S I N G   ( b u c k e t _ i d   =   ' a r t i c l e - p h o t o s ' ) ; 
  
 