import Link from "next/link"
import { SearchBar } from "./search-bar"
import { CartIcon } from "./cart-icon"
import { User, Menu } from "lucide-react"

export async function Header({ settings, categories }: { settings: any, categories: any[] }) {
  // Mobile Nav Drawer is needed but can be a small client component.
  // We'll just build a basic header layout.

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)] border-b border-[var(--color-border)] shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex flex-1 md:flex-none items-center">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {settings?.store_logo_url ? (
              <img src={settings.store_logo_url} alt={settings.store_name} className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <span className="font-display font-bold text-xl md:text-2xl text-[var(--color-primary)]">
                {settings?.store_name || "Boutique"}
              </span>
            )}
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <SearchBar />
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/compte" className="p-2 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors hidden sm:flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm font-medium sr-only lg:not-sr-only">Compte</span>
          </Link>
          
          <CartIcon />
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden p-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <SearchBar />
      </div>

    </header>
  )
}