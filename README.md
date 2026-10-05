# FinovoAI

FinovoAI is an intelligent, real-time investment advisor. Unlike standard chatbots that rely on static templates, FinovoAI uses a LangGraph ReAct (Reason + Act) agent to fetch live market data, analyze user profiles, and construct personalized portfolios from scratch.

## Architecture & Tech Stack

This project is split into a decoupled frontend and backend architecture:

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** TailwindCSS & Radix UI
- **State Management:** React Query for asynchronous state and caching
- **Visuals:** Recharts for dynamic portfolio projections

### Backend
- **Framework:** FastAPI (Python)
- **AI Engine:** LangGraph (ReAct agent loop) with specialized financial tools
- **Data Integrations:** CoinGecko API for real-time cryptocurrency data

## Key Features

- **True Agentic AI:** The backend runs a reasoning loop. It forms a hypothesis based on your financial goals, fetches real live data, and refines its answer before responding.
- **Crypto Portfolio Builder:** Recommends specific assets, allocates percentages, and provides best/worst/expected case projections based on historical data.
- **Mutual Fund Analyzer:** Analyzes investment horizons and risk appetites to recommend specific mutual fund categories.
- **Graceful Error Handling:** If the live data fetch fails, the system surfaces clear errors rather than silently hallucinating data.

---

## Running Locally

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment and install the dependencies:
```bash
python -m venv .venv
source .venv/Scripts/activate  # On Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory and add your API keys:
```env
GROQ_API_KEY=your_groq_key_here
COINGECKO_API_KEY=your_coingecko_key_here
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```
The backend will run on `http://localhost:8000`.

### 2. Frontend Setup

Open a second terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install the dependencies:
```bash
npm install
```

Create a `.env` file in the `frontend/` directory (if testing against a remote backend). Otherwise, the app defaults to `http://localhost:8000`.
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Start the Next.js development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:3000`.

---

## Deployment

This repository is structured to be easily deployed on modern cloud platforms.

- **Backend (Render):** Set the Root Directory to `backend` and use `uvicorn app.main:app --host 0.0.0.0 --port $PORT` as the start command.
- **Frontend (Vercel):** Set the Root Directory to `frontend`. Ensure you add `NEXT_PUBLIC_API_BASE_URL` to your Vercel Environment Variables, pointing to your deployed backend URL.
