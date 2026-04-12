-- Phase 2 DB Migrations

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

-- 3. Create store-assets bucket and policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('store-assets', 'store-assets', true) 
ON CONFLICT DO NOTHING;

CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'store-assets');

CREATE POLICY "Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'store-assets');

CREATE POLICY "Update Access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'store-assets');

CREATE POLICY "Delete Access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'store-assets');
