# 🚛 Tanko — Decentralized Fuel Wallet for Transport Fleets

> **Hack+ Alebrije CDMX 2026** — MVP Demo
> B2B system for managing fleet fuel with smart-contract escrows on the Stellar blockchain via **Trustless Work**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Monorepo Structure](#monorepo-structure)
3. [Data Flow](#data-flow)
4. [Tech Stack](#tech-stack)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Running the App](#running-the-app)
8. [Usage Guide (Demo)](#usage-guide-demo)
9. [Backend API Endpoints](#backend-api-endpoints)
10. [File Structure](#file-structure)
11. [Demo Notes](#demo-notes)

---

## Project Overview

**Tanko** replaces the cash and cloneable corporate fuel cards used by transport companies to manage driver fuel consumption. Instead, it uses **smart-contract escrows** on the Stellar blockchain to ensure funds are only released when the fleet manager explicitly approves a real fuel load.

### System Actors

| Actor | Role | Main Screen |
|---|---|---|
| **Fleet Manager (Jefe)** | Creates and approves escrows | `/dashboard/consumos` |
| **Driver (Conductor)** | Requests funds for a fuel load | `/dashboard/conductor` |

### Core Flow

```
Fleet Manager                  Tanko Backend              Stellar Blockchain
     │                              │                            │
     ├─ Connect Freighter wallet ──▶│                            │
     │                              │                            │
     ├─ Create Escrow ─────────────▶│                            │
     │                              ├─ POST /escrow/single/create▶│
     │                              │◀─ unsigned XDR transaction ─┤
     │◀─ unsignedXDR ───────────────┤                            │
     │                              │                            │
     ├─ Sign with Freighter ───────▶│ (browser extension popup)  │
     │                              │                            │
     ├─ Submit signed XDR ─────────▶│                            │
     │                              ├─ Submit to Horizon ────────▶│
     │◀─ confirmed tx hash ─────────┤◀─ confirmed ───────────────┤
```

---

## Monorepo Structure

```
Tanko_Workspace/
├── .env                  ← shared environment variables (single source of truth)
├── .gitignore
├── package.json          ← npm workspaces root + "npm run dev" script
├── README.md
│
├── frontend/             ← Next.js 14 (App Router)
│   ├── app/
│   │   ├── page.tsx           ← Freighter connection screen
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   └── dashboard/
│   │       ├── layout.tsx          ← sidebar + wallet chip
│   │       ├── page.tsx            ← overview + charts
│   │       ├── consumos/page.tsx   ← fuel logs + Create Escrow button
│   │       ├── conductor/page.tsx  ← driver virtual wallet
│   │       ├── unidades/page.tsx   ← fleet vehicles
│   │       └── usuarios/page.tsx   ← user management
│   ├── components/
│   │   ├── ui/            ← shadcn/ui components
│   │   └── wallet/
│   │       └── wallet-button.tsx   ← dApp wallet chip
│   ├── providers/
│   │   └── wallet-provider.tsx     ← Freighter context
│   └── public/
│       └── tanko-logo.png
│
└── backend/              ← Node.js / Express
    └── src/
        ├── index.ts           ← Express server entry point
        ├── config/index.ts    ← env vars + constants
        ├── routes/            ← API route definitions
        ├── controllers/       ← business logic handlers
        └── services/          ← Trustless Work API calls
```

---

## Data Flow

```
Browser (Next.js :3000)
  │
  │  1. User connects Freighter wallet → publicKey stored in context
  │  2. "Create Escrow" button clicked
  │
  ▼
Express API (:3001)
  │  POST /api/v1/escrow/single/create
  │  Authorization: Bearer <TRUSTLESS_WORK_API_KEY>
  │
  ▼
Trustless Work API (dev.api.trustlesswork.com)
  │  Returns unsigned XDR transaction
  │
  ▼ (future step — sign + submit)
Stellar Horizon Testnet
  └─ Escrow created on-chain
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui |
| Blockchain auth | `@stellar/freighter-api` (browser extension) |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Blockchain | Stellar (Testnet via Horizon) |
| Escrow protocol | Trustless Work API |
| Package manager | npm Workspaces |

---

## Installation

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- [Freighter wallet extension](https://freighter.app) installed in your browser and set to **Testnet**

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd Tanko_Workspace

# 2. Install all dependencies (frontend + backend) in one command
npm install

# 3. Configure environment variables
cp .env.example .env
#    → Fill in TRUSTLESS_WORK_API_KEY with your key from https://app.trustlesswork.com
```

---

## Environment Variables

All variables live in a single `.env` at the **monorepo root**. Both `frontend` and `backend` read from it automatically.

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend port | `3001` |
| `NODE_ENV` | Runtime environment | `development` |
| `TRUSTLESS_WORK_API_URL` | Trustless Work base URL | `https://dev.api.trustlesswork.com` |
| `TRUSTLESS_WORK_API_KEY` | Your API key (get it at app.trustlesswork.com) | `QJ31ARp...` |
| `STELLAR_NETWORK` | `testnet` or `public` | `testnet` |
| `STELLAR_HORIZON_URL` | Stellar Horizon endpoint | `https://horizon-testnet.stellar.org` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend URL used in browser fetch calls | `http://127.0.0.1:3001` |
| `NEXTAUTH_SECRET` | NextAuth secret (change in production) | `your-secret` |
| `NEXTAUTH_URL` | NextAuth base URL | `http://localhost:3000` |

---

## Running the App

```bash
# From the monorepo root — starts both frontend (:3000) and backend (:3001)
npm run dev
```

Individual commands:

```bash
npm run dev:frontend   # Next.js on port 3000
npm run dev:backend    # Express on port 3001
```

---

## Usage Guide (Demo)

### 1. Connect your wallet

Open `http://localhost:3000`. Click **"Connect with Freighter"**. The browser extension popup will appear — approve the connection. You will be redirected to the dashboard.

### 2. View the fleet overview

The `/dashboard` page shows monthly fuel spend, liters loaded, and recent transactions (all mock data for the demo).

### 3. Create an Escrow (Fleet Manager flow)

1. Navigate to **Fuel Logs** in the sidebar.
2. Your connected wallet address appears in a green banner at the top.
3. Click **"Create Escrow (Trustless Work)"**.
4. The button calls `POST /api/v1/escrow/single/create` on the backend.
5. The backend forwards the request to the Trustless Work API, which returns an unsigned XDR transaction.
6. The JSON response (success or error) is displayed in a toast notification.

### 4. Request fuel funds (Driver flow)

1. Navigate to **Driver** in the sidebar.
2. Enter the number of liters needed in the form.
3. The calculated USD amount is shown automatically.
4. Click **"Request funds"** to fire the same escrow-creation endpoint with the driver's payload.

---

## Backend API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/escrow/single/create` | Create a single-milestone escrow via Trustless Work |
| `POST` | `/escrow/approve` | Approve and release escrow funds |
| `GET`  | `/escrow/:id` | Get escrow details by ID |
| `POST` | `/wallet/connect` | Log a wallet connection event |

The backend proxies requests to `https://dev.api.trustlesswork.com` and attaches the `Authorization: Bearer <API_KEY>` header automatically.

---

## File Structure

```
backend/src/
├── index.ts              ← Express app, CORS, port binding
├── config/index.ts       ← Reads .env, exports typed config
├── routes/
│   ├── escrow.routes.ts
│   └── wallet.routes.ts
├── controllers/
│   ├── escrow.controller.ts
│   └── wallet.controller.ts
└── services/
    └── trustlesswork.service.ts
```

---

## Demo Notes

- **All frontend data is mocked** — no real database is used. The escrow API calls are real (Stellar Testnet).
- Freighter must be set to **Testnet** in the extension settings, otherwise the wallet address will be on the wrong network.
- The `engagementId` is generated as `TANKO-<timestamp>` on every button click, so each escrow attempt creates a unique escrow.
- The `amount` field sent to Trustless Work is `"1"` (1 USDC testnet) for safe testing.
- To get testnet USDC, use the [Stellar Laboratory](https://laboratory.stellar.org) to fund your testnet account.
