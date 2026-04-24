-- Migration for Supplier Purchase Orders (Bon de commande fournisseur)

CREATE TABLE IF NOT EXISTS public.supplier_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  supplier_name text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'cancelled')),
  total_estimated_amount numeric DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT supplier_orders_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users access to supplier_orders
CREATE POLICY "Enable all access for authenticated users to supplier_orders" ON public.supplier_orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.supplier_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  article_name text NOT NULL,
  expected_quantity integer NOT NULL CHECK (expected_quantity > 0),
  expected_price numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT supplier_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT supplier_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.supplier_orders(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.supplier_order_items ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users access to supplier_order_items
CREATE POLICY "Enable all access for authenticated users to supplier_order_items" ON public.supplier_order_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
