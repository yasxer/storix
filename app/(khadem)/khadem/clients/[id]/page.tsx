import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ArrowLeft, CheckCircle2, History, Phone, TrendingDown, TrendingUp, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AddTransactionDialog } from "@/components/khadem/clients/add-transaction-dialog"
import { AddPurchaseWithStockDialog } from "@/components/khadem/clients/add-purchase-with-stock-dialog"
import { ClientTransactionsTable } from "@/components/khadem/clients/client-transactions-table"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient()

  // Get Client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single()

  if (!client) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl max-w-2xl mx-auto mt-10">
        <h2 className="text-xl font-bold mb-2">Erreur: Client introuvable</h2>
        <p>L'ID demandé: {id}</p>
        <p className="mt-2 text-sm opacity-80">Détails de l'erreur: {clientError?.message || "Aucune donnée retournée"}</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/khadem/clients">Retour aux clients</Link>
        </Button>
      </div>
    )
  }

  // Get Transactions
  const { data: transactions } = await supabase
    .from("client_transactions")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false })

  const totalPurchases = (transactions || [])
    .filter(tx => tx.type === "purchase")
    .reduce((sum, tx) => sum + Number(tx.amount), 0)

  const totalPayments = (transactions || [])
    .filter(tx => tx.type === "payment")
    .reduce((sum, tx) => sum + Number(tx.amount), 0)

  const solde = totalPurchases - totalPayments

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6">
      <div className="flex items-center gap-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <Button variant="ghost" size="icon" asChild className="rounded-full shadow-none bg-gray-50 hover:bg-gray-100 shrink-0 h-10 w-10">
          <Link href="/khadem/clients">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2 leading-tight">
            <User className="h-5 w-5 text-gray-400" />
            {client.name}
          </h1>
          {client.phone && (
            <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-0.5 uppercase tracking-wider">
              <Phone className="h-3 w-3" />
              {client.phone}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {/* State-of-the-art Debt Card */}
        <div className={cn(
          "relative overflow-hidden rounded-[40px] p-7 transition-all border",
          solde > 0 
            ? "bg-white border-red-100 shadow-[0_20px_50px_rgba(239,68,68,0.08)]" 
            : "bg-[var(--wise-mint)] border-transparent shadow-[0_20px_50px_rgba(159,232,112,0.15)]"
        )}>
          {/* Decorative background element */}
          <div className={cn(
            "absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10",
            solde > 0 ? "bg-red-500" : "bg-[var(--wise-dark-green)]"
          )} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className={cn(
                "text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2",
                solde > 0 ? "text-red-500" : "text-[var(--wise-dark-green)]"
              )}>
                <History className="h-3.5 w-3.5" /> 
                {solde > 0 ? "Montant à Récupérer" : "Solde Entièrement Réglé"}
              </p>
              {solde <= 0 && <CheckCircle2 className="h-5 w-5 text-[var(--wise-dark-green)]" />}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-5xl font-black tracking-[-0.05em]",
                solde > 0 ? "text-red-600" : "text-[var(--wise-dark-green)]"
              )}>
                {Math.abs(solde).toLocaleString('fr-FR', { minimumFractionDigits: 0 })}
              </span>
              <span className={cn(
                "text-sm font-black opacity-30 uppercase tracking-[0.2em]",
                solde > 0 ? "text-red-900" : "text-[var(--wise-dark-green)]"
              )}>
                DZD
              </span>
            </div>
          </div>
        </div>

        {/* Totals Summary - Side by Side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm flex flex-col gap-1.5">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
              <TrendingUp className="h-3 w-3" /> ACHATS
            </p>
            <p className="text-xl font-black text-gray-900 tracking-tight">
              {totalPurchases.toLocaleString()} <span className="text-[10px] opacity-30 font-bold uppercase">DA</span>
            </p>
          </div>

          <div className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm flex flex-col gap-1.5 text-right items-end">
            <p className="text-[9px] font-black text-[var(--wise-dark-green)] opacity-40 uppercase tracking-widest flex items-center gap-1.5 justify-end">
              TOTAL VERSÉ <TrendingDown className="h-3 w-3" />
            </p>
            <p className="text-xl font-black text-[var(--wise-dark-green)] tracking-tight">
              {totalPayments.toLocaleString()} <span className="text-[10px] opacity-30 font-bold uppercase">DA</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border-y sm:border sm:rounded-3xl border-gray-100 shadow-sm flex flex-col p-5 gap-5 -mx-4 sm:mx-0">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">Historique des Opérations</h2>
          <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Consultez ce qu'il a pris et ce qu'il a versé.</p>
        </div>
        
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 px-1">
          <AddTransactionDialog clientId={client.id} type="payment" buttonText="Verser" />
          <AddPurchaseWithStockDialog clientId={client.id} />
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          {(!transactions || transactions.length === 0) ? (
            <div className="py-8 text-center text-gray-400 flex flex-col items-center">
              <History className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm font-bold">Aucune transaction pour ce client.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5">
              <ClientTransactionsTable transactions={transactions} clientId={client.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

