"use client"

import { useState, useMemo } from "react"
import { useCartStore } from "@/lib/store/cart"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { createOrder } from "@/app/(store)/checkout/actions"
import { Loader2 } from "lucide-react"

const checkoutSchema = z.object({
  client_name: z.string().min(2, "Nom trop court"),
  client_lastname: z.string().min(2, "Prénom trop court"),
  phone: z.string().min(9, "Numéro de téléphone invalide"),
  wilaya: z.string().min(2, "Wilaya requise"),
  delivery_type: z.enum(["domicile", "bureau"]),
  address: z.string().min(5, "Adresse détaillée requise"),
  notes: z.string().optional(),
})

export function CheckoutForm({ wilayas }: { wilayas: any[] }) {
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      client_name: "",
      client_lastname: "",
      phone: "",
      wilaya: "",
      delivery_type: "domicile",
      address: "",
      notes: "",
    },
  })

  const formWilaya = watch("wilaya")
  const deliveryType = watch("delivery_type")

  const subtotal = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)

  const deliveryFee = useMemo(() => {
    if (!formWilaya) return 0
    const w = wilayas.find((w) => w.wilaya_name === formWilaya)
    if (!w) return 0
    return deliveryType === "domicile" ? w.fee_domicile : w.fee_bureau
  }, [formWilaya, deliveryType, wilayas])

  const total = subtotal + deliveryFee

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
        <Button onClick={() => router.push("/boutique")}>Retour à la boutique</Button>
      </div>
    )
  }

  async function onSubmit(data: any) {
    setLoading(true)
    setError(null)
    
    // We pass both data and the cart items
    const result = await createOrder(data, items)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    clearCart()
    router.push(`/checkout/confirmation?id=${result.orderId}`)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-2xl border shadow-sm">
        
        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Vos coordonnées</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Nom *</Label>
              <Input id="client_name" {...register("client_name")} placeholder="Votre nom" />
              {errors.client_name && <p className="text-sm text-red-500">{String(errors.client_name.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_lastname">Prénom *</Label>
              <Input id="client_lastname" {...register("client_lastname")} placeholder="Votre prénom" />
              {errors.client_lastname && <p className="text-sm text-red-500">{String(errors.client_lastname.message)}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="ex: 0550... / 0660..." />
            {errors.phone && <p className="text-sm text-red-500">{String(errors.phone.message)}</p>}
          </div>
        </div>

        <div className="my-6 h-px w-full bg-border" />

        {/* Delivery Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Livraison</h2>
          
          <div className="space-y-2">
            <Label htmlFor="wilaya">Wilaya *</Label>
            <select
              id="wilaya"
              {...register("wilaya")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Sélectionnez votre wilaya</option>
              {wilayas.map((w: any) => (
                <option key={w.id} value={w.wilaya_name}>
                  {w.wilaya_code} - {w.wilaya_name}
                </option>
              ))}
            </select>
            {errors.wilaya && <p className="text-sm text-red-500">{String(errors.wilaya.message)}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <Label>Type de livraison *</Label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <input 
                  type="radio" 
                  value="domicile" 
                  {...register("delivery_type")} 
                  className="mt-1" 
                />
                <div>
                  <div className="font-semibold mb-1">À Domicile</div>
                  <div className="text-sm text-muted-foreground">Livraison jusqu'à votre porte.</div>
                  {formWilaya && <div className="text-sm font-bold text-primary mt-2">+{wilayas.find((w:any) => w.wilaya_name === formWilaya)?.fee_domicile || 0} DZD</div>}
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <input 
                  type="radio" 
                  value="bureau" 
                  {...register("delivery_type")} 
                  className="mt-1" 
                />
                <div>
                  <div className="font-semibold mb-1">Point Relais</div>
                  <div className="text-sm text-muted-foreground">Récupération au bureau du livreur.</div>
                  {formWilaya && <div className="text-sm font-bold text-primary mt-2">+{wilayas.find((w:any) => w.wilaya_name === formWilaya)?.fee_bureau || 0} DZD</div>}
                </div>
              </label>
            </div>
            {errors.delivery_type && <p className="text-sm text-red-500">{String(errors.delivery_type.message)}</p>}
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="address">Adresse Détaillée *</Label>
            <textarea
              id="address"
              className="resize-none w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("address")}
              placeholder="Indiquez l'adresse exacte (Cité, rue, bâtiment, étage...)"
              rows={3}
            />
            {errors.address && <p className="text-sm text-red-500">{String(errors.address.message)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes supplémentaires (Optionnel)</Label>
            <textarea
              id="notes"
              className="resize-none w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("notes")}
              placeholder="Information utile pour le livreur ?"
              rows={2}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            Erreur: {error}
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading || !formWilaya} className="w-full h-14 rounded-xl text-lg font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmer ma commande"}
        </Button>
      </form>

      {/* Recap */}
      <div className="bg-muted/30 p-6 rounded-2xl border sticky top-24">
        <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
        
        <div className="space-y-4 mb-6">
          {items.map((item) => (
             <div key={`${item.article_id}-${item.size_id}-${item.color_id}`} className="flex items-start gap-4">
               <div className="flex-1">
                 <div className="font-semibold text-sm line-clamp-1">{item.title}</div>
                 <div className="text-xs text-muted-foreground mt-0.5">
                   {item.size_label} | {item.color_name} x {item.quantity}
                 </div>
               </div>
               <div className="font-semibold text-sm whitespace-nowrap">
                 {(item.unit_price * item.quantity).toFixed(0)} DZD
               </div>
             </div>
          ))}
        </div>

        <div className="my-4 h-px w-full bg-border" />

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-muted-foreground text-sm">
            <span>Sous-total:</span>
            <span>{subtotal.toFixed(0)} DZD</span>
          </div>
          <div className="flex justify-between text-muted-foreground text-sm">
            <span>Livraison ({deliveryType}):</span>
            <span>{formWilaya ? `+${deliveryFee} DZD` : 'À calculer'}</span>
          </div>
        </div>
        
        <div className="my-4 h-px w-full bg-border" />
        
        <div className="flex justify-between font-bold text-2xl">
          <span>Total à payer:</span>
          <span className="text-primary">{total.toFixed(0)} DZD</span>
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-6 flex items-center justify-center gap-1.5 flex-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          Le paiement s'effectuera à la livraison (Cash on Delivery)
        </p>
      </div>

    </div>
  )
}
