# Wasilni Platform

**Transport & Parcels Platform for Yemen**

Wasilni is a production-ready, multi-tenant transport and parcels platform designed specifically for Yemen's market. It supports in-town taxi services, out-of-town VIP and shared rides, and door-to-door parcel delivery with Cash On Delivery (COD) support.

## 🚀 Features

- **Multi-Tenancy**: PostgreSQL Row Level Security (RLS) for agency isolation
- **Cash-First Operations**: Immutable ledger with multi-currency support (YER/USD)
- **Offline Resilient**: Designed for intermittent connectivity with retry mechanisms
- **Localization**: Full Arabic + English support
- **Real-time**: WebSocket-based driver tracking and status updates
- **KYC/Verification**: Driver KYC workflows, customer ID verification, parcel OTP proofs

## 📦 Products

1. **In-Town Taxi**: Base + distance + time pricing with rush hour multipliers
2. **Out-of-Town VIP**: Instant or scheduled door-to-door rides with corridor pricing
3. **Out-of-Town Shared**: Multi-passenger seat-based pricing with detour limits
4. **Parcels**: Size-based pricing with COD support and proof of pickup/delivery

## 🏗️ Architecture

### Monorepo Structure

```
wasilni-platform/
├── apps/
│   ├── api/              # NestJS backend (TypeScript)
│   ├── admin/            # Next.js admin portal (React + TypeScript)
│   ├── passenger_app/    # Flutter passenger mobile app
│   └── driver_app/       # Flutter driver mobile app
├── packages/
│   └── shared/           # Shared types, utilities, and constants
├── infra/
│   ├── docker/           # Docker Compose configurations
│   ├── migrations/       # MikroORM database migrations
│   ├── seeds/            # Database seed data
│   └── scripts/          # Deployment and utility scripts
└── docs/                 # Documentation and runbooks
```

### Tech Stack

- **Backend**: NestJS (Node.js + TypeScript)
- **ORM**: MikroORM with PostgreSQL driver
- **Database**: PostgreSQL 15 + PostGIS
- **Cache/Queues**: Redis + BullMQ
- **Real-time**: Socket.IO
- **Admin Portal**: Next.js 14 (React + TypeScript)
- **Mobile Apps**: Flutter 3.x (Dart)
- **Containerization**: Docker Compose

## 🚦 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose
- Flutter SDK 3.x
- PostgreSQL 15 (or use Docker)

### Local Development

```bash
# Clone the repository
git clone https://github.com/r-ismail/wasilni-platform.git
cd wasilni-platform

# Start infrastructure (PostgreSQL, Redis)
docker-compose -f infra/docker/docker-compose.yml up -d

# Install dependencies
pnpm install

# Run database migrations
cd apps/api
pnpm mikro-orm migration:up

# Seed initial data
pnpm run seed

# Start backend API
pnpm run start:dev

# In another terminal, start admin portal
cd apps/admin
pnpm run dev

# For mobile apps
cd apps/passenger_app
flutter pub get
flutter run

cd apps/driver_app
flutter pub get
flutter run
```

See [docs/RUNBOOK.md](docs/RUNBOOK.md) for detailed setup instructions.

## 🌍 Region-Specific Design

- **Launch Cities**: Sana'a and Aden
- **Currency**: Yemeni Rial (YER) with optional USD reporting
- **Connectivity**: Offline-tolerant with local queuing and retry logic
- **Payment**: Cash-first with COD support for parcels
- **SMS**: OTP via Twilio or local aggregator adapters

## 👥 User Roles

- **Customer/Passenger**: Book rides and send parcels
- **Driver/Captain**: Accept jobs, complete deliveries
- **Agency Admin**: Manage fleet and operations (tenant-scoped)
- **Dispatcher/Agent**: Assign jobs manually
- **Finance**: View ledger, settlements, and payouts
- **Super Admin**: Platform-wide administration

## 📊 Database Multi-Tenancy

All tenant-scoped tables include `tenant_id` with PostgreSQL RLS policies enforcing strict isolation:

```sql
CREATE POLICY tenant_isolation ON trips
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

Super Admin role bypasses RLS for cross-tenant reporting.

## 🔐 Security

- OTP-based authentication with refresh tokens
- Driver KYC with admin approval workflow
- Customer ID verification for out-of-town trips
- Parcel pickup/delivery OTP verification
- Immutable audit logs for all critical operations

## 📱 Mobile Apps

### Passenger App
- Multi-product booking (taxi, VIP, shared, parcels)
- Real-time driver tracking
- Trip and parcel history
- Ratings and receipts
- COD amount specification for parcels

### Driver App
- OTP login with KYC submission
- Online/offline availability toggle
- Accept/reject job assignments
- Navigation integration
- Parcel proof flows (photo + OTP)
- Earnings and COD summary

## 📄 License

Proprietary - All rights reserved

## 🤝 Contributing

This is a private project. For access or collaboration inquiries, contact the platform owner.

---

**Built for Yemen 🇾🇪 | Designed for reliability in challenging environments**
