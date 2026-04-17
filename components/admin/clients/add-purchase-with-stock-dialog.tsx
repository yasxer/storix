"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Minus, Search, Trash2, ShoppingCart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { addClientPurchaseWithStock } from "@/app/(admin)/admin/clients/actions"

type Variant = {
  id: string
  name: string
  price: number
  maxQuantity: number
  colorHex: string
}

type CartItem = Variant & { quantity: number }

export function AddPurchaseWithStockDialog({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [variants, setVariants] = useState<Variant[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isFetching, setIsFetching] = useState(false)

  // Custom fetch to get products
  useEffect(() => {
    if (!open) return
    const fetchStock = async () => {
      setIsFetching(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id, title, base_price, is_published,
          article_sizes (
            id, size_label, price_override,
            article_size_colors (
              id, color_name, color_hex, quantity
            )
          )
        `)
      
      if (!error && data) {
        const flat: Variant[] = []
        data.forEach(article => {
          article.article_sizes?.forEach((size: any) => {
            size.article_size_colors?.forEach((color: any) => {
              if (color.quantity > 0) {
                flat.push({
                  id: color.id,
                  name: `${article.title} - ${size.size_label} - ${color.color_name}`,
                  price: size.price_override || article.base_price,
                  maxQuantity: color.quantity,
                  colorHex: color.color_hex,
                })
              }
            })
          })
        })
        setVariants(flat)
      }
      setIsFetching(false)
    }
    
    fetchStock()
  }, [open])

  const filteredVariants = variants.filter(v => v.name.toLowerCase().includes(search.toLowerCase()))

  const addToCart = (variant: Variant) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === variant.id)
      if (existing) {
        if (existing.quantity >= variant.maxQuantity) return prev
        return prev.map(item => item.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...variant, quantity: 1 }]
    })
  }

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta
        if (newQ <= 0) return { ...item, quantity: 0 } // handled by filter below
        if (newQ > item.maxQuantity) return { ...item, quantity: item.maxQuantity }
        return { ...item, quantity: newQ }
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const onSubmit = async () => {
    if (cart.length === 0) return

    setIsLoading(true)
    const result = await addClientPurchaseWithStock({
      client_id: clientId,
      items: cart.map(c => ({ color_id: c.id, quantity: c.quantity, price: c.price, name: c.name }))
    })

    if (result.error) {
      alert("Erreur: " + result.error)
    } else {
      setOpen(false)
      setCart([])
      setSearch("")
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0 bg-red-600 hover:bg-red-700 text-white">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Ajouter Achat (Depuis Stock)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-xl rounded-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl font-bold">Nouvel Achat (Dette) - Sélectionner du Stock</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-4 overflow-hidden mt-4 pt-2">
          
          {/* Produits à sélectionner */}
          <div className="flex-1 flex flex-col min-h-[300px] border rounded-lg bg-gray-50/50">
            <div className="p-2 border-b bg-white relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Chercher un produit..." 
                className="pl-9 h-9" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[350px]">
              {isFetching ? (
                <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
              ) : filteredVariants.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-4">Aucun produit trouvé</div>
              ) : (
                filteredVariants.slice(0, 50).map(v => (
                  <div key={v.id} className="flex items-center justify-between p-2 bg-white rounded border shadow-sm hover:border-[var(--color-primary)] transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      <div className="w-3 h-3 rounded-full shrink-0 border" style={{ backgroundColor: v.colorHex }} />
                      <div className="truncate flex flex-col">
                        <span className="text-sm font-medium truncate" title={v.name}>{v.name}</span>
                        <span className="text-xs text-gray-500">{v.price.toFixed(2)} DZD • <span className="font-semibold text-green-600">Stock: {v.maxQuantity}</span></span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => addToCart(v)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panier des achats */}
          <div className="flex-1 flex flex-col border rounded-lg bg-white overflow-hidden max-h-[350px]">
            <div className="p-3 border-b bg-gray-50 font-bold text-sm">Produits Sélectionnés</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {cart.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-8">Le panier est vide</div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex flex-col p-2 bg-gray-50/50 rounded border border-gray-100 relative">
                    <div className="flex items-start justify-between pr-6">
                      <span className="text-sm font-medium leading-tight">{item.name}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-1 top-1 text-red-500 hover:bg-red-50 p-1" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-gray-700">{item.price.toFixed(2)} DZD</span>
                      <div className="flex items-center border rounded bg-white">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none p-0" onClick={() => updateCartQty(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none p-0" onClick={() => updateCartQty(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">Total:</span>
                <span className="text-lg font-bold text-red-600">{total.toFixed(2)} DZD</span>
              </div>
            </div>
          </div>

        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t mt-4 shrink-0">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button 
            disabled={isLoading || cart.length === 0} 
            className="bg-red-600 hover:bg-red-700 text-white min-w-[140px]"
            onClick={onSubmit}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
            {isLoading ? "En cours..." : "Confirmer Achat"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
