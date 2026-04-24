"use client"

import { useState } from "react"
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Phone, Hash } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function TrackingForm() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanQuery = query.trim()
    if (!cleanQuery) return

    setLoading(true)
    setSearched(true)
    
    try {
      let q = supabase.from("orders").select("*")
      
      // Check if it's a UUID (Order ID)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanQuery)
      
      if (isUUID) {
        q = q.eq("id", cleanQuery)
      } else {
        // For phone numbers, allow matching raw input or digit-only version
        const digitsOnly = cleanQuery.replace(/\D/g, '')
        if (digitsOnly.length >= 8) {
          q = q.or(`phone.eq."${cleanQuery}",phone.eq."${digitsOnly}"`)
        } else {
          q = q.eq("phone", cleanQuery)
        }
      }

      const { data, error } = await q.order("created_at", { ascending: false })
      
      if (error) throw error
      setResults(data || [])
    } catch (err) {
      console.error("Tracking error:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />
      case 'confirmed': return <CheckCircle2 className="w-5 h-5 text-blue-500" />
      case 'shipped': return <Truck className="w-5 h-5 text-indigo-500" />
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'cancelled': return <Package className="w-5 h-5 text-red-500" />
      default: return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'confirmed': return 'Confirmée'
      case 'shipped': return 'Expédiée'
      case 'delivered': return 'Livrée'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--wise-mint)] text-[var(--wise-dark-green)] mb-6 shadow-sm">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-4 tracking-tight" style={{ fontFeatureSettings: '"calt"' }}>Suivi de Commande</h1>
        <p className="text-[var(--wise-gray)] text-lg max-w-md mx-auto">
          Entrez votre numéro de téléphone ou l'ID de votre commande pour voir l'état d'avancement.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-12 relative group">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="N° de téléphone ou ID de commande..."
            className="w-full h-16 pl-14 pr-32 rounded-[24px] border-2 border-gray-100 focus:border-[var(--wise-green)] focus:ring-0 transition-all outline-none text-lg font-medium shadow-sm group-hover:shadow-md"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-6 rounded-[18px] font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
            style={{ backgroundColor: 'var(--wise-green)', color: 'var(--wise-dark-green)' }}
          >
            {loading ? "Recherche..." : "Suivre"}
          </button>
        </div>
      </form>

      {searched && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {results.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Aucune commande trouvée pour "{query}"</p>
            </div>
          ) : (
            <div className="grid gap-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">
                {results.length} commande{results.length > 1 ? 's' : ''} trouvée{results.length > 1 ? 's' : ''}
              </p>
              {results.map((order) => (
                <div key={order.id} className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commande</span>
                        <code className="text-xs font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{order.id.slice(0, 8)}</code>
                      </div>
                      <div className="text-2xl font-bold">{order.total_price.toFixed(2)} DA</div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-2xl">
                      {getStatusIcon(order.status)}
                      <span className="font-bold text-sm uppercase tracking-wider">{getStatusLabel(order.status)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Date</p>
                        <p className="text-sm font-bold">{format(new Date(order.created_at), "d MMMM yyyy", { locale: fr })}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-right sm:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Wilaya</p>
                        <p className="text-sm font-bold flex items-center justify-end gap-1.5 uppercase">
                          <MapPin className="w-3.5 h-3.5 text-[var(--wise-green)]" />
                          {order.wilaya}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.courier_tracking_id && (
                    <div className="mt-6 p-4 bg-[var(--wise-mint)]/30 rounded-2xl border border-[var(--wise-mint)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Hash className="w-4 h-4 text-[var(--wise-dark-green)]" />
                        <div>
                          <p className="text-[9px] font-black text-[var(--wise-dark-green)] opacity-50 uppercase tracking-widest">N° de suivi transporteur</p>
                          <p className="text-sm font-bold text-[var(--wise-dark-green)]">{order.courier_tracking_id}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
