# Crypto Options Analysis System - Implementation Plan

## Project Overview
Build a QuikStrike-style cryptocurrency options analysis platform with real-time data visualization, optimized for Oracle Cloud Free Tier deployment.

### Architecture Pattern
```
┌─────────────────┐     Polling      ┌──────────────────┐
│                 │ ──────────────>  │                  │
│  Binance/Bybit  │   (60s/5m)       │  Backend API     │
│   Exchange APIs │ <──────────────  │  (Node.js)       │
│                 │   Aggregation    │                  │
└─────────────────┘                  └────────┬─────────┘
                                             │
                                             │ Write Snapshot
                                             ▼
                                    ┌──────────────────┐
                                    │  Firebase RTDB   │
                                    │  (Real-time DB)  │
                                    └────────┬─────────┘
                                             │
                                             │ Subscribe (onValue)
                                             ▼
                                    ┌──────────────────┐
                                    │   Frontend       │
                                    │   (Next.js)      │
                                    │   + Charts       │
                                    └──────────────────┘
```

---

## Project Structure

```
oiSystem/
├── apps/
│   ├── backend/                 # Node.js/TypeScript Backend
│   │   ├── src/
│   │   │   ├── config/          # Environment variables, constants
│   │   │   ├── exchanges/       # Binance/Bybit API clients
│   │   │   ├── services/        # Aggregation, CME session logic
│   │   │   ├── jobs/            # Scheduled jobs (60s, 5m loops)
│   │   │   ├── types/           # TypeScript interfaces
│   │   │   └── index.ts         # Entry point
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   └── frontend/                # Next.js Frontend
│       ├── src/
│       │   ├── app/             # Next.js App Router
│       │   ├── components/      # Chart components, UI
│       │   ├── lib/             # Firebase client, utilities
│       │   └── types/           # TypeScript interfaces
│       ├── package.json
│       ├── next.config.js
│       └── Dockerfile
│
├── firebase/
│   ├── firestore.rules         # Firebase security rules
│   └── service-account.json    # Backend credentials (gitignored)
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Firebase Realtime Database Schema

### 1. Latest Snapshot (Primary read path for frontend)
```
/quikstrike/{asset}/options/{expiryKey}/latest
{
  "updatedAt": 1735789200000,
  "sessionStart": 1735740000000,
  "underlyingPrice": 97500.50,
  "atmStrike": 97500,
  "strikes": [90000, 92500, 95000, 97500, 100000, 102500, 105000],
  "callVolByStrike": [1450, 2100, 3800, 5200, 4100, 2800, 1500],
  "putVolByStrike": [800, 1200, 1800, 2400, 3200, 4100, 5200],
  "ivByStrike": [0.52, 0.48, 0.45, 0.43, 0.46, 0.49, 0.54],
  "meta": {
    "source": "binance",
    "fallback": "bybit",
    "expiries": ["2026-01-24", "2026-02-28"]
  }
}
```

### 2. State Tracking (For incremental aggregation)
```
/quikstrike/{asset}/options/{expiryKey}/state
{
  "lastTradeId": "485729300001",
  "lastTradeTs": 1735789185000,
  "lastRunAt": 1735789200000,
  "chainVersion": 3
}
```

### 3. Chain Cache (Optional - instrument lookup)
```
/quikstrike/{asset}/options/{expiryKey}/chain
{
  "instruments": [
    {"symbol": "BTC-250131-95000-C", "strike": 95000, "cp": "C", "expiry": "2025-01-31"},
    {"symbol": "BTC-250131-95000-P", "strike": 95000, "cp": "P", "expiry": "2025-01-31"},
    ...
  ]
}
```

---

## Backend Implementation Details

### Tech Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Fastify or Express (Fastify recommended for performance)
- **Scheduler**: node-cron for job loops
- **Firebase**: firebase-admin
- **HTTP Client**: axios or undici

### Job Loops Architecture

#### Loop A: Underlying Price (Every 60 seconds)
```typescript
// src/jobs/underlying-job.ts
async function updateUnderlyingPrice() {
  const price = await binance.getIndexPrice('BTC');
  await firebase.updateUnderlying('BTC', price);
}
```

#### Loop B: Mark/IV/Greeks (Every 5 minutes)
```typescript
// src/jobs/iv-job.ts
async function updateIVAndGreeks() {
  const tickers = await binance.getOptionsTickers();
  const ivByStrike = calculateIVSmile(tickers);
  await firebase.updateIV('BTC', expiryKey, ivByStrike);
}
```

#### Loop C: Intraday Volume (Every 5 minutes)
```typescript
// src/jobs/volume-job.ts
async function updateIntradayVolume() {
  const state = await firebase.getState('BTC', expiryKey);
  const trades = await binance.getRecentTrades(state.lastTradeId);

  const aggregated = aggregateByStrike(trades);
  await firebase.writeSnapshot('BTC', expiryKey, aggregated);
}
```

### CME Session Logic
```typescript
// src/services/cme-session.ts
function getSessionStart(): Date {
  const now = new Date();
  const ct = convertToChicagoTime(now); // UTC-6/UTC-5

  const todayCT = new Date(ct);
  todayCT.setHours(17, 0, 0, 0);

  if (ct.getHours() < 17) {
    // Before 17:00 CT → use yesterday's 17:00
    return subtractDays(todayCT, 1);
  } else {
    // After 17:00 CT → use today's 17:00
    return todayCT;
  }
}
```

### Exchange Integration Points

#### Binance
- **Index Price**: `GET /eapi/v1/index` (underlying)
- **Tickers**: `GET /eapi/v1/ticker` (mark, IV, greeks)
- **Trades**: `GET /eapi/v1/trades` (volume aggregation)
- **Instruments**: `GET /eapi/v1/instruments` (chain lookup)

#### Bybit (Fallback)
- **Tickers**: `GET /v5/market/tickers?category=option`
- **Instruments**: `GET /v5/market/instruments?category=option`

---

## Frontend Implementation Details

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Charts**: Recharts or Chart.js (lightweight)
- **Firebase**: firebase (client SDK)
- **Styling**: Tailwind CSS

### Page Structure
```typescript
// src/app/page.tsx
export default function OptionsPage() {
  const [expiryKey, setExpiryKey] = useState('2026-01-31');
  const [data, setData] = useState(null);

  useEffect(() => {
    const ref = ref(rtdb, `/quikstrike/BTC/options/${expiryKey}/latest`);
    const unsub = onValue(ref, (snapshot) => setData(snapshot.val()));
    return unsub;
  }, [expiryKey]);

  return (
    <div>
      <ExpirySelector value={expiryKey} onChange={setExpiryKey} />
      <OptionsChart data={data} />
    </div>
  );
}
```

### Chart Components
```typescript
// src/components/OptionsChart.tsx
function OptionsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={formatChartData(data)}>
        <Bar dataKey="callVol" fill="#22c55e" />
        <Bar dataKey="putVol" fill="#ef4444" />
        <Line dataKey="iv" yAxisId="iv" stroke="#f59e0b" />
        <ReferenceLine x={data.underlyingPrice} stroke="#000" strokeDasharray="3 3" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
```

---

## Docker Configuration

### Backend Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./apps/backend
    environment:
      - BINANCE_API_BASE=${BINANCE_API_BASE}
      - FIREBASE_DB_URL=${FIREBASE_DB_URL}
      - NODE_ENV=production
    restart: unless-stopped

  frontend:
    build: ./apps/frontend
    ports:
      - "3000:3000"
    restart: unless-stopped
```

---

## Implementation Checklist

### Phase 1: Foundation (Day 1-2)
- [ ] Create project structure (apps/backend, apps/frontend)
- [ ] Initialize Firebase project and RTDB
- [ ] Set up security rules for RTDB
- [ ] Create Docker compose configuration
- [ ] Set up TypeScript configs for both apps

### Phase 2: Backend Core (Day 3-5)
- [ ] Implement Binance API client
- [ ] Implement Bybit fallback client
- [ ] Create CME session utility
- [ ] Set up Firebase Admin SDK
- [ ] Implement underlying price job (60s)
- [ ] Implement IV/greeks job (5m)
- [ ] Implement intraday volume job (5m)
- [ ] Add error handling and retry logic
- [ ] Implement chain cache for strike mapping

### Phase 3: Frontend (Day 6-8)
- [ ] Initialize Next.js with App Router
- [ ] Set up Firebase client SDK
- [ ] Create expiry selector component
- [ ] Implement options chart component
- [ ] Add IV smile overlay
- [ ] Add underlying price reference line
- [ ] Implement real-time subscription

### Phase 4: Testing & Deployment (Day 9-10)
- [ ] Test exchange API rate limits
- [ ] Test Firebase writes
- [ ] Test frontend real-time updates
- [ ] Build Docker images
- [ ] Deploy to Oracle Cloud Free Tier
- [ ] Set up monitoring/logging
- [ ] Document API and setup process

---

## Environment Variables

### Backend (.env)
```bash
# Exchange APIs
BINANCE_API_BASE=https://eapi.binance.com
BYBIT_API_BASE=https://api.bybit.com

# Firebase
FIREBASE_DB_URL=https://your-project.firebaseio.com
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase/service-account.json

# Job Intervals
REFRESH_UNDERLYING_SEC=60
REFRESH_IV_MIN=5
REFRESH_VOL_MIN=5

# Configuration
DEFAULT_ASSETS=BTC,ETH
PRIMARY_EXPIRY=2026-01-31
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_DB_URL=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
```

---

## Security Rules (Firebase RTDB)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quikstrike/{asset}/options/{expiry}/{document=**} {
      // Public read access
      allow read: if true;

      // Write only for authenticated backend (service account)
      allow write: if request.auth != null;
    }
  }
}
```

---

## Cost Optimization (Free Tier)

1. **Firebase RTDB**: Use single `latest` node per expiry, not per trade
2. **Polling**: 60s/5m intervals instead of WebSocket (avoids constant connection)
3. **Payload**: Use arrays instead of objects for strike data
4. **Oracle**: Use 2 AMD VMs (always free) for backend + frontend
5. **Rate Limits**: Implement backoff, cache chain data

---

## Next Steps

1. **Review Plan**: Confirm architecture and approach
2. **Setup Firebase**: Create project, generate service account
3. **Initialize Repos**: Set up apps/backend and apps/frontend
4. **Start Implementation**: Begin with Phase 1

---

## References

- [Binance Options API](https://binance-docs.github.io/apidocs/v options/en/)
- [Bybit Options API](https://bybit-exchange.github.io/docs/v5/market/tickers)
- [Firebase RTDB](https://firebase.google.com/docs/database)
- [QuikStrike](https://www.quikstrike.com/) for reference UX
