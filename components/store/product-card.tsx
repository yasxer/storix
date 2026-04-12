import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

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
    <Link 
      href={`/article/${article.id}`} 
      className={`group block relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isSoldOut ? 'opacity-75' : ''}`}
      style={{ 
        borderRadius: '30px', 
        boxShadow: 'var(--wise-ring)',
        background: '#ffffff',
      }}
    >
      {/* Image container */}
      <div className={`aspect-square relative overflow-hidden flex items-center justify-center ${isSoldOut ? 'bg-[#f5f5f3]' : 'bg-[#fafaf8]'}`} style={{ borderRadius: '28px 28px 0 0' }}>
        
        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
             <span 
               className="px-5 py-2.5 rounded-[9999px] font-semibold tracking-wider uppercase text-xs"
               style={{ backgroundColor: 'var(--wise-black)', color: '#ffffff' }}
             >
                Épuisé
             </span>
          </div>
        )}

        {/* Sale Badge */}
        {article.is_on_sale && !isSoldOut && (
           <span 
             className="absolute top-3 left-3 z-10 text-[11px] font-bold px-3 py-1.5 rounded-[9999px] uppercase tracking-wider"
             style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
           >
             -{article.sale_percentage}%
           </span>
        )}

        {/* Arrow indicator on hover */}
        <div 
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-75"
          style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
        >
          <ArrowUpRight className="w-4 h-4" />
        </div>

        {photo ? (
          <img 
            src={photo} 
            alt={article.title} 
            className={`w-full h-full object-contain p-4 transition-transform duration-500 ${isSoldOut ? 'grayscale' : 'group-hover:scale-105'}`} 
          />
        ) : (
           <span className="text-4xl font-bold opacity-10" style={{ color: 'var(--wise-black)' }}>{article.title.charAt(0)}</span>
        )}
      </div>

      <div className="p-4 md:p-5">
        {article.category?.name && (
          <span className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--wise-gray)', fontFeatureSettings: '"calt"' }}>
            {article.category.name}
          </span>
        )}
        
        <h3 className="font-semibold text-[14px] md:text-[15px] mb-3 line-clamp-2 leading-snug" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }} dir="auto">
          {article.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="font-bold tracking-tight" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
            {article.is_on_sale ? (
              <div className="flex items-center gap-2">
                <span className="text-[15px] md:text-lg" style={{ color: 'var(--wise-dark-green)' }}>{Math.round(salePrice!)} DA</span>
                <span className="text-[10px] md:text-xs line-through font-medium" style={{ color: 'var(--wise-gray)' }}>{displayPrice} DA</span>
              </div>
            ) : (
              <span className="text-[15px] md:text-lg">{displayPrice} DA</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}