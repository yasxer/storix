-- Migration: Add Purchase Price to articles
-- Run this in your Supabase SQL Editor

ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE public.article_sizes
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC DEFAULT NULL;