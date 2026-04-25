-- Fix RLS for Suppliers and related tables
-- This ensures that authenticated users (Admins/Khadems) can view and manage suppliers

-- 1. Suppliers Table
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users to suppliers" ON public.suppliers;
CREATE POLICY "Enable all access for authenticated users to suppliers" ON public.suppliers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Supplier Payments Table
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users to supplier_payments" ON public.supplier_payments;
CREATE POLICY "Enable all access for authenticated users to supplier_payments" ON public.supplier_payments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Purchase Vouchers Table (if not already handled)
ALTER TABLE public.purchase_vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users to purchase_vouchers" ON public.purchase_vouchers;
CREATE POLICY "Enable all access for authenticated users to purchase_vouchers" ON public.purchase_vouchers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Purchase Voucher Items Table
ALTER TABLE public.purchase_voucher_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users to purchase_voucher_items" ON public.purchase_voucher_items;
CREATE POLICY "Enable all access for authenticated users to purchase_voucher_items" ON public.purchase_voucher_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
