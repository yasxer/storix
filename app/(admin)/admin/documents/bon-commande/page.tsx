import { createClient } from "@/lib/supabase/server"
import BonCommandeForm from "./bon-commande-form"

export const metadata = {
  title: 'Créer Bon de Commande',
}

export default async function BonCommandePage() {
  const supabase = await createClient()

  // Fetch Suppliers
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name")
    .order("name")

  // Fetch Products
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, base_price")
    .order("title")

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-gray-900 tracking-tight">Bon de Commande</h1>
        <p className="text-sm text-gray-500 mt-1">
          Créez et imprimez des bons de commande pour vos fournisseurs. Ces documents n'affectent pas votre stock actuel.
        </p>
      </div>

      <BonCommandeForm suppliers={suppliers || []} articles={articles || []} />
    </div>
  )
}
