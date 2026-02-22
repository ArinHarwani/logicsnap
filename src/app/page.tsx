"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEMO_KEY = "LOGICSNAP-DEMO";

const MENU = [
  {
    category: "☕ Hot Drinks",
    items: [
      { name: "Artisan Latte", price: "5.50", desc: "Smooth espresso with steamed oat milk" },
      { name: "Flat White", price: "4.80", desc: "Double ristretto, velvety microfoam" },
      { name: "Cappuccino", price: "4.50", desc: "Classic Italian with dry foam top" },
    ]
  },
  {
    category: "🧊 Cold Drinks",
    items: [
      { name: "Signature Cold Brew", price: "5.50", desc: "18-hour slow-drip, served over ice" },
      { name: "Iced Matcha Latte", price: "6.00", desc: "Ceremonial grade matcha, almond milk" },
      { name: "Passion Fruit Lemonade", price: "5.00", desc: "Fresh passion fruit, house lemonade" },
    ]
  },
  {
    category: "🍽️ Food",
    items: [
      { name: "Avocado Toast", price: "9.00", desc: "Sourdough, smashed avo, chili flakes, poached egg" },
      { name: "Breakfast Combo", price: "12.00", desc: "Eggs your way, toast, hash brown & coffee" },
      { name: "Butter Croissant", price: "3.50", desc: "Classic French, baked fresh each morning" },
    ]
  }
];

export default function CafeHomePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('devMode') === 'true') {
      router.replace('/live-surge');
    }
  }, []);

  useEffect(() => {
    if (showModal) setTimeout(() => inputRef.current?.focus(), 100);
  }, [showModal]);

  const handleUnlock = () => {
    if (apiKey.trim().toUpperCase() === DEMO_KEY) {
      setUnlocking(true);
      setError("");
      setTimeout(() => {
        localStorage.setItem('devMode', 'true');
        router.push('/live-surge');
      }, 800);
    } else {
      setError("Invalid API key. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="text-xl font-bold text-stone-800 tracking-tight">The LogicSnap <span className="text-emerald-600">Café</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-stone-600">
            <a href="#menu" className="hover:text-emerald-600 transition-colors">Menu</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">About</a>
            <a href="#visit" className="hover:text-emerald-600 transition-colors">Visit</a>
          </div>
          <a href="#menu" className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-emerald-700 transition-colors">Order Now</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-28 md:py-36 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Est. 2024 · Specialty Coffee</div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
              Brewed with<br /><span className="text-emerald-400">Intelligence.</span>
            </h1>
            <p className="text-lg text-stone-300 max-w-md mb-8">From slow-drip cold brews to fresh avocado toast — every cup and plate crafted for the discerning palate.</p>
            <div className="flex gap-4 flex-wrap justify-center md:justify-start">
              <a href="#menu" className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3 rounded-full transition-colors">View Menu</a>
              <a href="#about" className="border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-full transition-colors">Our Story</a>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-amber-600/30 rounded-full blur-3xl" />
              <div className="relative z-10 w-full h-full flex items-center justify-center text-[160px] select-none">☕</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-emerald-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-3 gap-4 text-center">
          {[["600+", "Orders Daily"], ["45", "Days Running"], ["4.9 ⭐", "Avg Rating"]].map(([val, label]) => (
            <div key={label}>
              <div className="text-2xl font-black">{val}</div>
              <div className="text-xs text-emerald-100 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Menu */}
      <section id="menu" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-stone-900 mb-3">Our Menu</h2>
          <p className="text-stone-500 max-w-md mx-auto">Thoughtfully curated, seasonally inspired. Prices may dynamically adjust based on demand.</p>
        </div>
        <div className="space-y-12">
          {MENU.map(section => (
            <div key={section.category}>
              <h3 className="text-lg font-bold text-stone-700 mb-4 pb-2 border-b border-stone-200">{section.category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.items.map(item => (
                  <div key={item.name} className="bg-white rounded-2xl border border-stone-200 p-5 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">{item.name}</h4>
                      <span className="font-black text-emerald-600 text-lg">${item.price}</span>
                    </div>
                    <p className="text-sm text-stone-500">{item.desc}</p>
                    <button className="mt-4 w-full bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-700 text-sm font-semibold py-2 rounded-xl transition-all">
                      Add to Order
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-stone-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3">Our Philosophy</div>
            <h2 className="text-4xl font-black mb-4">More than coffee.<br />It's a <span className="text-emerald-400">system</span>.</h2>
            <p className="text-stone-400 leading-relaxed mb-4">We believe every cup deserves precision — from bean sourcing to dynamic pricing that responds to real demand in real time.</p>
            <p className="text-stone-400 leading-relaxed">Our cafe is powered by a live rules engine that autonomously adjusts prices during peak hours, rewards loyal customers, and ensures you always get the fairest deal.</p>
          </div>
          <div className="bg-stone-800 rounded-3xl p-8 border border-stone-700">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">Smart Pricing Engine</h3>
            <p className="text-stone-400 text-sm mb-4">Our menu prices are powered by a live AI rules engine that monitors demand in real-time.</p>
            <div className="space-y-2 text-sm">
              {["Dynamic surge pricing during rush hours", "Loyalty discounts for Gold members", "Weekend premium menu pricing", "AI-generated rules, deployed in seconds"].map(f => (
                <div key={f} className="flex items-center gap-2 text-stone-300">
                  <span className="text-emerald-400 font-bold">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-black text-stone-900 mb-3">Come Visit Us</h2>
        <p className="text-stone-500 mb-8">Open daily · Mon–Fri 7am–6pm · Sat–Sun 8am–5pm</p>
        <div className="inline-block bg-stone-100 rounded-2xl px-10 py-6 text-stone-700 font-medium">
          📍 42 Innovation Drive, Cafe District, Mumbai
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-500">
          <span>© 2024 The LogicSnap Café. All rights reserved.</span>
          <span>Powered by intelligent pricing rules.</span>
        </div>
      </footer>

      {/* Floating Developer Access Button */}
      <button
        onClick={() => { setShowModal(true); setError(""); setApiKey(""); }}
        className="fixed bottom-6 right-6 z-50 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-stone-700 transition-all hover:scale-105 flex items-center gap-2"
      >
        <span className="text-amber-400">🔐</span> Developer Access
      </button>

      {/* Unlock Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className={`bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transition-all ${shake ? 'animate-[shake_0.4s_ease]' : ''}`}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🔐</div>
              <h2 className="text-2xl font-black text-stone-900">Developer Mode</h2>
              <p className="text-stone-500 text-sm mt-1">Enter your LogicSnap API key to access the pricing intelligence dashboard.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">API Key</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                  placeholder="LOGICSNAP-XXXX"
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-mono font-bold tracking-widest focus:outline-none transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-stone-200 focus:border-emerald-500'}`}
                />
                {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
              </div>

              <button
                onClick={handleUnlock}
                disabled={unlocking || !apiKey.trim()}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {unlocking ? (
                  <><span className="animate-spin">⚙️</span> Unlocking...</>
                ) : (
                  <><span>⚡</span> Access Dashboard</>
                )}
              </button>

              <p className="text-center text-xs text-stone-400">
                Access grants full pricing rule management, backtesting & live surge controls.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); }
                    40% { transform: translateX(8px); }
                    60% { transform: translateX(-6px); }
                    80% { transform: translateX(6px); }
                }
            `}</style>
    </div>
  );
}

