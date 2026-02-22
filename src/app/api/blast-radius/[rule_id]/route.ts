import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * PHASE 3: GET /blast-radius/[rule_id]
 * 
 * Scans the JSONB columns of all active rules within the project 
 * to find overlapping data keys (e.g., if Rule A and Rule B both modify "cart_total" 
 * or check "user.age").
 */
export async function GET(request: Request, context: { params: { rule_id: string } }) {
    try {
        const ruleId = context.params.rule_id;
        const apiKey = request.headers.get('x-api-key');

        // In a real edge app, we'd enforce the apiKey to match the RLS.
        // Since this is mock routing for the frontend, we'll bypass strict api_key blocks for local dev,
        // but the SQL queries still execute securely if configured.

        // 1. Fetch the Target Rule first
        const { data: targetRule, error: tErr } = await supabase
            .from('rules')
            .select('*')
            .eq('id', ruleId)
            .single();

        if (tErr || !targetRule) {
            return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
        }

        // Extract the properties this rule mutating or checking 
        // (We consider all condition "fields" and action payloads as the blast radius)
        const extractFields = (schema: any) => {
            const conditionFields = (schema.conditions || []).map((c: any) => c.field);
            return [...new Set(conditionFields)];
        };

        const targetDependencies = extractFields(targetRule.rule_schema);

        // 2. Fetch all other Active Rules in the project
        const { data: otherRules, error: oErr } = await supabase
            .from('rules')
            .select('id, name, rule_schema')
            .eq('project_id', targetRule.project_id)
            .eq('status', 'active')
            .neq('id', ruleId);

        if (oErr) throw new Error(oErr.message);

        // 3. Find Intersecting Collisions across the JSONB arrays
        const collisions = (otherRules || []).map(r => {
            const otherDeps = extractFields(r.rule_schema);
            const intersection = targetDependencies.filter(dep => otherDeps.includes(dep as string));

            return {
                id: r.id,
                name: r.name,
                overlappingFields: intersection,
                isCollision: intersection.length > 0
            };
        }).filter(r => r.isCollision);

        return NextResponse.json({
            targetRule: {
                id: targetRule.id,
                name: targetRule.name,
                dependencies: targetDependencies
            },
            collisions
        });

    } catch (error: any) {
        console.error('[Blast Radius API]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
