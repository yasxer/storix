'use client'

import { Button } from "@/components/ui/button"
import { Trash2, Loader2, Printer } from "lucide-react"
import { useState } from "react"
import { cancelBon } from "../../pos/actions"
import { useRouter } from "next/navigation"

export function BonActions({ bonId }: { bonId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this sale? This will permanently delete the receipt and add the items back to stock.")) return
    
    setIsDeleting(true)
    try {
      const res = await cancelBon(bonId)
      if (res.success) {
        router.push("/khadem")
        router.refresh()
      } else {
        alert("Error: " + res.error)
      }
    } catch (e) {
      alert("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrint = () => {
    window.open(`/print/bon/${bonId}`, '_blank')
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" className="gap-2" onClick={handlePrint}>
        <Printer size={16} />
        Imprimer le Bon
      </Button>
      <Button variant="destructive" className="gap-2" onClick={handleCancel} disabled={isDeleting}>
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        Annuler la Vente
      </Button>
    </div>
  )
}
