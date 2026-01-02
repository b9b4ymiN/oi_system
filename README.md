# OI System - Crypto Options Analysis Platform

A QuikStrike-style cryptocurrency options analysis platform with real-time data visualization, optimized for Oracle Cloud Free Tier deployment.

## Architecture

```
Binance/Bybit APIs → Backend (Node.js) → Firebase RTDB → Frontend (Next.js)
     Polling (60s/5m)    Aggregation    Real-time DB     Subscribe (onValue)
```

## Features

- **Real-time Options Data**: Live updates via Firebase Realtime Database
- **Volume Analysis**: Intraday call/put volume per strike (CME session logic)
- **IV Smile**: Implied volatility visualization across strikes
- **Multi-Exchange**: Binance primary, Bybit fallback
- **Free Tier Optimized**: Designed for Oracle Cloud Free Tier

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Firebase project with Realtime Database

### Setup

1. **Clone and install**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

3. **Firebase setup**
- Create Firebase project at https://console.firebase.google.com
- Enable Realtime Database
- Generate service account key: save as `firebase/service-account.json`

4. **Run locally**
```bash
npm run dev
```

5. **Run with Docker**
```bash
npm run docker:build
npm run docker:up
```

## Project Structure

```
oiSystem/
├── apps/
│   ├── backend/          # Node.js/TypeScript Backend
│   │   ├── src/
│   │   │   ├── config/       # Environment variables, constants
│   │   │   ├── exchanges/    # Binance/Bybit API clients
│   │   │   ├── services/     # Aggregation, CME session logic
│   │   │   ├── jobs/         # Scheduled jobs (60s, 5m loops)
│   │   │   └── types/        # TypeScript interfaces
│   │   └── Dockerfile
│   │
│   └── frontend/         # Next.js Frontend
│       ├── src/
│       │   ├── app/          # Next.js App Router
│       │   ├── components/   # Chart components, UI
│       │   └── lib/          # Firebase client, utilities
│       └── Dockerfile
│
├── firebase/             # Firebase configuration
├── docker-compose.yml
└── README.md
```

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `BINANCE_API_BASE` | Binance Options API base URL | `https://eapi.binance.com` |
| `BYBIT_API_BASE` | Bybit API base URL | `https://api.bybit.com` |
| `FIREBASE_DB_URL` | Firebase RTDB URL | - |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to service account JSON | `./firebase/service-account.json` |
| `REFRESH_UNDERLYING_SEC` | Underlying price update interval (seconds) | `60` |
| `REFRESH_IV_MIN` | IV update interval (minutes) | `5` |
| `REFRESH_VOL_MIN` | Volume update interval (minutes) | `5` |

### Frontend
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_DB_URL` | Firebase RTDB URL |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |

## API Endpoints

### Backend
- `GET /health` - Health check endpoint
- `GET /api/snapshot/:asset/:expiry` - Get latest options snapshot

## Firebase Database Schema

```
/quikstrike/{asset}/options/{expiryKey}/latest
{
  "updatedAt": 1735789200000,
  "sessionStart": 1735740000000,
  "underlyingPrice": 97500.50,
  "atmStrike": 97500,
  "strikes": [90000, 92500, 95000, ...],
  "callVolByStrike": [1450, 2100, 3800, ...],
  "putVolByStrike": [800, 1200, 1800, ...],
  "ivByStrike": [0.52, 0.48, 0.45, ...],
  "meta": { "source": "binance", "fallback": "bybit" }
}
```

## Deployment

### Oracle Cloud Free Tier

1. Create 2 AMD VMs (Always Free)
2. Install Docker on both VMs
3. Clone repository on both VMs
4. Copy `.env` and `firebase/service-account.json`
5. Run `docker-compose up -d`

### Backend VM
```bash
docker-compose up -d backend
```

### Frontend VM
```bash
docker-compose up -d frontend
```

## Development

```bash
# Install dependencies
npm install

# Run both backend and frontend
npm run dev

# Run only backend
cd apps/backend && npm run dev

# Run only frontend
cd apps/frontend && npm run dev

# Build for production
npm run build
```

## Monitoring

- Backend logs: `docker-compose logs -f backend`
- Frontend logs: `docker-compose logs -f frontend`
- Health check: `curl http://localhost:3001/health`

## License

MIT

## References

- [Binance Options API](https://binance-docs.github.io/apidocs/voptions/en/)
- [Bybit Options API](https://bybit-exchange.github.io/docs/v5/market/tickers)
- [Firebase RTDB](https://firebase.google.com/docs/database)
