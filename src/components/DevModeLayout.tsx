"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

// Routes that are part of the developer dashboard (show sidebar)
const DEV_ROUTES = ['/live-surge', '/menu', '/rules', '/backtest', '/blast-radius'];

export function DevModeLayout({ children }: { children: React.ReactNode }) {
    const [isDevMode, setIsDevMode] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        setIsDevMode(localStorage.getItem('devMode') === 'true');
    }, [pathname]); // re-check on route change

    if (!mounted) return <>{children}</>;

    const isDevRoute = DEV_ROUTES.some(r => pathname.startsWith(r));
    const showSidebar = isDevMode && isDevRoute;

    if (showSidebar) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 p-8 bg-slate-50 overflow-auto">
                    {children}
                </main>
            </div>
        );
    }

    return <>{children}</>;
}

