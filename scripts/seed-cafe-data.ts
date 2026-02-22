import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = '' + process.env.SUPABASE_SERVICE_KEY + '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CAFE_CUSTOMERS = [
    'Harshit', 'Priyanka', 'Adamya', 'Arin', 'Olly', 'Sarah', 'Mike', 'Emma'
];

const ITEMS = [
    { name: 'Cold Brew', price: 5 },
    { name: 'Avocado Toast', price: 9 },
    { name: 'Breakfast Combo', price: 12 },
    { name: 'Latte', price: 6 },
    { name: 'Croissant', price: 4 }
];

async function seedCafeData() {
    console.log("Seeding historical cafe data...");

    // 1. Get the project ID
    const { data: projects, error: pError } = await supabase.from('projects').select('id').limit(1);
    if (pError || !projects?.length) {
        console.error("Failed to find a project ID", pError);
        return;
    }
    const projectId = projects[0].id;

    // 2. Clear old test data
    await supabase.from('historical_events').delete().eq('project_id', projectId);

    // 3. Generate 500 fake cafe orders over the last 30 days
    const inserts = [];
    const now = new Date();

    for (let i = 0; i < 500; i++) {
        const customer = CAFE_CUSTOMERS[Math.floor(Math.random() * CAFE_CUSTOMERS.length)];
        const numItems = Math.floor(Math.random() * 3) + 1;
        const cartItems = [];
        let cartTotal = 0;

        for (let j = 0; j < numItems; j++) {
            const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            cartItems.push(item.name);
            cartTotal += item.price;
        }

        // Spread events over the last 30 days
        const eventDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

        inserts.push({
            project_id: projectId,
            payload: {
                cartTotal,
                items: cartItems,
                user: { id: customer, status: 'active' },
                timeOfDay: eventDate.getHours() < 11 ? 'morning' : 'afternoon'
            },
            created_at: eventDate.toISOString()
        });
    }

    // Insert in chunks
    for (let i = 0; i < inserts.length; i += 100) {
        const chunk = inserts.slice(i, i + 100);
        const { error } = await supabase.from('historical_events').insert(chunk);
        if (error) {
            console.error(`Chunk error:`, error.message);
        }
    }

    console.log("Successfully seeded 500 historical cafe orders!");
}

seedCafeData();
