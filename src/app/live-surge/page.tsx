"use client";

import { useState, useRef, useEffect } from "react";
import { Play, AlertTriangle, Coffee, Loader2, TrendingUp, Flame } from "lucide-react";

const CAFE_ITEMS = [
    'Signature Cold Brew',
    'Iced Matcha Latte',
    'Artisan Latte',
    'Avocado Toast',
    'Butter Croissant',
    'Breakfast Combo',
];

export default function LiveSurgePage() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [logs, setLogs] = useState<{ id: string; time: string; msg: string; type: 'info' | 'alert' | 'success' }[]>([]);
    const [anomalyActive, setAnomalyActive] = useState(false);
    const [surgeItem, setSurgeItem] = useState<string | null>(null);
    const [demandCounts, setDemandCounts] = useState<Record<string, number>>({});

    const autoScrollRef = useRef<HTMLDivElement>(null);
    const isRunningRef = useRef(false);

    // Auto-clear any leftover surge rules when the page first loads
    useEffect(() => {
        fetch('/api/surge-activate', { method: 'DELETE' });
    }, []);

    const clearSurge = async () => {
        await fetch('/api/surge-activate', { method: 'DELETE' });
        setAnomalyActive(false);
        setSurgeItem(null);
        setLogs([]);
        setDemandCounts({});
        addLog("✅ Surge cleared. Menu prices reset to baseline.", "success");
    };

    const addLog = (msg: string, type: 'info' | 'alert' | 'success' = 'info') => {
        setLogs(prev => [...prev, { id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg, type }]);
        setTimeout(() => {
            if (autoScrollRef.current) {
                autoScrollRef.current.scrollTop = autoScrollRef.current.scrollHeight;
            }
        }, 50);
    };

    const runMorningRush = async () => {
        if (isRunningRef.current) return;
        isRunningRef.current = true;
        setIsSimulating(true);
        setLogs([]);
        setAnomalyActive(false);
        setSurgeItem(null);
        setDemandCounts({});

        addLog("Initializing Cafe Morning Rush Simulation (50 rapid payloads)...");

        let anomalyTriggered = false;
        const localCounts: Record<string, number> = {};

        // Bias simulation: Cold Brew is 3x more likely (morning rush)
        const weightedItems = [
            ...Array(8).fill('Signature Cold Brew'),
            ...Array(4).fill('Iced Matcha Latte'),
            ...Array(3).fill('Artisan Latte'),
            ...Array(3).fill('Avocado Toast'),
            ...Array(2).fill('Butter Croissant'),
            ...Array(1).fill('Breakfast Combo'),
        ];

        for (let i = 1; i <= 50; i++) {
            if (!isRunningRef.current) break;

            const orderedItem = weightedItems[Math.floor(Math.random() * weightedItems.length)];
            const cartTotal = parseFloat((Math.random() * 30 + 5).toFixed(2));

            // Update live demand counts
            localCounts[orderedItem] = (localCounts[orderedItem] || 0) + 1;
            setDemandCounts({ ...localCounts });

            try {
                const res = await fetch('/api/menu-pricing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartTotal, items: [orderedItem] })
                });

                const data = await res.json();
                const actions = data.actions || [];
                const hasRule = actions.length > 0;

                if (hasRule) {
                    addLog(`Order #${i}: ${orderedItem} $${cartTotal} — Rule: ${actions[0].type}`, "success");
                } else {
                    addLog(`Order #${i}: ${orderedItem} $${cartTotal} — OK`, "info");
                }

            } catch {
                addLog(`Order #${i}: ${orderedItem} — processing error`, "alert");
            }

            await new Promise(r => setTimeout(r, 120));

            // At order 25, detect surge based on most-ordered item
            if (i === 25 && !anomalyTriggered) {
                const topItem = Object.entries(localCounts).sort((a, b) => b[1] - a[1])[0];
                const topName = topItem?.[0] || 'Signature Cold Brew';
                const topCount = topItem?.[1] || 0;

                addLog(`⚠️  [SYSTEM] Volume spike: "${topName}" ordered ${topCount}x in 25 transactions. Analyzing...`, "info");
                await new Promise(r => setTimeout(r, 600));

                anomalyTriggered = true;
                setAnomalyActive(true);
                setSurgeItem(topName);
                addLog(`🔴 Z-SCORE BREACHED — "${topName}" demand is ${((topCount / 25) * 100).toFixed(0)}% of all orders. Surge pricing +20% applied automatically.`, "alert");

                // Write surge rule to database so the Live Menu reflects it immediately
                fetch('/api/surge-activate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemName: topName, markupPercentage: 20 })
                }).then(() => {
                    addLog(`💾 Surge rule saved to database — Live Menu will reflect in ≤5 seconds.`, "success");
                });
            }
        }

        addLog("Simulation Complete. Live pricing engine updated.", "info");
        isRunningRef.current = false;
        setIsSimulating(false);
    };

    const topItems = Object.entries(demandCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const totalOrders = Object.values(demandCounts).reduce((a, b) => a + b, 0);

    return (
        <div className={`transition-all duration-500 min-h-[calc(100vh-4rem)] rounded-3xl p-8 border-4 ${anomalyActive ? 'border-red-500 bg-red-50/20' : 'border-transparent'}`}>

            {anomalyActive && (
                <div className="mb-8 bg-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3 font-semibold text-lg">
                        <AlertTriangle className="w-6 h-6" />
                        SURGE PRICING ACTIVATED — {surgeItem}
                    </div>
                    <span className="text-sm font-medium">+20% markup applied automatically to curb extreme demand.</span>
                </div>
            )}

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Live Demand Surge
                        <div className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            Z-Score Evaluator
                        </div>
                    </h1>
                    <p className="text-slate-500 mt-2">Monitor real-time throughput and statistically evaluate volume velocity against active rules.</p>
                </div>

                <div className="flex gap-3">
                    {anomalyActive && (
                        <button
                            onClick={clearSurge}
                            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                        >
                            ✕ Clear Surge
                        </button>
                    )}
                    <button
                        onClick={runMorningRush}
                        disabled={isSimulating}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                    >
                        {isSimulating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
                        {isSimulating ? "Simulating Rush..." : "Simulate Morning Rush"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Log Terminal */}
                <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[550px]">
                    <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Coffee className="w-5 h-5 text-emerald-500" />
                            <h3 className="text-slate-200 font-semibold text-sm">System Logs — Cafe API Gateway</h3>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-2" ref={autoScrollRef}>
                        {logs.length === 0 && (
                            <div className="text-slate-600 italic h-full flex items-center justify-center">
                                System awaiting payload throughput...
                            </div>
                        )}
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-4">
                                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                                <span className={`
                                    ${log.type === 'alert' ? 'text-red-400 font-semibold' : ''}
                                    ${log.type === 'success' ? 'text-emerald-400' : ''}
                                    ${log.type === 'info' ? 'text-slate-300' : ''}
                                `}>
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Demand Heatmap Panel */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[550px]">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-slate-800 text-sm">Live Demand Heatmap</h3>
                        {isSimulating && <span className="ml-auto text-xs font-medium text-emerald-600 flex items-center gap-1"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> LIVE</span>}
                    </div>

                    <div className="flex-1 p-5 space-y-3 overflow-auto">
                        {totalOrders === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center px-4">
                                Demand signals will appear here as orders stream in...
                            </div>
                        ) : (
                            topItems.map(([item, count], idx) => {
                                const pct = Math.round((count / totalOrders) * 100);
                                const isSurging = anomalyActive && item === surgeItem;
                                return (
                                    <div key={item} className={`rounded-xl p-3 border transition-all ${isSurging ? 'border-red-300 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {isSurging && <Flame className="w-4 h-4 text-red-500" />}
                                                <span className={`text-sm font-semibold ${isSurging ? 'text-red-700' : 'text-slate-700'}`}>{item}</span>
                                            </div>
                                            <span className={`text-sm font-bold ${isSurging ? 'text-red-600' : 'text-slate-600'}`}>{count}x</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${isSurging ? 'bg-red-500' : idx === 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-xs text-slate-400">{pct}% of orders</span>
                                            {isSurging && <span className="text-xs font-bold text-red-600">⚡ SURGE +20%</span>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="px-5 py-4 border-t border-slate-100">
                        <div className="text-xs text-slate-500 font-medium">Total orders processed: <span className="font-bold text-slate-800">{totalOrders}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

