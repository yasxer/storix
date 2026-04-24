-- Run this in your Supabase SQL Editor
-- Adds structured item storage for client purchases (to support modification)

CREATE TABLE IF NOT EXISTS public.client_purchase_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  color_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_purchase_items_pkey PRIMARY KEY (id),
  CONSTRAINT client_purchase_items_transaction_id_fkey
    FOREIGN KEY (transaction_id) REFERENCES public.client_transactions(id) ON DELETE CASCADE,
  CONSTRAINT client_purchase_items_color_id_fkey
    FOREIGN KEY (color_id) REFERENCES public.article_size_colors(id)
);
