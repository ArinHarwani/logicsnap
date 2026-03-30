# ⚡ LogicSnap — The Intelligent Cafe Pricing Engine

> *"What if a marketing manager could deploy enterprise-grade dynamic pricing rules — without writing a single line of code?"*

LogicSnap is a **real-time rule engine** that empowers non-technical operators to write, backtest, and deploy dynamic pricing rules to a live cafe menu — all through a natural language AI interface.

---

## 🌐 Live Demo

**👉 [https://logic-snap.vercel.app](https://logic-snap.vercel.app)**

> Open the link above to instantly access the live deployed application — no setup required!
>
> To access the developer dashboard: Click **"🔐 Developer Access"** in the bottom-right corner → Enter API key: **`LOGICSNAP-DEMO`**

---

## 🎯 The Problem

Modern businesses need real-time pricing intelligence (surge pricing, loyalty discounts, demand-based markups). But deploying these rules traditionally requires:
- A data scientist to model the logic
- A developer to ship the code  
- A DevOps cycle to deploy it safely

**LogicSnap eliminates all three bottlenecks.**

---

## 🚀 5 Core Features

| Feature | What It Does |
|---|---|
| **🍽️ Live Cafe Menu** | Public-facing cafe website. Prices update live via the rules engine every 5 seconds. |
| **🤖 AI Rule Generator** | Type a pricing instruction in plain English → Gemini AI converts it to a JSON rule schema → instantly deployed to production. |
| **📈 Live Demand Surge** | Real-time order volume monitor using Z-Score statistics. Detects demand anomalies and auto-activates surge pricing — mirrored on the live menu. |
| **⏪ Time-Travel Backtesting** | Replay a new pricing rule against 600 historical orders to predict revenue impact before publishing it. |
| **🔥 Blast Radius Map** | Visual dependency graph of all active rules. Detects fact collisions (conflicting rules) before they cause point-of-sale errors. |

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Rule Engine:** `json-rules-engine`
- **AI:** Google Gemini (`@google/generative-ai`)
- **Database:** Supabase (PostgreSQL + Row Level Security)
- **UI:** Tailwind CSS, Recharts, ReactFlow
- **Hosting:** Vercel
- **Language:** TypeScript

---

## 🔑 Developer Mode

The public-facing site is a normal cafe website. To access the developer dashboard:

1. Click **"🔐 Developer Access"** in the bottom-right corner
2. Enter API key: **`LOGICSNAP-DEMO`**
3. You now have full access to all 5 features

---

## 📊 Demo Data

The database is pre-seeded with:
- **1,100 realistic cafe orders** over 45 days (morning-rush weighted)
- **8 recurring customer profiles** with loyalty tiers
- **3 pre-built active pricing rules** for demonstration

---

## 🏃 Manual Setup (Optional)

> **Note:** The app is already deployed and accessible at [https://logic-snap.vercel.app](https://logic-snap.vercel.app). The instructions below are only needed if you want to run it locally.

### Prerequisites
- Node.js 18+
- A Supabase project with the schema from `supabase/migrations/00001_initial_schema.sql`
- A Google Gemini API key

### Quick Start (Encrypted Setup)

```bash
# 1. Clone the repository
git clone https://github.com/ArinHarwani/logicsnap.git
cd logic-snap

# 2. Run the secure setup utility
npm run judge-setup

# 3. Enter the setup password
#    → The script will auto-decrypt the `.env` keys, 
#      install dependencies, seed data, and start the server.
```

> 📋 **Note:** You must obtain the **Setup Password** directly from the author. API keys are safely encrypted out of plain text.

### Manual Setup

```bash
# 1. Clone the repository
git clone https://github.com/ArinHarwani/logicsnap.git
cd logic-snap

# 2. Install dependencies
npm install

# 3. Create a .env.local file with mandatory variables
#    (copy from .env.example and fill in your keys)
cp .env.example .env.local

# 4. Seed demo data
node scripts/seed-demo.js

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the cafe homepage.

### Environment Variables

| Variable | Description | Where to Get It |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (backend only) | Supabase Dashboard → Settings → API |

---

## 👥 Team

Built for **[Hackathon Name]** by **Arin Harwani**

---

*LogicSnap — Rule the market, not the codebase.*
