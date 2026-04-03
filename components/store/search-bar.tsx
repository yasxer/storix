"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <Input 
          type="text"
          placeholder="Chercher un produit, catégorie..."
          className="w-full pl-9 pr-10 bg-white border-[var(--color-border)] focus-visible:ring-[var(--color-primary)] rounded-full text-sm"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {open && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-[var(--color-border)] z-50 overflow-hidden max-h-[400px] flex flex-col">
          {loading ? (
            <div className="p-4 flex items-center justify-center text-[var(--color-text-muted)]">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="overflow-y-auto flex-1 p-2">
                {results.slice(0, 5).map((item: any) => (
                  <Link 
                    key={item.id} 
                    href={`/article/${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-2 hover:bg-[var(--color-surface)] rounded-md transition-colors"
                  >
                    <div className="w-10 h-10 bg-[var(--color-surface)] rounded flex-shrink-0 relative overflow-hidden border border-[var(--color-border)] flex items-center justify-center">
                       {item.photos?.[0]?.photo_url ? (
                         <img src={item.photos[0].photo_url} alt={item.title} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-[10px] text-gray-400">No img</span>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-left" dir="auto">{item.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate text-left">
                        {item.category?.name} {item.model ? `> ${item.model.name}` : ''}
                      </p>
                    </div>
                    <div className="text-sm font-bold ml-2">
                      {item.is_on_sale ? (
                        <>
                          <span className="text-[var(--color-sale)]">{Math.round(item.base_price * (1 - item.sale_percentage / 100))}</span>
                          <span className="text-xs line-through text-[var(--color-text-muted)] ml-1">{item.base_price}</span> DA
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
                className="p-3 text-sm text-[var(--color-primary)] hover:bg-[var(--color-surface)] bg-gray-50 border-t border-[var(--color-border)] text-center font-medium transition-colors"
              >
                Voir tous les résultats
              </Link>
            </>
          ) : (
            <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">
              Aucun résultat pour "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}