"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Boxes,
  History,
  ShoppingBag,
  Users,
  Receipt,
  BarChart2,
  Settings,
  LogOut,
  Store,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState, useEffect } from "react"

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/categories", label: "Categories", icon: Store },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/stock", label: "Stock", icon: Boxes },
  { href: "/admin/history", label: "History", icon: History },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/employees", label: "Employees", icon: Users },    { href: "/admin/suppliers", label: "Fournisseurs", icon: Users },  { href: "/admin/vouchers", label: "Vouchers", icon: Receipt },
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar({
  profile,
  userEmail,
}: {
  profile: any
  userEmail: string
}) {
  const pathname = usePathname()

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-[var(--color-surface)]">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2.5 text-[var(--wise-dark-green)]">
          <div className="w-8 h-8 rounded-xl bg-[var(--wise-dark-green)] text-[var(--wise-mint)] flex items-center justify-center">
            <Store className="h-4 w-4" />
          </div>
          <span className="font-display font-bold text-lg text-gray-900 tracking-tight">
            Hanot Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (pathname.startsWith(link.href + "/") && link.href !== "/admin")
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                isActive
                  ? "bg-[var(--wise-mint)] text-[var(--wise-dark-green)]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] transition-colors ${
                  isActive
                    ? "text-[var(--wise-dark-green)]"
                    : "text-gray-400 group-hover:text-[var(--wise-dark-green)]"
                }`}
              />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t shrink-0 border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--wise-dark-green)] text-sm font-bold text-[var(--wise-mint)] shadow-sm">
            {profile?.full_name?.[0] || userEmail?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-900 truncate">{profile?.full_name || "Admin"}</span>
            <span className="text-xs font-semibold text-gray-400 truncate w-32">
              {userEmail}
            </span>
          </div>
        </div>
        <form action="/auth/logout" method="post">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-[var(--color-border)] md:flex shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar & Header */}
      <div className="md:hidden">
        <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md px-4 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--wise-dark-green)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--wise-dark-green)] text-[var(--wise-mint)] flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 tracking-tight">
              Hanot
            </span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 hover:bg-gray-100 rounded-full h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>
        </header>
        <div className="h-14" /> {/* Spacer for fixed header */}
      </div>
    </>
  )
}
