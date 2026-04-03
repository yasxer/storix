import { createClient } from "@/lib/supabase/server"
import { CheckoutForm } from "@/components/store/checkout-form"
import { notFound } from "next/navigation"

export default async function CheckoutPage() {
  const supabase = (await createClient()) as any

  const { data: fees } = await supabase
    .from("delivery_fees")
    .select("*")
    .eq("is_active", true)
    .order("wilaya_code", { ascending: true })

  if (!fees) notFound()

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Caisse</h1>
        <p className="text-muted-foreground mt-2">Validez et payez votre commande à la livraison</p>
      </div>

      <CheckoutForm wilayas={fees} />
    </main>
  )
}
