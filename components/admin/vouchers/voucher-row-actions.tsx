"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Printer, Edit2, Eye } from "lucide-react"
import Link from "next/link"
import { deletePurchaseVoucher } from "@/app/(admin)/admin/vouchers/actions"
import { format } from "date-fns"

export function VoucherRowActions({ voucher }: { voucher: any }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this voucher? All associated stock quantities will be deducted back.`)) return;

    setIsDeleting(true)
    const result = await deletePurchaseVoucher(voucher.id)
    if (result.error) alert(result.error)
    setIsDeleting(false)
  }

  const handlePrint = () => {
    // Generate Print / Invoice popup
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return alert("Popup blocker prevented printing.")

    const itemsHtml = voucher.purchase_voucher_items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.articles?.title || 'Unknown'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.article_sizes?.size_label || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.article_size_colors?.color_name || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.purchase_price} DA</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${(item.purchase_price * item.quantity).toFixed(2)} DA</td>
      </tr>
    `).join('')

    const totalSpent = voucher.purchase_voucher_items.reduce((sum: number, item: any) => sum + (item.purchase_price * item.quantity), 0)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Voucher - ${voucher.id}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; background: #f8f9fa; padding: 10px; border-bottom: 2px solid #ddd; }
          .total { margin-top: 30px; text-align: right; font-size: 1.2em; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 style="margin:0;">BON D'ACHAT (Voucher)</h1>
            <p style="color:#666;">Fournisseur / Notes: ${voucher.notes || 'N/A'}</p>
          </div>
          <div style="text-align:right;">
            <p><strong>Date:</strong> ${format(new Date(voucher.created_at), 'dd MMM yyyy, HH:mm')}</p>
            <p><strong>Created By:</strong> ${voucher.profiles?.full_name || 'Admin'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Taille</th>
              <th>Couleur</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Prix Achat</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total">
          Total Achat: ${totalSpent.toFixed(2)} DA
        </div>
        
        <script>
          window.onload = () => {
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
      <Link href={`/admin/vouchers/${voucher.id}`}>
        <Button title="View Details" variant="outline" size="icon">
          <Eye className="h-4 w-4 text-gray-600" />
        </Button>
      </Link>
      
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        title="Print Voucher PDF"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4 text-[var(--color-primary)]" />
      </Button>
      
      <Link href={`/admin/vouchers/${voucher.id}/edit`}>
        <Button title="Edit Voucher" variant="outline" size="icon">
          <Edit2 className="h-4 w-4 text-[var(--color-primary)]" />
        </Button>
      </Link>

      <Button 
        title="Delete Voucher"
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
