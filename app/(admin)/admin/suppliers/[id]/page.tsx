import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, Wallet, ReceiptText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { AddPaymentDialog } from "@/components/admin/suppliers/add-payment-dialog"

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: supplier, error: supErr } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", params.id)
    .single()

  if (supErr || !supplier) {
    return <div className="p-8 text-center text-red-500">Fournisseur introuvable.</div>
  }

  // Get Vouchers (Bons d'achat)
  const { data: vouchers } = await supabase
    .from("purchase_vouchers")
    .select(`
      id, notes, created_at,
      profiles!purchase_vouchers_created_by_fkey(full_name),
      purchase_voucher_items ( quantity, purchase_price )
    `)
    .eq("supplier_id", params.id)
    .order("created_at", { ascending: false })

  // Get Payments (Versements)
  const { data: payments } = await supabase
    .from("supplier_payments")
    .select(`
      id, amount, payment_date, notes, created_at, voucher_id,
      profiles(full_name)
    `)
    .eq("supplier_id", params.id)
    .order("payment_date", { ascending: false })

  // Calculs
  const processedVouchers = (vouchers || []).map(v => {
    const total = v.purchase_voucher_items.reduce((sum: number, item: any) => sum + (item.quantity * item.purchase_price), 0)
    return { ...v, total }
  })

  const totalAchats = processedVouchers.reduce((s, v) => s + v.total, 0)
  const totalVersements = (payments || []).reduce((s, p) => s + p.amount, 0)
  const solde = Math.max(0, totalAchats - totalVersements)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="outline" size="icon" asChild className="rounded-full shrink-0">
          <Link href="/admin/suppliers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)] flex items-center gap-3">
            {supplier.name}
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                solde > 0 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-green-50 text-green-600 border border-green-100'
            }`}>
              Solde: {solde.toFixed(2)} DZD
            </span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 flex gap-4">
            <span>📞 {supplier.phone || "N/A"}</span>
            <span>📍 {supplier.address || "N/A"}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COL 1: ACHATS */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50/50 p-4 border-b flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-blue-600" />
              Bons d'Achat ({processedVouchers.length})
            </h2>
            <span className="text-sm font-bold text-gray-500">{totalAchats.toFixed(2)} DZD</span>
          </div>
          
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {processedVouchers.length === 0 && <p className="p-8 text-center text-gray-400 text-sm">Aucun achat.</p>}
            {processedVouchers.map((v: any) => (
              <div key={v.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    N° {v.id.substring(0, 8)}
                    <Link href={`/admin/vouchers/${v.id}/edit`} className="text-blue-500 hover:underline text-xs">(Voir)</Link>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {format(new Date(v.created_at), "dd MMM yyyy, HH:mm")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-900">{v.total.toFixed(2)}</span>
                  <span className="text-xs text-gray-500 ml-1">DZD</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COL 2: VERSEMENTS */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="bg-green-50/50 p-4 border-b border-green-100 flex justify-between items-center">
            <h2 className="font-bold text-green-800 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Versements ({payments?.length || 0})
            </h2>
            <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-green-700">{totalVersements.toFixed(2)} DZD</span>
                <AddPaymentDialog supplierId={supplier.id} solde={solde} />
            </div>
          </div>
          
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {(!payments || payments.length === 0) && <p className="p-8 text-center text-gray-400 text-sm">Aucun versement enregistré.</p>}
            {payments?.map((p: any) => (
              <div key={p.id} className="p-4 hover:bg-green-50/50 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-green-700">+{p.amount.toFixed(2)} DZD</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {format(new Date(p.payment_date), "dd MMM yyyy")}
                    {p.notes && <span className="ml-2 italic text-gray-400">- {p.notes}</span>}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">Par: {p.profiles?.full_name || 'Admin'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}