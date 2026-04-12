"use client"

import { useCartStore } from "@/lib/store/cart"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function CartIcon() {
  const items = useCartStore((state) => state.items)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const count = mounted ? items.reduce((total, item) => total + item.quantity, 0) : 0
  
  return (
    <Link 
      href="/panier" 
      className="relative p-2 rounded-full transition-all duration-200 hover:bg-[rgba(211,242,192,0.4)]"
      style={{ color: 'var(--wise-black)' }}
    >
      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
      {mounted && count > 0 && (
        <span 
          className="absolute top-0 right-0 text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full leading-none translate-x-1 -translate-y-1"
          style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}