import { createClient } from "@/lib/supabase/server"
import { CheckCircle2, ChevronRight, Home, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const supabase = (await createClient()) as any
  const resolvedParams = await searchParams
  const id = resolvedParams.id

  let order = null
  if (id) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()
    order = data
  }

  return (
    <main className="container mx-auto px-4 py-16 md:py-24 text-center max-w-lg">
      <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
        <CheckCircle2 className="h-12 w-12" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Commande Confirmée !</h1>
      
      {order ? (
        <div className="bg-muted/30 p-6 rounded-2xl border text-left mb-8 shadow-sm">
          <p className="text-muted-foreground mb-4 text-center">
             Merci pour votre achat <strong>{order.client_name} {order.client_lastname}</strong>. Votre commande a été enregistrée avec succès.
          </p>
          
          <div className="space-y-3 pt-4 border-t">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">N° Commande</span>
               <span className="font-mono font-medium">{order.id.slice(0, 8)}...</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Paiement</span>
               <span className="font-medium">À la livraison</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Total payé</span>
               <span className="font-bold text-primary">{Math.round(order.total_price)} DZD</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Statut</span>
               <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-semibold">En attente</span>
             </div>
          </div>
          
          <div className="mt-6 text-sm text-center text-muted-foreground bg-primary/5 p-4 rounded-xl">
             Notre équipe vous contactera bientôt au <strong>{order.phone}</strong> pour confirmer l'expédition.
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground mb-8">
          Merci pour votre achat ! Vous recevrez un appel de confirmation sous peu.
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/boutique" className="w-full sm:w-auto">
          <Button size="lg" className="w-full rounded-xl shadow-md">
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Link>
        {/* We can later link to order tracking if developed
        <Link href="#" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl bg-white">
            <Package className="mr-2 h-4 w-4" />
            Suivre ma commande
          </Button>
        </Link> 
        */}
      </div>
    </main>
  )
}
