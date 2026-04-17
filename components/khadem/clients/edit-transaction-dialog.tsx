"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { updateClientTransaction } from "@/app/(khadem)/khadem/clients/actions"

const txSchema = z.object({
  amount: z.string().min(1, "Montant est requis").refine(v => !isNaN(Number(v)) && Number(v) > 0, "Montant invalide"),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof txSchema>

export function EditTransactionDialog({ 
  transaction, 
  open, 
  setOpen 
}: { 
  transaction: any, 
  open: boolean, 
  setOpen: (o: boolean) => void 
}) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(txSchema),
    defaultValues: { 
      amount: transaction?.amount?.toString() || "", 
      description: transaction?.description || "" 
    }
  })

  // To refresh values if transaction changes
  if (transaction && open && form.getValues("amount") !== transaction.amount?.toString()) {
    form.reset({
      amount: transaction.amount?.toString(),
      description: transaction.description || ""
    })
  }

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    const result = await updateClientTransaction({
        id: transaction.id,
        client_id: transaction.client_id,
        amount: Number(data.amount),
        description: data.description || (transaction.type === "purchase" ? "Achat" : "Versement"),
    })
    
    if (result.error) {
      alert("Erreur: " + result.error)
    } else {
      setOpen(false)
    }
    setIsLoading(false)
  }

  if (!transaction) return null

  const isPurchase = transaction.type === "purchase"
  const colorClass = isPurchase ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Modifier {isPurchase ? "l'Achat" : "le Versement"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant (DZD) <span className="text-red-500">*</span></label>
            <Input {...form.register("amount")} type="number" step="0.01" placeholder="0.00" className="bg-gray-50 border-gray-200" />
            {form.formState.errors.amount && <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input {...form.register("description")} placeholder="Ex: 2 pantalons..." className="bg-gray-50 border-gray-200" />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={isLoading} className={`${colorClass} text-white min-w-[120px]`}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}




