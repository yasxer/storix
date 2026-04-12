"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Wallet } from "lucide-react"
import { addSupplierPayment } from "@/app/(admin)/admin/suppliers/actions"
import { format } from "date-fns"

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0"),
  payment_date: z.string().min(1, "Date requise"),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof paymentSchema>

export function AddPaymentDialog({ supplierId, solde }: { supplierId: string, solde: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { 
        amount: solde > 0 ? solde : 0, 
        payment_date: format(new Date(), "yyyy-MM-dd"),
        notes: "" 
    }
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    const result = await addSupplierPayment({
        supplier_id: supplierId,
        amount: data.amount,
        payment_date: data.payment_date,
        notes: data.notes
    })
    
    if (result.error) {
      alert("Erreur: " + result.error)
    } else {
      setOpen(false)
      form.reset({
        amount: 0,
        payment_date: format(new Date(), "yyyy-MM-dd"),
        notes: ""
      })
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shrink-0 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-3 w-3 mr-1" /> Versement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-600" />
            Nouveau Versement (Paiement)
          </DialogTitle>
        </DialogHeader>

        <div className="bg-gray-50 p-3 rounded text-sm text-center">
            Solde actuel (Crédit): <span className="font-bold text-red-600">{solde.toFixed(2)} DZD</span>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant payé (DZD) <span className="text-red-500">*</span></label>
            <Input type="number" step="0.01" {...form.register("amount")} className="bg-gray-50 border-gray-200 text-lg py-5 font-bold text-green-700" />
            {form.formState.errors.amount && <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Date du paiement</label>
            <Input type="date" {...form.register("payment_date")} className="bg-gray-50 border-gray-200" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optionnel)</label>
            <Input {...form.register("notes")} placeholder="Virement CCP, Espèces..." className="bg-gray-50 border-gray-200" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={isLoading || solde <= 0} className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin flex-1" /> : "Payer & Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}