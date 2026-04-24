"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Printer, Edit2 } from "lucide-react"
import Link from "next/link"
import JsBarcode from "jsbarcode"

export function ProductRowActions({ articleId, barcode, title, price }: { articleId: string, barcode: string | null, title: string, price: number | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${title}? This will also delete all associated sizes, colors, and photos.`)) return;

    setIsDeleting(true)
    try {
      // Manual cascade delete since there is no ON DELETE CASCADE
      // 1. Get sizes to delete their colors
      const { data: sizes } = await supabase.from("article_sizes").select("id").eq("article_id", articleId)
      if (sizes && sizes.length > 0) {
        const sizeIds = sizes.map(s => s.id)
        await supabase.from("article_size_colors").delete().in("size_id", sizeIds)
      }

      // 2. Delete sizes
      await supabase.from("article_sizes").delete().eq("article_id", articleId)

      // 3. Delete photos mapping (optionally could delete from storage bucket, but ignoring for now for speed)
      await supabase.from("article_photos").delete().eq("article_id", articleId)

      // 4. Finally delete article
      const { error } = await supabase.from("articles").delete().eq("id", articleId)
      if (error) throw error

      router.refresh()
    } catch (e: any) {
      console.error(e)
      alert("Error deleting article: " + e.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePrintBarcode = () => {
    if (!barcode) return alert("This article has no barcode to print")

    // Create a new window specifically sized for standard label printers (e.g. Dymo/Zebra)
    // 50x30 mm is roughly ~189x113 pixels at 96 PPI, but let's make it flexible.
    const printWindow = window.open('', '_blank', 'width=400,height=300')
    if (!printWindow) return alert("Popup blocker prevented printing.")

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Barcode</title>
        <style>
          @page {
            size: 50mm 30mm; /* Standard label size */
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 50mm;
            height: 30mm;
            font-family: sans-serif;
            background: white;
          }
          svg {
            max-width: 90%;
            height: auto;
          }
          .title {
            font-size: 8px;
            font-weight: bold;
            margin-bottom: 2px;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 90%;
          }
          .price {
            font-size: 10px;
            font-weight: bold;
            margin-top: 2px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="title">${title}</div>
        <svg id="barcode"></svg>
        ${price !== null && price !== undefined ? `<div class="price">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA</div>` : ''}
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = () => {
            JsBarcode("#barcode", "${barcode}", {
              format: "CODE128",
              width: 1.5,
              height: ${price !== null && price !== undefined ? '25' : '30'},
              displayValue: true,
              fontSize: 10,
              margin: 0
            });
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        title="Print Barcode"
        onClick={handlePrintBarcode}
        disabled={!barcode}
        className={!barcode ? "opacity-50 cursor-not-allowed" : ""}
      >
        <Printer className="h-4 w-4 text-[var(--color-primary)]" />
      </Button>
      
      <Link href={`/khadem/products/${articleId}/edit`}>
        <Button title="Edit Product" variant="outline" size="icon">
          <Edit2 className="h-4 w-4 text-[var(--color-primary)]" />
        </Button>
      </Link>

      <Button 
        title="Delete Product"
        type="button" 
        variant="outline" 
        size="icon" 
        onClick={handleDelete}
        disabled={isDeleting}
        className="hover:bg-red-50 hover:text-red-500 hover:border-red-200"
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4 text-red-500" />}
      </Button>
    </div>
  )
}
