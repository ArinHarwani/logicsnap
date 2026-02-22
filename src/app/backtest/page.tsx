"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Play, ShieldAlert, Sparkles, Loader2, Zap } from "lucide-react";

const MENU_ITEMS = [
    'Signature Cold Brew',
    'Iced Matcha Latte',
    'Artisan Latte',
    'Avocado Toast',
    'Butter Croissant',
    'Breakfast Combo',
    'Flat White',
    'Passion Fruit Lemonade',
];

// Presets that work perfectly with the seeded demo data
const PRESETS = [
    { label: '☕ Cold Brew 15% Off', item: 'Signature Cold Brew', action: 'discount', valueType: 'percentage', value: 15 },
    { label: '🥑 Avocado Toast +$3', item: 'Avocado Toast', action: 'increase', valueType: 'amount', value: 3 },
    { label: '🧋 Matcha 20% Off', item: 'Iced Matcha Latte', action: 'discount', valueType: 'percentage', value: 20 },
    { label: '🥐 Croissant +$1.5 Markup', item: 'Butter Croissant', action: 'increase', valueType: 'amount', value: 1.5 },
    { label: '🍳 Breakfast Surge +25%', item: 'Breakfast Combo', action: 'increase', valueType: 'percentage', value: 25 },
    { label: '☕ Flat White 10% Off', item: 'Flat White', action: 'discount', valueType: 'percentage', value: 10 },
];

export default function BacktestPage() {
    const [isSimulating, setIsSimulating] = useState(false);

    // Rule builder state
    const [selectedItem, setSelectedItem] = useState('Signature Cold Brew');
    const [actionType, setActionType] = useState<'discount' | 'increase'>('discount');
    const [valueType, setValueType] = useState<'percentage' | 'amount'>('percentage');
    const [value, setValue] = useState(15);

    const [results, setResults] = useState<{
        timeSeriesData: any[];
        totalOriginalRevenue: number;
        totalNewRevenue: number;
        totalTriggered: number;
        totalEvaluated: number;
    } | null>(null);

    const loadPreset = (preset: typeof PRESETS[0]) => {
        setSelectedItem(preset.item);
        setActionType(preset.action as any);
        setValueType(preset.valueType as any);
        setValue(preset.value);
        setResults(null);
    };

    const buildRuleSchema = () => ({
        conditions: {
            all: [{ fact: "items", operator: "containsCaseInsensitive", value: selectedItem }]
        },
        event: {
            type: actionType,
            params: valueType === 'percentage' ? { percentage: value } : { amount: value }
        }
    });

    const runBacktest = async () => {
        setIsSimulating(true);
        setResults(null);
        try {
            const res = await fetch('/api/backtest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draftRuleSchema: buildRuleSchema() })
            });
            const data = await res.json();
            if (data.success) setResults(data);
            else alert("Failed to run shadow test: " + data.error);
        } catch (e) {
            alert("Error reaching backtest API");
        } finally {
            setIsSimulating(false);
        }
    };

    const revenueDelta = results ? results.totalNewRevenue - results.totalOriginalRevenue : 0;
    const isPositive = revenueDelta >= 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Time-Travel Backtesting
                        <div className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">Historical Replay</div>
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Build a dynamic pricing rule and simulate it against 600 real cafe orders to predict financial impact — risk free.
                    </p>
                </div>
                <button
                    onClick={runBacktest}
                    disabled={isSimulating}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    {isSimulating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                    {isSimulating ? "Processing 600 Records..." : "Run Shadow Test"}
                </button>
            </div>

            {/* Quick Presets */}
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Presets</p>
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            onClick={() => loadPreset(p)}
                            className="text-sm bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-3 py-1.5 rounded-lg transition-all font-medium"
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rule Builder */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 flex flex-col gap-5">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold pb-3 border-b border-slate-100">
                        <Target className="w-5 h-5 text-indigo-500" /> Rule Builder
                    </div>

                    {/* Condition */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Condition — Target Item</label>
                        <select
                            value={selectedItem}
                            onChange={e => { setSelectedItem(e.target.value); setResults(null); }}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            {MENU_ITEMS.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                        <p className="text-xs text-slate-400 mt-1">If cart contains this item...</p>
                    </div>

                    {/* Action */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Action Event</label>
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => { setActionType('discount'); setResults(null); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${actionType === 'discount' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}
                            >
                                Discount
                            </button>
                            <button
                                onClick={() => { setActionType('increase'); setResults(null); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${actionType === 'increase' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:border-red-300'}`}
                            >
                                Increase
                            </button>
                        </div>

                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => { setValueType('percentage'); setResults(null); }}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${valueType === 'percentage' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                % Percentage
                            </button>
                            <button
                                onClick={() => { setValueType('amount'); setResults(null); }}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${valueType === 'amount' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                $ Flat Amount
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-medium text-sm">{valueType === 'percentage' ? '%' : '$'}</span>
                            <input
                                type="number"
                                min={0}
                                max={valueType === 'percentage' ? 100 : 50}
                                step={valueType === 'percentage' ? 5 : 0.5}
                                value={value}
                                onChange={e => { setValue(Number(e.target.value)); setResults(null); }}
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700">
                        <span className="font-semibold">Rule: </span>
                        Apply a <span className={`font-bold ${actionType === 'discount' ? 'text-emerald-600' : 'text-red-500'}`}>{actionType === 'discount' ? 'discount' : 'markup'}</span> of{' '}
                        <span className="font-bold">{valueType === 'percentage' ? `${value}%` : `$${value}`}</span> to all <span className="font-bold text-indigo-600">{selectedItem}</span> orders.
                    </div>

                    <div className="mt-auto p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800"><b>Shadow Mode</b> — will not affect live checkout traffic until published.</p>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
                    {results ? (
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Projected Impact Analysis</h3>
                                    <p className="text-sm text-slate-500">Evaluated across {results.totalEvaluated} historical cafe orders.</p>
                                </div>
                                <div className="flex gap-4 text-right">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-medium">Current Revenue</div>
                                        <div className="text-xl font-bold text-slate-900">${results.totalOriginalRevenue.toFixed(2)}</div>
                                    </div>
                                    <div className="w-px bg-slate-200" />
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-medium">Projected Revenue</div>
                                        <div className={`text-xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>${results.totalNewRevenue.toFixed(2)}</div>
                                    </div>
                                    <div className="w-px bg-slate-200" />
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-medium">Net Change</div>
                                        <div className={`text-xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>{isPositive ? '+' : ''}${revenueDelta.toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={results.timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorOriginal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} minTickGap={30} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '13px', fontWeight: 500 }} />
                                        <Area type="monotone" dataKey="originalValue" name="Current Model" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorOriginal)" />
                                        <Area type="monotone" dataKey="simulatedValue" name="Proposed Draft" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProjected)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-sm bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100">
                                <Sparkles className="w-4 h-4" />
                                This rule would have triggered on <b>{results.totalTriggered}</b> out of {results.totalEvaluated} past orders.
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[350px]">
                            <Target className="w-16 h-16 mb-4 text-slate-200" />
                            <p className="text-lg font-medium">Awaiting Simulation</p>
                            <p className="text-sm mt-1 max-w-sm text-center">Configure your rule on the left and click 'Run Shadow Test' to replay 600 historical orders.</p>
                            <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
                                <div className="bg-slate-50 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-black text-slate-800">600</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">Historical Orders</div>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-black text-slate-800">45</div>
                                    <div className="text-xs text-slate-500 font-medium mt-0.5">Days of Data</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

