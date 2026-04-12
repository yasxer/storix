"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus } from "lucide-react"
import { createSupplier } from "@/app/(admin)/admin/suppliers/actions"

const supplierSchema = z.object({
  name: z.string().min(2, "Nom est requis (min 2 chars)"),
  phone: z.string().optional(),
  address: z.string().optional()
})

type FormValues = z.infer<typeof supplierSchema>

export function AddSupplierDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: "", phone: "", address: "" }
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    const result = await createSupplier(data)
    if (result.error) {
      alert("Erreur: " + result.error)
    } else {
      setOpen(false)
      form.reset()
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Un Fournisseur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nouveau Fournisseur</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom complet ou Société <span className="text-red-500">*</span></label>
            <Input {...form.register("name")} placeholder="Fournisseur X" className="bg-gray-50 border-gray-200" />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Numéro de téléphone</label>
            <Input {...form.register("phone")} placeholder="05..., 06..., 07..." className="bg-gray-50 border-gray-200" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Adresse / Ville</label>
            <Input {...form.register("address")} placeholder="Alger, El Eulma, Sétif..." className="bg-gray-50 border-gray-200" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}