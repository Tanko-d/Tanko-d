# Tanko Backend — Express API

Node.js / Express API that proxies requests to the **Trustless Work** smart-escrow platform on the Stellar blockchain.

---

## Overview

The backend acts as a secure middleware layer between the Next.js frontend and the Trustless Work API. Its responsibilities are:

- Attach the `Authorization: Bearer <API_KEY>` header to every Trustless Work request (so the key never touches the browser).
- Enforce CORS for the frontend origin.
- Expose a clean REST surface to the frontend.

---

## Getting Started

```bash
# From the monorepo root
npm run dev:backend

# Or directly
cd backend
npm run dev
```

The server starts on the port defined by `PORT` in the root `.env` (default: `3001`).

---

## Environment Variables

Loaded from the monorepo root `.env`. See the root [README](../README.md#environment-variables) for the full list. Backend-specific variables:

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default `3001`) |
| `TRUSTLESS_WORK_API_URL` | Trustless Work base URL |
| `TRUSTLESS_WORK_API_KEY` | API key — never expose to the browser |
| `STELLAR_NETWORK` | `testnet` or `public` |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |

---

## API Reference

Base path: `/api/v1`

### Escrow

#### `POST /escrow/single/create`

Creates a single-milestone escrow on Stellar via Trustless Work.

**Request body:**

```json
{
  "signer": "G...",
  "engagementId": "TANKO-1712345678901",
  "roles": {
    "sender": "G...",
    "approver": "G...",
    "receiver": "G..."
  },
  "amount": "1",
  "description": "Fuel load authorization — 50L Diesel",
  "trustline": {
    "address": "CBIELTK6YBZJU5UP2WWQ",
    "decimals": 10000000
  }
}
```

**Success response (`200`):** Trustless Work returns an `unsignedXDR` transaction string that must be signed with the `signer`'s Freighter wallet and re-submitted.

#### `POST /escrow/approve`

Releases the escrow funds to the receiver after the approver signs.

#### `GET /escrow/:id`

Fetches the current state of an escrow by its engagement ID.

### Wallet

#### `POST /wallet/connect`

Logs a wallet connection event from the frontend. Used for audit/demo purposes.

```json
{ "address": "G..." }
```

---

## Project Structure

```
backend/
├── src/
│   ├── index.ts              ← Express app bootstrap
│   ├── config/
│   │   └── index.ts          ← Typed env-var config
│   ├── routes/
│   │   ├── escrow.routes.ts
│   │   └── wallet.routes.ts
│   ├── controllers/
│   │   ├── escrow.controller.ts
│   │   └── wallet.controller.ts
│   └── services/
│       └── trustlesswork.service.ts
├── package.json
└── tsconfig.json
```

---

## Trustless Work Integration

All calls to `https://dev.api.trustlesswork.com` are made server-side by `trustlesswork.service.ts`. The service attaches the API key from `process.env.TRUSTLESS_WORK_API_KEY` and returns the raw response JSON to the controller, which forwards it to the frontend.

```
Frontend → POST /api/v1/escrow/single/create
               ↓
Backend  → POST https://dev.api.trustlesswork.com/escrow/single/create
           Authorization: Bearer <API_KEY>
               ↓
Trustless Work → { unsignedXDR: "..." }
               ↓
Frontend ← { unsignedXDR: "..." }  (user signs with Freighter)
```
