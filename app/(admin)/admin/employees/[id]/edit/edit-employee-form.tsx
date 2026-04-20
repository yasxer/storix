"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { updateAllowedCategories } from "../../edit-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function EditEmployeeForm({ employee, categories }: { employee: any, categories: any[] }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Start with existing categories or empty array if null
  const [selectedCats, setSelectedCats] = useState<string[]>(employee.allowed_categories || [])

  const toggleCategory = (catId: string) => {
    setSelectedCats(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    )
  }

  const handleSave = async () => {
    setLoading(true)
    const result = await updateAllowedCategories(employee.id, selectedCats)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Employee access updated.")
      router.push("/admin/employees")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Allowed Categories</h3>
        <p className="text-sm text-gray-500 mb-4">
          Select which categories this employee can see in their Stock and POS pages. 
          If none are selected, they will see ALL categories.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
             <label key={cat.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
               <input 
                 type="checkbox" 
                 className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" 
                 checked={selectedCats.includes(cat.id)}
                 onChange={() => toggleCategory(cat.id)}
               />
               <span className="text-sm font-medium">{cat.name}</span>
             </label>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.push("/admin/employees")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}