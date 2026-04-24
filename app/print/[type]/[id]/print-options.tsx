"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, FileText, Receipt } from "lucide-react"
import { format } from "date-fns"

interface PrintItem {
  name: string
  quantity: number
  price: number
}

interface DocumentData {
  date: string
  entityName: string
  entityPhone: string
  totalAmount: number
  reference: string
}

export default function PrintOptions({ title, documentData, items }: { title: string, documentData: DocumentData, items: PrintItem[] }) {
  const [formatType, setFormatType] = useState<"a4" | "ticket">("a4")

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Controls - Hidden on print */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex gap-4 print:hidden items-center justify-between w-full max-w-[800px]">
        <div className="flex gap-2">
          <Button 
            variant={formatType === "a4" ? "default" : "outline"}
            onClick={() => setFormatType("a4")}
            className="flex gap-2"
          >
            <FileText className="w-4 h-4" /> Format A4
          </Button>
          <Button 
            variant={formatType === "ticket" ? "default" : "outline"}
            onClick={() => setFormatType("ticket")}
            className="flex gap-2"
          >
            <Receipt className="w-4 h-4" /> Format Ticket (80mm)
          </Button>
        </div>
        <Button onClick={handlePrint} className="bg-[var(--wise-dark-green)] hover:bg-[var(--wise-dark-green)]/90 flex gap-2">
          <Printer className="w-4 h-4" /> Lancer l'Impression
        </Button>
      </div>

      {/* The Printable Area */}
      <div 
        id="printable-document"
        className={`bg-white shadow-lg print:shadow-none mx-auto print:mx-0 ${
          formatType === "a4" 
            ? "w-[210mm] min-h-[297mm] p-10 print:p-0" 
            : "w-[80mm] p-4 print:p-0 text-[12px]"
        }`}
      >
        {/* Header */}
        <div className={`flex flex-col ${formatType === 'a4' ? 'items-center border-b pb-6 mb-6' : 'items-center border-b pb-3 mb-3 border-dashed border-black'}`}>
          <h1 className={`font-black tracking-tighter ${formatType === 'a4' ? 'text-4xl' : 'text-xl'}`}>HANOT POS</h1>
          <p className="text-gray-500 font-mono mt-1">NIF: 0000000000000000</p>
          <p className="text-gray-500 font-mono">Tél: 0555 55 55 55</p>
        </div>

        {/* Document Info */}
        <div className={`flex justify-between ${formatType === 'a4' ? 'mb-8' : 'mb-4 flex-col gap-2'}`}>
          <div>
            <h2 className={`font-bold uppercase tracking-wider text-gray-400 ${formatType === 'a4' ? 'text-xs mb-1' : 'text-[10px]'}`}>Document</h2>
            <p className="font-bold">{title}</p>
            <p className="font-mono text-gray-600">{documentData.reference}</p>
            <p className="font-mono text-gray-600">{format(new Date(documentData.date), "dd/MM/yyyy HH:mm")}</p>
          </div>
          <div className={formatType === 'a4' ? 'text-right' : ''}>
            <h2 className={`font-bold uppercase tracking-wider text-gray-400 ${formatType === 'a4' ? 'text-xs mb-1' : 'text-[10px]'}`}>Client / Fournisseur</h2>
            <p className="font-bold">{documentData.entityName}</p>
            {documentData.entityPhone && <p className="font-mono text-gray-600">{documentData.entityPhone}</p>}
          </div>
        </div>

        {/* Table of Items */}
        <table className="w-full text-left mb-6 border-collapse">
          <thead>
            <tr className={`border-b-2 border-black ${formatType === 'ticket' ? 'text-[9px]' : 'text-[11px]'}`}>
              <th className="py-2 font-bold uppercase tracking-wider">Désignation</th>
              <th className="py-2 text-center font-bold uppercase tracking-wider w-16">Qté</th>
              <th className="py-2 text-right font-bold uppercase tracking-wider w-24">Prix U.</th>
              {formatType === 'a4' && <th className="py-2 text-right font-bold uppercase tracking-wider w-24">Total</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, i) => (
              <tr key={i} className={`${formatType === 'a4' ? 'text-[12px]' : 'text-[10px]'} hover:bg-gray-50/30`}>
                <td className="py-1.5 pr-4 font-medium leading-tight">
                   {item.name}
                   {item.price < 0 && <span className="ml-2 text-[9px] text-green-600 font-black uppercase tracking-tighter bg-green-50 px-1 rounded">Versement</span>}
                </td>
                <td className="py-1.5 text-center text-gray-600 font-mono">{item.quantity}</td>
                <td className={`py-1.5 text-right font-mono ${item.price < 0 ? 'text-green-600 font-bold' : 'text-gray-900'}`}>
                  {item.price < 0 ? `-${Math.abs(item.price).toLocaleString()}` : item.price.toLocaleString()}
                </td>
                {formatType === 'a4' && (
                  <td className={`py-1.5 text-right font-bold font-mono ${item.price < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {item.price < 0 ? `-${Math.abs(item.quantity * item.price).toLocaleString()}` : (item.quantity * item.price).toLocaleString()}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className={`flex flex-col items-end ${formatType === 'a4' ? 'mt-8 border-t pt-4' : 'mt-4 border-t border-dashed border-black pt-2'}`}>
          <div className={`flex justify-between w-full ${formatType === 'a4' ? 'max-w-[300px]' : ''}`}>
            <span className="font-bold uppercase text-gray-500">
              {title.includes("Relevé") ? "Solde Final" : "Total Net"}
            </span>
            <span className={`font-black ${formatType === 'a4' ? 'text-2xl' : 'text-lg'} ${documentData.totalAmount > 0 && title.includes("Relevé") ? 'text-red-600' : ''}`}>
              {Math.abs(documentData.totalAmount).toLocaleString()} <span className="text-sm">DA</span>
              {documentData.totalAmount > 0 && title.includes("Relevé") ? <span className="text-[10px] ml-1 uppercase">(Dette)</span> : ''}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center text-gray-400 ${formatType === 'a4' ? 'mt-16 pt-8 border-t text-sm' : 'mt-8 pt-4 border-t border-dashed border-black text-[10px]'}`}>
          <p>Merci de votre confiance !</p>
          <p>Généré par Hanot POS System</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* Hide everything by default */
          body * {
            visibility: hidden;
          }
          
          /* Show ONLY the printable container and its children */
          #printable-document, #printable-document * {
            visibility: visible !important;
          }
          
          /* Position the printable area at the top left of the page */
          #printable-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }

          .print\:hidden {
            display: none !important;
          }
          
          @page {
            size: ${formatType === 'a4' ? 'A4 portrait' : '80mm auto'};
            margin: ${formatType === 'a4' ? '10mm' : '0mm'};
          }
        }
      `}</style>
    </div>
  )
}
