import Link from "next/link"

export function Footer({ settings, categories }: { settings: any, categories: any[] }) {
  return (
    <footer className="mt-16" style={{ backgroundColor: 'var(--wise-black)' }}>
      {/* Green accent line */}
      <div className="h-1" style={{ backgroundColor: 'var(--wise-green)' }} />
      
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block flex-shrink-0">
              {settings?.store_logo_url ? (
                <img src={settings.store_logo_url} alt={settings.store_name} className="h-10 w-auto object-contain brightness-0 invert" />
              ) : (
                <span className="font-semibold text-xl text-white" style={{ fontFeatureSettings: '"calt"' }}>
                  {settings?.store_name || "Boutique"}
                </span>
              )}
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--wise-gray)' }} dir="auto">
              {settings?.hero_subtitle || "Notre boutique en ligne avec les meilleurs offres."}
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white uppercase tracking-wider text-sm" style={{ fontFeatureSettings: '"calt"' }}>Catégories</h4>
            <ul className="space-y-2.5">
              {categories?.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <Link 
                    href={`/category/${cat.slug}`} 
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--wise-gray)' }}
                    dir="auto"
                  >
                    <span className="hover:text-[#9fe870]">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Client */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white uppercase tracking-wider text-sm" style={{ fontFeatureSettings: '"calt"' }}>Service Client</h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/suivi" className="text-sm hover:text-[#9fe870] transition-colors duration-200" style={{ color: 'var(--wise-gray)' }}>
                  Suivre ma commande
                </Link>
              </li>
              <li>
                <Link href="/compte" className="text-sm hover:text-[#9fe870] transition-colors duration-200" style={{ color: 'var(--wise-gray)' }}>
                  Mon compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white uppercase tracking-wider text-sm" style={{ fontFeatureSettings: '"calt"' }}>Contact</h4>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--wise-gray)' }} dir="auto">
              {settings?.store_phone && (
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(159,232,112,0.15)', color: 'var(--wise-green)' }}>📞</span>
                  {settings.store_phone}
                </li>
              )}
              {settings?.store_address && (
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(159,232,112,0.15)', color: 'var(--wise-green)' }}>📍</span>
                  {settings.store_address}
                </li>
              )}
            </ul>
          </div>

        </div>

        <div className="pt-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-xs" style={{ color: 'var(--wise-gray)' }}>
            &copy; {new Date().getFullYear()} {settings?.store_name || "Boutique"}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}