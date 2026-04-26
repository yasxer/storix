"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articles: any[]
  onSelect: (article: any) => void
}

export function ProductSelectModal({ open, onOpenChange, articles, onSelect }: ProductSelectModalProps) {
  const [search, setSearch] = useState("")

  const filteredArticles = useMemo(() => {
    if (!search) return articles
    const s = search.toLowerCase()
    return articles.filter(a => 
      a.title?.toLowerCase().includes(s) || 
      a.barcode?.toLowerCase().includes(s)
    )
  }, [articles, search])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-bold">Select Product</DialogTitle>
        </DialogHeader>
        
        <div className="p-4 border-b bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or barcode..."
              className="pl-10 h-11 bg-white border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredArticles.length > 0 ? (
            <div className="grid gap-1">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => {
                    onSelect(article)
                    onOpenChange(false)
                    setSearch("")
                  }}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-[var(--wise-mint)] group-hover:text-[var(--wise-dark-green)] transition-colors">
                    <Package size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{article.title}</h4>
                    <p className="text-xs text-gray-500 font-mono">{article.barcode || "No Barcode"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{article.base_price?.toLocaleString()} DA</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Vente</p>
                  </div>
                  <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-[var(--wise-dark-green)] text-[var(--wise-mint)] rounded-full flex items-center justify-center">
                      <Plus size={18} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No products found matching "{search}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
