import { createClient } from "@/lib/supabase/server"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SuppliersTable } from "@/components/admin/suppliers/suppliers-table"
import { AddSupplierDialog } from "@/components/admin/suppliers/add-supplier-dialog"

export default async function SuppliersPage() {
  const supabase = await createClient()

  // 1. Get ALL Suppliers
  let { data: suppliers } = await supabase
    .from("suppliers")
    .select("*")
    .order("name")

  // 2. We need to calculate Solde for each supplier = SUM(Vouchers Total) - SUM(Payments Amount)
  // To do this efficiently, we can fetch all vouchers and payments grouping by supplier, 
  // or we can just fetch everything and reduce in memory since data size might not be huge yet.
  
  const { data: allVoucherItems } = await supabase
    .from("purchase_voucher_items")
    .select(`
      quantity, purchase_price,
      purchase_vouchers!inner(supplier_id)
    `)

  const { data: allPayments } = await supabase
    .from("supplier_payments")
    .select("supplier_id, amount")

  const enrichedSuppliers = (suppliers || []).map(sup => {
    // Calculate total bought
    const bToSup = (allVoucherItems || [])
        .filter((vi: any) => vi.purchase_vouchers.supplier_id === sup.id)
        .reduce((sum, item) => sum + (item.quantity * item.purchase_price), 0)

    // Calculate total paid
    const pToSup = (allPayments || [])
        .filter((p: any) => p.supplier_id === sup.id)
        .reduce((sum, p) => sum + p.amount, 0)
        
    // Debt (Solde) = Bought - Paid
    const solde = bToSup - pToSup

    return {
        ...sup,
        total_bought: bToSup,
        total_paid: pToSup,
        solde: Math.max(0, solde) // Usually shouldn't be negative, but let's be safe
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Fournisseurs (Suppliers)</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Gérez vos fournisseurs, suivez vos achats et vos versements.
          </p>
        </div>
        
        <AddSupplierDialog />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <SuppliersTable suppliers={enrichedSuppliers} />
      </div>
    </div>
  )
}