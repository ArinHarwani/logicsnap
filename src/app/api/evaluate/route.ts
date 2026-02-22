import { NextResponse } from 'next/server';
import { Engine } from 'json-rules-engine';
import { supabase } from '@/lib/supabase';

// Helper for Z-Score Calculation
function calculateZScore(value: number, history: number[]): number {
    if (history.length === 0) return 0;
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length;
    const standardDeviation = Math.sqrt(variance);

    if (standardDeviation === 0) return 0; // Avoid division by zero

    return (value - mean) / standardDeviation;
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-api-key' } });
}

export async function POST(request: Request) {
    try {
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Unauthorized: x-api-key header is required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { payload } = body;

        // 1. Initialize the Standard json-rules-engine
        const engine = new Engine();

        engine.addOperator('z-score-greater-than', (factValue: { live: number, history: number[] }, jsonValue: number) => {
            if (!factValue || typeof factValue.live !== 'number' || !Array.isArray(factValue.history)) {
                return false;
            }
            const zScore = calculateZScore(factValue.live, factValue.history);
            console.log(`[Math Engine] Calculated Z-Score: ${zScore.toFixed(3)} (Threshold: > ${jsonValue})`);
            return zScore > jsonValue;
        });

        // 2.5 Register Custom Case-Insensitive Contains Operator
        engine.addOperator('containsCaseInsensitive', (factValue: any[], jsonValue: string) => {
            if (!Array.isArray(factValue) || typeof jsonValue !== 'string') return false;
            return factValue.some(item => typeof item === 'string' && item.toLowerCase() === jsonValue.toLowerCase());
        });

        // 3. Fetch Active Rules using Supabase
        const { data: activeRules, error: rulesError } = await supabase
            .from('rules')
            .select('id, name, rule_schema')
            .eq('status', 'active');

        if (rulesError || !activeRules) {
            throw new Error(`Failed to fetch logic schemas: ${rulesError?.message || 'No rules found'}`);
        }

        // Add all active rules to the engine
        for (const rule of activeRules) {
            engine.addRule(rule.rule_schema);
        }

        // 4. For our demo, we need context for the Z-Score operator (historical cart sizes)
        // Let's quickly fetch the last 20 events to calculate the baseline mean/standard deviation.
        const { data: historyData } = await supabase
            .from('historical_events')
            .select('payload')
            .order('created_at', { ascending: false })
            .limit(20);

        const historicalCartTotals = (historyData || []).map(event => event.payload.cartTotal || 0);

        // Define our facts for evaluation
        const facts = {
            cartTotal: payload.cartTotal,
            // Our custom fact shape required for the `z-score-greater-than` operator
            cartSurgeMetrics: {
                live: payload.cartTotal,
                history: historicalCartTotals.length > 0 ? historicalCartTotals : [100, 110, 95, 105, 90] // Fallback mock history
            },
            userId: payload.userId,
            isPremiumMember: payload.isPremiumMember,
            items: payload.items || []
        };

        // 5. Evaluate Fact against Rules
        const evaluationResults = await engine.run(facts);
        const triggeredActions = evaluationResults.events;

        // 6. Async Logging
        supabase.from('historical_events').insert({
            payload: payload
        }).then(({ error }) => {
            if (error) console.error("Async historical event logging failed:", error);
        });

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            evaluation: {
                totalRulesAnalyzed: activeRules.length,
                triggeredRules: triggeredActions.length,
                actions: triggeredActions
            }
        }, { headers: { 'Access-Control-Allow-Origin': '*' } });

    } catch (error: any) {
        console.error('[API Evaluate]', error);
        return NextResponse.json({ error: 'Internal Server Error', msg: error.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
}

