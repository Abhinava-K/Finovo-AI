# FinovoAI Frontend

> Investment Advice That Thinks Before It Recommends.

A premium fintech frontend built with Next.js 15 that provides AI-powered investment intelligence, mutual fund recommendations, crypto portfolio analysis, and conversational financial guidance.

---

## Overview

FinovoAI is an AI-powered investment intelligence platform designed to help users make informed investment decisions through:

- Personalized Mutual Fund Recommendations
- Crypto Portfolio Analysis
- AI Investment Advisor
- Portfolio Insights & Analytics
- Risk-Based Asset Allocation
- Projection & Rebalancing Visualization

This frontend consumes a FastAPI backend that provides recommendation engines, AI agent responses, portfolio optimization, and live market intelligence.

---

## Features

### Mutual Fund Advisor

- Risk profiling
- Asset allocation visualization
- Fund recommendations
- CAGR analysis
- Future projections
- Rebalancing timeline
- AI explanations

---

### Crypto Portfolio Advisor

- Portfolio allocation
- Drawdown-based strategy generation
- Volatility analysis
- Return simulations
- Risk assessment
- Market intelligence

---

### AI Investment Advisor

- Conversational financial assistant
- Markdown rendering
- Table rendering
- Suggested prompts
- Investment comparisons
- Mutual fund research
- Crypto market insights

---

### Investment Dashboard

- Portfolio Overview
- Asset Allocation
- Portfolio Health Metrics
- AI Confidence Indicators
- Market Sentiment
- Performance Analytics
- Investment Insights

---

## Tech Stack

### Framework

- Next.js 15
- React
- TypeScript

### Styling

- Tailwind CSS
- shadcn/ui
- Framer Motion

### Data Layer

- React Query
- Axios
- Zod
- React Hook Form

### Visualization

- Recharts

### Content Rendering

- React Markdown
- remark-gfm

---

## Project Structure

```text
frontend/
│
├── app/
├── components/
├── hooks/
├── lib/
├── public/
├── types/
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── .env.example
```

---

## Pages

| Route | Description |
|---------|-------------|
| `/` | Landing Page |
| `/dashboard` | Investment Dashboard |
| `/mutual-funds` | Mutual Fund Advisor |
| `/crypto` | Crypto Portfolio Advisor |
| `/advisor` | AI Investment Advisor |
| `/about` | About Platform |

---

## Backend Integration

The frontend integrates with the following backend endpoints:

### Mutual Fund Recommendations

```http
POST /api/mf/recommend
```

### Crypto Recommendations

```http
POST /api/crypto/recommend
```

### AI Advisor

```http
POST /api/agent/chat
```

---

## Environment Variables

Create:

```bash
.env.local
```

Add:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Local Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Production Build

Create production build:

```bash
npm run build
```

Run production server:

```bash
npm run start
```

---

## Deployment

Recommended platforms:

- Vercel
- Netlify
- AWS Amplify
- Azure Static Web Apps

Ensure:

```env
NEXT_PUBLIC_API_BASE_URL=<backend-url>
```

is configured in deployment environment variables.

---

## Team


**Gaurish Budhiraja**
**Abhinava K.**
**Chandramani Kumar**
**Atharv**

---

## Disclaimer

FinovoAI is intended for educational, research, and demonstration purposes.

The platform provides AI-assisted investment insights and should not be considered professional financial advice.

Always consult a qualified financial advisor before making investment decisions.

---

Built with Next.js, FastAPI, LangGraph, and Groq AI.
