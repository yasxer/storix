"use client"

import { useCartStore } from "@/lib/store/cart"
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"
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
        <div 
          className="h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'var(--wise-mint)' }}
        >
          <ShoppingBag className="h-10 w-10" style={{ color: 'var(--wise-dark-green)' }} />
        </div>
        <h1 className="text-3xl font-bold mb-4 tracking-tight" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
          Votre panier est vide
        </h1>
        <p className="mb-8 font-medium" style={{ color: 'var(--wise-gray)' }}>
          Vous n'avez pas encore ajouté d'articles à votre panier. Découvrez nos nouveautés !
        </p>
        <Link href="/boutique">
          <button 
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ 
              borderRadius: '9999px', 
              backgroundColor: 'var(--wise-green)', 
              color: 'var(--wise-dark-green)',
              fontFeatureSettings: '"calt"',
            }}
          >
            <ShoppingBag className="h-5 w-5" />
            Continuer mes achats
          </button>
        </Link>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 tracking-tight" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
        Mon Panier ({items.reduce((acc, i) => acc + i.quantity, 0)})
      </h1>

      <div className="flex flex-col gap-6">
        {/* Items List */}
        <div 
          className="p-5 sm:p-8"
          style={{ borderRadius: '30px', boxShadow: 'var(--wise-ring)', background: '#ffffff' }}
        >
          <h2 className="text-xl font-bold mb-4 pb-4" style={{ color: 'var(--wise-black)', borderBottom: '1px solid rgba(14,15,12,0.08)', fontFeatureSettings: '"calt"' }}>
            Articles
          </h2>
          
          {items.map((item) => (
            <div key={`${item.article_id}-${item.size_id}-${item.color_id}`} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start pb-6 last:pb-0 pt-4" style={{ borderBottom: '1px solid rgba(14,15,12,0.06)' }}>

              {/* Product Image */}
              <div 
                className="h-32 w-28 shrink-0 overflow-hidden relative flex items-center justify-center"
                style={{ borderRadius: '16px', boxShadow: 'var(--wise-ring)', backgroundColor: '#fafaf8' }}
              >
                {item.photo_url ? (
                  <Image 
                    src={item.photo_url} 
                    alt={item.title || "Image produit"} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" style={{ color: 'var(--wise-light-surface)' }} />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col w-full h-full justify-between">
                <div className="flex justify-between items-start w-full gap-4">
                  <div>
                    <Link 
                      href={`/article/${item.article_id}`} 
                      className="font-semibold text-base sm:text-lg line-clamp-2 hover:underline"
                      style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}
                    >
                      {item.title}
                    </Link>
                    <div className="text-sm mt-2 space-y-1.5 font-medium">
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--wise-gray)' }}>Taille:</span> 
                        <span 
                          className="px-2.5 py-0.5 rounded-[9999px] text-xs font-semibold"
                          style={{ backgroundColor: 'rgba(22,51,0,0.05)', color: 'var(--wise-black)' }}
                        >
                          {item.size_label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--wise-gray)' }}>Couleur:</span>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-[9999px] text-xs font-semibold" style={{ backgroundColor: 'rgba(22,51,0,0.05)', color: 'var(--wise-black)' }}>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color_hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }}
                            title={item.color_name}
                          />
                          <span>{item.color_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="font-bold text-lg whitespace-nowrap px-3 py-1"
                    style={{ color: 'var(--wise-black)', borderRadius: '9999px', backgroundColor: 'rgba(22,51,0,0.04)' }}
                  >
                    {item.unit_price} DA
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 w-full">
                  {/* Quantity Control */}
                  <div 
                    className="flex items-center p-1"
                    style={{ borderRadius: '9999px', boxShadow: 'var(--wise-ring)', background: '#ffffff' }}
                  >
                    <button 
                      onClick={() => updateQuantity(item.article_id, item.size_id, item.color_id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[rgba(211,242,192,0.4)] disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" style={{ color: 'var(--wise-black)' }} />
                    </button>
                    <span className="font-bold text-sm w-10 text-center" style={{ color: 'var(--wise-black)' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.article_id, item.size_id, item.color_id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[rgba(211,242,192,0.4)]"
                    >
                      <Plus className="w-3.5 h-3.5" style={{ color: 'var(--wise-black)' }} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button 
                    onClick={() => removeItem(item.article_id, item.size_id, item.color_id)}
                    className="px-3 py-2 rounded-[9999px] transition-all duration-200 flex items-center gap-1.5 text-sm font-semibold hover:bg-[rgba(208,50,56,0.06)]"
                    style={{ color: 'var(--wise-warm-dark)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end pt-4" style={{ borderTop: '1px solid rgba(14,15,12,0.06)' }}>
            <button 
              onClick={clearCart}
              className="text-sm font-semibold px-4 py-2 rounded-[9999px] transition-all duration-200 hover:bg-[rgba(208,50,56,0.06)]"
              style={{ color: 'var(--wise-gray)' }}
            >
              Vider le panier
            </button>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="relative mb-12">
          <div 
            className="p-5 sm:p-8"
            style={{ borderRadius: '30px', boxShadow: 'var(--wise-ring)', background: '#ffffff' }}
          >
            <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(14,15,12,0.08)' }}>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
                Confirmation de la commande
              </h2>
              <p className="text-sm sm:text-base font-medium" style={{ color: 'var(--wise-gray)' }}>
                Veuillez remplir vos informations pour valider.
              </p>
            </div>
            
            {wilayas.length > 0 ? (
              <CheckoutForm wilayas={wilayas} />
            ) : (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid var(--wise-green)', borderTopColor: 'transparent' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
