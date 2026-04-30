import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdrocqdshiglgcecfikg.supabase.co';
const supabaseAnonKey = 'sb_publishable_IOoJnDKfwgGyOa8IGRHr7Q_dgoo4m4D';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
