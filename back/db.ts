import path from 'path';
import dotenv from 'dotenv';

// Load env vars immediately so the Supabase client gets them
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
