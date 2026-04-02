"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { updateDeliveryFee } from "@/app/(admin)/admin/settings/actions"
import { toast } from "sonner"

export function DeliveryFeesTable({ wilayas }: { wilayas: any[] }) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleUpdate = async (id: string, field: "fee_domicile" | "fee_bureau" | "is_active", value: any) => {
    setUpdating(`${id}-${field}`)
    const res = await updateDeliveryFee(id, field, value)
    if (res.error) {
      toast.error(`Failed to update: ${res.error}`)
    } else {
      toast.success("Delivery fee updated")
    }
    setUpdating(null)
  }

  return (
    <div className="bg-white border border-[var(--color-border)] rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f8f9fa] text-[var(--color-text-muted)] text-xs uppercase font-semibold border-b border-[var(--color-border)] sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-medium">Wilaya Code</th>
              <th className="px-6 py-3 font-medium">Wilaya Name</th>
              <th className="px-6 py-3 font-medium text-center">Active</th>
              <th className="px-6 py-3 font-medium text-right">Fee Domicile (DA)</th>
              <th className="px-6 py-3 font-medium text-right">Fee Bureau (DA)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
            {wilayas.map((w) => (
              <tr key={w.id} className="hover:bg-[#f8f9fa] transition-colors">
                <td className="px-6 py-3 font-mono font-bold text-gray-500 w-24">
                  {w.wilaya_code.toString().padStart(2, '0')}
                </td>
                <td className="px-6 py-3 font-medium min-w-[150px]">
                  {w.wilaya_name}
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      checked={w.is_active}
                      disabled={updating === `${w.id}-is_active`}
                      onChange={(e) => handleUpdate(w.id, "is_active", e.target.checked)}
                    />
                  </div>
                </td>
                <td className="px-6 py-2 text-right">
                  <Input 
                    type="number"
                    defaultValue={w.fee_domicile}
                    className="w-24 text-right inline-block h-8 font-mono text-sm"
                    onBlur={(e) => {
                      if (parseFloat(e.target.value) !== w.fee_domicile) {
                         handleUpdate(w.id, "fee_domicile", parseFloat(e.target.value))
                      }
                    }}
                    disabled={updating === `${w.id}-fee_domicile`}
                  />
                </td>
                <td className="px-6 py-2 text-right">
                   <Input 
                    type="number"
                    defaultValue={w.fee_bureau}
                    className="w-24 text-right inline-block h-8 font-mono text-sm"
                    onBlur={(e) => {
                      if (parseFloat(e.target.value) !== w.fee_bureau) {
                         handleUpdate(w.id, "fee_bureau", parseFloat(e.target.value))
                      }
                    }}
                    disabled={updating === `${w.id}-fee_bureau`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

