# Crypto Options System - Step-by-Step Implementation Checklist

> Use this file to track progress. Check `[x]` when completed.

---

## STEP 1: Project Foundation Setup ✅ COMPLETED

### 1.1 Create Root Structure
- [x] Create `oiSystem/` root directory
- [x] Create `apps/` directory
- [x] Create `apps/backend/` directory
- [x] Create `apps/frontend/` directory
- [x] Create `firebase/` directory

### 1.2 Initialize Root Files
- [x] Create `package.json` (root)
- [x] Create `.gitignore` (node_modules, .env, service-account.json)
- [x] Create `.env.example`
- [x] Create `docker-compose.yml`
- [x] Create `README.md`

### 1.3 Initialize Git
- [x] Run `git init`
- [x] Create initial commit

---

## STEP 2: Firebase Configuration 🟡 PARTIALLY COMPLETE

### 2.1 Create Firebase Project
- [x] Go to https://console.firebase.google.com
- [x] Create new project (name: `solanathp`)
- [x] Enable Realtime Database (region: asia-southeast1)
- [x] Select "Start in test mode"

### 2.2 Generate Service Account
- [ ] Go to Project Settings → Service Accounts
- [ ] Click "Generate new private key"
- [ ] Save as `firebase/service-account.json`
- [x] Add to `.gitignore` (already done)

### 2.3 Set Database Security Rules
- [ ] Go to Realtime Database → Rules tab: https://console.firebase.google.com/project/solanathp/database/rules
- [x] Rules file created: [firebase/rules.json](firebase/rules.json)
- [ ] Click "Publish" after applying rules

**Rules to apply in Firebase Console:**
```json
{
  "rules": {
    "quikstrike": {
      "$asset": {
        "options": {
          "$expiry": {
            ".read": true,
            ".write": "auth != null"
          }
        }
      }
    }
  }
}
```

### 2.4 Get Firebase Credentials
- [x] Copy Database URL: `https://solanathp-default-rtdb.asia-southeast1.firebasedatabase.app`
- [x] Copy Project ID: `solanathp`
- [x] Copy API Key and frontend config
- [x] Save all to `.env.example`

---

### ⚠️ Manual Tasks Remaining

1. **Download Service Account Key**:
   - Go to: https://console.firebase.google.com/project/solanathp/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Save as: `firebase/service-account.json`

2. **Apply Database Rules**:
   - Go to: https://console.firebase.google.com/project/solanathp/database/rules
   - Copy rules from [firebase/rules.json](firebase/rules.json)
   - Click "Publish"

---

## STEP 3: Backend - Project Initialization

### 3.1 Initialize Backend Project
- [ ] `cd apps/backend`
- [ ] `npm init -y`
- [ ] `npm install` dependencies:
  - [ ] `typescript`
  - [ ] `ts-node`
  - [ ] `@types/node`
  - [ ] `firebase-admin`
  - [ ] `axios`
  - [ ] `node-cron`
  - [ ] `dotenv`
  - [ ] `fastify` (or `express`)
  - [ ] `@types/fastify` (if using fastify)

### 3.2 Backend Configuration
- [ ] Create `tsconfig.json`
- [ ] Create `.env` file with variables:
  - [ ] `FIREBASE_DB_URL`
  - [ ] `FIREBASE_SERVICE_ACCOUNT_PATH`
  - [ ] `BINANCE_API_BASE=https://eapi.binance.com`
  - [ ] `BYBIT_API_BASE=https://api.bybit.com`
  - [ ] `REFRESH_UNDERLYING_SEC=60`
  - [ ] `REFRESH_IV_MIN=5`
  - [ ] `REFRESH_VOL_MIN=5`

### 3.3 Backend Directory Structure
- [ ] Create `src/` directory
- [ ] Create `src/config/` directory
- [ ] Create `src/exchanges/` directory
- [ ] Create `src/services/` directory
- [ ] Create `src/jobs/` directory
- [ ] Create `src/types/` directory
- [ ] Create `src/index.ts` (entry point)

---

## STEP 4: Backend - Exchange Integration

### 4.1 Binance Client
- [ ] Create `src/exchanges/binance-client.ts`
- [ ] Implement `getIndexPrice(asset: string)` method
- [ ] Implement `getOptionsTickers(asset: string)` method
- [ ] Implement `getRecentTrades(symbol: string, fromId?: string)` method
- [ ] Implement `getInstruments(asset: string)` method
- [ ] Add error handling and rate limit handling

### 4.2 Bybit Client (Fallback)
- [ ] Create `src/exchanges/bybit-client.ts`
- [ ] Implement `getOptionsTickers(asset: string)` method
- [ ] Implement `getInstruments(asset: string)` method
- [ ] Add error handling

---

## STEP 5: Backend - Core Services

### 5.1 CME Session Service
- [ ] Create `src/services/cme-session.ts`
- [ ] Implement `convertToChicagoTime(date: Date)` function
- [ ] Implement `getSessionStart()` function
  - [ ] Returns 17:00 CT of current day if after 17:00
  - [ ] Returns 17:00 CT of previous day if before 17:00

### 5.2 Aggregation Service
- [ ] Create `src/services/aggregator.ts`
- [ ] Implement `aggregateByStrike(trades: Trade[], chain: Instrument[])` function
- [ ] Implement `calculateIVSmile(tickers: Ticker[])` function
- [ ] Implement `findATMStrike(price: number, strikes: number[])` function

### 5.3 Firebase Service
- [ ] Create `src/services/firebase.ts`
- [ ] Initialize Firebase Admin
- [ ] Implement `writeSnapshot(asset, expiryKey, data)` function
- [ ] Implement `updateUnderlying(asset, price)` function
- [ ] Implement `getState(asset, expiryKey)` function
- [ ] Implement `saveState(asset, expiryKey, state)` function
- [ ] Implement `updateIV(asset, expiryKey, ivData)` function

---

## STEP 6: Backend - Scheduled Jobs

### 6.1 Underlying Price Job (60s)
- [ ] Create `src/jobs/underlying-job.ts`
- [ ] Implement `updateUnderlyingPrice()` function
- [ ] Fetch from Binance index price API
- [ ] Update Firebase with latest price
- [ ] Set up cron schedule (every 60 seconds)

### 6.2 IV/Greeks Job (5m)
- [ ] Create `src/jobs/iv-job.ts`
- [ ] Implement `updateIVAndGreeks()` function
- [ ] Fetch tickers from Binance
- [ ] Calculate IV by strike
- [ ] Update Firebase with IV data
- [ ] Set up cron schedule (every 5 minutes)

### 6.3 Volume Job (5m)
- [ ] Create `src/jobs/volume-job.ts`
- [ ] Implement `updateIntradayVolume()` function
- [ ] Get last state from Firebase
- [ ] Fetch new trades since lastTradeId
- [ ] Aggregate by strike (call/put)
- [ ] Write complete snapshot to Firebase
- [ ] Save new state (lastTradeId)
- [ ] Set up cron schedule (every 5 minutes)

---

## STEP 7: Backend - Main Entry Point

### 7.1 Entry Point Setup
- [ ] Create `src/index.ts`
- [ ] Import all jobs
- [ ] Load environment variables
- [ ] Initialize Firebase
- [ ] Start all cron jobs
- [ ] Add graceful shutdown handler
- [ ] Add health check endpoint

### 7.2 Backend Dockerfile
- [ ] Create `Dockerfile` in `apps/backend/`
- [ ] Use `node:20-alpine` base image
- [ ] Copy package files
- [ ] Install dependencies
- [ ] Copy source code
- [ ] Build TypeScript
- [ ] Set start command

### 7.3 Test Backend Locally
- [ ] `cd apps/backend`
- [ ] `npm run build`
- [ ] `npm run start`
- [ ] Check console for job execution logs
- [ ] Verify Firebase has data

---

## STEP 8: Frontend - Project Initialization

### 8.1 Initialize Next.js Project
- [ ] `cd apps/frontend`
- [ ] `npx create-next-app@latest . --typescript --tailwind --app`
- [ ] `npm install` additional dependencies:
  - [ ] `firebase`
  - [ ] `recharts`
  - [ ] `date-fns`

### 8.2 Frontend Configuration
- [ ] Create `.env.local` file:
  - [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
  - [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `NEXT_PUBLIC_FIREBASE_DB_URL`
  - [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

### 8.3 Frontend Directory Structure
- [ ] Verify `src/app/` exists (App Router)
- [ ] Create `src/components/` directory
- [ ] Create `src/lib/` directory
- [ ] Create `src/types/` directory

---

## STEP 9: Frontend - Firebase Setup

### 9.1 Firebase Client Setup
- [ ] Create `src/lib/firebase.ts`
- [ ] Initialize Firebase app
- [ ] Export `rtdb` reference
- [ ] Create helper function `subscribeToOptions(asset, expiryKey, callback)`

### 9.2 Types
- [ ] Create `src/types/options.ts`
- [ ] Define `OptionsSnapshot` interface
- [ ] Define `StrikeData` interface
- [ ] Define `Metadata` interface

---

## STEP 10: Frontend - Components

### 10.1 Layout Component
- [ ] Create `src/components/Layout.tsx`
- [ ] Add header with title
- [ ] Add asset selector (BTC/ETH)
- [ ] Add expiry selector

### 10.2 Chart Component
- [ ] Create `src/components/OptionsChart.tsx`
- [ ] Import Recharts components (BarChart, Line, ReferenceLine)
- [ ] Create chart layout:
  - [ ] X-axis: Strikes
  - [ ] Left Y-axis: Volume
  - [ ] Right Y-axis: IV
  - [ ] Green bars: Call volume
  - [ ] Red bars: Put volume
  - [ ] Yellow line: IV smile
  - [ ] Dashed line: Underlying price (ATM)

### 10.3 Stats Component
- [ ] Create `src/components/StatsPanel.tsx`
- [ ] Display underlying price
- [ ] Display ATM strike
- [ ] Display total call volume
- [ ] Display total put volume
- [ ] Display put/call ratio

---

## STEP 11: Frontend - Main Page

### 11.1 Page Implementation
- [ ] Update `src/app/page.tsx`
- [ ] Add state for selected asset
- [ ] Add state for selected expiry
- [ ] Add state for options data
- [ ] Set up Firebase subscription on mount
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Render chart with data

### 11.2 Styling
- [ ] Apply Tailwind classes for layout
- [ ] Add responsive design (mobile-friendly)
- [ ] Add dark mode (optional)

### 11.3 Frontend Dockerfile
- [ ] Create `Dockerfile` in `apps/frontend/`
- [ ] Use multi-stage build
- [ ] Stage 1: Build Next.js
- [ ] Stage 2: Serve with nginx or standalone

---

## STEP 12: Docker Deployment Setup

### 12.1 Update docker-compose.yml
- [ ] Add `backend` service:
  - [ ] Build context: `./apps/backend`
  - [ ] Environment variables from `.env`
  - [ ] Restart policy: `unless-stopped`
- [ ] Add `frontend` service:
  - [ ] Build context: `./apps/frontend`
  - [ ] Port mapping: `3000:3000`
  - [ ] Restart policy: `unless-stopped`

### 12.2 Nginx Config (for frontend)
- [ ] Create `apps/frontend/nginx.conf`
- [ ] Configure reverse proxy for Next.js
- [ ] Add gzip compression

---

## STEP 13: Local Testing

### 13.1 Backend Testing
- [ ] Start backend: `cd apps/backend && npm run dev`
- [ ] Check logs for all 3 jobs
- [ ] Verify Firebase database has data
- [ ] Check `/quikstrike/BTC/options/...` paths

### 13.2 Frontend Testing
- [ ] Start frontend: `cd apps/frontend && npm run dev`
- [ ] Open http://localhost:3000
- [ ] Verify chart displays
- [ ] Check for real-time updates (wait 5 min)

### 13.3 Docker Testing
- [ ] Run `docker-compose build`
- [ ] Run `docker-compose up`
- [ ] Verify both services start
- [ ] Test frontend at http://localhost:3000

---

## STEP 14: Oracle Cloud Deployment

### 14.1 Oracle Cloud Setup
- [ ] Create Oracle Cloud account (free tier)
- [ ] Create 2 AMD VMs (always free)
  - [ ] VM 1: Backend (1 GB RAM, 1 OCPU)
  - [ ] VM 2: Frontend (1 GB RAM, 1 OCPU)

### 14.2 Backend Deployment
- [ ] SSH into VM 1
- [ ] Install Docker and Docker Compose
- [ ] Clone repository
- [ ] Copy `.env` file
- [ ] Copy `firebase/service-account.json`
- [ ] Run `docker-compose up -d backend`
- [ ] Verify container is running

### 14.3 Frontend Deployment
- [ ] SSH into VM 2
- [ ] Install Docker and Docker Compose
- [ ] Clone repository
- [ ] Copy `.env.local` file
- [ ] Run `docker-compose up -d frontend`
- [ ] Verify container is running

### 14.4 Networking
- [ ] Configure Oracle Security List / VCN
- [ ] Open port 80 for frontend
- [ ] (Optional) Set up domain name

---

## STEP 15: Monitoring & Documentation

### 15.1 Logging
- [ ] Add structured logging to backend (pino or winston)
- [ ] Add log levels (info, warn, error)
- [ ] Log job execution timestamps
- [ ] Log API call failures

### 15.2 Health Checks
- [ ] Add `/health` endpoint to backend
- [ ] Return uptime, last job runs
- [ ] Monitor Firebase connectivity

### 15.3 Documentation
- [ ] Update `README.md` with:
  - [ ] Project overview
  - [ ] Setup instructions
  - [ ] Environment variables list
  - [ ] Docker commands
  - [ ] Troubleshooting section

---

## STEP 16: Post-Deployment Verification

### 16.1 End-to-End Test
- [ ] Access frontend URL
- [ ] Verify chart loads
- [ ] Verify data updates every 5 minutes
- [ ] Test expiry selector
- [ ] Test asset selector (if multiple)

### 16.2 Performance Check
- [ ] Monitor Oracle VM CPU usage
- [ ] Monitor Firebase read/write operations
- [ ] Check for memory leaks
- [ ] Verify staying within free tier limits

---

## FINAL CHECKLIST

- [ ] All jobs running without errors
- [ ] Firebase data updating correctly
- [ ] Frontend displays data accurately
- [ ] Real-time updates working
- [ ] Docker containers auto-restart on reboot
- [ ] Logs are being captured
- [ ] Documentation is complete
- [ ] Code is pushed to Git repository

---

## Summary

| Category | Steps |
|----------|-------|
| Foundation | 3 |
| Firebase | 4 |
| Backend Init | 3 |
| Exchange Integration | 2 |
| Backend Services | 3 |
| Backend Jobs | 3 |
| Backend Entry | 3 |
| Frontend Init | 3 |
| Frontend Firebase | 2 |
| Frontend Components | 3 |
| Frontend Page | 3 |
| Docker Setup | 2 |
| Local Testing | 3 |
| Oracle Deploy | 4 |
| Monitoring | 3 |
| Final Verify | 2 |
| **TOTAL** | **50 steps** |

---

## Progress Tracker

```
Step 1:     [██████████] 100% (Project Foundation) ✅
Step 2:     [██████░░░░] 70% (Firebase Config) 🟡 2 manual tasks remaining
Step 3-5:   [░░░░░░░░░░] 0% (Backend Init)
Step 6-10:  [░░░░░░░░░░] 0% (Backend Core)
Step 11-13: [░░░░░░░░░░] 0% (Frontend)
Step 14-16: [░░░░░░░░░░] 0% (Deploy)
```

*Last updated: 2026-01-02*
