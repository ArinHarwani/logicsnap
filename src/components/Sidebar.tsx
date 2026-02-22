"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Zap, Target, Network, Coffee, LogOut } from "lucide-react";

const links = [
    { href: "/menu", label: "Live Cafe Menu", icon: Coffee },
    { href: "/rules/new", label: "AI Rule Generator", icon: LayoutDashboard },
    { href: "/live-surge", label: "Live Demand Surge", icon: Zap },
    { href: "/backtest", label: "Backtest Simulator", icon: Target },
    { href: "/blast-radius", label: "Blast Radius Map", icon: Network },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const exitDevMode = () => {
        localStorage.removeItem('devMode');
        router.push('/');
    };

    return (
        <div className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-lg">
                    <Coffee className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-800 tracking-tight">LogicSnap<span className="text-slate-400 font-normal">Cafe.</span></span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? "bg-slate-100 text-emerald-700"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                        AR
                    </div>
                    <div className="text-sm">
                        <div className="font-medium text-slate-800">Admin User</div>
                        <div className="text-slate-500 text-xs">cafe_manager</div>
                    </div>
                </div>
                <button
                    onClick={exitDevMode}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Exit Developer Mode
                </button>
            </div>
        </div>
    );
}

