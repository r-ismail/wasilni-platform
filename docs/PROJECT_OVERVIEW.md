# Wasilni Platform - Project Overview

**Author:** Manus AI  
**Date:** December 15, 2025  
**Version:** 1.0.0

## Executive Summary

The Wasilni Platform represents a comprehensive, production-ready transport and parcels management system designed specifically for the Yemeni market. Built with modern technologies and best practices, the platform addresses the unique challenges of operating in regions with intermittent connectivity, cash-first economies, and the need for robust multi-tenant architecture.

## System Architecture

The platform follows a modern monorepo architecture with clear separation of concerns across backend services, administrative interfaces, and mobile applications. The architecture is designed to support multiple agencies (tenants) while maintaining strict data isolation through PostgreSQL Row Level Security policies.

### Technology Stack

The backend infrastructure is built on **NestJS**, a progressive Node.js framework that provides excellent TypeScript support and follows enterprise-grade architectural patterns. The choice of NestJS enables scalable microservices architecture while maintaining code consistency through decorators and dependency injection.

Database operations are managed through **MikroORM**, a TypeScript ORM that provides type-safe database queries and automatic migration generation. The underlying database is **PostgreSQL 15** with the **PostGIS** extension for geospatial operations, enabling efficient location-based queries for driver matching and route optimization.

Real-time communication is handled by **Socket.IO**, providing bidirectional event-based communication between drivers and the backend. This enables live location tracking, instant trip assignment notifications, and real-time status updates. The queue system is powered by **BullMQ** with **Redis** as the backing store, ensuring reliable job processing for notifications, reports, and background tasks.

The administrative portal is built with **Next.js 16**, leveraging React 19 and server-side rendering capabilities for optimal performance. The interface uses **Tailwind CSS** for responsive design that works seamlessly across desktop and tablet devices.

Mobile applications for both passengers and drivers are developed in **Flutter**, Google's cross-platform framework. This choice enables a single codebase to target both iOS and Android platforms while maintaining native performance and user experience. State management is handled through **Riverpod**, providing a robust and testable architecture for complex application states.

## Multi-Tenancy Architecture

One of the platform's core architectural decisions is the implementation of multi-tenancy at the database level using PostgreSQL Row Level Security. This approach ensures that tenant data isolation is enforced at the lowest possible level, preventing data leakage even in the event of application-level bugs.

Each database connection sets a session variable `app.tenant_id` based on the authenticated user's tenant context. RLS policies on all tenant-scoped tables automatically filter queries to only return data belonging to the current tenant. Super Admin users can bypass these restrictions by setting `app.is_super_admin` to true, enabling cross-tenant reporting and platform-wide administration.

The tenancy service in NestJS operates at request scope, extracting tenant information from JWT tokens and applying the appropriate database context before any queries are executed. This ensures that developers cannot accidentally write queries that cross tenant boundaries.

## Authentication and Authorization

The platform implements a passwordless authentication system using One-Time Passwords delivered via SMS. This approach is particularly suitable for the Yemeni market where phone numbers serve as primary identifiers and SMS infrastructure is more reliable than internet connectivity.

When a user initiates login, the system generates a six-digit OTP with a configurable expiration time. The OTP is stored in memory (with Redis recommended for production) and sent to the user's phone via a pluggable SMS provider abstraction. The system supports both Twilio for international deployments and local SMS aggregator adapters for Yemen-specific providers.

Upon successful OTP verification, the system issues two JWT tokens: a short-lived access token for API requests and a long-lived refresh token for obtaining new access tokens without re-authentication. This dual-token approach balances security with user convenience.

Authorization is implemented through role-based access control with six distinct roles: Customer, Driver, Agency Admin, Dispatcher, Finance, and Super Admin. Each role has specific permissions enforced through NestJS guards that check JWT claims before allowing access to protected resources.

## Product Offerings

The platform supports four distinct product types, each with its own pricing model and operational workflow.

### In-Town Taxi Service

This product enables traditional point-to-point taxi rides within city boundaries. Pricing is calculated using a combination of base fare, distance-based charges, and time-based charges. The system supports rush hour multipliers that automatically increase fares during peak traffic periods based on configurable time windows.

Customers can request immediate pickup or schedule rides for future times. The matching algorithm considers driver proximity, availability, and vehicle capacity when assigning trips.

### Out-of-Town VIP Service

For intercity travel, the platform offers VIP service with premium vehicles and dedicated drivers. Pricing is based on predefined corridors between major cities (e.g., Sana'a to Aden) with fixed base fares and optional VIP multipliers for luxury vehicles.

Customers can book instant trips or schedule pickups with specific time windows. The system supports customer ID verification requirements for out-of-town trips, enhancing security for long-distance travel.

### Out-of-Town Shared Rides

Shared rides enable cost-effective intercity travel by pooling multiple passengers heading in the same direction. The system manages seat capacity, pickup time windows, and detour limits to ensure efficient routing while maintaining passenger comfort.

Pricing is calculated per seat with discounts compared to VIP service. The matching algorithm groups passengers with compatible routes and schedules, optimizing vehicle utilization while respecting maximum detour constraints.

### Parcel Delivery Service

The parcel product enables door-to-door delivery of packages within cities and between cities. Parcels are categorized by size (Small, Medium, Large, Extra Large) with corresponding weight and dimension limits.

The platform supports Cash On Delivery, a critical feature for the Yemeni market where online payments are uncommon. When a parcel includes COD, the driver collects the specified amount from the receiver and the system tracks this liability in the financial ledger until settlement.

Proof of pickup and delivery is enforced through a combination of photo metadata and OTP verification. The sender receives a pickup OTP that must be verified when the driver collects the parcel, and the receiver receives a delivery OTP that must be verified upon final delivery.

## Financial Ledger System

The platform implements an immutable, double-entry style ledger for all financial transactions. Every monetary event creates a ledger entry with debit and credit accounts, ensuring accurate tracking of money movement across the system.

Ledger entries are created for trip charges, parcel fees, driver earnings, platform commissions, COD collections, COD settlements, refunds, and manual adjustments. Each entry includes an idempotency key to prevent duplicate transactions in the event of retry logic or network failures.

Multi-currency support is built into the ledger, with each entry storing the original amount and currency plus an optional reporting amount in a different currency. Foreign exchange rates are captured with their source and timestamp, enabling accurate historical reporting even as exchange rates fluctuate.

For COD transactions, the ledger tracks the collection as a liability when the driver picks up the parcel, and records settlement when the agency transfers funds to the sender. This provides complete audit trails for all COD operations.

## Real-Time Features

Driver location tracking is implemented through Socket.IO connections that stream GPS coordinates from the driver app to the backend. These locations are stored in PostGIS point columns, enabling efficient spatial queries for driver matching and customer tracking.

Trip and parcel status updates are broadcast to relevant parties in real-time. When a driver accepts a trip, both the customer and the dispatcher receive instant notifications. When a parcel status changes, the sender receives updates without needing to poll the API.

The system is designed to handle intermittent connectivity gracefully. Mobile apps queue outbound updates locally and retry with exponential backoff when network is unavailable. The backend enforces idempotency on all state-changing operations to safely handle duplicate requests from retry logic.

## Database Schema

The database schema is designed for scalability, data integrity, and efficient querying. All tables use UUID primary keys to avoid conflicts in distributed systems and enable future sharding if needed.

Base entities include common fields for creation timestamp, update timestamp, and soft deletion. Tenant-scoped entities include a `tenant_id` foreign key that participates in RLS policies.

Trip and parcel entities maintain immutable event logs through separate `trip_events` and `parcel_events` tables. Every status transition creates a new event record with timestamp, location, actor information, and optional notes. This provides complete audit trails and enables sophisticated analytics on operational patterns.

The pricing rules table supports flexible configuration of fares based on trip type, parcel size, city pairs, corridors, and time windows. Multiple rules can be active simultaneously with priority ordering to resolve conflicts.

## Development Workflow

The monorepo structure enables efficient development across all platform components. The root `package.json` defines workspace scripts that can build, test, and run all applications with a single command.

Shared types and constants are defined in the `packages/shared` package and referenced by both backend and frontend applications. This ensures type consistency across the entire codebase and prevents drift between API contracts and client implementations.

Database migrations are managed through MikroORM CLI, with automatic migration generation based on entity changes. Developers can create, apply, and rollback migrations with simple commands.

The Docker Compose configuration provides a complete local development environment with PostgreSQL, Redis, and all application services. Developers can start the entire stack with a single command and have a fully functional platform for testing.

## Security Considerations

Security is implemented at multiple layers throughout the platform. Authentication tokens use strong secrets and short expiration times. Refresh tokens are stored hashed in the database and invalidated on logout.

Database access is protected by RLS policies that enforce tenant isolation. Even if application code contains bugs that attempt cross-tenant queries, the database will reject them.

Sensitive data such as passwords (when used for admin accounts) are hashed using bcrypt with appropriate cost factors. Refresh tokens are stored hashed to prevent token theft from database dumps.

API endpoints are protected by JWT authentication guards by default, with explicit `@Public()` decorators required to expose unauthenticated endpoints. Role-based guards ensure that users can only access resources appropriate for their role.

## Deployment Architecture

While the current implementation focuses on local development, the architecture is designed for production deployment on cloud platforms. The Docker containers can be orchestrated using Kubernetes or similar container orchestration systems.

The PostgreSQL database should be deployed with replication for high availability. PostGIS indexes on location columns should be monitored and optimized based on query patterns.

Redis should be configured with persistence to prevent data loss on restarts. For production, the in-memory OTP storage should be migrated to Redis with TTL-based expiration.

The NestJS API can be horizontally scaled by running multiple instances behind a load balancer. Session state is stored in JWT tokens and Redis, enabling stateless API servers.

The Next.js admin portal can be deployed using Vercel, Netlify, or self-hosted Node.js servers with PM2 for process management.

Flutter mobile apps should be built for release with appropriate code signing and uploaded to Google Play Store and Apple App Store.

## Future Enhancements

The platform architecture supports several future enhancements without requiring fundamental changes.

**Payment Integration**: The ledger system is designed to accommodate online payment methods. Integration with payment gateways can be added by creating new ledger entry types and updating the payment flow.

**Advanced Matching**: The current driver matching algorithm can be enhanced with machine learning models that predict driver acceptance rates, optimize for customer wait times, and balance driver earnings.

**Analytics Dashboard**: The immutable event logs provide rich data for analytics. A dedicated analytics service can process these events to generate insights on operational efficiency, driver performance, and customer behavior.

**API for Third Parties**: The platform can expose public APIs for third-party integrations, enabling businesses to integrate Wasilni services into their own applications.

**Multi-Language Support**: While the current implementation includes Arabic and English, the localization infrastructure can easily support additional languages.

## Conclusion

The Wasilni Platform represents a comprehensive solution for transport and parcel management in challenging operational environments. The architecture balances modern best practices with practical considerations for the Yemeni market, including cash-first operations, intermittent connectivity, and multi-tenant requirements.

The codebase is production-ready with proper error handling, validation, authentication, authorization, and audit logging. The monorepo structure enables efficient development and maintenance, while the Docker-based deployment simplifies infrastructure management.

With proper operational procedures, monitoring, and ongoing maintenance, the platform can serve as a reliable foundation for transport and logistics operations across Yemen and similar markets.
