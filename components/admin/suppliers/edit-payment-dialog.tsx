"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Wallet, Pencil, Trash2 } from "lucide-react"

// Ensure we import from the right place, assuming admin actions has both edit and delete.
// Wait, actually I should import from admin (if doing it in admin), or pass the functions,
// but since both use it, let's use the one in admin/suppliers/actions.
import { updateSupplierPayment, deleteSupplierPayment } from "@/app/(admin)/admin/suppliers/actions"

const paymentSchema = z.object({
  amount: z.any().transform((v: any) => v === "" ? "" : Number(v)).pipe(z.union([z.number().min(0.01, "Le montant doit être supérieur à 0"), z.literal("")])),
  payment_date: z.string().min(1, "Date requise"),
  notes: z.string().optional()
})

type FormValues = z.infer<typeof paymentSchema>

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  supplier_id: string;
}

export function EditPaymentDialog({ payment }: { payment: Payment }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
        amount: payment.amount,
        payment_date: payment.payment_date.split('T')[0],
        notes: payment.notes || ""
    }
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    const result = await updateSupplierPayment(payment.id, {
        amount: Number(data.amount),
        payment_date: data.payment_date,
        notes: data.notes
    })

    if (result.error) {
      alert("Erreur: " + result.error)
    } else {
      setOpen(false)
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce versement ?")) return;
    
    setIsDeleting(true)
    const result = await deleteSupplierPayment(payment.id)
    if (result.error) {
      alert("Erreur: " + result.error)
    } else {
      setOpen(false)
      router.refresh()
    }
    setIsDeleting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">   
            <Pencil className="h-5 w-5 text-blue-600" />
            Modifier Versement
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Montant payé (Versement) <span className="text-red-500">*</span></label>
            <Input type="number" step="0.01" placeholder="0.00" {...form.register("amount")} className="bg-white border-gray-200 text-lg py-5 font-bold text-blue-700 flex-1" />
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

          <div className="flex justify-between items-center pt-4">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting || isLoading} className="gap-2">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Supprimer
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={isLoading || isDeleting} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin flex-1" /> : "Enregistrer"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
