-- This script adds a trigger to automatically revert stock when a sale (bon) is deleted.
-- Run this in your Supabase SQL Editor.

-- 1. Create the function that reverts the stock
CREATE OR REPLACE FUNCTION revert_stock_on_bon_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment the quantity back in article_size_colors
    UPDATE article_size_colors
    SET quantity = quantity + OLD.quantity
    WHERE id = OLD.color_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the bon_items table
-- This ensures that even if you delete a Bon (and its items cascade delete), 
-- the stock will be restored for every item.
DROP TRIGGER IF EXISTS trigger_revert_stock ON bon_items;
CREATE TRIGGER trigger_revert_stock
AFTER DELETE ON bon_items
FOR EACH ROW
EXECUTE FUNCTION revert_stock_on_bon_delete();
