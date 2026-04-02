"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateStoreSettings(data: {
  id: string,
  store_name: string,
  store_phone: string,
  store_address: string,
  low_stock_threshold: number
}) {
  const supabase = await createClient() as any

  // Ensure there's a row to update, the default is already there typically
  const { error } = await supabase
    .from("store_settings")
    .update({ 
      store_name: data.store_name,
      store_phone: data.store_phone,
      store_address: data.store_address,
      low_stock_threshold: data.low_stock_threshold,
      updated_at: new Date().toISOString()
    })
    .eq("id", data.id)

  if (error) {
    return { error: error.message }
  }
  
  revalidatePath("/admin/settings")
  return { success: true }
}

export async function updateDeliveryFee(
  id: string, 
  field: "fee_domicile" | "fee_bureau" | "is_active", 
  value: number | boolean
) {
  const supabase = await createClient() as any

  const { error } = await supabase
    .from("delivery_fees")
    .update({ [field]: value })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/settings")
  return { success: true }
}

// Optional helper to mass create wilayas if table is empty
export async function seedWilayas() {
    const supabase = await createClient() as any
    const { count } = await supabase.from("delivery_fees").select("*", { count: "exact", head: true })
    if (count && count > 0) return { success: true } // Already seeded

    const wilayas = [
        "1 - Adrar", "2 - Chlef", "3 - Laghouat", "4 - Oum El Bouaghi", "5 - Batna", 
        "6 - Béjaïa", "7 - Biskra", "8 - Béchar", "9 - Blida", "10 - Bouira", 
        "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", 
        "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda", 
        "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", 
        "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla", 
        "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdès", 
        "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela", 
        "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", 
        "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - El M'Ghair", "50 - El Meniaa", 
        "51 - Ouled Djellal", "52 - Bordj Baji Mokhtar", "53 - Béni Abbès", "54 - Timimoun", "55 - Touggourt", 
        "56 - Djanet", "57 - In Salah", "58 - In Guezzam"
    ]

    const insertData = wilayas.map(w => {
        const [code, name] = w.split(" - ")
        return { wilaya_code: code, wilaya_name: name, fee_domicile: 600, fee_bureau: 400, is_active: true }
    })

    const { error } = await supabase.from("delivery_fees").insert(insertData)
    if (error) return { error: error.message }
    
    revalidatePath("/admin/settings")
    return { success: true }
}
