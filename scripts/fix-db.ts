import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = '' + process.env.SUPABASE_SERVICE_KEY + '';

export const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function fix() {
    console.log("Fixing bad rule...");
    const { error } = await supabase.from('rules').update({
        rule_schema: {
            conditions: {
                all: [
                    {
                        fact: 'cartTotal',
                        operator: 'greaterThan',
                        value: 100
                    }
                ]
            },
            event: {
                type: 'discount',
                params: {
                    percentage: 10
                }
            }
        }
    }).eq('name', '10% Off Orders Over $100');

    if (error) console.error(error);
    else console.log("Fixed old rule successfully!");
}
fix();
