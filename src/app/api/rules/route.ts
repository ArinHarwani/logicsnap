import { NextResponse } from 'next/server';

// Mock in-memory DB for demo purposes to simulate Supabase
const mockDb = {
    rules: [
        {
            id: 'rule_1',
            name: 'Weekend Surge Pricing',
            status: 'active',
            rule_schema: {
                conditionLogic: 'AND',
                conditions: [{ field: 'order.total', operator: 'GREATER_THAN', value: 100, type: 'standard' }],
                action: { type: 'SURGE', payload: { percentage: 20 } }
            },
            created_at: new Date().toISOString()
        },
        {
            id: 'rule_2',
            name: 'New User Discount',
            status: 'draft',
            rule_schema: {
                conditionLogic: 'AND',
                conditions: [{ field: 'user.isNew', operator: 'EQUALS', value: true, type: 'standard' }],
                action: { type: 'DISCOUNT', payload: { percentage: 15 } }
            },
            created_at: new Date().toISOString()
        }
    ]
};

export async function GET() {
    return NextResponse.json({ rules: mockDb.rules });
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const newRule = {
            id: `rule_${Date.now()}`,
            name: data.name || 'Untitled Rule',
            status: data.status || 'draft',
            rule_schema: data.rule_schema || {},
            created_at: new Date().toISOString()
        };
        mockDb.rules.push(newRule);
        return NextResponse.json({ rule: newRule });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (id) {
        mockDb.rules = mockDb.rules.filter(r => r.id !== id);
    }
    return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
    try {
        const data = await request.json();
        const index = mockDb.rules.findIndex(r => r.id === data.id);
        if (index > -1) {
            mockDb.rules[index] = { ...mockDb.rules[index], ...data };
            return NextResponse.json({ rule: mockDb.rules[index] });
        }
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}

