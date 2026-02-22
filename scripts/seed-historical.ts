import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '' + process.env.SUPABASE_SERVICE_KEY + '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedHistoricalData() {
    console.log('Seeding 100 historical events for Backtesting...');
    const TARGET_API_KEY = '550e8400-e29b-41d4-a716-446655440000';

    const { data: project } = await supabase.from('projects').select('id').eq('api_key', TARGET_API_KEY).single();

    if (!project) {
        console.error('Target Demo Project not found!');
        return;
    }

    const events = [];
    for (let i = 0; i < 100; i++) {
        // Create realistic spread of cart totals
        const isWhale = Math.random() > 0.9;
        const cartTotal = isWhale ? Math.floor(Math.random() * 500) + 200 : Math.floor(Math.random() * 150) + 20;

        // Spread dates over the last 30 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        events.push({
            project_id: project.id,
            payload: {
                userId: `user_seed_${i}`,
                cartTotal: cartTotal,
                items: ["seeded_item"],
                region: Math.random() > 0.5 ? "US-East" : "US-West",
                isPremiumMember: Math.random() > 0.7
            },
            created_at: date.toISOString()
        });
    }

    const { error } = await supabase.from('historical_events').insert(events);

    if (error) {
        console.error('Error seeding data:', error);
    } else {
        console.log(`✅ Successfully blasted 100 payloads into historical_events under project: ${project.id}.`);
    }
}

seedHistoricalData();
