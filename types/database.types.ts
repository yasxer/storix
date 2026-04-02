export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DatabaseRelationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: 'admin' | 'khadem' | 'client'; full_name: string | null; phone: string | null; is_active: boolean }
        Insert: { id: string; role?: 'admin' | 'khadem' | 'client'; full_name?: string | null; phone?: string | null; is_active?: boolean }
        Update: { id?: string; role?: 'admin' | 'khadem' | 'client'; full_name?: string | null; phone?: string | null; is_active?: boolean }
        Relationships: DatabaseRelationship[]
      }
      bons: {
        Row: { id: string; total_price: number; is_deleted: boolean; created_at: string; khadem_id: string }
        Insert: { id?: string; total_price: number; is_deleted?: boolean; created_at?: string; khadem_id: string }
        Update: { id?: string; total_price?: number; is_deleted?: boolean; created_at?: string; khadem_id?: string }
        Relationships: DatabaseRelationship[]
      }
      orders: {
        Row: { id: string; status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; total: number; created_at: string; client_name: string }    
        Insert: { id?: string; status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; total: number; created_at?: string; client_name: string }
        Update: { id?: string; status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; total?: number; created_at?: string; client_name?: string }
        Relationships: DatabaseRelationship[]
      }
      articles: {
        Row: { id: string; title: string; charika: string | null; description: string | null; base_price: number; low_stock_threshold: number; is_published: boolean; barcode: string | null; category_id: string; model_id: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; title: string; charika?: string | null; description?: string | null; base_price: number; low_stock_threshold?: number; is_published?: boolean; barcode?: string | null; category_id: string; model_id?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; title?: string; charika?: string | null; description?: string | null; base_price?: number; low_stock_threshold?: number; is_published?: boolean; barcode?: string | null; category_id?: string; model_id?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: { id: string; name: string }
        Insert: { id?: string; name: string }
        Update: { id?: string; name?: string }
        Relationships: DatabaseRelationship[]
      }
      models: {
        Row: { id: string; name: string; category_id: string }
        Insert: { id?: string; name: string; category_id: string }
        Update: { id?: string; name?: string; category_id?: string }
        Relationships: DatabaseRelationship[]
      }
      article_sizes: {
        Row: { id: string; article_id: string; size_label: string; is_standard: boolean; price_override: number | null }
        Insert: { id?: string; article_id: string; size_label: string; is_standard?: boolean; price_override?: number | null }
        Update: { id?: string; article_id?: string; size_label?: string; is_standard?: boolean; price_override?: number | null }
        Relationships: DatabaseRelationship[]
      }
      article_size_colors: {
        Row: { id: string; size_id: string; color_name: string; color_hex: string; quantity: number }
        Insert: { id?: string; size_id: string; color_name: string; color_hex: string; quantity?: number }
        Update: { id?: string; size_id?: string; color_name?: string; color_hex?: string; quantity?: number }
        Relationships: DatabaseRelationship[]
      }
      article_photos: {
        Row: { id: string; article_id: string; photo_url: string; position: number }
        Insert: { id?: string; article_id: string; photo_url: string; position?: number }
        Update: { id?: string; article_id?: string; photo_url?: string; position?: number }
        Relationships: DatabaseRelationship[]
      }
      purchase_vouchers: {
        Row: { id: string; created_by: string; notes: string | null; created_at: string }
        Insert: { id?: string; created_by: string; notes?: string | null; created_at?: string }
        Update: { id?: string; created_by?: string; notes?: string | null; created_at?: string }
        Relationships: DatabaseRelationship[]
      }
      purchase_voucher_items: {
        Row: { id: string; voucher_id: string; article_id: string; size_id: string; color_id: string; quantity: number; purchase_price: number; sale_price: number; created_at: string }
        Insert: { id?: string; voucher_id: string; article_id: string; size_id: string; color_id: string; quantity: number; purchase_price: number; sale_price: number; created_at?: string }
        Update: { id?: string; voucher_id?: string; article_id?: string; size_id?: string; color_id?: string; quantity?: number; purchase_price?: number; sale_price?: number; created_at?: string }
        Relationships: DatabaseRelationship[]
      }
    }
    Views: {
      session_recette: {
        Row: { khadem_id: string; date: string; total_recette: number; bons_count: number }
        Relationships: DatabaseRelationship[]
      }
      stock_overview: {
        Row: { article_id: string; title: string; quantity: number; low_stock_threshold: number }
        Relationships: DatabaseRelationship[]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
