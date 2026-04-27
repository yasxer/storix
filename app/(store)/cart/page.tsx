"use client"

import { useCartStore } from "@/lib/store/cart"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { CheckoutForm } from "@/components/store/checkout-form"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore()
  const [wilayas, setWilayas] = useState<any[]>([])

  useEffect(() => {
    async function fetchWilayas() {
      const supabase = createClient()
      const { data } = await supabase
        .from("delivery_fees")
        .select("*")
        .eq("is_active", true)
        .order("wilaya_code", { ascending: true })
      
      if (data) setWilayas(data)
    }
    fetchWilayas()
  }, [])

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  
  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 md:py-24 text-center max-w-lg min-h-[60vh] flex flex-col justify-center">
        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="text-3xl font-black mb-4 text-slate-900 tracking-tight">Votre panier est vide</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Vous n'avez pas encore ajouté d'articles à votre panier. Découvrez nos nouveautés !
        </p>
        <Link href="/boutique">
          <Button size="lg" className="rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] bg-slate-900 hover:bg-slate-800 text-white px-8">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Continuer mes achats
          </Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <h1 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">Mon Panier ({items.reduce((acc, i) => acc + i.quantity, 0)})</h1>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Items List */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-6 md:p-8 space-y-6 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 border-b border-slate-100 pb-4">Articles</h2>
          {items.map((item) => (
            <div key={`${item.article_id}-${item.size_id}-${item.color_id}`} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start pb-6 border-b border-slate-100 last:border-0 last:pb-0">
              
              {/* Product Image */}
              <div className="h-32 w-28 shrink-0 rounded-2xl overflow-hidden bg-slate-50 relative border border-slate-100">
                {item.photo_url ? (
                  <Image 
                    src={item.photo_url} 
                    alt={item.title} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Product Info & Actions */}
              <div className="flex-1 flex flex-col w-full h-full justify-between">
                <div className="flex justify-between items-start w-full gap-4">
                  <div>
                    <Link href={`/article/${item.article_id}`} className="font-bold text-lg text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2">
                      {item.title}
                    </Link>
                    <div className="text-sm text-slate-500 mt-2 space-y-1.5 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Taille:</span> 
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">{item.size_label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Couleur:</span>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                          <div 
                            className="w-3 h-3 rounded-full border border-slate-200 shadow-sm" 
                            style={
                              item.color_hex?.includes(',') || item.color_hex?.includes('/')
                                ? { background: `linear-gradient(135deg, ${(item.color_hex.split(/\/|,/)[0] || '#ccc').trim()} 50%, ${(item.color_hex.split(/\/|,/)[1] || '#ccc').trim()} 50%)` }
                                : { backgroundColor: item.color_hex }
                            }
                            title={item.color_name}
                          />
                          <span>{item.color_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="font-black text-lg text-slate-900 whitespace-nowrap bg-slate-50 px-3 py-1 rounded-xl">
                    {item.unit_price} DA
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 w-full">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-slate-200 rounded-full p-1 bg-white shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.article_id, item.size_id, item.color_id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm w-10 text-center text-slate-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.article_id, item.size_id, item.color_id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Item */}
                  <button 
                    onClick={() => removeItem(item.article_id, item.size_id, item.color_id)}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 text-sm font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              onClick={clearCart}
              className="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors px-4 py-2 hover:bg-slate-50 rounded-full"
            >
              Vider le panier
            </button>
          </div>
        </div>

        {/* Right Column: Checkout Form directly integrated */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24 bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
            <div className="mb-6 pb-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Confirmation de la commande</h2>
              <p className="text-sm text-slate-500 font-medium">Veuillez remplir vos informations pour valider.</p>
            </div>
            
            {wilayas.length > 0 ? (
              <CheckoutForm wilayas={wilayas} />
            ) : (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
