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
    <div className="border border-[var(--color-border)] rounded-lg overflow-x-auto bg-white shadow-sm">
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
        <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: variant.colorHex }} title={variant.colorHex}></div>
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
          className={`w-24 bg-white text-center font-medium h-8 transition-colors ${isUpdating ? "bg-gray-100 opacity-50" : ""} ${quantity <= 5 ? "border-red-300 bg-red-50 text-red-900 focus-visible:ring-red-500" : "border-gray-200"}`}
        />
      </td>
    </tr>
  )
}