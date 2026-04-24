import { createClient } from "@/lib/supabase/server"
import { ClientsTable } from "@/components/khadem/clients/clients-table"
import { AddClientDialog } from "@/components/khadem/clients/add-client-dialog"

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
    <div className="space-y-6 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-gray-900 tracking-tight">Clients</h1>
          <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Gestion des crédits et des versements
          </p>
        </div>
        <div className="flex-shrink-0">
           <AddClientDialog />
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-[32px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <ClientsTable clients={enrichedClients} />
      </div>
    </div>
  )
}



