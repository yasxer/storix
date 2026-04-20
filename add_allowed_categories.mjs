const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAllowedCategories() {
  const { data, error } = await supabase.rpc('query', { 
    sql_string: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allowed_categories uuid[] DEFAULT NULL;' 
  });
  console.log(data, error);
}

addAllowedCategories();