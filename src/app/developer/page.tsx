'use client';

import { useState, useEffect } from 'react';
import { Network, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import styles from './page.module.css';

// Mock system rules to demonstrate overlap/blast radius
const mockRules = [
    { id: 'R1', name: 'Weekend Surge Pricing', target: 'order.total', dependsOn: ['user.tier', 'time.dayOfWeek'] },
    { id: 'R2', name: 'Holiday Discount', target: 'order.total', dependsOn: ['time.date'] },
    { id: 'R3', name: 'VIP Flat Rate', target: 'order.total', dependsOn: ['user.tier'] },
    { id: 'R4', name: 'Fraud Lock', target: 'transaction.status', dependsOn: ['user.riskScore', 'transaction.amount'] },
    { id: 'R5', name: 'High-Value Verification', target: 'transaction.status', dependsOn: ['transaction.amount'] }
];

export default function DeveloperDashboard() {
    const [selectedRule, setSelectedRule] = useState<string | null>(null);

    // Simple collision detection based on common targets
    const getCollisions = (ruleId: string) => {
        const targetRule = mockRules.find(r => r.id === ruleId);
        if (!targetRule) return [];

        return mockRules.filter(r => r.id !== ruleId && r.target === targetRule.target);
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Developer <span className="text-gradient">Dashboard</span></h1>
                    <p>Visually map overlapping rules and cross-system dependencies. Mitigate risk by identifying logic collisions before they reach production.</p>
                </header>

                <section className={styles.dashboard}>
                    <div className={`glass-panel ${styles.sidebar}`}>
                        <div className={styles.searchBar}>
                            <Search size={16} />
                            <input type="text" placeholder="Search rules or targets..." />
                        </div>

                        <div className={styles.ruleList}>
                            {mockRules.map(rule => {
                                const isSelected = selectedRule === rule.id;
                                const collisions = getCollisions(rule.id).length;

                                return (
                                    <button
                                        key={rule.id}
                                        className={`${styles.ruleItem} ${isSelected ? styles.active : ''}`}
                                        onClick={() => setSelectedRule(rule.id)}
                                    >
                                        <div className={styles.ruleHeader}>
                                            <strong>{rule.name}</strong>
                                            {collisions > 0 ? (
                                                <span className={styles.badgeWarning}><AlertTriangle size={12} /> {collisions}</span>
                                            ) : (
                                                <span className={styles.badgeSafe}><CheckCircle2 size={12} /> Safe</span>
                                            )}
                                        </div>
                                        <div className={styles.ruleTarget}>
                                            Target: <code>{rule.target}</code>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`glass-panel ${styles.graphArea}`}>
                        {!selectedRule ? (
                            <div className={styles.emptyState}>
                                <Network size={48} />
                                <p>Select a rule to view its Blast Radius Dependency Graph</p>
                            </div>
                        ) : (
                            <div className={`animate-fade-in-up ${styles.graphView}`}>
                                <h3>Blast Radius & Dependencies</h3>

                                <div className={styles.canvas}>
                                    {/* Simplified Visual Node Graph */}
                                    <div className={styles.nodeCentral}>
                                        <div className={styles.nodeLabel}>{mockRules.find(r => r.id === selectedRule)?.name}</div>
                                        <div className={styles.nodeSub}>Target: {mockRules.find(r => r.id === selectedRule)?.target}</div>
                                    </div>

                                    <div className={styles.connectorPulse}></div>

                                    <div className={styles.dependencies}>
                                        <h4>Depends On Variables:</h4>
                                        <div className={styles.tagList}>
                                            {mockRules.find(r => r.id === selectedRule)?.dependsOn.map(dep => (
                                                <span key={dep} className={styles.tag}>{dep}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {getCollisions(selectedRule).length > 0 && (
                                        <div className={styles.collisions}>
                                            <h4><AlertTriangle size={16} color="var(--warning)" /> Collision Warning</h4>
                                            <p>The following rules also mutate <code>{mockRules.find(r => r.id === selectedRule)?.target}</code>. Execution order must be verified.</p>

                                            <div className={styles.collisionList}>
                                                {getCollisions(selectedRule).map(c => (
                                                    <div key={c.id} className={styles.collisionCard}>
                                                        <strong>{c.name}</strong>
                                                        <span>({c.id})</span>
                                                    </div>
                                                ))}
                                            </div>
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

