import Link from "next/link"
import { Heart } from "lucide-react"

export function ProductCard({ article }: { article: any }) {
  const photo = article.photos?.[0]?.photo_url || null
  
  const displayPrice = article.sizes?.[0]?.price_override ?? article.base_price
  const salePrice = article.is_on_sale
    ? displayPrice * (1 - (article.sale_percentage || 0) / 100)
    : null

  // Calculate total stock from sizes and colors
  const totalStock = article.sizes?.reduce((sum: number, size: any) => {
    const sizeStock = size.colors?.reduce((colorSum: number, color: any) => colorSum + (color.quantity || 0), 0) || 0;
    return sum + sizeStock;
  }, 0) ?? 0;

  // An article is sold out only if it has size variants initialized but the calculated stock is 0
  const hasSizes = article.sizes && article.sizes.length > 0;
  const isSoldOut = hasSizes && totalStock <= 0;

  return (
    <Link href={`/article/${article.id}`} className={`group block relative border ${isSoldOut ? 'border-gray-100 opacity-80' : 'border-transparent hover:border-gray-200'} rounded-[1.25rem] bg-white overflow-hidden transition-all hover:shadow-xl`}>
      {/* Image container */}
      <div className={`aspect-square relative overflow-hidden flex items-center justify-center rounded-xl mx-3 mt-3 shadow-inner ${isSoldOut ? 'bg-gray-100' : 'bg-gray-50'}`}>
        
        {/* Sold Out Overlay with blur */}
        {isSoldOut && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
             <span className="bg-black/80 text-white px-4 py-2 rounded-lg font-bold tracking-wider uppercase text-sm shadow-lg">
                Épuisé
             </span>
          </div>
        )}

        {/* Heart Icon Top Right */}
        <button className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4" />
        </button>

        {/* Promo Badge */}
        {article.is_on_sale && !isSoldOut && (
           <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
             -{article.sale_percentage}%
           </span>
        )}

        {photo ? (
          <img src={photo} alt={article.title} className={`w-full h-full object-contain p-3 md:p-4 transition-transform duration-500 ${isSoldOut ? 'grayscale mix-blend-normal' : 'mix-blend-multiply group-hover:scale-105'}`} />
        ) : (
           <span className="text-3xl md:text-4xl text-gray-300 font-bold opacity-30">{article.title.charAt(0)}</span>
        )}
      </div>

      <div className="p-3 md:p-4 pt-2 md:pt-3">
        <h3 className="font-semibold text-[13px] md:text-[15px] mb-1.5 md:mb-2 text-gray-800 line-clamp-2 leading-snug" dir="auto">
          {article.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="font-black text-[15px] md:text-lg text-gray-900 tracking-tight">
            {article.is_on_sale ? (
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-red-500">{Math.round(salePrice!)} DA</span>
                <span className="text-[10px] md:text-xs text-gray-400 line-through font-medium">{displayPrice} DA</span>
              </div>
            ) : (
              <span>{displayPrice} DA</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}