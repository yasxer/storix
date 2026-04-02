'use client'

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PrintButton() {
  return (
    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
      <Printer size={16} />
      Print Bon
    </Button>
  )
}
