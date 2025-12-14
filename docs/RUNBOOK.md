# Wasilni Platform - Local Development Runbook

This document provides detailed instructions for setting up and running the Wasilni platform on a local development machine.

## 1. Prerequisites

Ensure you have the following software installed on your system:

- **Node.js**: v18.x or later
- **pnpm**: v8.x or later (`npm install -g pnpm`)
- **Docker**: Latest version
- **Docker Compose**: Latest version
- **Flutter SDK**: v3.x or later
- **Git**: Latest version

## 2. Initial Setup

### 2.1. Clone the Repository

```bash
git clone https://github.com/r-ismail/wasilni-platform.git
cd wasilni-platform
```

### 2.2. Install Monorepo Dependencies

Install all dependencies for the backend, admin portal, and shared packages using `pnpm`.

```bash
pnpm install
```

### 2.3. Configure Environment Variables

Create a `.env` file in the `apps/api` directory by copying the example file.

```bash
cp apps/api/.env.example apps/api/.env
```

Update `apps/api/.env` with your specific configurations, especially for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and any external service keys (e.g., `GOOGLE_MAPS_API_KEY`).

## 3. Running the Backend and Infrastructure

### 3.1. Start Docker Containers

This command will start the PostgreSQL database (with PostGIS) and the Redis server.

```bash
docker-compose -f infra/docker/docker-compose.yml up -d
```

To check the status of the containers:

```bash
docker-compose -f infra/docker/docker-compose.yml ps
```

### 3.2. Run Database Migrations

The first time you set up the project, you need to create and run the initial database migration. This will create all the tables based on the MikroORM entities.

```bash
cd apps/api

# Create the initial migration file
pnpm mikro-orm migration:create

# Apply the migration to the database
pnpm mikro-orm migration:up
```

**Note:** The `001_rls_policies.sql` script is automatically executed by Docker Compose on database initialization to set up multi-tenancy policies.

### 3.3. Seed the Database

Populate the database with initial data, including tenants, a super admin user, and pricing rules.

```bash
# Still in apps/api directory
pnpm run seed
```

This will output a summary of the created data, including the login credentials for the super admin.

### 3.4. Start the NestJS API

Run the backend API in development mode with hot-reloading.

```bash
# Still in apps/api directory
pnpm run start:dev
```

The API will be available at `http://localhost:3000`.

## 4. Running the Frontend Applications

### 4.1. Start the Next.js Admin Portal

Open a **new terminal** and navigate to the `apps/admin` directory.

```bash
cd apps/admin
pnpm run dev
```

The admin portal will be available at `http://localhost:3001`.

### 4.2. Run the Flutter Mobile Apps

#### 4.2.1. Passenger App

Open a **new terminal** and navigate to the `apps/passenger_app` directory.

```bash
cd apps/passenger_app

# Install Flutter dependencies
flutter pub get

# Run the app on a connected device or emulator
flutter run
```

#### 4.2.2. Driver App

Open a **new terminal** and navigate to the `apps/driver_app` directory.

```bash
cd apps/driver_app

# Install Flutter dependencies
flutter pub get

# Run the app on a connected device or emulator
flutter run
```

## 5. Full Stack Overview

At this point, the entire Wasilni platform should be running locally:

- **PostgreSQL Database**: `localhost:5432`
- **Redis Cache**: `localhost:6379`
- **NestJS Backend API**: `http://localhost:3000`
- **Next.js Admin Portal**: `http://localhost:3001`
- **Flutter Passenger App**: Running on your emulator/device
- **Flutter Driver App**: Running on your emulator/device

## 6. Stopping the Environment

To stop all services, run the following command from the `infra/docker` directory or the root directory:

```bash
docker-compose -f infra/docker/docker-compose.yml down
```

To stop the frontend applications, use `Ctrl+C` in their respective terminal windows.

## 7. Running Tests

To run the backend unit and integration tests:

```bash
cd apps/api
pnpm run test
```
