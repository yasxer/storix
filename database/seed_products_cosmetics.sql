-- Seed file for Cosmétique Category, Models, Products, Sizes, and Colors
-- Copy and paste this into the SQL Editor in Supabase and click Run.

DO $$
DECLARE
    cat_id UUID := gen_random_uuid();
    
    mod_cerave UUID := gen_random_uuid();
    mod_lrp UUID := gen_random_uuid();
    mod_maybelline UUID := gen_random_uuid();
    mod_loreal UUID := gen_random_uuid();
    mod_ordinary UUID := gen_random_uuid();
    
    prod_id UUID;
    size_id UUID;
BEGIN
    -- 1. Insert Category 'Cosmétique'
    INSERT INTO public.categories (id, name, slug, position) 
    VALUES (cat_id, 'Cosmétique', 'cosmetique', 1)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO cat_id;

    -- 2. Insert Models (Marques / Lignes)
    INSERT INTO public.models (id, category_id, name) VALUES 
    (mod_cerave, cat_id, 'CeraVe'),
    (mod_lrp, cat_id, 'La Roche-Posay'),
    (mod_maybelline, cat_id, 'Maybelline New York'),
    (mod_loreal, cat_id, 'L''Oréal Paris'),
    (mod_ordinary, cat_id, 'The Ordinary');

    -- ==========================================
    -- 3. Insert Products for CeraVe
    -- ==========================================
    -- Product 1
    prod_id := gen_random_uuid();
    INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, barcode, is_published) 
    VALUES (prod_id, cat_id, mod_cerave, 'CeraVe', 'Nettoyant Moussant Visage 236ml', 3500, '3606000537736', true);
    
    size_id := gen_random_uuid();
    INSERT INTO public.article_sizes (id, article_id, size_label) VALUES (size_id, prod_id, '236ml');
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, 'Standard', '#ffffff', 50);

    -- Product 2
    prod_id := gen_random_uuid();
    INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, barcode, is_published) 
    VALUES (prod_id, cat_id, mod_cerave, 'CeraVe', 'Crème Hydratante Visage & Corps', 4200, '3606000537415', true);
    
    size_id := gen_random_uuid();
    INSERT INTO public.article_sizes (id, article_id, size_label) VALUES (size_id, prod_id, '454g');
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, 'Standard', '#ffffff', 30);

    -- ==========================================
    -- 4. Insert Products for La Roche-Posay
    -- ==========================================
    -- Product 3
    prod_id := gen_random_uuid();
    INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, barcode, is_published) 
    VALUES (prod_id, cat_id, mod_lrp, 'La Roche-Posay', 'Effaclar Gel Purifiant Moussant', 3800, '3337872411991', true);
    
    size_id := gen_random_uuid();
    INSERT INTO public.article_sizes (id, article_id, size_label) VALUES (size_id, prod_id, '400ml');
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, 'Standard', '#ffffff', 40);

    -- Product 4
    prod_id := gen_random_uuid();
    INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, barcode, is_published) 
    VALUES (prod_id, cat_id, mod_lrp, 'La Roche-Posay', 'Anthelios Crème Solaire Invisible 50+', 3200, '3337875706599', true);
    
    size_id := gen_random_uuid();
    INSERT INTO public.article_sizes (id, article_id, size_label) VALUES (size_id, prod_id, '50ml');
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, 'Standard', '#ffffff', 25);

    -- ==========================================
    -- 5. Insert Products for Maybelline
    -- ==========================================
    -- Product 5
    prod_id := gen_random_uuid();
    INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, barcode, is_published) 
    VALUES (prod_id, cat_id, mod_maybelline, 'Maybelline', 'Anti-Cernes Effaceur Instant Anti-Age', 2100, '3600531514757', true);
    
    size_id := gen_random_uuid();
    INSERT INTO public.article_sizes (id, article_id, size_label) VALUES (size_id, prod_id, 'Unique');
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, '01 Light', '#f5deb3', 15);
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, '02 Nude', '#deb887', 20);

    -- Product 6
    prod_id := gen_random_uuid();
    INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, barcode, is_published) 
    VALUES (prod_id, cat_id, mod_maybelline, 'Maybelline', 'Mascara Lash Sensational Sky High', 2500, '3600531625972', true);
    
    size_id := gen_random_uuid();
    INSERT INTO public.article_sizes (id, article_id, size_label) VALUES (size_id, prod_id, 'Unique');
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, 'Noir', '#000000', 45);

    -- ==========================================
    -- 6. Insert Products for L'Oréal
    -- ==========================================
    -- Product 7
    prod_id := gen_random_uuid();
    INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, barcode, is_published) 
    VALUES (prod_id, cat_id, mod_loreal, 'L''Oréal', 'Sérum Revitalift Acide Hyaluronique', 4800, '3600523875323', true);
    
    size_id := gen_random_uuid();
    INSERT INTO public.article_sizes (id, article_id, size_label) VALUES (size_id, prod_id, '30ml');
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, 'Standard', '#ffffff', 20);

    -- ==========================================
    -- 7. Insert Products for The Ordinary
    -- ==========================================
    -- Product 8
    prod_id := gen_random_uuid();
    INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, barcode, is_published) 
    VALUES (prod_id, cat_id, mod_ordinary, 'The Ordinary', 'Niacinamide 10% + Zinc 1%', 2800, '769915190311', true);
    
    size_id := gen_random_uuid();
    INSERT INTO public.article_sizes (id, article_id, size_label) VALUES (size_id, prod_id, '30ml');
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, 'Standard', '#ffffff', 60);

    -- Product 9
    prod_id := gen_random_uuid();
    INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, barcode, is_published) 
    VALUES (prod_id, cat_id, mod_ordinary, 'The Ordinary', 'AHA 30% + BHA 2% Peeling Solution', 3000, '769915190298', true);
    
    size_id := gen_random_uuid();
    INSERT INTO public.article_sizes (id, article_id, size_label) VALUES (size_id, prod_id, '30ml');
    INSERT INTO public.article_size_colors (size_id, color_name, color_hex, quantity) VALUES (size_id, 'Standard', '#990000', 35);

END $$;
