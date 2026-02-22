/**
 * LogicSnap Cafe - Comprehensive Demo Data Seeder
 * Seeds realistic cafe order history + pre-built showcase rules
 * for a great judge demo experience.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);


// ── Realistic Cafe Menu with real-world prices ──────────────────────────────
const MENU = [
    { name: 'Signature Cold Brew', price: 5.50, category: 'Cold Drinks', peakWeight: 3 },
    { name: 'Iced Matcha Latte', price: 6.00, category: 'Cold Drinks', peakWeight: 3 },
    { name: 'Artisan Latte', price: 5.00, category: 'Hot Drinks', peakWeight: 5 },
    { name: 'Avocado Toast', price: 9.00, category: 'Food', peakWeight: 4 },
    { name: 'Butter Croissant', price: 4.50, category: 'Food', peakWeight: 4 },
    { name: 'Breakfast Combo', price: 12.00, category: 'Food', peakWeight: 2 },
    { name: 'Flat White', price: 4.80, category: 'Hot Drinks', peakWeight: 4 },
    { name: 'Passion Fruit Lemonade', price: 5.20, category: 'Cold Drinks', peakWeight: 2 },
];

// ── Well-known customer profiles (recurring regulars) ──────────────────────
const CUSTOMERS = [
    { name: 'Harshit Agarwal', isPremium: true, loyaltyTier: 'gold', favoriteItems: ['Artisan Latte', 'Avocado Toast'] },
    { name: 'Priyanka Sharma', isPremium: true, loyaltyTier: 'gold', favoriteItems: ['Iced Matcha Latte', 'Butter Croissant'] },
    { name: 'Adamya Jain', isPremium: false, loyaltyTier: 'silver', favoriteItems: ['Signature Cold Brew', 'Avocado Toast'] },
    { name: 'Arin Mehta', isPremium: true, loyaltyTier: 'gold', favoriteItems: ['Flat White', 'Breakfast Combo'] },
    { name: 'Olly Bennett', isPremium: false, loyaltyTier: 'bronze', favoriteItems: ['Signature Cold Brew', 'Butter Croissant'] },
    { name: 'Nandini Gupta', isPremium: false, loyaltyTier: 'silver', favoriteItems: ['Iced Matcha Latte', 'Passion Fruit Lemonade'] },
    { name: 'Rohan Kapoor', isPremium: true, loyaltyTier: 'gold', favoriteItems: ['Artisan Latte', 'Breakfast Combo'] },
    { name: 'Isha Verma', isPremium: false, loyaltyTier: 'bronze', favoriteItems: ['Butter Croissant', 'Flat White'] },
];

// ── Simulate realistic time-of-day patterns ────────────────────────────────
function getRealisticTimestamp(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    // Heavily weighted towards morning (7-10am), lunch (12-1pm), and afternoon (3-5pm)
    const rand = Math.random();
    let hour;
    if (rand < 0.40) hour = 7 + Math.random() * 3;   // Morning rush (40%)
    else if (rand < 0.60) hour = 12 + Math.random() * 1.5; // Lunch rush (20%)
    else if (rand < 0.80) hour = 15 + Math.random() * 2;   // Afternoon (20%)
    else hour = 10 + Math.random() * 2;   // Mid-morning (20%)

    date.setHours(Math.floor(hour), Math.floor(Math.random() * 60), 0, 0);
    return date.toISOString();
}

// ── Pick a realistic item for a customer (prefers their favorites) ──────────
function pickItem(customer) {
    if (Math.random() < 0.65) {
        return customer.favoriteItems[Math.floor(Math.random() * customer.favoriteItems.length)];
    }
    return MENU[Math.floor(Math.random() * MENU.length)].name;
}

function getItemPrice(itemName) {
    return MENU.find(m => m.name === itemName)?.price || 5.00;
}

async function seedDemoData() {
    console.log('\n🌱 LogicSnap Cafe - Demo Data Seeder');
    console.log('=====================================\n');

    // ── 1. Get Project ID ──────────────────────────────────────────────────────
    const { data: projects, error: pErr } = await supabase.from('projects').select('id').limit(1);
    if (pErr || !projects?.length) { console.error('❌ No project found.', pErr); return; }
    const projectId = projects[0].id;
    console.log(`✅ Using project: ${projectId}`);

    // ── 2. Clear existing data ─────────────────────────────────────────────────
    await supabase.from('historical_events').delete().eq('project_id', projectId);
    await supabase.from('rules').delete().eq('project_id', projectId);
    console.log('🗑️  Cleared old data\n');

    // ── 3. Seed 600 realistic historical orders over 45 days ───────────────────
    console.log('📦 Generating 600 realistic cafe orders...');
    const orders = [];
    for (let i = 0; i < 600; i++) {
        const daysAgo = Math.floor(Math.random() * 45); // Spread over 45 days
        const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
        const itemName = pickItem(customer);
        const itemPrice = getItemPrice(itemName);

        // Cart may have 1-3 items
        const itemCount = Math.random() < 0.5 ? 1 : (Math.random() < 0.7 ? 2 : 3);
        const extraItems = [];
        for (let j = 1; j < itemCount; j++) {
            extraItems.push(MENU[Math.floor(Math.random() * MENU.length)].name);
        }
        const allItems = [itemName, ...extraItems];
        const cartTotal = allItems.reduce((sum, n) => sum + getItemPrice(n), 0);

        orders.push({
            project_id: projectId,
            payload: {
                orderId: `ORD-${String(i + 1000).padStart(4, '0')}`,
                customer: customer.name,
                isPremiumMember: customer.isPremium,
                loyaltyTier: customer.loyaltyTier,
                items: allItems,
                primaryItem: itemName,
                cartTotal: Math.round(cartTotal * 100) / 100,
                quantity: itemCount,
                paymentMethod: Math.random() > 0.4 ? 'card' : 'cash',
                channel: Math.random() > 0.3 ? 'in-store' : 'app',
            },
            created_at: getRealisticTimestamp(daysAgo)
        });
    }

    // Insert in chunks of 100
    for (let i = 0; i < orders.length; i += 100) {
        const chunk = orders.slice(i, i + 100);
        const { error } = await supabase.from('historical_events').insert(chunk);
        if (error) console.error(`  ❌ Chunk ${i / 100 + 1} failed:`, error.message);
        else console.log(`  ✅ Inserted orders ${i + 1}–${Math.min(i + 100, orders.length)}`);
    }

    // ── 4. Seed pre-built showcase rules ──────────────────────────────────────
    console.log('\n📋 Creating showcase rules...');

    const showcaseRules = [
        {
            name: '🌅 Morning Rush Surge — Cold Brew (+20%)',
            rule_schema: {
                conditions: {
                    all: [
                        { fact: 'items', operator: 'containsCaseInsensitive', value: 'Signature Cold Brew' },
                        { fact: 'cartSurgeMetrics', operator: 'z-score-greater-than', value: 1.5 }
                    ]
                },
                event: { type: 'surge_pricing', params: { markupPercentage: 20, reason: 'High demand detected' } }
            }
        },
        {
            name: '⭐ Gold Member Perk — 15% off Breakfast Combo',
            rule_schema: {
                conditions: {
                    all: [
                        { fact: 'items', operator: 'containsCaseInsensitive', value: 'Breakfast Combo' },
                        { fact: 'isPremiumMember', operator: 'equal', value: true }
                    ]
                },
                event: { type: 'discount', params: { percentage: 15, reason: 'Gold loyalty member reward' } }
            }
        },
        {
            name: '🥑 Premium Avocado Toast — +$2 Weekend Markup',
            rule_schema: {
                conditions: {
                    all: [
                        { fact: 'items', operator: 'containsCaseInsensitive', value: 'Avocado Toast' }
                    ]
                },
                event: { type: 'increase', params: { amount: 2, reason: 'Premium weekend menu' } }
            }
        },
    ];

    for (const rule of showcaseRules) {
        const { error } = await supabase.from('rules').insert({
            project_id: projectId,
            name: rule.name,
            status: 'active',
            rule_schema: rule.rule_schema
        });
        if (error) console.error(`  ❌ Rule "${rule.name}" failed:`, error.message);
        else console.log(`  ✅ Rule created: ${rule.name}`);
    }

    console.log('\n🎉 All done! Ready to impress the judges.\n');
    console.log('Demo flow:');
    console.log('  1. /menu          → See Avocado Toast at $11 (premium weekend markup active)');
    console.log('  2. /live-surge    → Click "Simulate Morning Rush" → Cold Brew surges');
    console.log('  3. /backtest      → Click "Run Shadow Test" → See revenue chart from 600 real orders');
    console.log('  4. /blast-radius  → Click "Scan" → See 3 rules mapped across facts');
    console.log('  5. /rules/new     → Type any custom rule to add more');
}

seedDemoData().catch(console.error);
