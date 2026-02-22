-- Run this in the Supabase SQL Editor to inject the "High Demand Surge" rule
-- This rule uses the `z-score-greater-than` operator. It triggers if the live cartTotal 
-- is 2 standard deviations higher than the historical mean (a massive anomaly).

INSERT INTO public.rules (project_id, name, status, rule_schema)
VALUES (
    (SELECT id FROM public.projects WHERE api_key = '550e8400-e29b-41d4-a716-446655440000' LIMIT 1),
    'High Demand Surge Pricing (+20%)',
    'active',
    '{
        "conditions": {
            "all": [
                {
                    "fact": "cartSurgeMetrics",
                    "operator": "z-score-greater-than",
                    "value": 2.0
                }
            ]
        },
        "event": {
            "type": "surge_pricing",
            "params": {
                "markupPercentage": 20
            }
        }
    }'::jsonb
);
