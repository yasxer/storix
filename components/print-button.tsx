"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export default function PrintButton({ type, id, label = "Imprimer", variant = "outline", size = "sm" }: { type: string, id: string, label?: string, variant?: any, size?: any }) {
  const handlePrint = () => {
    window.open(`/print/${type}/${id}`, '_blank')
  }

  return (
    <Button variant={variant} size={size} onClick={handlePrint} className="flex gap-2" title={label}>
      <Printer className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}
