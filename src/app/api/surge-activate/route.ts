import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Activates a surge rule for a specific item in the database.
// The menu page polls /api/menu-pricing every 5s which reads from this table.
export async function POST(request: Request) {
    try {
        const { itemName, markupPercentage = 20 } = await request.json();

        if (!itemName) {
            return NextResponse.json({ success: false, error: 'itemName is required' }, { status: 400 });
        }

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xseubadkltyupttwlxjx.supabase.co',
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data: projects } = await adminSupabase.from('projects').select('id').limit(1);
        const projectId = projects?.[0]?.id;
        if (!projectId) return NextResponse.json({ success: false, error: 'No project found' }, { status: 500 });

        // Remove any previously auto-inserted surge rules for this item
        await adminSupabase
            .from('rules')
            .delete()
            .ilike('name', '%LIVE SURGE:%');

        // Insert a fresh surge rule that the menu will immediately pick up
        const { error } = await adminSupabase.from('rules').insert({
            project_id: projectId,
            name: `⚡ LIVE SURGE: ${itemName} +${markupPercentage}%`,
            status: 'active',
            rule_schema: {
                conditions: {
                    all: [
                        { fact: 'items', operator: 'containsCaseInsensitive', value: itemName }
                    ]
                },
                event: {
                    type: 'increase',
                    params: {
                        percentage: markupPercentage,
                        reason: `Live surge pricing — high demand detected`
                    }
                }
            }
        });

        if (error) throw new Error(error.message);

        return NextResponse.json({ success: true, itemName, markupPercentage });

    } catch (error: any) {
        console.error('[API Surge Activate]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// Deactivate surge (optional — call to clear it)
export async function DELETE() {
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xseubadkltyupttwlxjx.supabase.co',
        process.env.SUPABASE_SERVICE_KEY
    );
    await adminSupabase.from('rules').delete().ilike('name', '%LIVE SURGE:%');
    return NextResponse.json({ success: true });
}

