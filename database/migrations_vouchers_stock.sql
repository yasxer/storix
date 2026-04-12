-- Supabase SQL Editor: Stock Management for Purchase Vouchers

-- 1. Create a function to add stock when a purchase voucher item is inserted
CREATE OR REPLACE FUNCTION public.handle_new_purchase_voucher_item()
RETURNS TRIGGER AS \database\migrations_purchase_price.sql
BEGIN
  UPDATE public.article_size_colors
  SET quantity = quantity + NEW.quantity
  WHERE id = NEW.color_id;
  RETURN NEW;
END;
\database\migrations_purchase_price.sql LANGUAGE plpgsql;

-- 2. Create a function to deduct stock when a purchase voucher item is deleted
CREATE OR REPLACE FUNCTION public.handle_deleted_purchase_voucher_item()
RETURNS TRIGGER AS \database\migrations_purchase_price.sql
BEGIN
  UPDATE public.article_size_colors
  SET quantity = GREATEST(0, quantity - OLD.quantity)
  WHERE id = OLD.color_id;
  RETURN OLD;
END;
\database\migrations_purchase_price.sql LANGUAGE plpgsql;

-- 3. Create a function to adjust stock when a purchase voucher item is updated
CREATE OR REPLACE FUNCTION public.handle_updated_purchase_voucher_item()
RETURNS TRIGGER AS \database\migrations_purchase_price.sql
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
\database\migrations_purchase_price.sql LANGUAGE plpgsql;

-- 4. Attach triggers to the purchase_voucher_items table
DROP TRIGGER IF EXISTS trg_purchase_voucher_item_insert ON public.purchase_voucher_items;
CREATE TRIGGER trg_purchase_voucher_item_insert
AFTER INSERT ON public.purchase_voucher_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_purchase_voucher_item();

DROP TRIGGER IF EXISTS trg_purchase_voucher_item_delete ON public.purchase_voucher_items;
CREATE TRIGGER trg_purchase_voucher_item_delete
AFTER DELETE ON public.purchase_voucher_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_deleted_purchase_voucher_item();

DROP TRIGGER IF EXISTS trg_purchase_voucher_item_update ON public.purchase_voucher_items;
CREATE TRIGGER trg_purchase_voucher_item_update
AFTER UPDATE ON public.purchase_voucher_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_purchase_voucher_item();
