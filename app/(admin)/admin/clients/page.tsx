import { createClient } from "@/lib/supabase/server"
import { ClientsTable } from "@/components/admin/clients/clients-table"
import { AddClientDialog } from "@/components/admin/clients/add-client-dialog"

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: transactions } = await supabase
    .from("client_transactions")
    .select("client_id, type, amount")

  const enrichedClients = (clients || []).map(client => {
    const clientTx = (transactions || []).filter(tx => tx.client_id === client.id)
    
    const bToClient = clientTx
        .filter(tx => tx.type === "purchase")
        .reduce((sum, item) => sum + Number(item.amount), 0)

    const pToClient = clientTx
        .filter(tx => tx.type === "payment")
        .reduce((sum, item) => sum + Number(item.amount), 0)
        
    const solde = bToClient - pToClient

    return {
        ...client,
        total_bought: bToClient,
        total_paid: pToClient,
        solde: Number(solde)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-text)]">Clients (Crédits & Versements)</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Gérez vos clients spéciaux, suivez ce qu'ils ont pris et leurs versements.
          </p>
        </div>
        
        <AddClientDialog />
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <ClientsTable clients={enrichedClients} />
      </div>
    </div>
  )
}
