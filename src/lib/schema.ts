import { z } from 'zod';

// ==========================================
// 1. Zod Schemas for the Host Integration
// ==========================================

// This is the generic payload sent from a Host Application to LogicSnap
// Since we don't know the exact shape in advance (it varies per client),
// we validate that it's an object with string keys and primitive/array values.
export const IntegrationPayloadSchema = z.record(z.string(), z.any()).refine(
    (data) => Object.keys(data).length > 0,
    { message: "Payload cannot be empty. Must include data to evaluate." }
);

export const EvaluateRequestSchema = z.object({
    payload: IntegrationPayloadSchema
});

// ==========================================
// 2. Strict Zod Schemas for Rule Definitions
// ==========================================

export const ConditionOperatorSchema = z.enum([
    'EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN',
    'GREATER_THAN_OR_EQUALS', 'LESS_THAN_OR_EQUALS',
    'IN', 'NOT_IN'
]);

// Used to strictly validate the JSON rule_schema stored in Supabase
export const LogicConditionSchema = z.object({
    field: z.string().min(1, "Field name is required"),
    operator: ConditionOperatorSchema,
    value: z.any(),
    type: z.enum(['standard', 'zscore', 'moving_average', 'risk_matrix']).default('standard'),
    meta: z.object({
        window: z.number().optional(), // For moving_average
        weights: z.array(z.array(z.number())).optional() // For risk_matrix
    }).optional()
});

export const RuleActionSchema = z.object({
    type: z.string().min(1, "Action type is required (e.g., 'DISCOUNT', 'FLAG', 'ALLOW')"),
    payload: z.any()
});

export const RuleDefinitionSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    conditionLogic: z.enum(['AND', 'OR']),
    conditions: z.array(LogicConditionSchema).min(1, "At least one condition is required"),
    action: RuleActionSchema
});

// ==========================================
// 3. AI Parsing / LLM Output Schema
// ==========================================

// Used when receiving JSON back from the Text-to-Rule LLM endpoint
export const AIGeneratedRuleSchema = RuleDefinitionSchema.extend({
    confidenceScore: z.number().min(0).max(1).optional()
});

