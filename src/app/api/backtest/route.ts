import { NextResponse } from 'next/server';
import { Engine } from 'json-rules-engine';
import { createClient } from '@supabase/supabase-js';

function calculateZScore(value: number, history: number[]): number {
    if (history.length === 0) return 0;
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length;
    const standardDeviation = Math.sqrt(variance);
    if (standardDeviation === 0) return 0;
    return (value - mean) / standardDeviation;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { draftRuleSchema } = body;

        if (!draftRuleSchema) {
            return NextResponse.json({ success: false, error: 'draftRuleSchema is required' }, { status: 400 });
        }

        // Use admin client to bypass RLS and auto-resolve project ID
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xseubadkltyupttwlxjx.supabase.co',
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data: projects } = await adminSupabase.from('projects').select('id').limit(1);
        const projectId = projects?.[0]?.id;
        if (!projectId) {
            return NextResponse.json({ success: false, error: 'No project found' }, { status: 500 });
        }

        const { data: events, error } = await adminSupabase
            .from('historical_events')
            .select('payload, created_at')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true })
            .limit(600);

        if (error) throw new Error(error.message);
        const historicalData = events || [];
        const allCartTotals = historicalData.map((e: any) => e.payload.cartTotal || 0);

        const engine = new Engine();

        engine.addOperator('z-score-greater-than', (factValue: { live: number, history: number[] }, jsonValue: number) => {
            if (!factValue || typeof factValue.live !== 'number' || !Array.isArray(factValue.history)) return false;
            return calculateZScore(factValue.live, factValue.history) > jsonValue;
        });

        engine.addOperator('containsCaseInsensitive', (factValue: any[], jsonValue: string) => {
            if (!Array.isArray(factValue) || typeof jsonValue !== 'string') return false;
            return factValue.some((item: any) => typeof item === 'string' && item.toLowerCase() === jsonValue.toLowerCase());
        });

        engine.addRule(draftRuleSchema);

        let totalOriginalRevenue = 0;
        let totalNewRevenue = 0;
        let totalTriggered = 0;
        const dayBuckets: Record<string, { original: number; simulated: number }> = {};

        for (let i = 0; i < historicalData.length; i++) {
            const event = historicalData[i];
            const payload = event.payload;

            const rollingHistory = allCartTotals.slice(Math.max(0, i - 20), i);
            const facts = {
                cartTotal: payload.cartTotal || 0,
                items: payload.items || (payload.primaryItem ? [payload.primaryItem] : []),
                isPremiumMember: payload.isPremiumMember || false,
                cartSurgeMetrics: {
                    live: payload.cartTotal || 0,
                    history: rollingHistory.length > 0 ? rollingHistory : [payload.cartTotal || 0]
                }
            };

            const evaluation = await engine.run(facts);
            const triggered = evaluation.events;

            let finalPrice = payload.cartTotal || 0;
            if (triggered.length > 0) {
                totalTriggered++;
                const action = triggered[0];
                if ((action.type === 'discount' || action.type === 'decrease') && action.params?.percentage) {
                    finalPrice = finalPrice * (1 - action.params.percentage / 100);
                } else if ((action.type === 'discount' || action.type === 'decrease') && action.params?.amount) {
                    finalPrice = finalPrice - action.params.amount;
                } else if ((action.type === 'surge_pricing' || action.type === 'increase') && action.params?.markupPercentage) {
                    finalPrice = finalPrice * (1 + action.params.markupPercentage / 100);
                } else if ((action.type === 'increase' || action.type === 'surge_pricing') && action.params?.amount) {
                    finalPrice = finalPrice + action.params.amount;
                }
            }

            totalOriginalRevenue += payload.cartTotal || 0;
            totalNewRevenue += finalPrice;

            const day = event.created_at.substring(0, 10);
            if (!dayBuckets[day]) dayBuckets[day] = { original: 0, simulated: 0 };
            dayBuckets[day].original += payload.cartTotal || 0;
            dayBuckets[day].simulated += finalPrice;
        }

        const timeSeriesData = Object.entries(dayBuckets).map(([day, bucket]) => ({
            time: day.substring(5),
            originalValue: parseFloat(bucket.original.toFixed(2)),
            simulatedValue: parseFloat(bucket.simulated.toFixed(2))
        }));

        return NextResponse.json({
            success: true,
            totalEvaluated: historicalData.length,
            totalTriggered,
            totalOriginalRevenue: parseFloat(totalOriginalRevenue.toFixed(2)),
            totalNewRevenue: parseFloat(totalNewRevenue.toFixed(2)),
            timeSeriesData
        });

    } catch (error: any) {
        console.error('[API Backtest Error]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

