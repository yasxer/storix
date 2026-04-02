'use client'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { searchArticles, createBon } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ScanBarcode, Minus, Plus, Trash2, ShoppingCart, CheckCircle2, Camera } from 'lucide-react'
import { Card } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// Dynamically import ScannerModal to avoid SSR issues with html5-qrcode
const ScannerModal = dynamic(() => import('./scanner-modal').then(mod => mod.ScannerModal), {
  ssr: false,
})

type PosClientProps = {
  sessionId: string
  khademId: string
}

type CartItem = {
  id: string // unique id for cart item combining article+size+color
  articleId: string
  sizeId: string
  colorId: string
  title: string
  sizeLabel: string
  colorName: string
  colorHex: string
  unitPrice: number
  quantity: number
  maxQuantity: number
}

export default function PosClient({ sessionId, khademId }: PosClientProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPending, startTransition] = useTransition()
  const [isCheckoutPending, startCheckoutTransition] = useTransition()
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Load default catalog and keep focus
  useEffect(() => {
    startTransition(async () => {
      const defaultItems = await searchArticles('')
      setResults(defaultItems)
    })
    searchRef.current?.focus()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    startTransition(async () => {
      const items = await searchArticles(val)
      setResults(items)
      
      // Auto-add exact scanner match
      if (items.length === 1 && items[0].barcode === val.trim() && items[0].sizes.length > 0) {
        const article = items[0]
        const firstSizeWithStock = article.sizes.find((s: any) => s.colors.length > 0)
        if (firstSizeWithStock) {
           const firstColorWithStock = firstSizeWithStock.colors[0]
           addToCart(article, firstSizeWithStock, firstColorWithStock)
        }
      }
    })
  }

  const handleScan = useCallback((resultText: string) => {
    setQuery(resultText)
    startTransition(async () => {
      const items = await searchArticles(resultText)
      setResults(items)
      
      // Auto-add on successful scan
      if (items.length === 1 && items[0].barcode === resultText.trim() && items[0].sizes.length > 0) {
        const article = items[0]
        const firstSizeWithStock = article.sizes.find((s: any) => s.colors.length > 0)
        if (firstSizeWithStock) {
           const firstColorWithStock = firstSizeWithStock.colors[0]
           addToCart(article, firstSizeWithStock, firstColorWithStock)
        }
      }
    })
  }, [])

  const restoreDefaultCatalog = useCallback(async () => {
    setQuery('')
    const defaultItems = await searchArticles('')
    setResults(defaultItems)
  }, [])

  // Barcode scanner submission logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if (e.key === 'Enter') {
        const val = query
        // Quick auto-add if perfectly matches one variant (like scanning an exact barcode logic here)
        // If results length is 1, and its exact matches, etc...
     }
  }

  const addToCart = useCallback((article: any, size: any, color: any) => {
    const itemKey = `${article.id}-${size.id}-${color.id}`
    const unitPrice = size.price_override || article.base_price
    const maxQuantity = color.quantity

    setCart(prev => {
      const existing = prev.find(i => i.id === itemKey)
      if (existing) {
         if (existing.quantity >= maxQuantity) return prev // Can't add more than stock
         return prev.map(i => i.id === itemKey ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, {
        id: itemKey,
        articleId: article.id,
        sizeId: size.id,
        colorId: color.id,
        title: article.title,
        sizeLabel: size.size_label,
        colorName: color.color_name,
        colorHex: color.color_hex,
        unitPrice: unitPrice,
        quantity: 1,
        maxQuantity
      }]
    })

    // Reset search query and restore catalog
    restoreDefaultCatalog()
    searchRef.current?.focus()
  }, [restoreDefaultCatalog])

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
       if (item.id !== id) return item
       const nextQ = item.quantity + delta
       if (nextQ <= 0 || nextQ > item.maxQuantity) return item
       return { ...item, quantity: nextQ }
    }))
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const total = cart.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0)

  const handleCheckout = () => {
    if (cart.length === 0) return

    startCheckoutTransition(async () => {
       const res = await createBon(khademId, sessionId, total, cart)
       if (res.success) {
          alert('Bon verified and created successfully!') // Replace with toast later
          setCart([]) // Clear cart
          searchRef.current?.focus()
       } else {
          alert('Failed to checkout: ' + res.error)
       }
    })
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-4 lg:p-6 pb-24 lg:pb-6">
      {/* Left side: Search & Results */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="relative shrink-0 flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={searchRef}
              autoFocus
              className="w-full pl-11 pr-4 py-6 text-lg border-none shadow-sm ring-1 ring-gray-200/60 rounded-2xl bg-white focus-visible:ring-blue-500 focus-visible:border-transparent transition-shadow"
              placeholder="Scan barcode or type article name..."
              value={query}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
            {isPending && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <Button
            size="icon"
            className="shrink-0 h-full aspect-square rounded-2xl bg-gray-900 hover:bg-gray-800 text-white shadow-md transition-transform active:scale-95"
            onClick={() => setIsScannerOpen(true)}
            title="Open camera scanner"
          >
            <Camera size={26} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-24 lg:pb-0">
          {results.map((article: any) => (
             <div key={article.id} className="group flex flex-col bg-white ring-1 ring-gray-200/60 rounded-3xl p-5 hover:shadow-xl hover:shadow-blue-900/5 hover:ring-blue-200 transition-all duration-300">
                <div className="mb-3">
                  <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-bold text-gray-900 text-lg line-clamp-1" title={article.title}>{article.title}</h3>
                       <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{article.categoryName}</p>
                     </div>
                     <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-sm ml-2 whitespace-nowrap">{article.base_price.toLocaleString()} DA</span>
                  </div>
                </div>

                <div className="mt-auto space-y-3 pt-2">
                   {article.sizes?.map((size: any) => (
                      <div key={size.id} className="">
                         <div className="inline-flex items-center text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md mb-2">
                            {size.size_label} {size.price_override ? <span className="font-medium opacity-80 ml-1">({size.price_override} DA)</span> : ""}
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {size.colors?.map((color: any) => (
                               <button
                                key={color.id}
                                onClick={() => addToCart(article, size, color)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95 group/btn relative overflow-hidden"
                                title={"Add"}
                               >
                                  <div className="w-3 h-3 rounded-full border shadow-sm" style={{ backgroundColor: color.hex_code || "#cccccc" }} />
                                  <span className="text-xs font-medium text-gray-700 group-hover/btn:text-blue-700">{color.color_name}</span>
                                  {color.quantity <= 3 && (
                                     <span className="absolute top-0 right-0 px-1 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold rounded-bl-lg items-center flex leading-none">
                                        {color.quantity}
                                     </span>
                                  )}
                               </button>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          ))}
          {results.length === 0 && !isPending && query.length > 0 && (
             <div className="col-span-full py-10 text-center flex flex-col items-center justify-center space-y-3">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                   <Search className="text-gray-400" size={28} />
                 </div>
                 <p className="text-gray-500 font-medium">No products found</p>
             </div>
          )}
        </div>
      </div>

      {/* Desktop Cart */}
      <div className="hidden lg:flex flex-col h-full bg-white ring-1 ring-gray-200/60 rounded-[2rem] shadow-sm overflow-hidden lg:w-[400px] xl:w-[450px] shrink-0 pointer-events-auto z-20">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h2 className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
               <ShoppingCart size={22} className="text-blue-600" />
               Current Bon
             </h2>
             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold shadow-inner">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
             </span>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-gray-50/20">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                 <ShoppingCart size={64} className="opacity-20" />
                 <p className="font-medium opacity-80">Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-white ring-1 ring-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                     <div>
                       <h4 className="font-bold text-gray-900 leading-tight truncate">{item.title}</h4>
                       <div className="flex items-center gap-2 mt-2">
                         <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{item.sizeLabel}</span>
                         <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-md">
                           <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: item.colorHex || "#ccc" }} />
                           {item.colorName}
                         </div>
                       </div>
                     </div>
                     <p className="font-bold text-gray-900 mt-3">{(item.unitPrice * item.quantity).toLocaleString()} DA</p>
                  </div>

                  <div className="flex flex-col items-center justify-between ml-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                    <div className="flex items-center gap-2 mt-auto bg-gray-50 rounded-xl p-1 shadow-inner">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm transition-all" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                        <Minus size={14} />
                      </Button>
                      <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm transition-all" onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.maxQuantity}>
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-6 bg-white border-t border-gray-100 space-y-6 shrink-0">
             <div className="flex justify-between items-end">
               <span className="text-sm font-semibold tracking-wider text-gray-400 uppercase">Total Pay:</span>
               <span className="text-3xl font-black text-blue-600 tracking-tight">
                 {cart.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0).toLocaleString()} 
                 <span className="text-lg ml-1 font-medium">DA</span>
               </span>
             </div>
             
             <Button 
              onClick={handleCheckout} 
              disabled={cart.length === 0 || isCheckoutPending}
              className="w-full h-16 rounded-2xl text-lg font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 transition-all"
             >
                {isCheckoutPending ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2" size={24} />
                    Validate Bon
                  </>
                )}
             </Button>
          </div>
      </div>

      {/* Mobile Sticky Cart Footer */}
      <div className="fixed lg:hidden bottom-0 left-0 right-0 p-4 pb-6 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <Sheet>
                 <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-gray-200/60 shadow-sm bg-white/80 hover:bg-white flex items-center justify-between px-5">
                      <div className="flex items-center gap-3">
                         <div className="relative">
                           <ShoppingCart className="text-blue-600" size={22} />
                           {cart.length > 0 && (
                              <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold px-1 ring-2 ring-white">
                                {cart.reduce((a,b)=>a+b.quantity, 0)}
                              </span>
                           )}
                         </div>
                         <div className="flex flex-col items-start leading-tight ml-2">
                            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Voir Panier</span>
                            <span className="font-bold text-gray-900">
                              {cart.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0).toLocaleString()} DA
                            </span>
                         </div>
                      </div>
                    </Button>
                 </SheetTrigger>
                 <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] p-0 flex flex-col bg-gray-50/50 z-[100]">
                     <div className="p-6 border-b border-gray-100 bg-white shadow-sm flex items-center justify-between shrink-0">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                          <ShoppingCart size={28} className="text-blue-600" />
                          Mon Panier
                        </h2>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
                        {cart.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                             <ShoppingCart size={48} className="opacity-20" />
                             <p className="font-medium opacity-80">Cart is empty</p>
                          </div>
                        ) : (
                          cart.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 bg-white ring-1 ring-gray-100 rounded-2xl shadow-sm">
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                                 <div className="flex items-center gap-2 mt-2">
                                   <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{item.sizeLabel}</span>
                                   <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-md">
                                     <div className="w-2.5 h-2.5 rounded-full border" style={{ backgroundColor: item.colorHex || "#ccc" }} />
                                     {item.colorName}
                                   </div>
                                 </div>
                                 <p className="font-bold text-gray-900 mt-2">{(item.unitPrice * item.quantity).toLocaleString()} DA</p>
                              </div>
                              <div className="flex flex-col items-end justify-between">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeFromCart(item.id)}>
                                  <Trash2 size={16} />
                                </Button>
                                <div className="flex items-center gap-2 mt-auto bg-gray-50 rounded-lg p-1">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                                    <Minus size={14} />
                                  </Button>
                                  <span className="w-5 text-center font-bold">{item.quantity}</span>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.maxQuantity}>
                                    <Plus size={14} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                     </div>
                 </SheetContent>
              </Sheet>

              <Button 
                onClick={handleCheckout} 
                className="h-14 px-8 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                disabled={cart.length === 0 || isCheckoutPending}
              >
                {isCheckoutPending ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Valider"}
              </Button>
          </div>
      </div>

      <ScannerModal
         isOpen={isScannerOpen}
         onClose={() => setIsScannerOpen(false)}
         onScan={handleScan}
      />
    </div>
  )
}
