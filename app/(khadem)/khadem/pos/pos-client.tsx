'use client'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { searchArticles, createBon } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ScanBarcode, Minus, Plus, Trash2, ShoppingCart, CheckCircle2, Camera } from 'lucide-react'
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

  const restoreDefaultCatalog = useCallback(async () => {
    setQuery('')
    const defaultItems = await searchArticles('')
    setResults(defaultItems)
  }, [])

  const addToCart = useCallback((article: any, size: any, color: any) => {
    if (color.quantity <= 0) return; // Prevent adding zero stock

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

    restoreDefaultCatalog()
    searchRef.current?.focus()
  }, [restoreDefaultCatalog])

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if (e.key === 'Enter') {
        const val = query
     }
  }

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
          alert('Bon verified and created successfully!') 
          setCart([]) 
          searchRef.current?.focus()
       } else {
          alert('Failed to checkout: ' + res.error)
       }
    })
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 p-4 lg:p-6 pb-24 lg:pb-6 bg-[var(--color-surface)] min-h-[calc(100vh-140px)]">
      
      {/* Left side: Search & Grid */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Search Bar */}
        <div className="relative shrink-0 flex gap-3 h-14">
          <div className="relative flex-1 h-full">
            <Input
              ref={searchRef}
              autoFocus
              className="w-full h-full pl-12 pr-4 text-base bg-white border border-[var(--color-border)] rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] focus-visible:border-[var(--color-primary)] transition-all"
              placeholder="Scan barcode or search products..."
              value={query}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
            {isPending && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <Button
            size="icon"
            variant="outline"
            className="shrink-0 h-full w-14 rounded-xl bg-white border-[var(--color-border)] shadow-sm hover:bg-gray-50 text-[var(--color-text)] transition-colors"
            onClick={() => setIsScannerOpen(true)}
            title="Open scanner camera"
          >
            <Camera size={24} />
          </Button>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24 lg:pb-0">
          {results.map((article: any) => (
             <div key={article.id} className="bg-white border border-[var(--color-border)] hover:border-[var(--color-primary)] shadow-sm rounded-xl p-4 flex flex-col transition-colors">
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4 gap-2">
                   <div className="min-w-0">
                     <h3 className="font-semibold text-[var(--color-text)] text-base truncate" title={article.title}>
                       {article.title}
                     </h3>
                     <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mt-0.5">
                       {article.categoryName || "Variant"}
                     </p>
                   </div>
                   <span className="shrink-0 bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded-md text-sm font-bold">
                     {article.base_price.toLocaleString()} DA
                   </span>
                </div>

                {/* Card Sizes & Colors */}
                <div className="flex-1 space-y-4">
                   {article.sizes?.map((size: any) => (
                      <div key={size.id} className="pt-3 border-t border-[var(--color-border)]/50">
                         <div className="flex items-center gap-2 mb-2">
                            <span className="text-[13px] font-semibold text-[var(--color-text-muted)]">Size: {size.size_label}</span>
                            {size.price_override && (
                              <span className="text-[11px] bg-[var(--color-warning)]/10 text-[var(--color-warning)] px-1.5 py-0.5 rounded font-bold">
                                {size.price_override} DA
                              </span>
                            )}
                         </div>
                         
                         {/* Color Buttons */}
                         <div className="grid grid-cols-2 gap-2">
                            {size.colors?.map((color: any) => {
                               const outOfStock = color.quantity <= 0;
                               return (
                                 <button
                                  key={color.id}
                                  onClick={() => addToCart(article, size, color)}
                                  disabled={outOfStock}
                                  className={`flex items-center justify-between p-2 border rounded-lg transition-colors text-left group
                                    ${outOfStock 
                                      ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed' 
                                      : 'bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 cursor-pointer'
                                    }`}
                                 >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-3 h-3 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: color.hex_code || "#cccccc" }} />
                                      <span className={`text-[13px] font-medium truncate ${outOfStock ? 'text-gray-400' : 'text-[var(--color-text)] group-hover:text-[var(--color-primary)]'}`}>
                                        {color.color_name}
                                      </span>
                                    </div>
                                    <span className={`text-[11px] font-mono ml-1 ${
                                      outOfStock ? 'text-red-500 font-bold' 
                                      : color.quantity <= 3 ? 'text-orange-500 font-bold' 
                                      : 'text-[var(--color-text-muted)]'
                                    }`}>
                                      {outOfStock ? '0' : color.quantity}
                                    </span>
                                 </button>
                               )
                            })}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          ))}

          {/* Empty State */}
          {results.length === 0 && !isPending && query.length > 0 && (
             <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                 <div className="w-16 h-16 bg-white border border-[var(--color-border)] rounded-full flex items-center justify-center shadow-sm">
                   <Search className="text-[var(--color-text-muted)]" size={24} />
                 </div>
                 <p className="text-[var(--color-text-muted)] font-medium">No products found matching your search.</p>
             </div>
          )}
        </div>
      </div>

      {/* Right Side: Desktop Cart Sidebar */}
      <div className="hidden lg:flex flex-col h-full bg-white border border-[var(--color-border)] rounded-xl shadow-sm w-[380px] xl:w-[420px] shrink-0 overflow-hidden">
          {/* Cart Header */}
          <div className="p-5 border-b border-[var(--color-border)] bg-gray-50/30 flex justify-between items-center shrink-0">
             <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
               <ShoppingCart size={20} className="text-[var(--color-primary)]" />
               Current Bon
             </h2>
             <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-[var(--color-primary)]/20 shadow-sm">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
             </span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-[#fdfdfd]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] space-y-4">
                 <ShoppingCart size={48} className="opacity-20" />
                 <p className="font-medium text-sm">Cart is empty. Scan an item to start.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex flex-col gap-3 p-3 bg-white border border-[var(--color-border)] rounded-lg shadow-sm hover:border-[var(--color-primary)]/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-3">
                       <h4 className="font-semibold text-sm text-[var(--color-text)] leading-tight">{item.title}</h4>
                       <div className="flex items-center gap-2 mt-1.5 text-[12px] text-[var(--color-text-muted)]">
                         <span className="font-medium text-[var(--color-text)] bg-gray-100 px-1.5 py-0.5 rounded">{item.sizeLabel}</span>
                         <span className="flex items-center gap-1">
                           <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: item.colorHex || "#ccc" }} />
                           {item.colorName}
                         </span>
                       </div>
                    </div>
                    <div className="text-right shrink-0">
                       <span className="font-bold text-[var(--color-text)]">{(item.unitPrice * item.quantity).toLocaleString()}</span>
                       <span className="text-[10px] text-[var(--color-text-muted)] ml-1">DA</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--color-border)]/50 pt-2.5 mt-1">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-[var(--color-error)] text-[12px] font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                    
                    <div className="flex items-center gap-1 bg-gray-50 border border-[var(--color-border)] rounded-md p-0.5">
                      <button 
                        className="w-7 h-7 flex items-center justify-center bg-white rounded hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm" 
                        onClick={() => updateQuantity(item.id, -1)} 
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} className="text-[var(--color-text)]" />
                      </button>
                      <span className="w-8 text-center font-bold text-[13px] font-mono">{item.quantity}</span>
                      <button 
                        className="w-7 h-7 flex items-center justify-center bg-white rounded hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm" 
                        onClick={() => updateQuantity(item.id, 1)} 
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus size={14} className="text-[var(--color-text)]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-5 bg-white border-t border-[var(--color-border)] shrink-0 space-y-5">
             <div className="flex justify-between items-end">
               <span className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Total Pay</span>
               <div className="text-right">
                 <span className="text-3xl font-black text-[var(--color-primary)] tracking-tight">
                   {total.toLocaleString()} 
                 </span>
                 <span className="text-sm font-bold text-[var(--color-text-muted)] ml-1">DA</span>
               </div>
             </div>
             
             <Button 
              onClick={handleCheckout} 
              disabled={cart.length === 0 || isCheckoutPending}
              className="w-full h-14 rounded-lg text-base font-bold bg-[var(--color-success)] hover:opacity-90 transition-opacity text-white shadow-sm disabled:opacity-50"
             >
                {isCheckoutPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2" size={20} />
                    Validate Order
                  </>
                )}
             </Button>
          </div>
      </div>

      {/* Mobile Sticky Cart Footer */}
      <div className="fixed lg:hidden bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 rounded-t-xl">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
              <Sheet>
                 <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 h-12 rounded-lg border-[var(--color-border)] bg-gray-50 hover:bg-gray-100 flex items-center justify-between px-4 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="relative">
                           <ShoppingCart className="text-[var(--color-text)]" size={20} />
                           {cart.length > 0 && (
                              <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] bg-[var(--color-error)] text-white rounded-full flex items-center justify-center text-[10px] font-bold px-1 ring-2 ring-white">
                                {cart.reduce((a,b)=>a+b.quantity, 0)}
                              </span>
                           )}
                         </div>
                         <div className="flex flex-col items-start leading-tight ml-2">
                            <span className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">Review Cart</span>
                            <span className="font-bold text-[13px] text-[var(--color-text)]">
                              {total.toLocaleString()} DA
                            </span>
                         </div>
                      </div>
                    </Button>
                 </SheetTrigger>
                 <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 flex flex-col bg-gray-50 z-[100]">
                     <SheetTitle className="sr-only">Mobile Cart</SheetTitle>
                     <div className="p-4 border-b border-[var(--color-border)] bg-white flex items-center justify-between shrink-0">
                        <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                          <ShoppingCart size={22} className="text-[var(--color-primary)]" />
                          Mobile Cart
                        </h2>
                        <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded text-xs font-bold">
                           {cart.reduce((a,b)=>a+b.quantity, 0)} Items
                        </span>
                     </div>

                     <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfdfd]">
                        {cart.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-muted)]">
                             <ShoppingCart size={40} className="mb-2 opacity-20" />
                             <p className="text-sm font-medium">Cart is empty</p>
                           </div>
                        ) : (
                          cart.map(item => (
                            <div key={item.id} className="flex flex-col gap-2 p-3 bg-white border border-[var(--color-border)] rounded-lg shadow-sm">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-2">
                                   <h4 className="font-semibold text-sm text-[var(--color-text)]">{item.title}</h4>
                                   <p className="text-[12px] text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                                     <span className="bg-gray-100 text-[var(--color-text)] px-1 rounded font-medium">{item.sizeLabel}</span>
                                     • 
                                     <span className="flex items-center gap-1 border rounded px-1">
                                        <span className="w-2 h-2 rounded-full border border-black/10" style={{backgroundColor: item.colorHex}}/> 
                                        {item.colorName}
                                     </span>
                                   </p>
                                </div>
                                <span className="font-bold text-[13px] text-[var(--color-text)] whitespace-nowrap">{(item.unitPrice * item.quantity).toLocaleString()} DA</span>
                              </div>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]/50">
                                <button className="text-[var(--color-error)] text-xs font-medium px-2 py-1 bg-red-50 rounded" onClick={() => removeFromCart(item.id)}>Remove</button>
                                <div className="flex items-center gap-1 bg-gray-50 border border-[var(--color-border)] rounded p-0.5">
                                  <button className="w-7 h-7 bg-white rounded flex items-center justify-center shadow-sm" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}><Minus size={14} /></button>
                                  <span className="w-8 text-center font-bold text-[13px] font-mono">{item.quantity}</span>
                                  <button className="w-7 h-7 bg-white rounded flex items-center justify-center shadow-sm" onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.maxQuantity}><Plus size={14} /></button>
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
                className="h-12 px-6 rounded-lg font-bold bg-[var(--color-success)] hover:opacity-90 shadow-sm text-white disabled:opacity-50"
                disabled={cart.length === 0 || isCheckoutPending}
              >
                {isCheckoutPending ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Checkout"}
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
