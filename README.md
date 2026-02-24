# ⚡ LogicSnap — The Intelligent Cafe Pricing Engine

## 🏁 JUDGES: Quick Start

1. Ensure you have Node.js v18+ installed.
2. In the project root, run:
   ```bash
   npm run judge-setup
   ```
3. When prompted, enter the **Setup Password** provided to you by the team.
   *(This will securely decrypt the keys, install dependencies, seed demo data, and start the app automatically).*
4. Open **http://localhost:3000** → click **"🔐 Developer Access"** → enter developer key: **`LOGICSNAP-DEMO`**

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

# 2. Run the secure setup utility
npm run judge-setup

# 3. Enter the setup password
#    → The script will auto-decrypt the `.env` keys, 
#      install dependencies, seed data, and start the server.
```

> 📋 **Note:** You must obtain the **Setup Password** directly from the author. API keys are safely encrypted out of plain text.

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
