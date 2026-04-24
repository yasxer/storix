"use client"

import { useState, useTransition } from "react"
import { toggleProductPublish } from "@/app/(khadem)/khadem/products/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ProductTogglePublish({ articleId, initialStatus }: { articleId: string, initialStatus: boolean }) {
  const [isPublished, setIsPublished] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    const newStatus = !isPublished
    setIsPublished(newStatus)
    startTransition(async () => {
      const res = await toggleProductPublish(articleId, newStatus)
      if (res.error) {
        toast.error("Erreur: " + res.error)
        setIsPublished(!newStatus) // Revert on error
      } else {
        if (newStatus) {
          toast.success("Produit activé : Il est maintenant visible dans la boutique.")
        } else {
          toast.info("Produit désactivé : Il n'est plus visible dans la boutique.")
        }
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex items-center justify-center px-3 py-1 text-xs font-bold rounded-md transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--wise-dark-green)] disabled:opacity-70 disabled:cursor-not-allowed ${
        isPublished 
          ? "bg-[var(--wise-mint)] text-[var(--wise-dark-green)] hover:bg-[var(--wise-mint)]/80" 
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
      ) : null}
      {isPublished ? "En Boutique" : "Caché"}
    </button>
  )
}
