"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { addClientTransaction } from "@/app/(admin)/admin/clients/actions"

const txSchema = z.object({
  amount: z.string().min(1, "Montant est requis").refine(v => !isNaN(Number(v)) && Number(v) > 0, "Montant invalide"),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof txSchema>

export function AddTransactionDialog({ clientId, type, buttonText }: { clientId: string, type: "purchase" | "payment", buttonText: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: { amount: "", description: "" }
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    const result = await addClientTransaction({
        client_id: clientId,
        type: type,
        amount: Number(data.amount),
        description: data.description || (type === "purchase" ? "Achat" : "Versement"),
    })
    
    if (result.error) {
      alert("Erreur: " + result.error)
    } else {
      setOpen(false)
      form.reset()
    }
    setIsLoading(false)
  }

  const isPurchase = type === "purchase"
  const Icon = isPurchase ? ArrowUpFromLine : ArrowDownToLine
  const colorClass = isPurchase ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
  const title = isPurchase ? "Ajouter un Achat (Dette)" : "Ajouter un Versement"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`shrink-0 text-white ${colorClass}`}>
          <Icon className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant (DZD) <span className="text-red-500">*</span></label>
            <Input {...form.register("amount")} type="number" step="0.01" placeholder="0.00" className="bg-gray-50 border-gray-200" />
            {form.formState.errors.amount && <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{isPurchase ? "Ce qu'il a pris (Description)" : "Commentaire / Note"}</label>
            <Input {...form.register("description")} placeholder={isPurchase ? "Ex: 2 pantalons, t-shirt..." : "Ex: Versement en espèces"} className="bg-gray-50 border-gray-200" />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={isLoading} className={`${colorClass} text-white min-w-[120px]`}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
