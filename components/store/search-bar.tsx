"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { searchProductsClient } from "./actions"
import Link from "next/link"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      setLoading(true)
      searchProductsClient(debouncedQuery).then(data => {
        setResults(data || [])
        setLoading(false)
        setOpen(true)
      })
    } else {
      setResults([])
      setOpen(false)
    }
  }, [debouncedQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      router.push(`/boutique?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div ref={ref} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--wise-gray)' }} />
        <input 
          type="text"
          placeholder="Chercher un produit..."
          className="w-full pl-10 pr-10 h-10 text-sm font-medium rounded-[9999px] outline-none transition-all duration-200 focus:ring-2"
          style={{ 
            boxShadow: 'var(--wise-ring)',
            color: 'var(--wise-black)',
            fontFeatureSettings: '"calt"',
            backgroundColor: '#fafaf8',
          }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setOpen(true)
          }}
          dir="auto"
        />
        {query && (
          <button 
            type="button" 
            onClick={() => { setQuery(""); setResults([]); setOpen(false); }} 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(14,15,12,0.08)]"
            style={{ color: 'var(--wise-gray)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {open && query.length >= 2 && (
        <div 
          className="absolute top-full mt-2 w-full bg-white z-50 overflow-hidden max-h-[400px] flex flex-col"
          style={{ borderRadius: '16px', boxShadow: 'var(--wise-ring), 0 8px 24px rgba(14,15,12,0.08)' }}
        >
          {loading ? (
            <div className="p-4 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--wise-green)' }} />
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="overflow-y-auto flex-1 p-2">
                {results.slice(0, 5).map((item: any) => (
                  <Link 
                    key={item.id} 
                    href={`/article/${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:bg-[rgba(211,242,192,0.3)]"
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex-shrink-0 relative overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: '#fafaf8', boxShadow: 'var(--wise-ring)' }}
                    >
                       {item.photos?.[0]?.photo_url ? (
                         <img src={item.photos[0].photo_url} alt={item.title} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-[10px]" style={{ color: 'var(--wise-gray)' }}>—</span>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-left" style={{ color: 'var(--wise-black)', fontFeatureSettings: '"calt"' }} dir="auto">{item.title}</p>
                      <p className="text-xs truncate text-left" style={{ color: 'var(--wise-gray)' }}>
                        {item.category?.name} {item.model ? `> ${item.model.name}` : ''}
                      </p>
                    </div>
                    <div className="text-sm font-bold ml-2" style={{ color: 'var(--wise-black)' }}>
                      {item.is_on_sale ? (
                        <>
                          <span style={{ color: 'var(--wise-dark-green)' }}>{Math.round(item.base_price * (1 - item.sale_percentage / 100))}</span>
                          <span className="text-xs line-through ml-1" style={{ color: 'var(--wise-gray)' }}>{item.base_price}</span> DA
                        </>
                      ) : (
                        <>{item.base_price} DA</>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                href={`/boutique?q=${encodeURIComponent(query)}`}
                onClick={() => setOpen(false)}
                className="p-3 text-sm font-semibold text-center transition-colors duration-200 hover:bg-[rgba(211,242,192,0.3)]"
                style={{ color: 'var(--wise-dark-green)', borderTop: '1px solid rgba(14,15,12,0.08)', fontFeatureSettings: '"calt"' }}
              >
                Voir tous les résultats
              </Link>
            </>
          ) : (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--wise-gray)' }}>
              Aucun résultat pour "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}