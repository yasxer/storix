'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { searchArticles, createBon } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ScanBarcode, Minus, Plus, Trash2, ShoppingCart, CheckCircle2, Camera } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ScannerModal } from './scanner-modal'

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
    <div className="flex h-full gap-4 pt-4">
      {/* Left side: Search & Results */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden pr-2">
        <div className="relative shrink-0">
          <Input
            ref={searchRef}
            autoFocus
            className="w-full pl-10 pr-12 py-4 text-lg border-2 shadow-sm rounded-xl focus-visible:ring-[var(--color-primary)] focus-visible:border-[var(--color-primary)]"
            placeholder="Scan barcode or type article name..."
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-primary)] opacity-80 hover:opacity-100 transition h-14 w-14"
            onClick={() => setIsScannerOpen(true)}
            title="Open camera scanner"
          >
            <Camera size={36} strokeWidth={2.5} />
          </Button>
          {isPending && (
             <div className="absolute right-16 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
            {results.map((article: any) => (
               <Card key={article.id} className="p-4 flex flex-col hover:shadow-md transition shadow-sm border-gray-200">
                  <div className="mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2 md:line-clamp-1" title={article.title}>{article.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{article.categoryName} {article.modelName ? `› ${article.modelName}` : ''}</p>
                    <p className="font-medium text-[var(--color-primary)] mt-1">{article.base_price.toFixed(2)} DA</p>
                  </div>
                  
                  <div className="mt-auto space-y-3 border-t pt-3">
                     {article.sizes?.map((size: any) => (
                        <div key={size.id} className="text-sm">
                           <div className="font-medium text-[var(--color-text)] bg-[var(--color-surface)] px-2 py-0.5 rounded inline-block mb-1.5 border border-gray-100">
                              {size.size_label} {size.price_override ? <span className="text-xs text-[var(--color-text-muted)] font-normal">({size.price_override} DA)</span> : ''}
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {size.colors?.map((color: any) => (
                                 <button
                                  key={color.id}
                                  onClick={() => addToCart(article, size, color)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition active:scale-95 text-xs"
                                  title={`Add ${color.color_name} (Stock: ${color.quantity})`}
                                 >
                                    <div className="w-3 h-3 rounded-full border border-black/10 shadow-sm shrink-0" style={{ backgroundColor: color.color_hex }} />
                                    <span className="font-medium">{color.color_name}</span>
                                    <span className="text-[var(--color-text-faint)] ml-1">({color.quantity})</span>
                                 </button>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>
            ))}
            
            {query.length >= 2 && !isPending && results.length === 0 && (
              <div className="col-span-full mt-10 flex flex-col items-center justify-center text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-xl border border-dashed p-10">
                <ScanBarcode size={48} className="mb-4 opacity-50" />
                <p className="text-lg">No products found for "{query}"</p>
                <p className="text-sm mt-1 opacity-70">Check spelling or try a different barcode</p>
              </div>
            )}

            {!query && cart.length === 0 && results.length === 0 && (
               <div className="col-span-full mt-20 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                 <Search size={48} className="mb-4 opacity-20" />
                 <p className="text-lg">Ready to scan</p>
                 <p className="text-sm text-[var(--color-text-faint)]">Search by name or use your barcode scanner</p>
               </div>
            )}
        </div>
      </div>

      {/* Right side: Cart (Bon) */}
      <div className="hidden lg:flex w-[380px] bg-white border border-gray-200 rounded-xl shadow-sm flex-col p-0 overflow-hidden flex-shrink-0">
        <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
           <h2 className="font-semibold text-lg flex items-center gap-2">
             <ShoppingCart size={20} className="text-[var(--color-primary)]" />
             Current Bon
           </h2>
           <span className="bg-teal-100 text-[var(--color-primary)] text-xs px-2 py-1 rounded-full font-medium">
             {cart.length} items
           </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                 <ShoppingCart size={48} className="mb-4 opacity-20" />
                 <p>Cart is empty</p>
                 <p className="text-sm">Scan a barcode or search to add items.</p>
             </div>
           ) : (
             cart.map((item) => (
                <div key={item.id} className="flex flex-col border border-gray-100 p-3 rounded-lg shadow-sm hover:border-[var(--color-primary)]/30 transition group">
                   <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm line-clamp-2 pr-2">{item.title}</div>
                      <div className="font-semibold text-sm whitespace-nowrap">{(item.unitPrice * item.quantity).toFixed(2)} DA</div>
                   </div>
                   
                   <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded">{item.sizeLabel}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: item.colorHex }} />
                        {item.colorName}
                      </div>
                      <span className="ml-auto">{item.unitPrice.toFixed(2)} / u</span>
                   </div>

                   <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center bg-gray-50 border rounded-lg overflow-hidden">
                         <button 
                           onClick={() => updateQuantity(item.id, -1)}
                           disabled={item.quantity <= 1}
                           className="p-1 hover:bg-gray-200 disabled:opacity-50 text-gray-600 transition"
                         >
                           <Minus size={16} />
                         </button>
                         <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                         <button 
                           onClick={() => updateQuantity(item.id, 1)}
                           disabled={item.quantity >= item.maxQuantity}
                           className="p-1 hover:bg-gray-200 disabled:opacity-50 text-gray-600 transition"
                         >
                           <Plus size={16} />
                         </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-[var(--color-error)] p-1.5 hover:bg-red-50 rounded transition opacity-50 group-hover:opacity-100"
                        title="Remove"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
             ))
           )}
        </div>

        <div className="p-4 border-t bg-gray-50">
           <div className="flex justify-between items-end mb-4">
              <span className="text-gray-500">Total Price</span>
              <span className="text-2xl font-bold text-[var(--color-primary)]">{total.toFixed(2)} DA</span>
           </div>
           <Button 
             className="w-full h-14 text-lg font-semibold gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
             disabled={cart.length === 0 || isCheckoutPending}
             onClick={handleCheckout}
           >
             {isCheckoutPending ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <CheckCircle2 size={20} />
             )}
             Validate Bon ({cart.length})
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
