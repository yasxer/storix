"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Minus, Search, Trash2, Edit2, PackageCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { modifyClientPurchase } from "@/app/(khadem)/khadem/clients/actions"

type CartItem = {
  id: string
  name: string
  price: number
  maxQuantity: number
  colorHex: string
  quantity: number
}

export function ModifyPurchaseDialog({
  transaction,
  clientId,
  open,
  setOpen,
}: {
  transaction: any
  clientId: string
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [search, setSearch] = useState("")
  const [allVariants, setAllVariants] = useState<CartItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    if (!open) return
    const fetchData = async () => {
      setIsFetching(true)
      const supabase = createClient()

      const { data: existingItems } = await supabase
        .from("client_purchase_items")
        .select("*")
        .eq("transaction_id", transaction.id)

      const { data: articles } = await supabase
        .from("articles")
        .select(`
          id, title, base_price,
          article_sizes (
            id, size_label, price_override,
            article_size_colors (
              id, color_name, color_hex, quantity
            )
          )
        `)

      const variantMap: Record<string, CartItem> = {}
      articles?.forEach((article: any) => {
        article.article_sizes?.forEach((size: any) => {
          size.article_size_colors?.forEach((color: any) => {
            variantMap[color.id] = {
              id: color.id,
              name: `${article.title} - ${size.size_label} - ${color.color_name}`,
              price: size.price_override || article.base_price,
              maxQuantity: color.quantity,
              colorHex: color.color_hex,
              quantity: 0,
            }
          })
        })
      })

      const cartItems: CartItem[] = []
      for (const item of existingItems || []) {
        const variant = variantMap[item.color_id]
        if (variant) {
          const adjustedMax = variant.maxQuantity + item.quantity
          variantMap[item.color_id].maxQuantity = adjustedMax
          cartItems.push({ ...variant, maxQuantity: adjustedMax, quantity: item.quantity })
        } else {
          cartItems.push({
            id: item.color_id,
            name: item.name,
            price: item.price,
            maxQuantity: item.quantity,
            colorHex: "#888888",
            quantity: item.quantity,
          })
        }
      }

      setAllVariants(Object.values(variantMap).filter(v => v.maxQuantity > 0))
      setCart(cartItems)
      setIsFetching(false)
    }
    fetchData()
  }, [open, transaction.id])

  const filteredVariants = allVariants
    .filter(v => v.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 50)

  const addToCart = (variant: CartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === variant.id)
      if (existing) {
        if (existing.quantity >= variant.maxQuantity) return prev
        return prev.map(item =>
          item.id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...variant, quantity: 1 }]
    })
  }

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id !== id) return item
          const newQ = item.quantity + delta
          if (newQ <= 0) return { ...item, quantity: 0 }
          if (newQ > item.maxQuantity) return { ...item, quantity: item.maxQuantity }
          return { ...item, quantity: newQ }
        })
        .filter(item => item.quantity > 0)
    )
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id))

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const onSubmit = async () => {
    setIsLoading(true)
    const result = await modifyClientPurchase({
      transaction_id: transaction.id,
      client_id: clientId,
      items: cart.map(c => ({ color_id: c.id, quantity: c.quantity, price: c.price, name: c.name })),
    })
    if (result.error) alert("Erreur: " + result.error)
    else setOpen(false)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-xl rounded-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-blue-600" />
            Modifier Bon d&apos;Achat
          </DialogTitle>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
            Le stock est mis à jour automatiquement.
          </p>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-3 overflow-hidden mt-2">
            {/* Left: search */}
            <div className="flex-1 flex flex-col border rounded-2xl bg-gray-50/50 min-h-[260px]">
              <div className="p-2 border-b bg-white rounded-t-2xl relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ajouter un produit..."
                  className="pl-9 h-9 rounded-xl"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[300px]">
                {filteredVariants.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-6">Aucun produit disponible</p>
                ) : (
                  filteredVariants.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-2 bg-white rounded-xl border hover:border-blue-400 transition-colors shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <div className="w-3 h-3 rounded-full shrink-0 border" style={{ backgroundColor: v.colorHex }} />
                        <div className="truncate flex flex-col">
                          <span className="text-sm font-semibold truncate">{v.name}</span>
                          <span className="text-xs text-gray-400">
                            {v.price.toFixed(2)} DA • <span className="font-bold text-green-600">Stock: {v.maxQuantity}</span>
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl" onClick={() => addToCart(v)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: cart */}
            <div className="flex-1 flex flex-col border rounded-2xl bg-white max-h-[360px]">
              <div className="p-3 border-b font-black text-sm flex items-center gap-2 text-gray-700">
                <PackageCheck className="h-4 w-4 text-blue-600" />
                Articles du bon
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {cart.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">Panier vide</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex flex-col p-2 bg-gray-50 rounded-xl border border-gray-100 relative">
                      <div className="flex items-start justify-between pr-7">
                        <span className="text-sm font-semibold leading-tight">{item.name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-1 top-1 text-red-500 hover:bg-red-50 p-1" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-black text-gray-700">{item.price.toFixed(2)} DA</span>
                        <div className="flex items-center border rounded-lg bg-white">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none p-0" onClick={() => updateCartQty(item.id, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-black w-6 text-center">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none p-0" onClick={() => updateCartQty(item.id, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t flex justify-between items-center bg-gray-50 rounded-b-2xl">
                <span className="font-black text-gray-700">Total:</span>
                <span className="text-xl font-black text-blue-700">{total.toFixed(2)} DA</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t mt-2 shrink-0">
          <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            disabled={isLoading || isFetching}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[160px] rounded-xl"
            onClick={onSubmit}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
            {isLoading ? "Modification..." : "Confirmer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
