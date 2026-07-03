import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://snpsbbhfngovwkwftluy.supabase.co';
const supabaseAnonKey = 'sb_publishable_6IJvMWBOgWN5WKC6LD9ebA_rPM4F24F';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
