'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Code, ShieldCheck, Play } from 'lucide-react';
import styles from './page.module.css';

export default function MarketingPortal() {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [schema, setSchema] = useState<any>(null);
    const [deployed, setDeployed] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        setDeployed(false);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify({ prompt }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            setSchema(data.schema);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleDeploy = () => {
        setDeployed(true);
        // In a real app this would POST to a rule ingestion engine
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Marketing <span className="text-gradient">Portal</span></h1>
                    <p>Instantly translate natural language strategies into mathematically rigorous, deployable application logic without waiting for a developer.</p>
                </header>

                <section className={styles.workspace}>
                    {/* Input Side */}
                    <div className={styles.inputArea}>
                        <div className={styles.promptBox}>
                            <div className={styles.promptHeader}>
                                <Sparkles size={18} className="text-gradient" />
                                <h3>Describe the business logic</h3>
                            </div>
                            <textarea
                                className={styles.textarea}
                                placeholder="e.g. Because today is Sunday, we will have an offer like 30% off upto 120 on all orders over $50..."
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                            />
                            <div className={styles.examples}>
                                <span>Examples:</span>
                                <button onClick={() => setPrompt("If user spent over $500 last month, give 10% off.")}>Loyalty Tier</button>
                                <button onClick={() => setPrompt("Apply weekend discount of 30% off upto 120.")}>Weekend Surge</button>
                                <button onClick={() => setPrompt("Flag transactions that are mathematical anomalies (surge/z-score) for review.")}>Risk Engine</button>
                            </div>
                            <button
                                className={`btn-primary ${styles.generateBtn}`}
                                onClick={handleGenerate}
                                disabled={loading || !prompt}
                            >
                                {loading ? 'Translating to Code...' : 'Generate Logic Schema'}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </div>

                        <div className={`glass-panel ${styles.infoCard}`}>
                            <ShieldCheck className={styles.iconSafe} size={24} />
                            <div>
                                <h4>Zero-Downtime Agility</h4>
                                <p>Deploying this logic will bypass the standard CI/CD pipeline, taking effect immediately on real-time data streams while governed by the Master Schema.</p>
                            </div>
                        </div>
                    </div>

                    {/* Output Side */}
                    <div className={styles.outputArea}>
                        <div className={`glass-panel ${styles.schemaBox}`}>
                            <div className={styles.schemaHeader}>
                                <div className={styles.tabActive}><Code size={16} /> Generated Schema (JSON)</div>
                                <div className={styles.schemaMeta}>Live Preview</div>
                            </div>

                            <div className={styles.codeContainer}>
                                {loading ? (
                                    <div className={styles.loadingState}>
                                        <div className={styles.spinner} />
                                        <p>Synthesizing mathematical parameters...</p>
                                    </div>
                                ) : schema ? (
                                    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                                        {schema.confidenceScore && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                <ShieldCheck size={16} /> AI Confidence: {(schema.confidenceScore * 100).toFixed(0)}%
                                            </div>
                                        )}
                                        <pre style={{ margin: 0 }}>
                                            {JSON.stringify(schema, null, 2)}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <Code size={48} className={styles.mutedIcon} />
                                        <p>Generated logic schema will appear here.</p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.schemaActions}>
                                <button
                                    className="btn-secondary"
                                    disabled={!schema}
                                    onClick={() => {
                                        sessionStorage.setItem('draftSchema', JSON.stringify(schema));
                                        router.push('/backtesting');
                                    }}
                                >
                                    <Play size={16} /> Backtest Logic
                                </button>
                                <button
                                    className={`btn-primary ${deployed ? styles.btnSuccess : ''}`}
                                    disabled={!schema || deployed}
                                    onClick={handleDeploy}
                                >
                                    {deployed ? 'Logic Deployed Successfully' : 'Deploy to Production'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

