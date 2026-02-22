'use client';

import { useState, useEffect } from 'react';
import { Play, Activity, CheckCircle2, XCircle } from 'lucide-react';
import styles from './page.module.css';

export default function Backtesting() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [ruleToTest, setRuleToTest] = useState<any>({
        id: "rule_1",
        name: "High Value Surge Discount",
        description: "Apply up to 120 discount on anomalous transaction amounts",
        conditionLogic: "AND",
        conditions: [{
            field: "amount",
            operator: "GREATER_THAN",
            value: 1.0,
            type: "zscore"
        }],
        action: {
            type: "DISCOUNT",
            payload: { type: "PERCENTAGE", value: 30, maxLimit: 120 }
        }
    });

    useEffect(() => {
        const draft = sessionStorage.getItem('draftSchema');
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setRuleToTest(parsed);
                sessionStorage.removeItem('draftSchema');
            } catch (e) { }
        }
    }, []);

    const runBacktest = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/backtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rules: [ruleToTest] })
            });
            const data = await res.json();
            setResults(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Time-Travel <span className="text-gradient">Backtesting</span></h1>
                    <p>Simulate financial impact against historical data streams before ever deploying a rule to production.</p>
                </header>

                <section className={styles.dashboard}>
                    <div className={`glass-panel ${styles.controlPanel}`}>
                        <div className={styles.rulePreview}>
                            <h3>Testing Logic Schema</h3>
                            <pre>
                                {JSON.stringify(ruleToTest, null, 2)}
                            </pre>
                        </div>

                        <button
                            className={`btn-primary ${styles.runBtn}`}
                            onClick={runBacktest}
                            disabled={loading}
                        >
                            {loading ? <Activity className="animate-spin" /> : <Play />}
                            {loading ? 'Simulating 30 Days...' : 'Run Simulation'}
                        </button>
                    </div>

                    <div className={styles.resultsArea}>
                        {!results && !loading && (
                            <div className={styles.emptyState}>
                                <Activity size={48} />
                                <p>Run a backtest simulation to view financial impact</p>
                            </div>
                        )}

                        {results && (
                            <div className={`animate-fade-in-up ${styles.report}`}>
                                <div className={styles.summaryCards}>
                                    <div className={`glass-panel ${styles.statCard}`}>
                                        <small>Total Historical Txns</small>
                                        <div className={styles.statValue}>{results.summary.totalTransactions}</div>
                                    </div>
                                    <div className={`glass-panel ${styles.statCard}`}>
                                        <small>Transactions Affected</small>
                                        <div className={styles.statValue}>{results.summary.transactionsAffected}</div>
                                        <div className={styles.statSub}>{results.summary.impactPercentage}% Impact</div>
                                    </div>
                                    <div className={`glass-panel ${styles.statCard} ${styles.financialStat}`}>
                                        <small>Total Discount Cost Simulated</small>
                                        <div className={styles.statValue}>${results.summary.totalDiscountApplied.toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Simulation Chart */}
                                <div className={`glass-panel ${styles.chartArea}`}>
                                    <h3>Discount Volume (30 Days)</h3>
                                    <div className={styles.cssChart}>
                                        {results.timeSeriesData.map((row: any, i: number) => {
                                            const height = row.discountApplied ? Math.min((row.transaction.amount / 500) * 100, 100) : 5;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`${styles.bar} ${row.discountApplied ? styles.barActive : ''}`}
                                                    style={{ height: `${height}%` }}
                                                    title={`Txn ${row.transaction.transactionId}: $${row.transaction.amount}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={`glass-panel ${styles.logTable}`}>
                                    <h3>Simulation Log (Last 30 Days)</h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Txn ID</th>
                                                <th>Amount</th>
                                                <th>Category</th>
                                                <th>Status</th>
                                                <th>Discount Applied</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.timeSeriesData.slice(0, 10).map((row: any, i: number) => (
                                                <tr key={i}>
                                                    <td>{row.transaction.transactionId}</td>
                                                    <td>${row.transaction.amount}</td>
                                                    <td>{row.transaction.category}</td>
                                                    <td>
                                                        {row.discountApplied ?
                                                            <span className={styles.tagSuccess}><CheckCircle2 size={14} /> Triggered</span> :
                                                            <span className={styles.tagNeutral}><XCircle size={14} /> Passed</span>}
                                                    </td>
                                                    <td>
                                                        {row.discountApplied ? 'Yes' : 'No'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {results.timeSeriesData.length > 10 && (
                                        <div className={styles.tableFooter}>
                                            Showing 10 of {results.timeSeriesData.length} records.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}


