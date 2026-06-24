import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumns(table, columns) {
  for (const col of columns) {
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} text;`
    });
    if (error) {
      console.log(`Failed to add ${col} to ${table} via RPC:`, error.message);
      console.log("Fallback: trying to insert via REST API trick or just print error.");
    } else {
      console.log(`Added ${col} to ${table}`);
    }
  }
}

async function main() {
  await addColumns('projects', ['title_en', 'category_en', 'location_en', 'description_en']);
  await addColumns('services', ['title_en', 'description_en']);
  await addColumns('testimonials', ['text_en', 'project_en']);
  await addColumns('faqs', ['question_en', 'answer_en']);
  console.log("Done");
}

main();
