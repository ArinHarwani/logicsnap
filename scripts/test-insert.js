const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = '' + process.env.SUPABASE_SERVICE_KEY + '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const { data: projects } = await supabase.from('projects').select('id').limit(1);
    const projectId = projects?.[0]?.id;

    const parsedObj = {
        "conditions": {
            "all": [
                {
                    "fact": "items",
                    "operator": "contains",
                    "value": "Avocado Toast"
                }
            ]
        },
        "event": {
            "type": "increase",
            "params": {
                "amount": 5
            }
        }
    };

    const { data, error } = await supabase.from('rules').insert({
        project_id: projectId,
        name: "AI Test Rule",
        rule_schema: parsedObj,
        status: 'active'
    }).select();

    console.log("Error:", error);
    console.log("Data:", data);
}

testInsert();
