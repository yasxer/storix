import Link from "next/link"

export function Footer({ settings, categories }: { settings: any, categories: any[] }) {
  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-12 py-12 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="inline-block flex-shrink-0">
            {settings?.store_logo_url ? (
              <img src={settings.store_logo_url} alt={settings.store_name} className="h-10 w-auto object-contain grayscale" />
            ) : (
              <span className="font-display font-bold text-xl text-[var(--color-text)]">
                {settings?.store_name || "Boutique"}
              </span>
            )}
          </Link>
          <p className="text-sm text-[var(--color-text-muted)] max-w-sm" dir="auto">
            {settings?.hero_subtitle || "Notre boutique en ligne avec les meilleurs offres."}
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h4 className="font-bold text-[var(--color-text)] uppercase tracking-wider text-sm">Catégories</h4>
          <ul className="space-y-2">
            {categories?.slice(0, 5).map(cat => (
              <li key={cat.id}>
                <Link href={`/category/${cat.slug}`} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors" dir="auto">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div className="space-y-4">
          <h4 className="font-bold text-[var(--color-text)] uppercase tracking-wider text-sm">Service Client</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/suivi" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                Suivre ma commande
              </Link>
            </li>
            <li>
              <Link href="/compte" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                Mon compte
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h4 className="font-bold text-[var(--color-text)] uppercase tracking-wider text-sm">Contact</h4>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]" dir="auto">
            {settings?.store_phone && (
              <li>📞 {settings.store_phone}</li>
            )}
            {settings?.store_address && (
              <li>📍 {settings.store_address}</li>
            )}
          </ul>
        </div>

      </div>

      <div className="container mx-auto pt-8 border-t border-[var(--color-border)] text-center">
        <p className="text-xs text-[var(--color-text-faint)]">
          &copy; {new Date().getFullYear()} {settings?.store_name || "Boutique"}. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}