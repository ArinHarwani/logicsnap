"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Coffee } from "lucide-react";

export default function NewRulePage() {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedJSON, setGeneratedJSON] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGeneratedJSON(null);
        setError(null);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate rule');
            }

            setGeneratedJSON(data.json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedJSON) {
            navigator.clipboard.writeText(generatedJSON);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    AI Rule Generator
                    <div className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Powered by Gemini
                    </div>
                </h1>
                <p className="text-slate-500 mt-2">Describe your new cafe pricing rule in plain English to generate a strict JSON schema.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <label className="text-sm font-semibold text-slate-700">Cafe Business Logic</label>
                <div className="flex gap-4">
                    <input
                        type="text"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        placeholder="e.g. Give a 15% discount if a customer orders a Cold Brew and a Bagel before 10 AM..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin" />
                                Drafting...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Generate <Sparkles className="w-4 h-4 text-emerald-400" />
                            </span>
                        )}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {generatedJSON && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-700">Generated Rule Schema</span>
                            <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded">json-rules-engine verified</span>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="text-slate-500 hover:text-slate-900 transition-colors p-2 hover:bg-slate-200 rounded-lg flex items-center gap-2 pointer-events-auto"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="p-6 bg-slate-900 overflow-x-auto">
                        <pre className="text-sm text-emerald-400 font-mono leading-relaxed">
                            <code>{generatedJSON}</code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

