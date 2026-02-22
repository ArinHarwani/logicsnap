import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (For the MVP backend)
// In a real edge environment, these would be process.env variables mapped securely
const supabaseUrl = process.env.SUPABASE_URL || 'https://mock-supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'mock-service-key';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

