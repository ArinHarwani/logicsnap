import { NextResponse } from 'next/server';
import { Engine } from 'json-rules-engine';

function calculateZScore(value: number, history: number[]): number {
    if (history.length === 0) return 0;
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length;
    const standardDeviation = Math.sqrt(variance);
    if (standardDeviation === 0) return 0;
    return (value - mean) / standardDeviation;
}

// Public menu pricing endpoint - no API key needed
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cartTotal, items } = body;

        const { createClient } = require('@supabase/supabase-js');
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xseubadkltyupttwlxjx.supabase.co',
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data: activeRules } = await adminSupabase
            .from('rules')
            .select('id, name, rule_schema')
            .eq('status', 'active');

        const allActions: any[] = [];

        // Evaluate each rule independently so one broken rule can't crash the others
        for (const rule of (activeRules || [])) {
            try {
                const engine = new Engine();

                engine.addOperator('z-score-greater-than', (factValue: { live: number, history: number[] }, jsonValue: number) => {
                    if (!factValue || typeof factValue.live !== 'number' || !Array.isArray(factValue.history)) return false;
                    return calculateZScore(factValue.live, factValue.history) > jsonValue;
                });

                engine.addOperator('containsCaseInsensitive', (factValue: any[], jsonValue: string) => {
                    if (!Array.isArray(factValue) || typeof jsonValue !== 'string') return false;
                    return factValue.some((item: any) => typeof item === 'string' && item.toLowerCase() === jsonValue.toLowerCase());
                });

                engine.addRule(rule.rule_schema);

                const facts = {
                    cartTotal: cartTotal || 0,
                    items: items || [],
                    isPremiumMember: false,
                    cartSurgeMetrics: {
                        live: cartTotal || 0,
                        history: [5, 6, 5.5, 6, 5, 5.5, 6, 5, 6, 5.5]
                    }
                };

                const result = await engine.run(facts);
                allActions.push(...result.events);
            } catch (e: any) {
                console.warn(`[Menu Pricing] Skipping rule "${rule.name}":`, e.message);
            }
        }

        return NextResponse.json({ success: true, actions: allActions });

    } catch (error: any) {
        console.error('[API Menu Pricing] Fatal:', error);
        return NextResponse.json({ success: false, actions: [] }, { status: 200 });
    }
}

