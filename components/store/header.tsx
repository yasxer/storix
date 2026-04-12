import Link from "next/link"
import { SearchBar } from "./search-bar"
import { CartIcon } from "./cart-icon"
import { User } from "lucide-react"

export async function Header({ settings, categories }: { settings: any, categories: any[] }) {
  return (
    <header className="sticky top-0 z-40 bg-white" style={{ boxShadow: 'var(--wise-ring)' }}>
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <div className="flex flex-1 md:flex-none items-center">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {settings?.store_logo_url ? (
              <img src={settings.store_logo_url} alt={settings.store_name} className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <span className="font-semibold text-xl md:text-2xl tracking-tight" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}>
                {settings?.store_name || "Boutique"}
              </span>
            )}
          </Link>
        </div>

        {/* Center: Categories as pills (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {categories?.slice(0, 5).map((cat: any) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="px-4 py-2 rounded-[9999px] text-sm font-semibold transition-all duration-200 hover:bg-[rgba(211,242,192,0.4)]"
              style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Right: Search + Icons */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex lg:hidden xl:flex max-w-xs">
            <SearchBar />
          </div>
          
          <Link 
            href="/compte" 
            className="hidden sm:flex items-center gap-2 p-2 rounded-full transition-all duration-200 hover:bg-[rgba(211,242,192,0.4)]"
            style={{ color: 'var(--wise-black)' }}
          >
            <User className="w-5 h-5" />
          </Link>
          
          <CartIcon />
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden lg:flex xl:hidden px-4 pb-3 pt-1">
        <SearchBar />
      </div>
    </header>
  )
}