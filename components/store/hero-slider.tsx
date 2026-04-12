
"use client"
import { useState, useEffect } from "react"

export function HeroSlider({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images])

  if (!images || images.length === 0) {
     return (
       <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--wise-mint)' }}>
         <span className="text-sm font-semibold" style={{ color: 'var(--wise-dark-green)', fontFeatureSettings: '"calt"' }}>
           [Upload Hero Image from Admin]
         </span>
       </div>
     )
  }

  return (
    <>
      {images.map((img, i) => (
        <img 
          key={i} 
          src={img} 
          alt={`Promo ${i + 1}`} 
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${i === currentIndex ? "opacity-100 z-0 scale-105" : "opacity-0 -z-10 scale-100"}`} 
          style={{ objectPosition: "center center" }} 
        />
      ))}
      
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {images.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentIndex(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? '24px' : '10px',
                height: '10px',
                backgroundColor: i === currentIndex ? 'var(--wise-green)' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}
