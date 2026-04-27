"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, Package } from "lucide-react"

export function StockTable({ articles }: { articles: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
     <div className="border border-[var(--color-border)] rounded-lg overflow-x-auto bg-white shadow-sm hidden md:block">
      <table className="w-full min-w-[800px] whitespace-nowrap text-sm text-left">
        <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)]">
          <tr>
            <th className="px-6 py-3 font-medium w-10"></th>
            <th className="px-6 py-3 font-medium">Product Title</th>
            <th className="px-6 py-3 font-medium">Category / Model</th>
            <th className="px-6 py-3 font-medium text-center">Total Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
          {articles.map((article) => {
            // Calculate total stock and flatten specific variants for this article
            const flatVariants: any[] = []
            let totalStock = 0

            article.article_sizes?.forEach((size: any) => {
              size.article_size_colors?.forEach((color: any) => {
                totalStock += color.quantity || 0
                flatVariants.push({
                  sizeId: size.id,
                  sizeLabel: size.size_label,
                  colorId: color.id,
                  colorName: color.color_name,
                  colorHex: color.color_hex,
                  quantity: color.quantity
                })
              })
            })

            const isExpanded = expanded[article.id]

            return (
              <React.Fragment key={article.id}>
                {/* Main Article Row */}
                <tr 
                  className={`hover:bg-[#f8f9fa] transition-colors cursor-pointer ${isExpanded ? 'bg-[#f8f9fa]' : ''}`}
                  onClick={() => toggleExpand(article.id)}
                >
                  <td className="px-6 py-4 text-[var(--color-text-muted)]">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </td>
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    {article.title}
                    {!article.is_published && <Badge variant="default" className="text-[10px] scale-90">Draft</Badge>}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-muted)]">
                    {article.categories?.name} {article.models ? `/ ${article.models?.name}` : ''}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${totalStock <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                      {totalStock}
                    </span>
                  </td>
                </tr>
                
                {/* Expanded Variants Row */}
                {isExpanded && (
                  <tr className="bg-[#fafafa]">
                    <td colSpan={4} className="p-0 border-t border-[var(--color-border)]">
                      <div className="px-12 py-4 pl-[72px]"> {/* Indented to align with product title */}
                        <table className="w-full text-sm text-left border rounded-md overflow-hidden bg-white">
                          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2">Size</th>
                              <th className="px-4 py-2">Color</th>
                              <th className="px-4 py-2 w-32 border-l">Quantity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {flatVariants.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="px-4 py-6 text-center text-gray-500 italic">No variations found for this product.</td>
                              </tr>
                            ) : (
                              flatVariants.map((variant, idx) => (
                                <VariantRow key={`${variant.colorId}-${idx}`} variant={variant} />
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
          
          {articles.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                No products found in stock.
              </td>
            </tr>
          )}
        </tbody>
      </table>
     </div>

     {/* Mobile Cards View */}
     <div className="md:hidden flex flex-col gap-3 p-3 bg-[#f7f8f9] rounded-xl border border-[var(--color-border)]">
        {articles.length === 0 ? (
          <div className="py-12 text-center text-[var(--color-text-muted)] bg-white rounded-xl">
             No products found in stock.
          </div>
        ) : (
          articles.map((article) => {
            const flatVariants: any[] = []
            let totalStock = 0

            article.article_sizes?.forEach((size: any) => {
              size.article_size_colors?.forEach((color: any) => {
                totalStock += color.quantity || 0
                flatVariants.push({
                  sizeId: size.id,
                  sizeLabel: size.size_label,
                  colorId: color.id,
                  colorName: color.color_name,
                  colorHex: color.color_hex,
                  quantity: color.quantity
                })
              })
            })

            const isExpanded = expanded[article.id]

            return (
              <div key={article.id} className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden flex flex-col transition-all">
                 <div className="p-4 flex items-start justify-between cursor-pointer active:bg-gray-50" onClick={() => toggleExpand(article.id)}>
                    <div className="flex-1 pr-3 min-w-0">
                       <h3 className="font-bold text-gray-900 text-[13px] leading-tight flex flex-wrap items-center gap-1.5 mb-1.5">
                         <span className="truncate">{article.title}</span>
                         {!article.is_published && <Badge variant="default" className="text-[9px] px-1.5 py-0">Draft</Badge>}
                       </h3>
                       <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">
                         {article.categories?.name} {article.models ? `/ ${article.models?.name}` : ''}
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                       <span className={`font-black text-[11px] bg-gray-50 px-2 py-0.5 rounded-md border text-center min-w-[65px] ${
                         totalStock <= 5 ? 'text-red-500 border-red-100' : 'text-[var(--wise-dark-green)] border-[var(--color-border)]'
                       }`}>
                         {totalStock} qty
                       </span>
                       <div className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-[var(--color-border)]">
                         {isExpanded ? 'Close' : 'Edit'}
                         {isExpanded ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
                       </div>
                    </div>
                 </div>
                 {isExpanded && (
                   <div className="bg-gray-50/80 border-t border-[var(--color-border)] p-3">
                      {flatVariants.length === 0 ? (
                        <div className="text-center text-xs text-gray-500 italic py-2">No variations found.</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                           {flatVariants.map((variant, idx) => (
                             <VariantCard key={`${variant.colorId}-${idx}`} variant={variant} />
                           ))}
                        </div>
                      )}
                   </div>
                 )}
              </div>
            )
          })
        )}
     </div>
    </>
  )
}

function VariantRow({ variant }: { variant: any }) {
  const supabase = createClient()
  const [quantity, setQuantity] = useState(variant.quantity)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityUpdate = async (newVal: number) => {
    if (newVal < 0 || isNaN(newVal)) return;

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('article_size_colors')
        .update({ quantity: newVal })
        .eq('id', variant.colorId)
        
      if (error) throw error
    } catch (e: any) {
      alert("Error updating quantity: " + e.message)
      setQuantity(variant.quantity) // revert to original on error
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <tr className="hover:bg-[#f8f9fa] transition-colors">
      <td className="px-4 py-2 font-medium text-gray-700">
        {variant.sizeLabel}
      </td>
      <td className="px-4 py-2 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full border shadow-sm" style={
          variant.colorHex?.includes(',') || variant.colorHex?.includes('/')
            ? { background: `linear-gradient(135deg, ${(variant.colorHex.split(/\/|,/)[0] || '#ccc').trim()} 50%, ${(variant.colorHex.split(/\/|,/)[1] || '#ccc').trim()} 50%)` }
            : { backgroundColor: variant.colorHex }
        } title={variant.colorHex}></div>
        <span>{variant.colorName}</span>
      </td>
      <td className="px-4 py-2 border-l">
        <Input 
          type="number" 
          min={0}
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value)
            setQuantity(isNaN(val) ? 0 : val)
          }}
          onBlur={(e) => handleQuantityUpdate(parseInt(e.target.value))}
          disabled={isUpdating}
          className={`w-24 bg-white text-center font-medium h-8 transition-colors ${isUpdating ? "bg-gray-100 opacity-50" : ""} ${quantity <= 5 ? "border-red-300 bg-red-50 text-red-900 focus-visible:ring-red-500" : "border-[var(--color-border)]"}`}
        />
      </td>
    </tr>
  )
}

function VariantCard({ variant }: { variant: any }) {
  const supabase = createClient()
  const [quantity, setQuantity] = useState(variant.quantity)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityUpdate = async (newVal: number) => {
    if (newVal < 0 || isNaN(newVal)) return;

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('article_size_colors')
        .update({ quantity: newVal })
        .eq('id', variant.colorId)
        
      if (error) throw error
    } catch (e: any) {
      alert("Error updating quantity: " + e.message)
      setQuantity(variant.quantity) // revert to original on error
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl p-2.5 flex flex-col gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors focus-within:border-[var(--wise-mint)]">
       <div className="flex justify-between items-center">
          <span className="font-extrabold text-[11px] bg-[#f8f9fa] border border-[var(--color-border)] px-1.5 py-0.5 rounded-md text-gray-700 shadow-sm">{variant.sizeLabel}</span>
          <div className="flex items-center gap-1.5 bg-white pl-1.5 pr-2 py-0.5 rounded-full border border-[var(--color-border)] shadow-sm">
             <div className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm" style={
                variant.colorHex?.includes(',') || variant.colorHex?.includes('/')
                  ? { background: `linear-gradient(135deg, ${(variant.colorHex.split(/\/|,/)[0] || '#ccc').trim()} 50%, ${(variant.colorHex.split(/\/|,/)[1] || '#ccc').trim()} 50%)` }
                  : { backgroundColor: variant.colorHex }
             }></div>
             <span className="text-[9px] uppercase font-bold text-gray-600 truncate max-w-[40px]">{variant.colorName}</span>
          </div>
       </div>
       <div className="flex items-center mt-auto">
          <Input 
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              setQuantity(isNaN(val) ? 0 : val)
            }}
            onBlur={(e) => handleQuantityUpdate(parseInt(e.target.value))}
            disabled={isUpdating}
            className={`w-full h-8 text-xs text-center font-black transition-colors rounded-lg shadow-inner ${isUpdating ? "opacity-50" : ""} ${quantity <= 5 ? "bg-red-50 border-red-200 text-red-600 focus-visible:ring-red-400" : "bg-gray-50 border-[var(--color-border)] focus-visible:ring-[var(--wise-green)] text-[var(--wise-dark-green)]"}`}
          />
       </div>
    </div>
  )
}