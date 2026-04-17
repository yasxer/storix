'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, Package, PlusCircle, CreditCard, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export function KhademNav() {
  const pathname = usePathname()

  const links = [
    { href: '/khadem', label: 'Dashboard', icon: Home, exact: true },
    { href: '/khadem/pos', label: 'POS Terminal', icon: ShoppingCart },
    { href: '/khadem/orders', label: 'Online Orders', icon: CreditCard },
    { href: '/khadem/stock', label: 'Stock Lookup', icon: Package },
    { href: '/khadem/clients', label: 'Crédit Clients', icon: Users },
    { href: '/khadem/inventory', label: 'Adds & Purchases', icon: PlusCircle },
  ]
  return (
    <nav className="w-full flex sm:justify-start sm:max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 sm:h-14 items-center gap-1 sm:overflow-x-auto sm:no-scrollbar justify-around sm:justify-start">
      {links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href)
        const Icon = link.icon
        
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl sm:rounded-full transition-all flex-1 sm:flex-none",
              isActive 
                ? "text-[var(--color-primary)] sm:bg-[var(--color-primary)] sm:text-white sm:shadow-md sm:shadow-black/5" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className={cn(
              "p-1.5 sm:p-0 rounded-full transition-colors",
              isActive && "bg-[var(--wise-mint)] sm:bg-transparent"
            )}>
              <Icon size={20} className={cn(
                "sm:w-[18px] sm:h-[18px]",
                isActive ? "text-[var(--wise-dark-green)] sm:text-white" : "text-gray-400"
              )} />
            </div>
            <span className={cn(
              "text-[10px] sm:text-sm font-bold sm:font-medium text-center leading-none tracking-tight sm:whitespace-nowrap transition-colors",
              isActive ? "text-[var(--color-primary)] sm:text-white" : "text-gray-500"
            )}>
              {link.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
