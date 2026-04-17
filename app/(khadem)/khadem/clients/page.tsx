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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-3xl font-black font-display text-gray-900 tracking-tight">Clients</h1>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Gestion des crédits et des versements
          </p>
        </div>
        <div className="pt-2">
           <AddClientDialog />
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <ClientsTable clients={enrichedClients} />
      </div>
    </div>
  )
}



