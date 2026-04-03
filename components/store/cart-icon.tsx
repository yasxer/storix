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
    <Link href="/panier" className="relative p-2 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors">
      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
      {mounted && count > 0 && (
        <span className="absolute 0 top-0 right-0 sm:right-0 bg-[var(--color-primary)] text-white text-[10px] w-4 h-4 sm:text-xs font-bold sm:w-5 sm:h-5 flex items-center justify-center rounded-full leading-none translate-x-1 -translate-y-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}