Add-Content -Path "c:\Users\User\Desktop\khdmti\hanot\app\(admin)\admin\clients\actions.ts" -Value @"

export async function addClientPurchaseWithStock(data: {
  client_id: string
  items: { color_id: string, quantity: number, price: number, name: string }[]  
}) {
  const supabase = await createClient()

  // 1. Calculate amount and description
  let totalAmount = 0;
  const descParts: string[] = [];

  for (const item of data.items) {
    totalAmount += item.quantity * item.price;
    descParts.push(`\${item.quantity}x \${item.name}`);

    // Update stock
    // Since we cant easily do Math in supabase update without RPC, we select then update
    const { data: colorData } = await supabase
      .from("article_size_colors")
      .select("quantity")
      .eq("id", item.color_id)
      .single()

    if (colorData) {
      const newQ = Math.max(0, colorData.quantity - item.quantity)
      await supabase.from("article_size_colors").update({ quantity: newQ }).eq("id", item.color_id)
    }
  }

  const description = descParts.join(", ")

  // 2. Add client transaction
  const { error } = await supabase.from("client_transactions").insert({
    client_id: data.client_id,
    type: "purchase",
    amount: totalAmount,
    description: description,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/clients/\${data.client_id}`)
  revalidatePath("/admin/clients")
  revalidatePath("/admin/stock")
  return { success: true }
}
"@
