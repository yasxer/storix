-- =========================================================================
-- NETTOYAGE ET REMPLISSAGE DE LA BASE DE DONNÉES (TEST DATA)
-- =========================================================================

-- 1. VIDER TOUTES LES TABLES (SAUF AUTH ET SES PROFILS)
TRUNCATE TABLE 
  public.supplier_payments,
  public.purchase_voucher_items,
  public.purchase_vouchers,
  public.suppliers,
  public.order_items,
  public.orders,
  public.bon_items,
  public.bons,
  public.daily_sessions,
  public.article_photos,
  public.article_size_colors,
  public.article_sizes,
  public.articles,
  public.models,
  public.categories,
  public.promotions
CASCADE;

-- =========================================================================
-- 2. INSERTION DE DONNÉES DE DÉMONSTRATION (SEED)
-- =========================================================================

-- ----- CATÉGORIES -----
INSERT INTO public.categories (id, name, slug) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Vêtements Homme', 'vetements-homme'),
  ('22222222-2222-2222-2222-222222222222', 'Vêtements Femme', 'vetements-femme'),
  ('33333333-3333-3333-3333-333333333333', 'Chaussures', 'chaussures');

-- ----- MODÈLES -----
INSERT INTO public.models (id, category_id, name) VALUES
  ('11111111-2222-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'T-shirts Basic'),
  ('22222222-3333-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Vestes Cuir'),
  ('33333333-4444-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Robes Soirée'),
  ('44444444-5555-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Baskets Sport');

-- ----- ARTICLES (PRODUITS) -----
INSERT INTO public.articles (id, category_id, model_id, charika, title, base_price, purchase_price, barcode, description, is_published, is_featured) VALUES
  ('11111111-aaaa-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-2222-1111-1111-111111111111', 'ZARA', 'T-shirt Polo Classic', 1500, 800, 'TSHIRT01', 'Polo en coton très confortable', true, true),
  ('22222222-bbbb-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '22222222-3333-2222-2222-222222222222', 'GUCCI', 'Veste en Cuir Premium', 8500, 5000, 'VESTE02', 'Veste classe pour hiver', true, true),
  ('33333333-cccc-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '44444444-5555-4444-4444-444444444444', 'NIKE', 'Chaussures AirMax', 7200, 4800, 'AIRMAX99', 'Idéal pour le running', true, true);

-- ----- TAILLES (SIZES) -----
-- T-shirt tailles
INSERT INTO public.article_sizes (id, article_id, size_label) VALUES
  ('11aaaaaa-1111-1111-1111-111111111111', '11111111-aaaa-1111-1111-111111111111', 'M'),
  ('11bbbbbb-1111-1111-1111-111111111111', '11111111-aaaa-1111-1111-111111111111', 'L');

-- Veste cuir taille
INSERT INTO public.article_sizes (id, article_id, size_label) VALUES
  ('22aaaaaa-2222-2222-2222-222222222222', '22222222-bbbb-2222-2222-222222222222', 'Standard');

-- Chaussure taille
INSERT INTO public.article_sizes (id, article_id, size_label) VALUES
  ('33aaaaaa-3333-3333-3333-333333333333', '33333333-cccc-3333-3333-333333333333', '42'),
  ('33bbbbbb-3333-3333-3333-333333333333', '33333333-cccc-3333-3333-333333333333', '43');

-- ----- VARIANTS COULEURS + STOCK -----
-- T-shirt M (Blanc, Noir)
INSERT INTO public.article_size_colors (id, size_id, color_name, color_hex, quantity) VALUES
  ('11a11111-1111-1111-1111-111111111111', '11aaaaaa-1111-1111-1111-111111111111', 'Blanc', '#FFFFFF', 45),
  ('11a22222-1111-1111-1111-111111111111', '11aaaaaa-1111-1111-1111-111111111111', 'Noir', '#000000', 30);
-- T-shirt L (Blanc)
INSERT INTO public.article_size_colors (id, size_id, color_name, color_hex, quantity) VALUES
  ('11b11111-1111-1111-1111-111111111111', '11bbbbbb-1111-1111-1111-111111111111', 'Blanc', '#FFFFFF', 20);

-- Veste Cuir (Noir)
INSERT INTO public.article_size_colors (id, size_id, color_name, color_hex, quantity) VALUES
  ('22a11111-2222-2222-2222-222222222222', '22aaaaaa-2222-2222-2222-222222222222', 'Noir', '#000000', 10);

-- Chaussure 42 & 43 (Rouge, Bleu)
INSERT INTO public.article_size_colors (id, size_id, color_name, color_hex, quantity) VALUES
  ('33a11111-3333-3333-3333-333333333333', '33aaaaaa-3333-3333-3333-333333333333', 'Rouge', '#FF0000', 15),
  ('33b11111-3333-3333-3333-333333333333', '33bbbbbb-3333-3333-3333-333333333333', 'Bleu', '#0000FF', 8);

-- ----- FOURNISSEURS -----
INSERT INTO public.suppliers (id, name, phone, address) VALUES
  ('11111111-ffff-1111-1111-111111111111', 'Grossiste Alger', '0555123456', 'Alger, Algérie'),
  ('22222222-ffff-2222-2222-222222222222', 'Importateur Oran', '0770987654', 'Oran, El Akid');

-- =========================================================================
-- FIN DU SCRIPT
-- =========================================================================
