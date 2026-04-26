'use client'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { searchArticles, createBon } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ScanBarcode, Minus, Plus, Trash2, ShoppingCart, CheckCircle2, Camera, X } from 'lucide-react'
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

  // Load default catalog
  useEffect(() => {
    startTransition(async () => {
      const defaultItems = await searchArticles('')
      setResults(defaultItems)
    })
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
          // alert('Bon verified and created successfully!') 
          setCart([]) 
          // Refresh results immediately
          const updatedItems = await searchArticles(query)
          setResults(updatedItems)
       } else {
          alert('Failed to checkout: ' + res.error)
       }
    })
  }

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] lg:h-[calc(100vh-7.5rem)] gap-0 lg:gap-6 bg-[#f7f8f9] relative w-full overflow-hidden">
      
      {/* Left side: Search & Grid */}
      <div className="flex-1 flex flex-col h-full w-full relative z-0">
        
        {/* Sticky Mobile-friendly Top Bar */}
        <div className="shrink-0 pt-4 px-4 pb-3 bg-white shadow-sm border-b border-gray-100 z-20 lg:rounded-none lg:bg-transparent lg:shadow-none lg:border-none lg:pt-6 lg:px-6">
          <div className="relative flex gap-3 w-full h-14">
            <div className="relative flex-1 h-full shadow-sm rounded-[1.25rem] bg-gray-50/80 border border-gray-200 focus-within:border-[var(--wise-green)] focus-within:ring-4 focus-within:ring-[var(--wise-green)]/20 transition-all flex items-center">
              <Search className="absolute left-4 text-gray-400" size={20} />
              <Input
                ref={searchRef}
                className="w-full h-full pl-11 pr-12 text-base md:text-sm bg-transparent border-none shadow-none focus-visible:ring-0 text-gray-900 placeholder:text-gray-400 font-medium"
                placeholder="Search products or scan..."
                value={query}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                inputMode="search"
              />
              {query && (
                 <button onClick={restoreDefaultCatalog} className="absolute right-4 text-gray-400 hover:text-gray-700 bg-white shadow-sm rounded-full p-1 border border-gray-100">
                    <X size={14} />
                 </button>
              )}
              {isPending && (
                <div className="absolute right-12 w-5 h-5 border-2 border-[var(--wise-green)] border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <Button
              size="icon"
              className="shrink-0 h-14 w-14 rounded-[1.25rem] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md transition-transform active:scale-95 border-none"
              onClick={() => setIsScannerOpen(true)}
            >
              <Camera size={24} />
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 pt-4 pb-32 lg:pb-6 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 w-full">
            {results.map((article: any) => (
               <div key={article.id} className="bg-white rounded-[1.25rem] p-2.5 shadow-sm border border-gray-200 flex flex-col transition-all active:scale-[0.99] hover:shadow-md">
                  
                  <div className="flex justify-between items-start mb-2 gap-2">
                     <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-[13px] leading-tight line-clamp-2" title={article.title}>
                          {article.title}
                        </h3>
                        {article.categoryName && (
                          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-wider truncate">
                            {article.categoryName}
                          </p>
                        )}
                     </div>
                     <span className="shrink-0 text-[10px] font-black text-[var(--wise-green)] bg-[var(--wise-dark-green)] px-1.5 py-0.5 rounded-md shadow-sm">
                       {article.base_price.toLocaleString()} DA
                     </span>
                  </div>

                  <div className="mt-auto flex flex-col gap-1.5">
                     {article.sizes?.map((size: any) => (
                        <div key={size.id} className="flex flex-wrap gap-1.5">
                           {size.colors?.map((color: any) => {
                              const outOfStock = color.quantity <= 0;
                              return (
                                <button
                                 key={color.id}
                                 onClick={() => addToCart(article, size, color)}
                                 disabled={outOfStock}
                                 className={`flex-1 min-w-[45%] flex items-center justify-between p-1.5 rounded-xl border transition-all active:scale-95 ${
                                   outOfStock 
                                   ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed' 
                                   : 'bg-white border-gray-200 hover:border-[var(--wise-green)] hover:bg-[var(--wise-mint)] cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                                 }`}
                                >
                                   <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                     <div className="w-2.5 h-2.5 shrink-0 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: color.hex_code || "#cccccc" }} />
                                     <span className="text-[10px] font-bold text-gray-800 truncate" title={`${size.size_label} ${color.color_name}`}>
                                        <span className="text-gray-400 mr-1">{size.size_label}</span>
                                        {color.color_name}
                                     </span>
                                   </div>
                                   <span className={`text-[9px] font-bold shrink-0 ${
                                     outOfStock ? 'text-red-400' : 'text-[var(--color-primary)]'
                                   }`}>
                                     {outOfStock ? '0' : color.quantity}
                                   </span>
                                </button>
                              )
                           })}
                        </div>
                     ))}
                  </div>
               </div>
            ))}

            {results.length === 0 && !isPending && query.length > 0 && (
               <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                   <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                     <Search className="text-gray-400" size={32} />
                   </div>
                   <p className="text-gray-500 font-bold text-lg">No products found.</p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Desktop Cart Sidebar */}
      <div className="hidden lg:flex flex-col h-full bg-white rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.03)] border border-gray-100 w-[380px] xl:w-[420px] shrink-0 overflow-hidden relative z-10">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white">
             <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
               <div className="w-10 h-10 bg-[var(--wise-mint)] rounded-full flex items-center justify-center">
                 <ShoppingCart size={18} className="text-[var(--wise-dark-green)]" />
               </div>
               Active Bon
             </h2>
             <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
             </span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-3 bg-gray-50/30">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                 <ShoppingCart size={48} className="opacity-20" />
                 <p className="font-bold text-sm">Cart is empty. Tap products to add.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex flex-col gap-3 p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-3">
                       <h4 className="font-bold text-[13px] text-gray-900 leading-tight">{item.title}</h4>
                       <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-gray-500">
                         <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 border border-gray-200">{item.sizeLabel}</span>
                         <span className="flex items-center gap-1.5">
                           <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: item.colorHex || "#ccc" }} />
                           {item.colorName}
                         </span>
                       </div>
                    </div>
                    <div className="text-right shrink-0">
                       <span className="font-black text-gray-900">{(item.unitPrice * item.quantity).toLocaleString()}</span>
                       <span className="text-[10px] text-gray-400 ml-1 font-bold">DA</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-1.5 border-t border-gray-100/80">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 text-[11px] font-bold px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                    
                    <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1 border border-gray-200">
                      <button 
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm border border-gray-100" 
                        onClick={() => updateQuantity(item.id, -1)} 
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={12} className="text-gray-700" />
                      </button>
                      <span className="w-8 text-center font-black text-[13px]">{item.quantity}</span>
                      <button 
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm border border-gray-100" 
                        onClick={() => updateQuantity(item.id, 1)} 
                        disabled={item.quantity >= item.maxQuantity}
                      >
                        <Plus size={12} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-white border-t border-gray-100 shrink-0 space-y-5">
             <div className="flex justify-between items-end">
               <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
               <div className="text-right">
                 <span className="text-3xl font-black text-[var(--color-primary)] tracking-tight">
                   {total.toLocaleString()} 
                 </span>
                 <span className="text-sm font-bold text-gray-400 ml-1">DA</span>
               </div>
             </div>
             
             <Button 
              onClick={handleCheckout} 
              disabled={cart.length === 0 || isCheckoutPending}
              className="w-full h-14 rounded-full text-base font-bold bg-black hover:bg-gray-900 transition-opacity text-wrapper text-[var(--wise-mint)] shadow-md disabled:bg-gray-200 disabled:text-gray-400"
             >
                {isCheckoutPending ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2" size={20} />
                    Confirm & Checkout
                  </>
                )}
             </Button>
          </div>
      </div>

      {/* Mobile Sticky Cart Trigger */}
      <div className="fixed lg:hidden bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent z-50 pointer-events-none">
          <div className="pointer-events-auto max-w-md mx-auto">
              <Sheet>
                 <SheetTrigger asChild>
                    <button className="w-full relative overflow-hidden bg-[var(--wise-black)] text-white rounded-[2rem] p-1.5 shadow-2xl flex items-center active:scale-[0.98] transition-transform">
                       <div className="bg-[#2a2a2a] w-12 h-12 rounded-full flex items-center justify-center relative shrink-0">
                         <ShoppingCart size={20} className="text-[var(--wise-green)]" />
                         {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[var(--wise-green)] text-black w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black border-2 border-[#2a2a2a]">
                              {cart.reduce((a,b)=>a+b.quantity, 0)}
                            </span>
                         )}
                       </div>
                       <div className="flex-1 flex items-center justify-between px-4">
                         <span className="font-bold text-sm tracking-widest uppercase text-gray-300">View Cart</span>
                         <span className="font-black text-lg text-[var(--wise-mint)]">{total.toLocaleString()} DA</span>
                       </div>
                    </button>
                 </SheetTrigger>
                 <SheetContent side="bottom" className="h-[88vh] rounded-t-[2rem] p-0 flex flex-col bg-gray-50 z-[100] border-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                     <SheetTitle className="sr-only">Mobile Cart</SheetTitle>
                     <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between shrink-0 rounded-t-[2rem]">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                          <div className="w-10 h-10 bg-[var(--wise-mint)] rounded-full flex items-center justify-center">
                            <ShoppingCart size={18} className="text-[var(--wise-dark-green)]" />
                          </div>
                          Your Cart
                        </h2>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                           {cart.reduce((a,b)=>a+b.quantity, 0)} Items
                        </span>
                     </div>

                     <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-gray-50/50">
                        {cart.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <ShoppingCart size={48} className="mb-4 opacity-20" />
                             <p className="text-sm font-bold">Cart is empty</p>
                           </div>
                        ) : (
                          cart.map(item => (
                            <div key={item.id} className="flex flex-col gap-3 p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-3">
                                   <h4 className="font-bold text-[13px] text-gray-900 leading-tight">{item.title}</h4>
                                   <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-gray-500">
                                     <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 border border-gray-200">{item.sizeLabel}</span>
                                     <span className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{backgroundColor: item.colorHex}}/> 
                                        {item.colorName}
                                     </span>
                                   </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-black text-gray-900">{(item.unitPrice * item.quantity).toLocaleString()}</span>
                                  <span className="text-[10px] text-gray-400 ml-1 font-bold">DA</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-3 mt-1.5 border-t border-gray-100/80">
                                <button className="text-red-500 text-[11px] font-bold px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors flex items-center gap-1.5" onClick={() => removeFromCart(item.id)}>
                                  <Trash2 size={12} /> Remove
                                </button>
                                <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1 border border-gray-200">
                                  <button className="w-7 h-7 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm border border-gray-100" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}><Minus size={12} className="text-gray-700" /></button>
                                  <span className="w-8 text-center font-black text-[13px]">{item.quantity}</span>
                                  <button className="w-7 h-7 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-sm border border-gray-100" onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.maxQuantity}><Plus size={12} className="text-gray-700" /></button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                     </div>
                     <div className="p-5 bg-white border-t border-gray-100 shrink-0 pb-8">
                       <div className="flex justify-between items-end mb-4">
                         <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                         <div className="text-right">
                           <span className="text-3xl font-black text-[var(--color-primary)] tracking-tight">
                             {total.toLocaleString()} 
                           </span>
                           <span className="text-sm font-bold text-gray-400 ml-1">DA</span>
                         </div>
                       </div>
                       <Button 
                         onClick={handleCheckout} 
                         className="w-full h-14 rounded-full text-base font-bold bg-black hover:bg-gray-900 transition-opacity text-[var(--wise-mint)] shadow-md disabled:bg-gray-200 disabled:text-gray-400"
                         disabled={cart.length === 0 || isCheckoutPending}
                       >
                         {isCheckoutPending ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : "Confirm & Checkout"}
                       </Button>
                     </div>
                 </SheetContent>
              </Sheet>
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

