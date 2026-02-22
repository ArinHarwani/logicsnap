"use client";

import { useState, useCallback } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, ScanSearch, ShieldAlert, FileJson, Loader2 } from "lucide-react";

export default function BlastRadiusPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [hasConflicts, setHasConflicts] = useState(false);

    const scanDependencies = async () => {
        setIsScanning(true);
        setHasConflicts(false);

        try {
            const res = await fetch('/api/blast-radius');
            const data = await res.json();

            if (data.success) {
                setNodes(data.graph.nodes.map((node: any) => ({
                    ...node,
                    style: {
                        background: node.data.type === 'rule' ? '#ffffff' : '#f8fafc',
                        border: node.data.type === 'rule' ? '2px solid #10b981' : (node.data.isColliding ? '2px solid #ef4444' : '2px solid #cbd5e1'),
                        borderRadius: '12px',
                        padding: '16px',
                        width: 250,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        color: '#0f172a',
                        fontWeight: '600'
                    }
                })));

                setEdges(data.graph.edges.map((edge: any) => ({
                    ...edge,
                    animated: edge.data.isColliding,
                    style: { stroke: edge.data.isColliding ? '#ef4444' : '#94a3b8', strokeWidth: edge.data.isColliding ? 3 : 2 }
                })));

                setHasConflicts(data.graph.nodes.some((n: any) => n.data.isColliding));
            } else {
                alert("Failed to scan dependencies: " + data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Error reaching blast-radius API");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-[1400px] mx-auto">
            <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        Blast Radius Map
                        <div className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            Collision Detection
                        </div>
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        Visually map the JSON schemas of all active pricing rules. Detect overlapping property constraints before they cause disastrous point-of-sale conflicts.
                    </p>
                </div>

                <button
                    onClick={scanDependencies}
                    disabled={isScanning}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanSearch className="w-5 h-5" />}
                    {isScanning ? "Scanning Matrix..." : "Scan Architecture"}
                </button>
            </div>

            {hasConflicts && (
                <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-xl flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 font-semibold">
                        <ShieldAlert className="w-6 h-6" />
                        HIGH RISK OVERLAP DETECTED
                    </div>
                    <span className="text-sm font-medium">Multiple active JSON rules are mutating or listening to the exact same checkout property.</span>
                </div>
            )}

            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">
                {nodes.length === 0 ? (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 absolute inset-0 z-10">
                        <Network className="w-16 h-16 mb-4 text-slate-300" />
                        <p className="text-lg font-medium text-slate-600">No Graph Generated</p>
                        <p className="text-sm mt-1 max-w-sm text-center">Click 'Scan Architecture' to deeply parse the AST parameters of your live Supabase database rules.</p>
                    </div>
                ) : null}

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    className="bg-slate-50"
                >
                    <Background color="#cbd5e1" gap={16} />
                    <Controls className="bg-white border border-slate-200 text-slate-600 shadow-sm" />
                    <MiniMap className="border-2 border-slate-200 rounded-lg shadow-sm" />
                </ReactFlow>

                <div className="absolute bottom-6 left-6 flex gap-4 bg-white/90 backdrop-blur p-4 rounded-xl border border-slate-200 shadow-sm z-20">
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <div className="w-4 h-4 rounded-md border-2 border-emerald-500 bg-white" /> Rule Engine Target
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <div className="w-4 h-4 rounded-md border-2 border-slate-300 bg-slate-50" /> Data Fact Dependency
                    </div>
                    <div className="flex items-center gap-2 text-sm text-rose-600 font-medium ml-4 border-l pl-4 border-slate-200">
                        <div className="w-4 h-4 border-t-2 border-rose-500" /> Conflicting Path
                    </div>
                </div>
            </div>
        </div>
    );
}

