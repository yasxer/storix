import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() { 
  console.log("Running RPC execute_sql...");
  const { error } = await supabase.rpc('execute_sql', { sql: "ALTER TABLE articles ADD COLUMN IF NOT EXISTS purchase_price NUMERIC NOT NULL DEFAULT 0;" }); 
  if (error) {
    console.error("RPC Error:", error);
  } else {
    console.log("Added purchase_price column successfully!");
  }
} 
run();