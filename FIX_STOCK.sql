-- ==========================================
-- SCRIPT DE RÉPARATION DU PROBLÈME DU STOCK DOUBLE
-- ==========================================

-- 1. Nettoyage absolu : Supprimer TOUS les anciens déclencheurs existants 
-- (même ceux créés avant ou cachés) sur la table purchase_voucher_items
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tgname
        FROM pg_trigger
        WHERE tgrelid = 'public.purchase_voucher_items'::regclass
            AND tgisinternal = false
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON public.purchase_voucher_items';
    END LOOP;
END
$$;

-- 2. Créer (ou recréer) nos 3 procédures parfaites
CREATE OR REPLACE FUNCTION public.handle_new_purchase_voucher_item()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.article_size_colors
  SET quantity = quantity + NEW.quantity
  WHERE id = NEW.color_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_deleted_purchase_voucher_item()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.article_size_colors
  SET quantity = GREATEST(0, quantity - OLD.quantity)
  WHERE id = OLD.color_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_updated_purchase_voucher_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Revert old quantity
  UPDATE public.article_size_colors
  SET quantity = GREATEST(0, quantity - OLD.quantity)
  WHERE id = OLD.color_id;

  -- Add new quantity
  UPDATE public.article_size_colors
  SET quantity = quantity + NEW.quantity
  WHERE id = NEW.color_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attacher UNIQUEMENT ces 3 nouveaux déclencheurs fiables pour qu'ils soient seuls.
CREATE TRIGGER trg_purchase_voucher_item_insert
AFTER INSERT ON public.purchase_voucher_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_purchase_voucher_item();

CREATE TRIGGER trg_purchase_voucher_item_delete
AFTER DELETE ON public.purchase_voucher_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_deleted_purchase_voucher_item();

CREATE TRIGGER trg_purchase_voucher_item_update
AFTER UPDATE ON public.purchase_voucher_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_purchase_voucher_item();
