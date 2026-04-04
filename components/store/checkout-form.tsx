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
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-transparent w-full">

        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Vos coordonnées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="client_name" className="text-slate-700 font-semibold cursor-pointer">Nom *</Label>
              <Input id="client_name" {...register("client_name")} placeholder="Votre nom" className="h-12 rounded-lg border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:ring-offset-0 bg-white" />
              {errors.client_name && <p className="text-sm text-rose-500 font-medium">{String(errors.client_name.message)}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_lastname" className="text-slate-700 font-semibold cursor-pointer">Prénom *</Label>
              <Input id="client_lastname" {...register("client_lastname")} placeholder="Votre prénom" className="h-12 rounded-lg border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:ring-offset-0 bg-white" />
              {errors.client_lastname && <p className="text-sm text-rose-500 font-medium">{String(errors.client_lastname.message)}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-700 font-semibold cursor-pointer">Téléphone *</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="ex: 0550... / 0660..." className="h-12 rounded-lg border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:ring-offset-0 bg-white text-lg tracking-wide" />        
            {errors.phone && <p className="text-sm text-rose-500 font-medium">{String(errors.phone.message)}</p>}
          </div>
        </div>

        <div className="my-8 h-px w-full bg-slate-200" />
        
        {/* Delivery Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Livraison</h2>       

          <div className="space-y-2">
            <Label htmlFor="wilaya" className="text-slate-700 font-semibold cursor-pointer">Wilaya *</Label>
            <select
              id="wilaya"
              {...register("wilaya")}
              className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-4 py-2 text-sm md:text-base outline-none focus:ring-2 focus:ring-slate-900 transition-all disabled:opacity-50 appearance-none font-medium text-slate-700"
            >
              <option value="">Sélectionnez votre wilaya</option>
              {wilayas.map((w: any) => (
                <option key={w.id} value={w.wilaya_name}>
                  {w.wilaya_code} - {w.wilaya_name}
                </option>
              ))}
            </select>
            {errors.wilaya && <p className="text-sm text-rose-500 font-medium">{String(errors.wilaya.message)}</p>}
          </div>

          <div className="space-y-3 pt-4">
            <Label className="text-slate-600 font-semibold mb-2 block">Type de livraison *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start gap-4 p-5 border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-slate-300 transition-all [&:has(:checked)]:border-slate-900 [&:has(:checked)]:bg-slate-50 group">
                <div className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-300 group-has-[:checked]:border-slate-900"> 
                  <input 
                    type="radio" 
                    value="domicile" 
                    {...register("delivery_type")} 
                    className="opacity-0 absolute" 
                  />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 mb-1">À Domicile</div>
                  <div className="text-sm text-slate-500 leading-snug">Livraison jusqu'à votre porte ou lieu de travail.</div>
                  {formWilaya && <div className="text-sm font-black text-slate-800 mt-2 bg-slate-100 inline-block px-2 py-1 rounded-md">+{wilayas.find((w:any) => w.wilaya_name === formWilaya)?.fee_domicile || 0} DA</div>}
                </div>
              </label>

              <label className="flex items-start gap-4 p-5 border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-slate-300 transition-all [&:has(:checked)]:border-slate-900 [&:has(:checked)]:bg-slate-50 group">
                <div className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-300 group-has-[:checked]:border-slate-900"> 
                  <input 
                    type="radio" 
                    value="bureau" 
                    {...register("delivery_type")} 
                    className="opacity-0 absolute" 
                  />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 mb-1">Point Relais (StopDesk)</div>
                  <div className="text-sm text-slate-500 leading-snug">Récupération au bureau du transporteur dans votre wilaya.</div>
                  {formWilaya && <div className="text-sm font-black text-slate-800 mt-2 bg-slate-100 inline-block px-2 py-1 rounded-md">+{wilayas.find((w:any) => w.wilaya_name === formWilaya)?.fee_bureau || 0} DA</div>}
                </div>
              </label>
            </div>
            {errors.delivery_type && <p className="text-sm text-rose-500 font-medium">{String(errors.delivery_type.message)}</p>}
          </div>

          <div className="space-y-2.5 pt-4">
            <Label htmlFor="address" className="text-slate-600 font-semibold cursor-pointer">Adresse Détaillée *</Label>
            <textarea
              id="address"
              className="resize-none w-full h-24 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-4 py-3 text-sm md:text-base outline-none focus:ring-2 focus:ring-slate-900 transition-all disabled:opacity-50 placeholder:text-slate-400"
              {...register("address")}
              placeholder="Indiquez l'adresse exacte (Cité, rue, bâtiment, étage...)"
            />
            {errors.address && <p className="text-sm text-rose-500 font-medium">{String(errors.address.message)}</p>}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="notes" className="text-slate-600 font-semibold cursor-pointer">Notes supplémentaires (Optionnel)</Label>
            <textarea
              id="notes"
              className="resize-none w-full h-20 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-4 py-3 text-sm md:text-base outline-none focus:ring-2 focus:ring-slate-900 transition-all disabled:opacity-50 placeholder:text-slate-400"
              {...register("notes")}
              placeholder="Information utile pour le livreur ?"
            />
          </div>
        </div>

        <div className="my-8 h-px w-full bg-slate-100" />

        {/* Totals Section */}
        <div className="bg-slate-50/50 p-6 rounded-[2xl] border border-slate-100">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-slate-500 font-medium text-base">
              <span>Sous-total:</span>
              <span>{subtotal.toFixed(0)} DA</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium text-base">
              <span>Livraison ({deliveryType}):</span>
              <span>{formWilaya ? `+${deliveryFee} DA` : 'À calculer'}</span>    
            </div>
          </div>

          <div className="my-6 h-px w-full bg-slate-200" />

          <div className="flex justify-between font-black text-2xl text-slate-900 items-end mb-6">
            <span>Total à payer:</span>
            <span className="text-3xl text-slate-900 block mt-1">{total.toFixed(0)} DA</span>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-center gap-3 text-emerald-700 font-semibold text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            Paiement à la livraison
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-bold flex items-center gap-2">
            Erreur: {error}
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading} className="w-full h-14 rounded-xl text-lg font-bold bg-slate-900 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all mt-8">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmer ma commande"}
        </Button>
      </form>
    </div>
  )
}
