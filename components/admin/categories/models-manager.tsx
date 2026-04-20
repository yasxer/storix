"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Edit, UploadCloud, X, LayoutTemplate } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { v4 as uuidv4 } from "uuid"
import Link from "next/link"
import { getUploadUrl } from "@/app/actions/storage"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { createModel, updateModel, deleteModel } from "@/app/(admin)/admin/categories/actions"

export function ModelsManager({ categoryId, categoryName, models }: { categoryId: string, categoryName: string, models: any[] }) {
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const resetForm = () => {
    setEditId(null)
    setName("")
    setImageUrl("")
    setOpen(false)
  }

  const openEdit = (mod: any) => {
    setEditId(mod.id)
    setName(mod.name)
    setImageUrl(mod.photo_url || "")
    setOpen(true)
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    setUploading(true)
    const fileExt = file.name.split(".").pop()
    const fileName = `models/${uuidv4()}.${fileExt}`

    const { success, uploadUrl, publicUrl, error } = await getUploadUrl(fileName, file.type, 'store-assets')

    if (!success || !uploadUrl) {
      toast.error(`Échec: ${error}`)
      setUploading(false)
      return
    }

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })

    if (!uploadRes.ok) {
      toast.error(`Échec de l'envoi de l'image`)
      setUploading(false)
      return
    }

    setImageUrl(publicUrl || "")
    setUploading(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1
  })

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return toast.error("Le nom est obligatoire")
    
    setLoading(true)
    let res;
    if (editId) {
      res = await updateModel({ id: editId, name, photo_url: imageUrl, category_id: categoryId })
    } else {
      res = await createModel({ name, photo_url: imageUrl, category_id: categoryId })
    }
    setLoading(false)

    if (res?.error) toast.error(res.error)
    else {
      toast.success("Modèle enregistré")
      resetForm()
    }
  }

  const handleDeleteModel = async (id: string, count: number) => {
    if (count > 0) return toast.error("Impossible de supprimer car il contient des articles")
    if (!confirm("Supprimer ce modèle ?")) return
    
    setLoading(true)
    const res = await deleteModel(id)
    setLoading(false)
    if (res?.error) toast.error(res.error)
    else toast.success("Modèle supprimé")
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden flex flex-col w-full">
      <div className="flex items-center justify-between p-4 border-b">
         <h2 className="font-semibold text-lg">Modèles: {categoryName}</h2>
         <Dialog open={open} onOpenChange={(val) => { if(!val) resetForm(); else setOpen(true); }}>
           <DialogTrigger asChild>
             <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Ajouter Modèle</Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>{editId ? "Modifier" : "Nouveau"} Modèle ({categoryName})</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleSaveModel} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nom du modèle</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Series 8, L1..." />
                </div>
                <div className="space-y-2">
                  <Label>Image du Modèle</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {uploading ? (
                      <div className="flex flex-col items-center justify-center p-4">   
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />       
                      </div>
                    ) : imageUrl ? (
                       <div className="relative group rounded overflow-hidden aspect-square w-32 mx-auto bg-gray-50 border">
                          <img src={imageUrl} alt="preview" className="w-full h-full object-contain mix-blend-multiply" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Button type="button" variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); setImageUrl("") }}>
                               <X className="w-4 h-4" />
                             </Button>
                          </div>
                       </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">  
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">Glisser / Cliquer pour uploader l'image du modèle</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
                  <Button type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
                </div>
             </form>
           </DialogContent>
         </Dialog>
      </div>

      <div className="overflow-x-auto w-full">
         <Table>
           <TableHeader className="bg-gray-50">
             <TableRow>
               <TableHead>Image / Nom</TableHead>
               <TableHead className="text-center">Articles Visibles</TableHead>
               <TableHead className="text-right">Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {models.length === 0 && (
               <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-500">Aucun modèle trouvé pour cette catégorie.</TableCell></TableRow>
             )}
             {models.map((mod: any) => (
               <TableRow key={mod.id} className="hover:bg-gray-50">
                 <TableCell>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full border bg-white flex items-center justify-center overflow-hidden">
                          {mod.photo_url ? <img src={mod.photo_url} alt="" className="w-full h-full object-contain p-1 mix-blend-multiply" /> : <LayoutTemplate className="w-5 h-5 text-gray-300" />}
                       </div>
                       <span className="font-bold text-gray-900">{mod.name}</span>
                    </div>
                 </TableCell>
                 <TableCell className="text-center font-medium text-gray-600">
                    {mod.articleCount}
                 </TableCell>
                 <TableCell className="text-right">
                   <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products?model_id=${mod.id}`}>
                         <Button variant="secondary" size="sm" className="hidden sm:flex text-xs h-8">
                           Voir Produits
                         </Button>
                      </Link>
                      <Button variant="outline" size="icon" onClick={() => openEdit(mod)} className="h-8 w-8 text-blue-600">
                         <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteModel(mod.id, mod.articleCount)} className="h-8 w-8" disabled={mod.articleCount > 0}>
                         <Trash2 className="w-4 h-4" />
                      </Button>
                   </div>
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
      </div>
    </div>
  )
}
