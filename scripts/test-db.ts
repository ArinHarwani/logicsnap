import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 'sb_publishable_tcsm57jTrQwnkClLQ7DHsA_tXlVIBK0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase.from('rules').select('id').limit(1);
    if (error) {
        console.error('Error connecting to Supabase:', error);
    } else {
        console.log('Successfully connected to Supabase!', data);
    }
}

test();
