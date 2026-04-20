
"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Edit, UploadCloud, X, ChevronDown, ChevronRight, PackageOpen } from "lucide-react"
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

import { createCategory, updateCategory, deleteCategory, createModel, deleteModel } from "@/app/(admin)/admin/categories/actions"

export function CategoriesManager({ categories }: { categories: any[] }) {
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

  const openEdit = (cat: any) => {
    setEditId(cat.id)
    setName(cat.name)
    setImageUrl(cat.image_url || "")
    setOpen(true)
  }

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    setUploading(true)
    const fileExt = file.name.split(".").pop()
    const fileName = `categories/${uuidv4()}.${fileExt}`

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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return toast.error("Le nom est obligatoire")
    
    setLoading(true)
    let res;
    if (editId) {
      res = await updateCategory({ id: editId, name, image_url: imageUrl })
    } else {
      res = await createCategory({ name, image_url: imageUrl })
    }
    setLoading(false)

    if (res?.error) toast.error(res.error)
    else {
      toast.success("Catégorie enregistrée")
      resetForm()
    }
  }

  const handleDeleteCategory = async (id: string, count: number) => {
    if (count > 0) return toast.error("Impossible de supprimer car elle contient des articles")
    if (!confirm("Supprimer cette catégorie ?")) return
    
    setLoading(true)
    const res = await deleteCategory(id)
    setLoading(false)
    if (res?.error) toast.error(res.error)
    else toast.success("Catégorie supprimée")
  }

  const handleDeleteModel = async (id: string) => {
     if (!confirm("Supprimer ce modèle ?")) return
     const res = await deleteModel(id)
     if (res?.error) toast.error(res.error)
     else toast.success("Modèle supprimé")
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden flex flex-col w-full">
      <div className="flex items-center justify-between p-4 border-b">
         <h2 className="font-semibold text-lg">Catégories Existantes</h2>
         <Dialog open={open} onOpenChange={(val) => { if(!val) resetForm(); else setOpen(true); }}>
           <DialogTrigger asChild>
             <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Ajouter Catégorie</Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>{editId ? "Modifier" : "Nouvelle"} Catégorie</DialogTitle>
             </DialogHeader>
             <form onSubmit={handleSaveCategory} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nom de la catégorie</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Montres, Parfums..." />
                </div>
                <div className="space-y-2">
                  <Label>Image de Catégorie (Optionnelle mais recommandée)</Label>
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
                        <p className="text-sm font-medium">Glisser / Cliquer pour uploader (1 icône)</p>
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

      <div className="hidden md:block overflow-x-auto w-full">
         <Table>
           <TableHeader className="bg-gray-50">
             <TableRow>
               <TableHead className="w-[50px]"></TableHead>
               <TableHead>Image / Nom</TableHead>
               <TableHead className="text-center">Articles Visibles</TableHead>
               <TableHead className="text-center">Modèles</TableHead>
               <TableHead className="text-right">Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {categories.length === 0 && (
               <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500">Aucune catégorie trouvée.</TableCell></TableRow>
             )}
             {categories.map((cat) => (
               <React.Fragment key={cat.id}>
                 <TableRow className="hover:bg-gray-50">
                   <TableCell>
                      <Link href={`/admin/categories/${cat.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </Button>
                      </Link>
                   </TableCell>
                   <TableCell>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full border bg-white flex items-center justify-center overflow-hidden">
                            {cat.image_url ? <img src={cat.image_url} alt="" className="w-full h-full object-contain p-1 mix-blend-multiply" /> : <PackageOpen className="w-5 h-5 text-gray-300" />}
                         </div>
                         <span className="font-bold text-gray-900">{cat.name}</span>
                      </div>
                   </TableCell>
                   <TableCell className="text-center font-medium text-gray-600">{cat.articleCount}</TableCell>
                   <TableCell className="text-center">
                     <span className="inline-flex items-center justify-center bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
                       {cat.models?.length || 0} modèles
                     </span>
                   </TableCell>
                   <TableCell className="text-right">
                     <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/categories/${cat.id}`}>
                           <Button variant="secondary" size="sm" className="hidden sm:flex text-xs h-8">
                             Gérer les Modèles
                           </Button>
                        </Link>
                        <Button variant="outline" size="icon" onClick={() => openEdit(cat)} className="h-8 w-8 text-blue-600">
                           <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteCategory(cat.id, cat.articleCount)} className="h-8 w-8" disabled={cat.articleCount > 0}>
                           <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                   </TableCell>
                 </TableRow>
                 
                </React.Fragment>
             ))}
           </TableBody>
         </Table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden flex flex-col gap-3 p-3 bg-gray-50/50 rounded-b-xl border-t border-gray-100">
         {categories.length === 0 && (
           <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
             Aucune catégorie trouvée.
           </div>
         )}
         {categories.map((cat) => (
           <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                 {cat.image_url ? <img src={cat.image_url} alt="" className="w-full h-full object-contain p-1.5 mix-blend-multiply" /> : <PackageOpen className="w-6 h-6 text-gray-300" />}
              </div>
              <div className="flex-1 flex flex-col justify-center min-w-0">
                 <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate pr-2">{cat.name}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                       <Button variant="ghost" size="icon" onClick={() => openEdit(cat)} className="h-7 w-7 text-blue-600 bg-blue-50 rounded-lg">
                          <Edit className="w-3.5 h-3.5" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id, cat.articleCount)} disabled={cat.articleCount > 0} className="h-7 w-7 text-red-600 bg-red-50 rounded-lg disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />
                       </Button>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      {cat.articleCount} articles
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      {cat.models?.length || 0} modèles
                    </span>
                 </div>
                 
                 <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <Link href={`/admin/categories/${cat.id}`} className="w-full">
                       <Button variant="outline" size="sm" className="w-full h-8 text-[11px] font-bold text-[var(--wise-dark-green)] border-gray-200 hover:border-[var(--wise-mint)] hover:bg-[var(--wise-mint)]/10 transition-colors">
                          Gérer les Modèles <ChevronRight className="w-3.5 h-3.5 ml-1" />
                       </Button>
                    </Link>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  )
}
