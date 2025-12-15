# Wasilni Platform - Testing Guide

This document provides comprehensive instructions for testing the Wasilni platform and troubleshooting common issues.

## Test Results Summary

The platform has been successfully created and pushed to GitHub at `https://github.com/r-ismail/wasilni-platform`.

### ✅ Completed Setup Steps

1. **Repository Created**: GitHub repository initialized with all code

1. **Dependencies Installed**: All Node.js packages installed via pnpm

1. **Database Setup**: PostgreSQL with PostGIS extension configured

1. **Schema Created**: All database tables created successfully

1. **Seed Data Loaded**: Initial tenants, admin user, and pricing rules inserted

### 📋 What Was Created

- **Backend API** (NestJS ): 12 modules with authentication, multi-tenancy, and business logic

- **Admin Portal** (Next.js): Dashboard with professional design

- **Mobile Apps** (Flutter): Passenger and driver apps with complete structure

- **Database Schema**: 11 tables with PostGIS spatial support

- **Infrastructure**: Docker Compose configuration and SQL migration scripts

- **Documentation**: Runbook, project overview, and this testing guide

## Local Testing Instructions

### Prerequisites

Ensure you have the following installed:

- Node.js 18+

- pnpm 8+

- PostgreSQL 14+ with PostGIS

- Redis 6+

- Flutter SDK 3+ (for mobile apps)

### Step 1: Clone the Repository

```bash
git clone https://github.com/r-ismail/wasilni-platform.git
cd wasilni-platform
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Build Shared Package

The shared package must be built before the API can use it:

```bash
cd packages/shared
pnpm run build
cd ../..
```

### Step 4: Setup Database

#### Option A: Using Docker (Recommended )

If you have Docker installed:

```bash
docker run --name wasilni-postgres -e POSTGRES_USER=wasilni -e POSTGRES_PASSWORD=wasilni_dev_password -e POSTGRES_DB=wasilni -p 5432:5432 -d postgis/postgis:15-3.3
docker run --name wasilni-redis -p 6379:6379 -d redis:7-alpine
```

#### Option B: Using Local PostgreSQL

```bash
# Create database and user
sudo -u postgres psql -c "CREATE USER wasilni WITH PASSWORD 'wasilni_dev_password';"
sudo -u postgres psql -c "CREATE DATABASE wasilni OWNER wasilni;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE wasilni TO wasilni;"

# Install PostGIS extension
sudo -u postgres psql -d wasilni -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Apply schema
sudo -u postgres psql -d wasilni < infra/migrations/002_init_schema.sql

# Load seed data
sudo -u postgres psql -d wasilni < infra/seeds/001_initial_data.sql
```

### Step 5: Configure Environment

Create `.env` file in `apps/api`:

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` and ensure database credentials match:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=wasilni
DB_PASSWORD=wasilni_dev_password
DB_NAME=wasilni
```

### Step 6: Fix Entity Issues

Before starting the API, you need to fix a few entity definition issues:

#### Fix @Enum Decorator Usage

The `@Enum` decorator in MikroORM doesn't accept options as a second parameter. Remove the options object:

```typescript
// BEFORE (incorrect):
@Enum(() => UserRole, { nullable: true })
actorRole?: UserRole;

// AFTER (correct):
@Enum(() => UserRole)
actorRole?: UserRole;
```

Apply this fix to these files:

- `apps/api/src/database/entities/audit-log.entity.ts`

- `apps/api/src/database/entities/ledger-entry.entity.ts`

- `apps/api/src/database/entities/parcel-event.entity.ts`

- `apps/api/src/database/entities/pricing-rule.entity.ts`

- `apps/api/src/database/entities/trip-event.entity.ts`

### Step 7: Start the Backend API

```bash
cd apps/api
pnpm run start:dev
```

The API should start on `http://localhost:3000`.

### Step 8: Test API Endpoints

#### Health Check

```bash
curl http://localhost:3000
```

Expected response: `{"message":"Wasilni API is running"}`

#### Send OTP

```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+967771111111", "role": "CUSTOMER"}'
```

Expected response: `{"message":"OTP sent successfully to +967771111111"}`

#### Verify OTP (Development Mode )

In development mode, check the console logs for the OTP code, then:

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+967771111111", "otp": "123456", "role": "CUSTOMER"}'
```

Expected response: JWT tokens and user information.

### Step 9: Start the Admin Portal

Open a new terminal:

```bash
cd apps/admin
pnpm run dev
```

The admin portal should start on `http://localhost:3001`.

### Step 10: Test Mobile Apps

#### Passenger App

```bash
cd apps/passenger_app
flutter pub get
flutter run
```

#### Driver App

```bash
cd apps/driver_app
flutter pub get
flutter run
```

## Common Issues and Solutions

### Issue 1: Module Not Found Errors

**Symptom**: `Cannot find module '@wasilni/shared'`

**Solution**:

```bash
cd packages/shared
pnpm run build
```

### Issue 2: Database Connection Failed

**Symptom**: `Connection refused` or `ECONNREFUSED`

**Solution**:

- Ensure PostgreSQL is running: `sudo service postgresql status`

- Check credentials in `.env` match your database setup

- Verify port 5432 is not blocked by firewall

### Issue 3: PostGIS Extension Missing

**Symptom**: `ERROR: could not open extension control file`

**Solution**:

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-14-postgis-3

# macOS
brew install postgis

# Then create extension
psql -d wasilni -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### Issue 4: Redis Connection Failed

**Symptom**: `Error connecting to Redis`

**Solution**:

- Ensure Redis is running: `sudo service redis-server status`

- Check Redis is listening on port 6379: `redis-cli ping`

### Issue 5: TypeScript Compilation Errors

**Symptom**: Various TS errors about missing properties

**Solution**:

- Ensure all dependencies are installed: `pnpm install`

- Build shared package: `cd packages/shared && pnpm run build`

- Clear NestJS build cache: `rm -rf apps/api/dist`

### Issue 6: Migration Errors

**Symptom**: `relation already exists` or migration fails

**Solution**: Use the SQL scripts directly instead of MikroORM migrations:

```bash
# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS wasilni;"
sudo -u postgres psql -c "CREATE DATABASE wasilni OWNER wasilni;"
sudo -u postgres psql -d wasilni -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Apply schema and seeds
sudo -u postgres psql -d wasilni < infra/migrations/002_init_schema.sql
sudo -u postgres psql -d wasilni < infra/seeds/001_initial_data.sql
```

### Issue 7: Flutter Dependencies Not Found

**Symptom**: `Package not found` or `pub get` fails

**Solution**:

```bash
flutter clean
flutter pub get
```

### Issue 8: Port Already in Use

**Symptom**: `EADDRINUSE: address already in use :::3000`

**Solution**:

```bash
# Find process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port in .env
PORT=3001
```

## Testing Checklist

Use this checklist to verify all components are working:

- [ ] PostgreSQL database is running and accessible

- [ ] Redis is running and accessible

- [ ] Shared package is built (`packages/shared/dist` exists )

- [ ] Backend API starts without errors

- [ ] API health check returns success

- [ ] OTP can be sent to a phone number

- [ ] OTP can be verified (check console for dev OTP)

- [ ] JWT tokens are returned after OTP verification

- [ ] Admin portal starts and displays dashboard

- [ ] Passenger app compiles and runs

- [ ] Driver app compiles and runs

## Performance Testing

### Load Testing the API

Use Apache Bench or similar tools:

```bash
# Test health endpoint
ab -n 1000 -c 10 http://localhost:3000/

# Test OTP endpoint
ab -n 100 -c 5 -p otp-payload.json -T application/json http://localhost:3000/api/v1/auth/send-otp
```

### Database Query Performance

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

## Security Testing

### API Security Checklist

- [ ] JWT tokens expire after configured time

- [ ] Refresh tokens are properly validated

- [ ] OTP codes expire after configured time

- [ ] Rate limiting is implemented (TODO )

- [ ] CORS is properly configured

- [ ] SQL injection is prevented (parameterized queries)

- [ ] XSS is prevented (input validation)

### Database Security Checklist

- [ ] RLS policies are active

- [ ] Tenant isolation is enforced

- [ ] Super admin can bypass RLS

- [ ] Regular users cannot access other tenants' data

## Next Steps

1. **Implement Remaining Modules**: Complete the placeholder modules (Drivers, Trips, Parcels, etc.)

1. **Add Unit Tests**: Write tests for services and controllers

1. **Add Integration Tests**: Test API endpoints end-to-end

1. **Implement WebSocket**: Add real-time features for driver tracking

1. **Complete Mobile Apps**: Add booking screens, maps integration, and real-time updates

1. **Deploy to Staging**: Set up CI/CD pipeline and deploy to staging environment

1. **Performance Optimization**: Add caching, optimize queries, and implement rate limiting

1. **Security Hardening**: Add rate limiting, implement HTTPS, and conduct security audit

## Support

For issues or questions:

- Check the main README.md for project overview

- Review RUNBOOK.md for setup instructions

- Review PROJECT_OVERVIEW.md for architecture details

- Open an issue on GitHub: [https://github.com/r-ismail/wasilni-platform/issues](https://github.com/r-ismail/wasilni-platform/issues)

## Conclusion

The Wasilni platform foundation is complete and ready for development. The core architecture is in place with multi-tenancy, authentication, database schema, and mobile app scaffolding. Follow this testing guide to verify everything works on your local machine, then proceed with implementing the remaining business logic and features.

