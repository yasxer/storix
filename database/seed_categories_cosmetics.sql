-- Seed file for cosmetics categories
-- To run this, copy and paste into the SQL Editor in Supabase.

INSERT INTO public.categories (name, slug, position) VALUES
  ('Soins du Visage', 'soins-du-visage', 1),
  ('Soins du Corps', 'soins-du-corps', 2),
  ('Maquillage Teint', 'maquillage-teint', 3),
  ('Maquillage Yeux', 'maquillage-yeux', 4),
  ('Maquillage Lèvres', 'maquillage-levres', 5),
  ('Parfums Femme', 'parfums-femme', 6),
  ('Parfums Homme', 'parfums-homme', 7),
  ('Soins des Cheveux', 'soins-des-cheveux', 8),
  ('Accessoires Beauté', 'accessoires-beaute', 9),
  ('Onglerie (Vernis & Soins)', 'onglerie', 10),
  ('Solaire & Bronzage', 'solaire-bronzage', 11),
  ('Hygiène', 'hygiene', 12),
  ('Démaquillants & Nettoyants', 'demaquillants-nettoyants', 13),
  ('Masques & Gommages', 'masques-gommages', 14),
  ('Soins Anti-Âge', 'soins-anti-age', 15),
  ('Soins Hydratants', 'soins-hydratants', 16),
  ('Colorations Cheveux', 'colorations-cheveux', 17),
  ('Produits Homme (Barbe & Soins)', 'produits-homme', 18),
  ('Soins Bio & Naturels', 'soins-bio-naturels', 19),
  ('Maternité & Bébé', 'maternite-bebe', 20),
  ('Coffrets Cadeaux', 'coffrets-cadeaux', 21),
  ('Parapharmacie', 'parapharmacie', 22),
  ('Bain & Douche', 'bain-douche', 23),
  ('Déodorants', 'deodorants', 24),
  ('Soins des Lèvres', 'soins-des-levres', 25)
ON CONFLICT (slug) DO NOTHING;
