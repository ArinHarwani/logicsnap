/**
 * Statistical Math Evaluator
 * 
 * An enterprise-grade mathematical evaluation engine for LogicSnap.
 * Supports standard boolean logic, advanced statistical tests,
 * anomaly detection, and linear algebra operations.
 */
export class StatisticalMathEvaluator {

    /**
     * 1. Matrix Multiplication (Risk Vector Evaluation)
     * Multiplies two matrices (or vectors). Useful for calculating multi-variable risk scores.
     */
    static multiplyMatrices(a: number[][], b: number[][]): number[][] {
        const aRows = a.length, aCols = a[0].length;
        const bRows = b.length, bCols = b[0].length;

        if (aCols !== bRows) {
            throw new Error(`Incompatible matrices for multiplication: ${aCols} and ${bRows}`);
        }

        const result = new Array(aRows);
        for (let r = 0; r < aRows; ++r) {
            result[r] = new Array(bCols).fill(0);
            for (let c = 0; c < bCols; ++c) {
                for (let i = 0; i < aCols; ++i) {
                    result[r][c] += a[r][i] * b[i][c];
                }
            }
        }
        return result;
    }

    /**
     * 2. Z-Score (Anomaly Detection / Standard Deviation)
     * Calculates the Z-Score of a given value against a dataset.
     * Z = (X - μ) / σ
     */
    static calculateZScore(value: number, dataset: number[]): number {
        if (dataset.length === 0) return 0;

        // Calculate Mean (μ)
        const mean = dataset.reduce((acc, val) => acc + val, 0) / dataset.length;

        // Calculate Standard Deviation (σ)
        const variance = dataset.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / dataset.length;
        const standardDeviation = Math.sqrt(variance);

        if (standardDeviation === 0) return 0; // Avoid division by zero

        return (value - mean) / standardDeviation;
    }

    /**
     * 3. Moving Average Calculation
     * Calculates the simple moving average over a specified window.
     */
    static calculateMovingAverage(dataset: number[], windowSize: number): number[] {
        if (dataset.length < windowSize || windowSize <= 0) return [];

        const result: number[] = [];
        for (let i = 0; i <= dataset.length - windowSize; i++) {
            const window = dataset.slice(i, i + windowSize);
            const sum = window.reduce((acc, val) => acc + val, 0);
            result.push(sum / windowSize);
        }
        return result;
    }

    /**
     * 4. Complex Threshold/Boolean Logic
     * Evaluates standard equality or comparative logic dynamically.
     */
    static evaluateCondition(value: any, operator: string, threshold: any): boolean {
        switch (operator) {
            case 'EQUALS': return value === threshold;
            case 'NOT_EQUALS': return value !== threshold;
            case 'GREATER_THAN': return value > threshold;
            case 'LESS_THAN': return value < threshold;
            case 'GREATER_THAN_OR_EQUALS': return value >= threshold;
            case 'LESS_THAN_OR_EQUALS': return value <= threshold;
            case 'IN': return Array.isArray(threshold) && threshold.includes(value);
            case 'NOT_IN': return Array.isArray(threshold) && !threshold.includes(value);
            default: return false;
        }
    }
}

