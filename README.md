<div align="center">

# 📊 OI System

### **Crypto Options Analysis Platform**

[![Status](https://img.shields.io/badge/status-active-success)](https://github.com/yourusername/oi-system)
[![Node](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

*A QuikStrike-style cryptocurrency options analysis platform with real-time data visualization, optimized for free-tier cloud deployment.*

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API](#-api) • [Deployment](#-deployment)

</div>

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| **🔄 Real-time Data** | Live options data via Firebase Realtime Database push notifications |
| **📈 Volume Analysis** | Intraday call/put volume per strike with CME session logic |
| **😊 IV Smile** | Implied volatility visualization across all strikes |
| **🔀 Multi-Exchange** | Binance primary data source with Bybit fallback |
| **💰 Free Tier Ready** | Optimized for Oracle Cloud Free Tier deployment |
| **⚡ Fast Performance** | Polling-based architecture (60s/5m) for efficient resource usage |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20 or higher
- **Docker** & **Docker Compose** (optional, for containerized deployment)
- **Firebase** project with Realtime Database enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/oi-system.git
cd oiSystem

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Configuration

1. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable **Realtime Database** (choose a region near you)
   - Generate a service account key and save as `firebase/service-account.json`

2. **Configure Environment Variables**

Edit `.env` with your Firebase credentials:

```bash
# Backend
FIREBASE_DB_URL=https://your-project.firebaseio.com
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase/service-account.json
BINANCE_API_BASE=https://eapi.binance.com
BYBIT_API_BASE=https://api.bybit.com

# Frontend
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

### Run Locally

```bash
# Development mode (both backend and frontend)
npm run dev

# Or run separately
cd apps/backend && npm run dev    # Backend on :3001
cd apps/frontend && npm run dev   # Frontend on :3000
```

### Run with Docker

```bash
# Build and start all services
npm run docker:build
npm run docker:up

# View logs
docker-compose logs -f
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EXCHANGE LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌──────────────────┐              ┌──────────────────┐           │
│   │   Binance API    │              │   Bybit API      │           │
│   │   (Primary)      │◄──── Fallback ───►   (Backup)     │           │
│   └────────┬─────────┘              └──────────────────┘           │
│            │                                                        │
└────────────┼────────────────────────────────────────────────────────┘
             │ Polling (60s/5m)
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│   │ Underlying  │   │  IV/Greeks  │   │   Volume    │            │
│   │   Job 60s   │   │   Job 5m    │   │   Job 5m    │            │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘            │
│          │                 │                 │                     │
│          └─────────────────┼─────────────────┘                     │
│                            ▼                                       │
│                    ┌───────────────┐                              │
│                    │  Aggregation  │                              │
│                    │   Service     │                              │
│                    └───────┬───────┘                              │
└────────────────────────────────┼────────────────────────────────────┘
                                 │ Write Snapshot
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                    ┌───────────────────┐                            │
│                    │  Firebase RTDB    │                            │
│                    │  (Real-time DB)   │                            │
│                    └─────────┬─────────┘                            │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ Subscribe (onValue)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FRONTEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                    ┌───────────────────┐                            │
│                    │   Next.js App     │                            │
│                    ├───────────────────┤                            │
│                    │  • Options Chart  │                            │
│                    │  • IV Smile      │                            │
│                    │  • Volume Bars   │                            │
│                    └───────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Exchange APIs** → Backend polls Binance/Bybit for options data
2. **Aggregation** → Data is processed (CME session logic, IV calculation)
3. **Firebase** → Snapshot written to Realtime Database
4. **Frontend** → Subscribes to Firebase and receives real-time updates

---

## 📁 Project Structure

```
oiSystem/
├── apps/
│   ├── backend/                    # Node.js/TypeScript Backend
│   │   ├── src/
│   │   │   ├── config/             # Configuration, Firebase init
│   │   │   ├── exchanges/          # Binance/Bybit API clients
│   │   │   ├── services/           # Aggregation, CME session logic
│   │   │   ├── jobs/               # Scheduled jobs (cron)
│   │   │   ├── types/              # TypeScript interfaces
│   │   │   └── scripts/            # Test scripts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   └── frontend/                   # Next.js Frontend
│       ├── src/
│       │   ├── app/                # Next.js App Router
│       │   ├── components/         # React components
│       │   └── lib/                # Firebase client, utils
│       ├── package.json
│       └── Dockerfile
│
├── firebase/
│   ├── rules.json                  # Database security rules
│   └── service-account.json        # Backend credentials (gitignored)
│
├── .env.example                    # Environment variables template
├── docker-compose.yml              # Multi-service orchestration
├── package.json                    # Root package.json
└── README.md
```

---

## 🔌 API Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T07:00:05.662Z",
  "uptime": 93.5243015
}
```

### Options Snapshot (Planned)

```http
GET /api/snapshot/:asset/:expiry
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `asset` | string | Asset symbol (BTC, ETH) |
| `expiry` | string | Expiry date (YYYY-MM-DD) |

---

## 🗄️ Database Schema

### Options Snapshot Path

```
/quikstrike/{asset}/options/{expiryKey}/latest
```

### Data Structure

```json
{
  "updatedAt": 1735789200000,
  "sessionStart": 1735740000000,
  "underlyingPrice": 97500.50,
  "atmStrike": 97500,
  "strikes": [90000, 92500, 95000, 97500, 100000],
  "callVolByStrike": [1450, 2100, 3800, 5200, 4100],
  "putVolByStrike": [800, 1200, 1800, 2400, 3200],
  "ivByStrike": [0.52, 0.48, 0.45, 0.43, 0.46],
  "meta": {
    "source": "binance",
    "fallback": "bybit",
    "expiries": ["2026-01-24", "2026-02-28"]
  }
}
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BINANCE_API_BASE` | Binance Options API URL | `https://eapi.binance.com` |
| `BYBIT_API_BASE` | Bybit API URL | `https://api.bybit.com` |
| `FIREBASE_DB_URL` | Firebase RTDB URL | - |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to service account | `./firebase/service-account.json` |
| `REFRESH_UNDERLYING_SEC` | Price update interval (sec) | `60` |
| `REFRESH_IV_MIN` | IV update interval (min) | `5` |
| `REFRESH_VOL_MIN` | Volume update interval (min) | `5` |

---

## 🚢 Deployment

### Oracle Cloud Free Tier

This project is optimized for Oracle Cloud's **Always Free** tier:

**Resources Used:**
- 2x AMD VMs (1 OCPU, 1GB RAM each)
- No additional costs

**Deployment Steps:**

```bash
# 1. Create VMs in Oracle Cloud Console

# 2. SSH into Backend VM
ssh oracle@backend-vm-ip
git clone https://github.com/yourusername/oi-system.git
cd oiSystem
cp .env .env.production
# Edit .env.production with your credentials
docker-compose up -d backend

# 3. SSH into Frontend VM
ssh oracle@frontend-vm-ip
git clone https://github.com/yourusername/oi-system.git
cd oiSystem
cp .env.local .env.production
# Edit .env.production with your credentials
docker-compose up -d frontend
```

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

---

## 🧪 Development

### Running Tests

```bash
# Test Firebase connection
cd apps/backend
npm run test:firebase
```

### Building for Production

```bash
# Build both backend and frontend
npm run build

# Build backend only
cd apps/backend && npm run build

# Build frontend only
cd apps/frontend && npm run build
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend in dev mode |
| `npm run build` | Build both apps for production |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |

---

## 📊 Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3
- **Framework**: Fastify
- **Database**: Firebase Admin SDK
- **Scheduler**: node-cron
- **HTTP Client**: axios

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Firebase**: Client SDK

### DevOps
- **Containers**: Docker & Docker Compose
- **Version Control**: Git
- **Platform**: Oracle Cloud (Free Tier)

---

## 📈 Roadmap

| Status | Feature |
|--------|---------|
| ✅ Complete | Project structure & configuration |
| ✅ Complete | Firebase integration |
| ✅ Complete | Backend server foundation |
| 🚧 In Progress | Exchange API clients (Binance, Bybit) |
| 📋 Planned | Aggregation services |
| 📋 Planned | Scheduled jobs implementation |
| 📋 Planned | Frontend UI & charts |
| 📋 Planned | Production deployment |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 References

- [Binance Options API](https://binance-docs.github.io/apidocs/voptions/en/)
- [Bybit Options API](https://bybit-exchange.github.io/docs/v5/market/tickers)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [QuikStrike](https://www.quikstrike.com/) - Inspiration for this project

---

## 📧 Support

For questions or issues, please open an issue on GitHub.

---

<div align="center">

**Built with ❤️ for the crypto options trading community**

</div>
