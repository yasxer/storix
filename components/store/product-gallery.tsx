"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"

export function ProductGallery({ photos, title, isOnSale, salePercentage }: { 
  photos: any[], 
  title: string,
  isOnSale?: boolean,
  salePercentage?: number
}) {
  const [activePhoto, setActivePhoto] = useState(photos[0]?.photo_url || null)

  return (
    <div className="space-y-3 md:space-y-4 -mx-4 md:mx-0 px-4 md:px-0">
      {/* Main Image */}
      <div 
        className="aspect-[4/5] relative overflow-hidden flex items-center justify-center bg-[#fafaf8]"
        style={{ borderRadius: '30px', boxShadow: 'var(--wise-ring)' }}
      >
        {activePhoto ? (
          <img 
            src={activePhoto} 
            alt={title}
            className="w-full h-full object-contain p-4 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#fafaf8]">
            <ShoppingBag className="h-12 w-12" style={{ color: 'var(--wise-light-surface)' }} />
          </div>
        )}

        {/* Sale badge */}
        {isOnSale && (
          <span 
            className="absolute top-4 left-4 z-10 text-[11px] font-bold px-4 py-2 rounded-[9999px] uppercase tracking-wider"
            style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
          >
            -{salePercentage}%
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {photos.map((photo: any, idx: number) => (
            <div 
              key={idx} 
              onClick={() => setActivePhoto(photo.photo_url)}
              className={`aspect-square relative overflow-hidden cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105 ${activePhoto === photo.photo_url ? 'ring-2 ring-[var(--wise-green)]' : ''}`}
              style={{ 
                borderRadius: '16px', 
                boxShadow: 'var(--wise-ring)', 
                backgroundColor: '#fafaf8',
              }}
            >
              <img 
                src={photo.photo_url} 
                alt={`${title} - ${idx}`}
                className="w-full h-full object-contain p-1.5"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
