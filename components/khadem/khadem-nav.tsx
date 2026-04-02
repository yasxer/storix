'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, Package, PlusCircle, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

export function KhademNav() {
  const pathname = usePathname()

  const links = [
    { href: '/khadem', label: 'Dashboard', icon: Home, exact: true },
    { href: '/khadem/pos', label: 'POS Terminal', icon: ShoppingCart },
    { href: '/khadem/orders', label: 'Online Orders', icon: CreditCard },
    { href: '/khadem/stock', label: 'Stock Lookup', icon: Package },
    { href: '/khadem/inventory', label: 'Adds & Purchases', icon: PlusCircle },
  ]

  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-1 overflow-x-auto no-scrollbar">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href)
        const Icon = link.icon
        
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={cn(
              "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all whitespace-nowrap",
              isActive 
                ? "bg-[var(--color-primary)] text-white shadow-md shadow-blue-500/20" 
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon size={18} className={cn(isActive && "text-white")} />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
