'use client';

import { useState, useEffect } from 'react';
import { DatabaseZap, Plus, Trash2, Edit2, Archive, Play, Activity } from 'lucide-react';
import styles from './page.module.css';

export default function RulesManager() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [draftName, setDraftName] = useState('');
    const [draftSchema, setDraftSchema] = useState('{\n  "conditionLogic": "AND",\n  "conditions": [],\n  "action": {}\n}');

    const fetchRules = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/rules');
            const data = await res.json();
            setRules(data.rules || []);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleCreate = async () => {
        try {
            let parsed = {};
            try { parsed = JSON.parse(draftSchema); } catch (e) { alert("Invalid JSON Schema."); return; }

            await fetch('/api/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: draftName, status: 'draft', rule_schema: parsed })
            });
            setIsModalOpen(false);
            setDraftName('');
            fetchRules();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete rule?")) return;
        try {
            await fetch(`/api/rules?id=${id}`, { method: 'DELETE' });
            fetchRules();
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'draft' : 'active';
        try {
            await fetch('/api/rules', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            fetchRules();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Rules <span className="text-gradient">Manager</span></h1>
                    <p>Manage, deploy, and revoke your LogicSnap schemas instantly without any code changes or redeployments.</p>
                </header>

                <section className={styles.dashboard}>
                    <div className={styles.controls}>
                        <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <DatabaseZap size={18} className="text-gradient" />
                            <span>{rules.length} Rules Enforced</span>
                        </div>
                        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} /> New Rule
                        </button>
                    </div>

                    <div className={`glass-panel ${styles.tableContainer}`}>
                        {loading ? (
                            <div className={styles.emptyState}>
                                <Activity className="animate-spin" size={32} />
                                <p>Loading rules...</p>
                            </div>
                        ) : rules.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Archive size={48} />
                                <p>No rules defined yet.</p>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rule Name</th>
                                        <th>Status</th>
                                        <th>Conditions</th>
                                        <th>Action</th>
                                        <th>Created</th>
                                        <th>Manage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rules.map((rule) => (
                                        <tr key={rule.id} className={styles.row}>
                                            <td>
                                                <div className={styles.ruleName}>{rule.name}</div>
                                                <div className={styles.ruleId}>{rule.id}</div>
                                            </td>
                                            <td>
                                                <span className={rule.status === 'active' ? styles.badgeActive : styles.badgeDraft}>
                                                    {rule.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <code style={{ fontSize: '0.85rem' }}>{rule.rule_schema?.conditionLogic || 'AND'}</code> ({rule.rule_schema?.conditions?.length || 0})
                                            </td>
                                            <td>
                                                <code style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                                                    {rule.rule_schema?.action?.type || 'UNKNOWN'}
                                                </code>
                                            </td>
                                            <td>
                                                <small style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(rule.created_at).toLocaleDateString()}
                                                </small>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button
                                                        className={styles.actionBtn}
                                                        title={rule.status === 'active' ? "Move to Draft" : "Deploy to Active"}
                                                        onClick={() => handleToggleStatus(rule.id, rule.status)}
                                                    >
                                                        {rule.status === 'active' ? <Archive size={16} /> : <Play size={16} />}
                                                    </button>
                                                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(rule.id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={`glass-panel ${styles.modal} animate-fade-in-up`}>
                        <div className={styles.modalHeader}>
                            <h2>Create New Rule</h2>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Rule Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="e.g. VIP Member Discount"
                                value={draftName}
                                onChange={(e) => setDraftName(e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Logic Schema (JSON)</label>
                            <textarea
                                className={styles.textarea}
                                value={draftSchema}
                                onChange={(e) => setDraftSchema(e.target.value)}
                            />
                        </div>
                        <div className={styles.modalFooter}>
                            <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleCreate}>Save Rule</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

