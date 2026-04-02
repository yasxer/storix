"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateStoreSettings } from "@/app/(admin)/admin/settings/actions"
import { toast } from "sonner"
import { Save } from "lucide-react"

export function StoreSettingsForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    store_name: initialData?.store_name || "",
    store_phone: initialData?.store_phone || "",
    store_address: initialData?.store_address || "",
    low_stock_threshold: initialData?.low_stock_threshold || 5
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await updateStoreSettings(formData)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Store settings updated successfully!")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="store_name">Store Name</Label>
          <Input 
            id="store_name"
            value={formData.store_name}
            onChange={e => setFormData({ ...formData, store_name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store_phone">Store Phone</Label>
          <Input 
            id="store_phone"
            value={formData.store_phone}
            onChange={e => setFormData({ ...formData, store_phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="store_address">Store Address</Label>
        <Input 
          id="store_address"
          value={formData.store_address}
          onChange={e => setFormData({ ...formData, store_address: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold (Quantities &le; X)</Label>
        <Input 
          id="low_stock_threshold"
          type="number"
          min="1"
          value={formData.low_stock_threshold}
          onChange={e => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 5 })}
          required
        />
      </div>

      <div className="pt-2 border-t flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
