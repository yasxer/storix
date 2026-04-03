"use client"

import { useCartStore } from "@/lib/store/cart"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore()

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  
  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-16 md:py-24 text-center max-w-lg">
        <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
        <p className="text-muted-foreground mb-8">
          Vous n'avez pas encore ajouté d'articles à votre panier. Découvrez nos nouveautés !
        </p>
        <Link href="/boutique">
          <Button size="lg" className="rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Continuer mes achats
          </Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Mon Panier ({items.reduce((acc, i) => acc + i.quantity, 0)})</h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden p-6 space-y-6">
          {items.map((item) => (
            <div key={`${item.article_id}-${item.size_id}-${item.color_id}`} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start pb-6 border-b last:border-0 last:pb-0">
              
              {/* Product Image */}
              <div className="h-28 w-24 shrink-0 rounded-lg overflow-hidden bg-muted relative">
                {item.photo_url ? (
                  <Image 
                    src={item.photo_url} 
                    alt={item.title || "Image produit"} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Product Info & Actions */}
              <div className="flex-1 flex flex-col w-full">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <Link href={`/article/${item.article_id}`} className="font-bold text-lg hover:underline decoration-2 underline-offset-4">
                      {item.title}
                    </Link>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">Taille:</span> {item.size_label}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-foreground">Couleur:</span>
                        <div 
                          className="w-3 h-3 rounded-full border shadow-sm" 
                          style={{ backgroundColor: item.color_hex }}
                          title={item.color_name}
                        />
                        <span>{item.color_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-lg whitespace-nowrap">
                    {item.unit_price} DZD
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 w-full">
                  {/* Quantity Control */}
                  <div className="flex items-center border rounded-full p-1 bg-muted/20">
                    <button 
                      onClick={() => updateQuantity(item.article_id, item.size_id, item.color_id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-sm w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.article_id, item.size_id, item.color_id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove Item */}
                  <button 
                    onClick={() => removeItem(item.article_id, item.size_id, item.color_id)}
                    className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end pt-2">
            <button 
              onClick={clearCart}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Vider le panier
            </button>
          </div>
        </div>

        {/* Order Summary Summary */}
        <div className="bg-muted/30 p-6 rounded-2xl border sticky top-24">
          <h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(0)} DZD</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span className="text-sm italic">Calculée à l'étape suivante</span>
            </div>
            
            <div className="my-4 h-px w-full bg-border" />
            
            <div className="flex justify-between font-bold text-xl">
              <span>Total provisoire</span>
              <span>{subtotal.toFixed(0)} DZD</span>
            </div>
          </div>

          <Link href="/checkout" className="block w-full">
            <Button size="lg" className="w-full rounded-xl text-lg font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Valider la commande
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>

          <Link href="/boutique" className="block w-full mt-4 text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </main>
  )
}
