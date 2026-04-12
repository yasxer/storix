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
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/stock", label: "Stock", icon: Boxes },
  { href: "/admin/history", label: "History", icon: History },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/employees", label: "Employees", icon: Users },
  { href: "/admin/suppliers", label: "Fournisseurs", icon: Users },
  { href: "/admin/vouchers", label: "Vouchers", icon: Receipt },
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

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[var(--color-surface)]">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-primary)]">
          <Store className="h-6 w-6" />
          <span className="font-display font-bold text-lg text-[var(--color-text)]">
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
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon
                className={`h-5 w-5 transition-colors ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-faint)] group-hover:text-[var(--color-primary)]"
                }`}
              />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t shrink-0 border-[var(--color-border)]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-medium text-white">
            {profile?.full_name?.[0] || userEmail?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">{profile?.full_name || "Admin"}</span>
            <span className="text-xs text-[var(--color-text-muted)] truncate w-32">
              {userEmail}
            </span>
          </div>
        </div>
        <form action="/auth/logout" method="post">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--color-error)] transition-colors hover:bg-[#b91c1c]/10">
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-[var(--color-border)] md:flex shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar & Header */}
      <div className="md:hidden">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Store className="h-6 w-6" />
            <span className="font-display font-bold text-lg text-[var(--color-text)]">
              Hanot
            </span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>
      </div>
    </>
  )
}
