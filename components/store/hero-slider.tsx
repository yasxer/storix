
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
       <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-800">
         [Upload Hero Image from Admin]
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
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === currentIndex ? "opacity-100 z-0 group-hover:scale-105" : "opacity-0 -z-10"}`} 
          style={{ objectPosition: "center center" }} 
        />
      ))}
      
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </>
  )
}
