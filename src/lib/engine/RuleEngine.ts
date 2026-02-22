import { StatisticalMathEvaluator } from './StatisticalMathEvaluator';

// Define the structure of a deployable Rule Logic Item
export interface LogicCondition {
    field: string;
    operator: string;
    value: any;
    type?: 'standard' | 'zscore' | 'moving_average' | 'risk_matrix';
    meta?: any; // Additional payload for complex operations
}

export interface RuleSchema {
    id: string;
    name: string;
    description: string;
    conditions: LogicCondition[];
    conditionLogic: 'AND' | 'OR';
    action: {
        type: string;
        payload: any;
    };
    metadata?: {
        tags: string[];
        author: string;
        createdAt: string;
    };
}

export interface EvaluationResult {
    passed: boolean;
    ruleId: string;
    action?: any;
    details: any;
}

export class RuleEngine {
    private rules: RuleSchema[] = [];

    constructor(initialRules: RuleSchema[] = []) {
        this.rules = initialRules;
    }

    addRule(rule: RuleSchema) {
        this.rules.push(rule);
    }

    getRules() {
        return this.rules;
    }

    /**
     * Evaluates a live data payload against all registered rules.
     * Returns an array of evaluation results for rules that passed.
     */
    evaluate(payload: any, historicalContext: any = {}): EvaluationResult[] {
        const passedRules: EvaluationResult[] = [];

        for (const rule of this.rules) {
            const conditionResults = rule.conditions.map(condition => {
                return this.evaluateCondition(condition, payload, historicalContext);
            });

            const passed = rule.conditionLogic === 'AND'
                ? conditionResults.every(r => r === true)
                : conditionResults.some(r => r === true);

            if (passed) {
                passedRules.push({
                    passed: true,
                    ruleId: rule.id,
                    action: rule.action,
                    details: { evaluatedAt: new Date().toISOString() }
                });
            }
        }

        return passedRules;
    }

    /**
     * Dispatches evaluation to the correct mathematical/statistical engine
     */
    private evaluateCondition(condition: LogicCondition, payload: any, historicalContext: any): boolean {
        const fieldValue = payload[condition.field];

        switch (condition.type) {
            case 'zscore':
                // e.g. "Is the current transaction amount an anomaly compared to the last 30 days?"
                const dataset = historicalContext[condition.field] || [];
                const zScore = StatisticalMathEvaluator.calculateZScore(fieldValue, dataset);
                return StatisticalMathEvaluator.evaluateCondition(Math.abs(zScore), condition.operator, condition.value);

            case 'moving_average':
                // e.g. "Is the current value 20% higher than the 7-day moving average?"
                const maDataset = historicalContext[condition.field] || [];
                const window = condition.meta?.window || 7;
                const ma = StatisticalMathEvaluator.calculateMovingAverage(maDataset, window);
                if (ma.length === 0) return false;
                const currentMA = ma[ma.length - 1]; // Latest moving average
                // Simple ratio evaluation here as an example
                return StatisticalMathEvaluator.evaluateCondition(fieldValue / currentMA, condition.operator, condition.value);

            case 'risk_matrix':
                // Evaluate multi-variable risk using matrix multiplication
                // Expected payload is a vector, and we multiply it against a weight matrix
                if (!condition.meta?.weights || !Array.isArray(fieldValue)) return false;

                try {
                    const resultMatrix = StatisticalMathEvaluator.multiplyMatrices([fieldValue], condition.meta.weights);
                    const riskScore = resultMatrix[0].reduce((a, b) => a + b, 0); // Sum of output vector
                    return StatisticalMathEvaluator.evaluateCondition(riskScore, condition.operator, condition.value);
                } catch (e) {
                    console.error("Matrix Math Evaluation Error", e);
                    return false;
                }

            case 'standard':
            default:
                // Basic boolean evaluation
                return StatisticalMathEvaluator.evaluateCondition(fieldValue, condition.operator, condition.value);
        }
    }
}

