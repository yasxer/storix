"use client"

import { useState } from "react"
import { useCartStore } from "@/lib/store/cart"
import { ShoppingCart, Minus, Plus } from "lucide-react"

export function AddToCartForm({ article }: { article: any }) {
  const { addItem } = useCartStore()

  const defaultSize = article.sizes?.[0]
  const defaultColor = defaultSize?.colors?.[0]

  const [selectedSize, setSelectedSize] = useState<any>(defaultSize)
  const [selectedColor, setSelectedColor] = useState<any>(defaultColor)
  const [quantity, setQuantity] = useState(1)

  const maxStock = selectedColor?.quantity || 0
  const isAvailable = maxStock > 0

  const handleAddToCart = () => {
    if (!isAvailable || !selectedSize || !selectedColor) return

    const price = selectedSize.price_override ?? article.base_price
    const finalPrice = article.is_on_sale 
      ? price * (1 - (article.sale_percentage || 0) / 100) 
      : price

    addItem({
      article_id: article.id,
      size_id: selectedSize.id,
      color_id: selectedColor.id,
      quantity,
      unit_price: finalPrice,
      title: article.name,
      photo_url: article.photos?.[0]?.photo_url || null,
      size_label: selectedSize.size_label,
      color_name: selectedColor.color_name,
      color_hex: selectedColor.color_hex,
    })
  }

  const handleSizeChange = (size: any) => {
    setSelectedSize(size)
    if (size.colors && size.colors.length > 0) {
       setSelectedColor(size.colors[0])
    } else {
       setSelectedColor(null)
    }
    setQuantity(1)
  }

  if (!article.sizes || article.sizes.length === 0) {
    return (
      <div 
        className="py-4 rounded-[9999px] text-center font-semibold text-sm"
        style={{ backgroundColor: 'rgba(208,50,56,0.08)', color: 'var(--wise-danger)' }}
      >
        Ce produit n'est pas disponible pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sizes */}
      <div className="space-y-3">
         <h3 className="font-semibold text-sm" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>Taille</h3>
         <div className="flex flex-wrap gap-2">
           {article.sizes.map((size: any) => {
             const hasStock = size.colors?.some((c:any) => c.quantity > 0)
             const isSelected = selectedSize?.id === size.id
             return (
               <button
                 key={size.id}
                 onClick={() => handleSizeChange(size)}
                 disabled={!hasStock}
                 className="px-5 py-2.5 rounded-[9999px] text-sm font-semibold transition-all duration-200"
                 style={{
                   backgroundColor: isSelected ? 'var(--wise-green)' : 'rgba(22,51,0,0.05)',
                   color: isSelected ? 'var(--wise-dark-green)' : 'var(--wise-black)',
                   opacity: !hasStock ? 0.4 : 1,
                   cursor: !hasStock ? 'not-allowed' : 'pointer',
                   textDecoration: !hasStock ? 'line-through' : 'none',
                   transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                   fontFeatureSettings: '"calt"',
                 }}
               >
                 {size.size_label}
               </button>
             )
           })}
         </div>
      </div>

      {/* Colors */}
      {selectedSize?.colors && selectedSize.colors.length > 0 && (
         <div className="space-y-3">
           <h3 className="font-semibold text-sm" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
             Couleur: <span style={{ color: 'var(--wise-gray)' }} className="ml-1 font-normal">{selectedColor?.color_name || ''}</span>
           </h3>
           <div className="flex flex-wrap gap-3">
             {selectedSize.colors.map((color: any) => {
               const isSelected = selectedColor?.id === color.id
               const hexValues = color.color_hex ? color.color_hex.split(/\/|,/).map((h: string) => h.trim()) : ['#ccc']
               const backgroundStyle = hexValues.length > 1 
                 ? { background: `linear-gradient(135deg, ${hexValues[0]} 50%, ${hexValues[1]} 50%)` }
                 : { backgroundColor: hexValues[0] }

               return (
                 <button
                   key={color.id}
                   onClick={() => setSelectedColor(color)}
                   disabled={color.quantity === 0}
                   className="rounded-full transition-all duration-200"
                   style={{
                     width: isSelected ? '44px' : '40px',
                     height: isSelected ? '44px' : '40px',
                     padding: '3px',
                     border: isSelected ? '2px solid var(--wise-green)' : '2px solid transparent',
                     opacity: color.quantity === 0 ? 0.3 : 1,
                     display: color.quantity === 0 ? 'none' : 'block',
                     transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                   }}
                   title={color.color_name}
                 >
                   <div 
                     className="w-full h-full rounded-full" 
                     style={{ 
                       ...backgroundStyle,
                       boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                     }} 
                   />
                 </button>
               )
             })}
           </div>
         </div>
      )}

      {/* Quantity & Action */}
      <div className="pt-4 pb-8 flex flex-col gap-4">
        <div className="flex items-center gap-3 w-full">
          {/* Qty selector */}
          <div 
            className="flex items-center justify-between px-1.5 h-[52px] md:h-[56px] w-[120px] md:w-[130px] shrink-0"
            style={{ borderRadius: '9999px', boxShadow: 'var(--wise-ring)', background: '#ffffff' }}
          >
            <button 
               onClick={() => setQuantity(Math.max(1, quantity - 1))}
               disabled={quantity <= 1}
               className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[rgba(211,242,192,0.4)] disabled:opacity-30"
            >
               <Minus className="w-4 h-4" style={{ color: 'var(--wise-black)' }} />
            </button>
            <span className="font-bold text-base md:text-lg w-8 text-center" style={{ color: 'var(--wise-black)' }}>{quantity}</span>
            <button 
               onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
               disabled={quantity >= maxStock}
               className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-[rgba(211,242,192,0.4)] disabled:opacity-30"
            >
               <Plus className="w-4 h-4" style={{ color: 'var(--wise-black)' }} />
            </button>
          </div>

          {/* Add to cart button — Wise Green Pill */}
          <button 
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="flex-1 h-[52px] md:h-[56px] inline-flex items-center justify-center gap-2 font-semibold text-[15px] md:text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              borderRadius: '9999px',
              backgroundColor: isAvailable ? 'var(--wise-green)' : 'var(--wise-light-surface)',
              color: isAvailable ? 'var(--wise-dark-green)' : 'var(--wise-gray)',
              fontFeatureSettings: '"calt"',
              border: 'none',
            }}
            onMouseEnter={(e) => { if (isAvailable) e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            onMouseDown={(e) => { if (isAvailable) e.currentTarget.style.transform = 'scale(0.97)' }}
            onMouseUp={(e) => { if (isAvailable) e.currentTarget.style.transform = 'scale(1.03)' }}
          >
            {isAvailable ? (
              <>
                <ShoppingCart className="w-5 h-5" />
                Ajouter au panier
              </>
            ) : (
              'Rupture de stock'
            )}
          </button>
        </div>

       {/* Low stock warning */}
       {isAvailable && maxStock <= 5 && (
         <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--wise-dark-green)' }}>
           <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--wise-green)' }} />
           Plus que {maxStock} article(s) en stock !
         </p>
       )}
      </div>
    </div>
  )
}
