import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function extractFactsFromSchema(schema: any): string[] {
    const facts: Set<string> = new Set();
    if (!schema?.conditions) return [];
    [...(schema.conditions.all || []), ...(schema.conditions.any || [])].forEach((cond: any) => {
        if (cond.fact) facts.add(cond.fact);
    });
    return Array.from(facts);
}

export async function GET() {
    try {
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xseubadkltyupttwlxjx.supabase.co',
            process.env.SUPABASE_SERVICE_KEY
        );

        const { data: projects } = await adminSupabase.from('projects').select('id').limit(1);
        const projectId = projects?.[0]?.id;
        if (!projectId) return NextResponse.json({ success: false, error: 'No project found' }, { status: 500 });

        const { data: rules, error } = await adminSupabase
            .from('rules')
            .select('id, name, rule_schema')
            .eq('project_id', projectId)
            .eq('status', 'active');

        if (error) throw new Error(error.message);

        const nodes: any[] = [];
        const edges: any[] = [];
        const factFrequency: Record<string, number> = {};
        const rulesParsed: { id: string; name: string; dependencies: string[] }[] = [];

        for (const rule of (rules || [])) {
            const dependencies = extractFactsFromSchema(rule.rule_schema);
            rulesParsed.push({ id: rule.id, name: rule.name, dependencies });
            dependencies.forEach(fact => { factFrequency[fact] = (factFrequency[fact] || 0) + 1; });
        }

        Object.keys(factFrequency).forEach((fact, index) => {
            const isColliding = factFrequency[fact] > 1;
            nodes.push({
                id: `fact-${fact}`,
                data: { label: `📌 ${fact}`, type: 'fact', isColliding },
                position: { x: 150 + index * 260, y: 50 },
                style: {
                    background: isColliding ? '#7f1d1d' : '#0f172a',
                    color: isColliding ? '#fca5a5' : '#38bdf8',
                    border: `2px solid ${isColliding ? '#ef4444' : '#38bdf8'}`,
                    borderRadius: '10px', padding: '10px 20px', fontWeight: 'bold', fontSize: '13px'
                }
            });
        });

        rulesParsed.forEach((rule, index) => {
            nodes.push({
                id: `rule-${rule.id}`,
                data: { label: `⚡ ${rule.name}`, type: 'rule' },
                position: { x: 80 + index * 220, y: 280 },
                style: {
                    background: '#ffffff', color: '#0f172a',
                    border: '2px solid #10b981', borderRadius: '12px',
                    padding: '12px 18px', fontWeight: '600', fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', width: 200
                }
            });

            rule.dependencies.forEach(fact => {
                const isColliding = factFrequency[fact] > 1;
                edges.push({
                    id: `edge-${rule.id}-${fact}`,
                    source: `rule-${rule.id}`,
                    target: `fact-${fact}`,
                    type: 'smoothstep',
                    animated: isColliding,
                    data: { isColliding },
                    style: { stroke: isColliding ? '#ef4444' : '#94a3b8', strokeWidth: isColliding ? 3 : 2 }
                });
            });
        });

        return NextResponse.json({
            success: true,
            graph: { nodes, edges },
            summary: {
                totalRules: rulesParsed.length,
                totalFacts: Object.keys(factFrequency).length,
                collisionsCount: Object.values(factFrequency).filter(v => v > 1).length
            }
        });

    } catch (error: any) {
        console.error('[API Blast Radius]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

