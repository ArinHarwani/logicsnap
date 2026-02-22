"use client";

import { useState, useEffect } from "react";
import { Coffee, Tag, AlertTriangle, Sparkles, MapPin } from "lucide-react";

export default function MenuPage() {
    const [itemModifiers, setItemModifiers] = useState<Record<string, any[]>>({});
    const [isLive, setIsLive] = useState(false);

    const catalog = [
        { name: 'Signature Cold Brew', basePrice: 5.50, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1517701550927-30cfcb64d55b?auto=format&fit=crop&q=80&w=500', desc: 'Slow-steeped in cool water for 20 hours.' },
        { name: 'Iced Matcha Latte', basePrice: 6.00, category: 'Cold Drinks', image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&q=80&w=500', desc: 'Premium matcha green tea over ice.' },
        { name: 'Artisan Latte', basePrice: 5.00, category: 'Hot Drinks', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=500', desc: 'Dark, rich espresso balanced with steamed milk.' },
        { name: 'Avocado Toast', basePrice: 9.00, category: 'Food', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&q=80&w=500', desc: 'Smashed avocado on sourdough with chili flakes.' },
        { name: 'Butter Croissant', basePrice: 4.50, category: 'Food', image: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88ec?auto=format&fit=crop&q=80&w=500', desc: 'Classic, flaky, buttery pastry baked fresh daily.' },
        { name: 'Breakfast Combo', basePrice: 12.00, category: 'Food', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0188bb2?auto=format&fit=crop&q=80&w=500', desc: 'Any coffee paired with a hearty breakfast sandwich.' },
    ];

    // Poll the LogicSnap rule engine every 5 seconds to check for live pricing changes for EACH item
    useEffect(() => {
        setIsLive(true);
        const fetchLivePrices = async () => {
            try {
                const newModifiers: Record<string, any[]> = {};
                await Promise.all(catalog.map(async (item) => {
                    const res = await fetch('/api/menu-pricing', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            cartTotal: item.basePrice,
                            items: [item.name]
                        })
                    });
                    const data = await res.json();
                    if (data.actions && data.actions.length > 0) {
                        newModifiers[item.name] = data.actions;
                    }
                }));
                setItemModifiers(newModifiers);
            } catch (err) {
                console.error("Pricing sync error", err);
            }
        };

        fetchLivePrices();
        const interval = setInterval(fetchLivePrices, 5000);
        return () => clearInterval(interval);
    }, []);

    const calculateLivePrice = (basePrice: number, itemName: string) => {
        let finalPrice = basePrice;
        let effect = null;
        const modifiers = itemModifiers[itemName] || [];

        modifiers.forEach(mod => {
            if (mod.type === 'surge_pricing' || mod.type === 'surge' || mod.type === 'increase') {
                if (mod.params?.markupPercentage) {
                    finalPrice = finalPrice * (1 + (mod.params.markupPercentage / 100));
                    effect = 'surge';
                } else if (mod.params?.percentage) {
                    finalPrice = finalPrice * (1 + (mod.params.percentage / 100));
                    effect = 'surge';
                } else if (mod.params?.amount) {
                    finalPrice = finalPrice + Number(mod.params.amount);
                    effect = 'surge';
                }
            } else if (mod.type === 'discount' || mod.type === 'decrease') {
                if (mod.params?.percentage) {
                    finalPrice = finalPrice * (1 - (mod.params.percentage / 100));
                    effect = 'discount';
                } else if (mod.params?.amount) {
                    finalPrice = finalPrice - Number(mod.params.amount);
                    effect = 'discount';
                }
            }
        });

        return {
            price: Math.max(0, finalPrice).toFixed(2),
            hasChanged: finalPrice !== basePrice,
            effect
        };
    };

    const hasSurge = Object.values(itemModifiers).flat().some(m => m.type === 'surge_pricing' || m.type === 'surge' || m.type === 'increase');
    const hasDiscount = Object.values(itemModifiers).flat().some(m => m.type === 'discount' || m.type === 'decrease');

    return (
        <div className="max-w-7xl mx-auto pb-24">
            {/* Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-emerald-900 border-4 border-emerald-950/20 text-white mb-12 shadow-2xl">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center" />
                <div className="relative p-12 lg:p-16 flex flex-col items-center text-center">
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
                        LogicSnap Cafe.
                    </h1>
                    <p className="text-emerald-100 text-lg lg:text-xl font-medium max-w-2xl drop-shadow-sm flex items-center gap-2">
                        <MapPin className="w-5 h-5" /> San Francisco, CA • Open until 9 PM
                    </p>
                </div>
            </div>

            {/* Dynamic Pricing Alerts */}
            <div className="mb-10 space-y-3 px-2">
                {hasSurge && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-4 shadow-sm animate-pulse">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600 shrink-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-red-800 font-bold text-lg">High Demand Surge Pricing Active</h3>
                            <p className="text-red-600 font-medium text-sm mt-0.5">We are currently experiencing an unusually high volume of orders. Prices have dynamically adjusted by +20%.</p>
                        </div>
                    </div>
                )}
                {hasDiscount && !hasSurge && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
                            <Tag className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-emerald-800 font-bold text-lg">Promotional Event Active!</h3>
                            <p className="text-emerald-600 font-medium text-sm mt-0.5">Special discounts are currently being dynamically applied to the menu below.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* LogicSnap Engine Indicator */}
            <div className="flex justify-between items-center mb-6 px-2">
                <h2 className="text-2xl font-bold text-slate-800">Menu Catalog</h2>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
                    {isLive ? (
                        <span className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            LogicSnap Pricing Engine: ACTIVE
                        </span>
                    ) : (
                        "Engine Offline"
                    )}
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {catalog.map((item, idx) => {
                    const livePricing = calculateLivePrice(item.basePrice, item.name);
                    return (
                        <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
                            <div className="relative h-56 w-full overflow-hidden flex-shrink-0 bg-slate-100">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover origin-center transition-transform duration-700 group-hover:scale-105"
                                />
                                {livePricing.hasChanged && (
                                    <div className={`absolute top-4 left-4 ${livePricing.effect === 'surge' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur shadow-md flex items-center gap-1.5`}>
                                        <Sparkles className="w-3.5 h-3.5" /> LIVE ADJUSTMENT
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">{item.category}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.name}</h3>
                                <p className="text-slate-500 text-sm font-medium mb-6 flex-1 line-clamp-2">{item.desc}</p>

                                <div className="flex items-end justify-between mt-auto">
                                    <div className="flex flex-col">
                                        {livePricing.hasChanged ? (
                                            <>
                                                <span className="text-sm text-slate-400 font-medium line-through">${item.basePrice.toFixed(2)} Base</span>
                                                <span className={`text-2xl text-slate-900 font-black tracking-tight ${livePricing.effect === 'surge' ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    ${livePricing.price}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-2xl text-slate-900 font-black tracking-tight">${item.basePrice.toFixed(2)}</span>
                                        )}
                                    </div>

                                    <button className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 w-12 h-12 rounded-full flex items-center justify-center transition-colors">
                                        <span className="text-2xl leading-none font-medium mb-1">+</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

