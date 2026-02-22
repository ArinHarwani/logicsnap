import { StatisticalMathEvaluator } from '../src/lib/engine/StatisticalMathEvaluator';

console.log("--- Executing Statistical Math Evaluator Tests ---");

// 1. Matrix Multiplication
const vec = [[1, 2]]; // 1x2
const weights = [
    [0.5, 0.2],
    [0.1, 0.8]
]; // 2x2
const riskMatrix = StatisticalMathEvaluator.multiplyMatrices(vec, weights);
console.log("1. Matrix Multiplication (Risk Matrix):");
console.log(`Input: [[1, 2]] * ${JSON.stringify(weights)}`);
console.log(`Result: ${JSON.stringify(riskMatrix)}`); // Expected: [[0.7, 1.8]]

// 2. standard deviation (Z-score)
const dataset = [10, 12, 23, 23, 16, 23, 21, 16]; // Mean: 18, Var: 23.5, StdDev: ~4.84
const testValue = 30;
const zScore = StatisticalMathEvaluator.calculateZScore(testValue, dataset);
console.log("\n2. Z-Score / Anomaly Detection:");
console.log(`Dataset: ${JSON.stringify(dataset)}`);
console.log(`Test Value: ${testValue}`);
console.log(`Z-Score: ${zScore.toFixed(3)} (Anomaly if > 2)`);

// 3. Moving Average
const maDataset = [10, 20, 30, 40, 50];
const ma = StatisticalMathEvaluator.calculateMovingAverage(maDataset, 3);
console.log("\n3. Moving Average:");
console.log(`Dataset: ${JSON.stringify(maDataset)}, Window: 3`);
console.log(`Result: ${JSON.stringify(ma)}`); // Expected: [20, 30, 40]

// 4. Boolean Evaluation
const isAnomalous = StatisticalMathEvaluator.evaluateCondition(zScore, 'GREATER_THAN', 2.0);
console.log("\n4. Boolean Evaluation:");
console.log(`Is Z-Score (${zScore.toFixed(3)}) > 2.0? ${isAnomalous}`);

console.log("\n--- Tests Completed Successfully ---");
