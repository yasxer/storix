"use client"

import { useState } from "react"
import { useCartStore } from "@/lib/store/cart"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Minus, Plus, ShoppingCart } from "lucide-react"

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
      <div className="py-4 rounded-lg bg-red-50 text-red-600 text-center font-medium">
        Ce produit n'est pas disponible pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sizes */}
      <div className="space-y-3">
         <h3 className="font-medium">Taille</h3>
         <div className="flex flex-wrap gap-2">
           {article.sizes.map((size: any) => {
             const hasStock = size.colors?.some((c:any) => c.quantity > 0)
             return (
               <button
                 key={size.id}
                 onClick={() => handleSizeChange(size)}
                 disabled={!hasStock}
                 className={`
                   px-4 py-2 border rounded-xl text-sm font-medium transition-colors
                   ${!hasStock ? 'opacity-50 cursor-not-allowed bg-muted line-through' : ''}
                   ${selectedSize?.id === size.id ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary'}
                 `}
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
           <h3 className="font-medium">Couleur: <span className="text-muted-foreground ml-1">{selectedColor?.color_name || ''}</span></h3>
           <div className="flex flex-wrap gap-2.5">
             {selectedSize.colors.map((color: any) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  disabled={color.quantity === 0}
                  className={`
                    w-9 h-9 md:w-11 md:h-11 rounded-full border-2 transition-all p-0.5 md:p-1
                    ${color.quantity === 0 ? 'opacity-50 cursor-not-allowed hidden' : ''}
                    ${selectedColor?.id === color.id ? 'border-primary shadow-[0_0_10px_rgba(0,0,0,0.1)] scale-110' : 'border-transparent hover:border-gray-300'}
                  `}
                  title={color.color_name}
                >
                  <div 
                    className="w-full h-full rounded-full border border-black/10" 
                    style={{ backgroundColor: color.color_hex || '#ccc' }} 
                  />
                </button>
             ))}
           </div>
         </div>
      )}

      {/* Quantity & Action */}
      <div className="pt-4 pb-8 flex flex-col gap-3">
        {/* Qty & Add to cart row */}
        <div className="flex items-center gap-3 w-full">
          {/* Qty selector */}
          <div className="flex items-center justify-between border-2 border-gray-100 rounded-full px-1.5 h-[52px] md:h-[56px] w-[110px] md:w-[130px] shrink-0 bg-white shadow-sm">
            <button 
               onClick={() => setQuantity(Math.max(1, quantity - 1))}
               disabled={quantity <= 1}
               className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-30"
            >
               <Minus className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
            <span className="font-bold text-base md:text-lg text-gray-900 w-8 text-center">{quantity}</span>
            <button 
               onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
               disabled={quantity >= maxStock}
               className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-30"
            >
               <Plus className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
          </div>

          {/* Add to cart button */}
          <Button 
            size="lg"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="flex-1 h-[52px] md:h-[56px] rounded-full text-[15px] md:text-lg font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-[1px] transition-all active:scale-[0.98]"
          >
          {isAvailable ? (
            <>
              <ShoppingCart className="mr-2 w-5 h-5" />
              Ajouter au panier
            </>
          ) : (
            'Rupture de stock'
          )}
        </Button>
        </div>

       {/* Small hint */}
       {isAvailable && maxStock <= 5 && (
         <p className="text-orange-500 text-sm font-medium flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
           Plus que {maxStock} article(s) en stock !
         </p>
       )}
      </div>
    </div>
  )
}
