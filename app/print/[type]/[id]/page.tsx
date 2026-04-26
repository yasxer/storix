import { createClient } from "@/lib/supabase/server"
import PrintOptions from "./print-options"
import { notFound } from "next/navigation"
import { format } from "date-fns"

export default async function PrintPage({ params }: { params: Promise<{ type: string, id: string }> }) {
  const resolvedParams = await params
  const { type, id } = resolvedParams
  const supabase = await createClient()

  let documentData: any = null;
  let itemsData: any[] = [];
  let title = "";
  
  // Fetch store settings for the header
  const { data: storeSettings } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .single()

  if (type === "client_purchase") {
    // Fetch Client Purchase Data
    const { data: transaction } = await supabase
      .from("client_transactions")
      .select(`
        *,
        clients(name, phone)
      `)
      .eq("id", id)
      .single()
      
    if (!transaction) return notFound();

    const { data: items } = await supabase
      .from("client_purchase_items")
      .select("*")
      .eq("transaction_id", id)

    title = "Facture Client"
    documentData = {
      date: transaction.created_at,
      entityName: transaction.clients?.name,
      entityPhone: transaction.clients?.phone,
      totalAmount: transaction.amount,
      reference: `FAC-${transaction.id.substring(0,8).toUpperCase()}`
    }
    itemsData = items?.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })) || []
    
  } else if (type === "supplier_order") {
    // Fetch Supplier Order Data
    const { data: order } = await supabase
      .from("supplier_orders")
      .select("*")
      .eq("id", id)
      .single()

    if (!order) return notFound();

    const { data: items } = await supabase
      .from("supplier_order_items")
      .select("*")
      .eq("order_id", id)

    title = "Bon de Commande Fournisseur"
    documentData = {
      date: order.created_at,
      entityName: order.supplier_name || "Fournisseur Non Défini",
      entityPhone: "",
      totalAmount: order.total_estimated_amount,
      reference: `BCF-${order.id.substring(0,8).toUpperCase()}`
    }
    itemsData = items?.map(item => ({
      name: item.article_name,
      quantity: item.expected_quantity,
      price: item.expected_price
    })) || []
  } else if (type === "client_statement" || type === "client_detailed_purchases") {
    // Fetch Client Details
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single()
      
    if (!client) return notFound();

    // Fetch all transactions
    let query = supabase
      .from("client_transactions")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true })

    if (type === "client_detailed_purchases") {
      query = query.eq("type", "purchase")
    }

    const { data: transactions } = await query

    if (type === "client_statement") {
      title = "Relevé de Compte"
      
      // Fetch all items for all purchases in this list
      const txIds = transactions?.filter(tx => tx.type === 'purchase').map(tx => tx.id) || []
      const { data: allItems } = await supabase
        .from("client_purchase_items")
        .select("*")
        .in("transaction_id", txIds)

      documentData = {
        date: new Date().toISOString(),
        entityName: client.name,
        entityPhone: client.phone,
        totalAmount: (transactions || []).reduce((acc, tx) => 
          tx.type === "purchase" ? acc + Number(tx.amount) : acc - Number(tx.amount), 0),
        reference: `REL-${client.id.substring(0,8).toUpperCase()}`
      }

      itemsData = []
      transactions?.forEach(tx => {
        if (tx.type === 'purchase') {
          const txItems = allItems?.filter(item => item.transaction_id === tx.id) || []
          if (txItems.length > 0) {
            txItems.forEach(item => {
              itemsData.push({
                name: `${item.name} (${format(new Date(tx.created_at), "dd/MM")})`,
                quantity: item.quantity,
                price: item.price
              })
            })
          } else {
            itemsData.push({
              name: `${tx.description || 'Achat'} (${format(new Date(tx.created_at), "dd/MM")})`,
              quantity: 1,
              price: Number(tx.amount)
            })
          }
        } else {
          // Payment
          itemsData.push({
            name: `Versement - ${tx.description || ''} (${format(new Date(tx.created_at), "dd/MM")})`,
            quantity: 1,
            price: -Number(tx.amount)
          })
        }
      })
    } else {
      // Detailed Purchases
      title = "Historique des Achats Détaillé"
      
      // Fetch all items for these transactions
      const txIds = transactions?.map(tx => tx.id) || []
      const { data: allItems } = await supabase
        .from("client_purchase_items")
        .select("*")
        .in("transaction_id", txIds)

      documentData = {
        date: new Date().toISOString(),
        entityName: client.name,
        entityPhone: client.phone,
        totalAmount: (transactions || []).reduce((acc, tx) => acc + Number(tx.amount), 0),
        reference: `DET-${client.id.substring(0,8).toUpperCase()}`
      }

      // Format itemsData to show article details for each transaction
      itemsData = []
      transactions?.forEach(tx => {
        const txItems = allItems?.filter(item => item.transaction_id === tx.id) || []
        if (txItems.length > 0) {
          txItems.forEach(item => {
            itemsData.push({
              name: `${item.name} (${format(new Date(tx.created_at), "dd/MM")})`,
              quantity: item.quantity,
              price: item.price
            })
          })
        } else {
          itemsData.push({
            name: `${tx.description || 'Achat'} (${format(new Date(tx.created_at), "dd/MM")})`,
            quantity: 1,
            price: Number(tx.amount)
          })
        }
      })
    }
  } else if (type === "bon") {
    // Fetch Bon detailed information
    const { data: bon } = await supabase
      .from("bons")
      .select(`
        *,
        profiles ( full_name ),
        bon_items (
          quantity,
          unit_price,
          discount_amount,
          articles ( title ),
          article_sizes ( size_label ),
          article_size_colors ( color_name )
        )
      `)
      .eq("id", id)
      .single()

    if (!bon) return notFound();

    title = "Bon de Vente (Ticket)"
    documentData = {
      date: bon.created_at,
      entityName: "Passager",
      entityPhone: "",
      totalAmount: bon.total_price,
      reference: `BON-${bon.id.substring(0,8).toUpperCase()}`
    }
    itemsData = bon.bon_items.map((item: any) => ({
      name: `${item.articles?.title} ${item.article_sizes?.size_label || ''} ${item.article_size_colors?.color_name || ''}`,
      quantity: item.quantity,
      price: item.unit_price
    }))
  } else if (type === "voucher") {
    // Fetch Voucher detailed information
    const { data: voucher } = await supabase
      .from("purchase_vouchers")
      .select(`
        *,
        profiles ( full_name ),
        purchase_voucher_items (
          quantity,
          purchase_price,
          sale_price,
          articles ( title ),
          article_sizes ( size_label ),
          article_size_colors ( color_name, color_hex )
        )
      `)
      .eq("id", id)
      .single()

    if (!voucher) return notFound();

    title = "Bon d'Achat (Voucher)"
    documentData = {
      date: voucher.created_at,
      entityName: voucher.notes || "Fournisseur Non Défini",
      entityPhone: "",
      totalAmount: voucher.purchase_voucher_items.reduce((sum: number, item: any) => sum + (item.purchase_price * item.quantity), 0),
      reference: `ACH-${voucher.id.substring(0,8).toUpperCase()}`
    }
    itemsData = voucher.purchase_voucher_items.map((item: any) => ({
      name: `${item.articles?.title} ${item.article_sizes?.size_label || ''} ${item.article_size_colors?.color_name || ''}`,
      quantity: item.quantity,
      price: item.purchase_price
    }))
  } else {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 print:bg-white print:p-0 print:py-0">
      <PrintOptions title={title} documentData={documentData} items={itemsData} storeSettings={storeSettings} />
    </div>
  )
}
