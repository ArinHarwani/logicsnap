const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = '' + process.env.SUPABASE_SERVICE_KEY + '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanRules() {
    const { error } = await supabase.from('rules').delete().like('name', 'AI Rule:%');
    if (error) {
        console.error("Failed to delete AI rules:", error);
    } else {
        console.log("Successfully wiped old AI rules from the database to reset the schema check.");
    }
}

cleanRules();
