-- Migration 1: Add Purchase Price to articles
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE public.article_sizes
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC DEFAULT NULL;


-- Migration 2: Stock Management for Purchase Vouchers
-- Create a function to add stock when a purchase voucher item is inserted
CREATE OR REPLACE FUNCTION public.handle_new_purchase_voucher_item()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.article_size_colors
  SET quantity = quantity + NEW.quantity
  WHERE id = NEW.color_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to deduct stock when a purchase voucher item is deleted
CREATE OR REPLACE FUNCTION public.handle_deleted_purchase_voucher_item()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.article_size_colors
  SET quantity = GREATEST(0, quantity - OLD.quantity)
  WHERE id = OLD.color_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create a function to adjust stock when a purchase voucher item is updated
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

-- Attach triggers to the purchase_voucher_items table
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
