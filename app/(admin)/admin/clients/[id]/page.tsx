import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ArrowLeft, CheckCircle2, History, Phone, TrendingDown, TrendingUp, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AddTransactionDialog } from "@/components/admin/clients/add-transaction-dialog"
import { AddPurchaseWithStockDialog } from "@/components/admin/clients/add-purchase-with-stock-dialog"
import { ClientTransactionsTable } from "@/components/admin/clients/client-transactions-table"
import PrintButton from "@/components/print-button"

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
          <Link href="/admin/clients">Retour aux clients</Link>
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm hover:bg-gray-100">
          <Link href="/admin/clients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)] flex items-center gap-2">
            <User className="h-6 w-6 text-[var(--color-primary)]" />
            {client.name}
          </h1>
          {client.phone && (
            <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
              <Phone className="h-3 w-3" />
              {client.phone}
            </p>
          )}
        </div>
        <div className="flex gap-2 ml-auto">
          <PrintButton type="client_statement" id={client.id} label="Relevé" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Acheté (Dettes)</p>
            <p className="text-2xl font-bold text-gray-900">{totalPurchases.toFixed(2)} DZD</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full text-green-600">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Versé (Paiements)</p>
            <p className="text-2xl font-bold text-gray-900">{totalPayments.toFixed(2)} DZD</p>
          </div>
        </div>

        <div className={`rounded-xl p-5 border shadow-sm flex items-center gap-4 ${solde > 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
          <div className={`p-3 rounded-full ${solde > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            <History className="h-6 w-6" />
          </div>
          <div>
            <p className={`text-sm font-medium ${solde > 0 ? "text-red-800" : "text-green-800"}`}>
              {solde > 0 ? "Crédit Restant (Il doit)" : "Solde Réglé"}
            </p>
            <p className={`text-2xl font-bold ${solde > 0 ? "text-red-700" : "text-green-700"}`}>
              {Math.abs(solde).toFixed(2)} DZD
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border text-[var(--color-text)] shadow-sm rounded-xl flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
        <div>
          <h2 className="text-lg font-bold font-display">Historique des Opérations</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Consultez ce qu'il a pris et ce qu'il a versé.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:flex sm:gap-2 flex-wrap">
          <AddTransactionDialog clientId={client.id} type="payment" buttonText="Ajouter Versement" />
          <AddPurchaseWithStockDialog clientId={client.id} />
          <AddTransactionDialog clientId={client.id} type="purchase" buttonText="Achat Simple" />
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {(!transactions || transactions.length === 0) ? (
          <div className="p-8 text-center text-gray-500">
            <History className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p>Aucune transaction pour ce client.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <ClientTransactionsTable transactions={transactions} clientId={client.id} />
          </div>
        )}
      </div>
    </div>
  )
}