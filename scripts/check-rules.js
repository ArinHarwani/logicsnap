const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function checkRules() {
    const { data, error } = await supabase.from('rules').select('*');
    if (error) { console.error('Error:', error.message); return; }
    console.log(JSON.stringify(data, null, 2));
}

checkRules();
