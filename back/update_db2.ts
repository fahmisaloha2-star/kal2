import { supabase } from './db.js';

async function addColumns(table: string, columns: string[]) {
  for (const col of columns) {
    const { error } = await supabase.rpc('execute_sql', {
      sql_query: `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} text;`
    });
    if (error) {
      console.log(`Failed to add ${col} to ${table} via RPC:`, error.message);
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
