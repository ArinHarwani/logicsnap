# ⚡ LogicSnap — The Intelligent Cafe Pricing Engine

## 🏁 JUDGES: Quick Start (One Click)
> **Double-click `JUDGE_SETUP.bat`** in the project root.  
> It auto-installs everything, seeds 600 demo orders, and opens the server.  
> Then open **http://localhost:3000** → click **"🔐 Developer Access"** → enter key: **`LOGICSNAP-DEMO`**

---

> *"What if a marketing manager could deploy enterprise-grade dynamic pricing rules — without writing a single line of code?"*

LogicSnap is a **real-time rule engine** that empowers non-technical operators to write, backtest, and deploy dynamic pricing rules to a live cafe menu — all through a natural language AI interface.

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

- **Framework:** Next.js 14 (App Router)
- **Rule Engine:** `json-rules-engine`
- **AI:** Google Gemini (`@google/generative-ai`)
- **Database:** Supabase (PostgreSQL + Row Level Security)
- **UI:** Tailwind CSS, Recharts, ReactFlow
- **Language:** TypeScript

---

## 🔑 Developer Mode

The public-facing site is a normal cafe website. To access the developer dashboard:

1. Click **"🔐 Developer Access"** in the bottom-right corner
2. Enter API key: **`LOGICSNAP-DEMO`**
3. You now have full access to all 5 features

---

## 🏃 How to Run Locally

### Prerequisites
- Node.js 18+
- A Supabase project with the schema from `supabase/migrations/00001_initial_schema.sql`
- A Google Gemini API key

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd logic-snap

# 2. Install dependencies
npm install

# 3. Configure environment variables
#    → Open JUDGES_KEYS.txt (included in this repo)
#    → Copy .env.example to .env
#    → Paste the keys from JUDGES_KEYS.txt into .env
cp .env.example .env

# 4. Seed demo data (required for full feature demo)
node scripts/seed-demo.js

# 5. Start the development server
npm run dev
```

> 📋 **All API keys are pre-provided in `JUDGES_KEYS.txt`** — no sign-ups required.

Open [http://localhost:3000](http://localhost:3000) to see the cafe homepage.

### Environment Variables

| Variable | Description | Where to Get It |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (backend only) | Supabase Dashboard → Settings → API |

---

## 📊 Demo Data

Run `node scripts/seed-demo.js` to populate the database with:
- **600 realistic cafe orders** over 45 days (morning-rush weighted)
- **8 recurring customer profiles** with loyalty tiers
- **3 pre-built active pricing rules** for demonstration

---

## 👥 Team

Built for **[Hackathon Name]** by **Arin Harwani**

---

*LogicSnap — Rule the market, not the codebase.*
