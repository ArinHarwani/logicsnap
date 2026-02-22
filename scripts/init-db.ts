import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '' + process.env.SUPABASE_SERVICE_KEY + '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function initDb() {
    console.log('Initializing Mock Data for LogicSnap Dummy App...');
    const TARGET_API_KEY = '550e8400-e29b-41d4-a716-446655440000';

    // 1. Create a Project
    const { data: existingProjects } = await supabase.from('projects').select('*').eq('api_key', TARGET_API_KEY).limit(1);

    let projectId;

    if (!existingProjects || existingProjects.length === 0) {
        console.log('Creating new project...');
        const { data: project, error: pErr } = await supabase.from('projects').insert({
            name: 'Demo E-Commerce Store',
            api_key: TARGET_API_KEY
        }).select().single();

        if (pErr) {
            console.error('Error creating project:', pErr);
            return;
        }
        projectId = project.id;
    } else {
        console.log('Using existing project...');
        projectId = existingProjects[0].id;
    }

    console.log(`✅ Project ready: ID=${projectId}, API_KEY=${TARGET_API_KEY}`);

    // 2. Insert a Sample Rule
    const { data: rules } = await supabase.from('rules').select('id').eq('project_id', projectId);
    if (!rules || rules.length === 0) {
        console.log('Inserting sample rule...');
        const { error: rErr } = await supabase.from('rules').insert({
            project_id: projectId,
            name: '10% Off Orders Over $100',
            status: 'active',
            rule_schema: {
                conditionLogic: 'AND',
                conditions: [
                    {
                        field: 'cartTotal',
                        operator: 'GREATER_THAN',
                        value: 100,
                        type: 'standard'
                    }
                ],
                action: {
                    type: 'DISCOUNT',
                    payload: {
                        type: 'PERCENTAGE',
                        value: 10,
                        maxLimit: 1000
                    }
                }
            }
        });

        if (rErr) {
            console.error('Error creating rule:', rErr);
            return;
        }
    }

    console.log('✅ Mock data initialization complete!');
}

initDb();
