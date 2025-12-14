-- ============================================================================
-- PostgreSQL Row Level Security (RLS) Policies for Multi-Tenancy
-- ============================================================================
-- This script sets up RLS policies to enforce tenant isolation at the database level.
-- All tenant-scoped tables will have policies that filter rows based on app.tenant_id.
-- Super Admin role can bypass RLS for cross-tenant operations.

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom role for bypassing RLS (Super Admin)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wasilni_super_admin') THEN
    CREATE ROLE wasilni_super_admin;
  END IF;
END
$$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current tenant ID from session variable
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.tenant_id', TRUE), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('app.is_super_admin', TRUE) = 'true';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- RLS POLICIES FOR TENANT-SCOPED TABLES
-- ============================================================================

-- Note: These policies will be applied after MikroORM creates the tables.
-- Run this script after initial migration.

-- USERS table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_users ON users
  USING (
    is_super_admin() OR 
    tenant_id IS NULL OR 
    tenant_id = current_tenant_id()
  );

CREATE POLICY tenant_isolation_users_insert ON users
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR 
    tenant_id IS NULL OR 
    tenant_id = current_tenant_id()
  );

-- DRIVERS table
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_drivers ON drivers
  USING (
    is_super_admin() OR 
    tenant_id = current_tenant_id()
  );

CREATE POLICY tenant_isolation_drivers_insert ON drivers
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR 
    tenant_id = current_tenant_id()
  );

-- TRIPS table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_trips ON trips
  USING (
    is_super_admin() OR 
    tenant_id = current_tenant_id()
  );

CREATE POLICY tenant_isolation_trips_insert ON trips
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR 
    tenant_id = current_tenant_id()
  );

-- PARCELS table
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_parcels ON parcels
  USING (
    is_super_admin() OR 
    tenant_id = current_tenant_id()
  );

CREATE POLICY tenant_isolation_parcels_insert ON parcels
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR 
    tenant_id = current_tenant_id()
  );

-- LEDGER_ENTRIES table
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_ledger ON ledger_entries
  USING (
    is_super_admin() OR 
    tenant_id IS NULL OR 
    tenant_id = current_tenant_id()
  );

CREATE POLICY tenant_isolation_ledger_insert ON ledger_entries
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR 
    tenant_id IS NULL OR 
    tenant_id = current_tenant_id()
  );

-- PRICING_RULES table
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_pricing ON pricing_rules
  USING (
    is_super_admin() OR 
    tenant_id IS NULL OR 
    tenant_id = current_tenant_id()
  );

CREATE POLICY tenant_isolation_pricing_insert ON pricing_rules
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR 
    tenant_id IS NULL OR 
    tenant_id = current_tenant_id()
  );

-- AUDIT_LOGS table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_audit ON audit_logs
  USING (
    is_super_admin() OR 
    tenant_id IS NULL OR 
    tenant_id = current_tenant_id()
  );

CREATE POLICY tenant_isolation_audit_insert ON audit_logs
  FOR INSERT
  WITH CHECK (
    is_super_admin() OR 
    tenant_id IS NULL OR 
    tenant_id = current_tenant_id()
  );

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Spatial indexes for PostGIS columns
CREATE INDEX IF NOT EXISTS idx_trips_pickup_location ON trips USING GIST (pickup_location);
CREATE INDEX IF NOT EXISTS idx_trips_dropoff_location ON trips USING GIST (dropoff_location);
CREATE INDEX IF NOT EXISTS idx_parcels_pickup_location ON parcels USING GIST (pickup_location);
CREATE INDEX IF NOT EXISTS idx_parcels_delivery_location ON parcels USING GIST (delivery_location);
CREATE INDEX IF NOT EXISTS idx_drivers_current_location ON drivers USING GIST (current_location);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trips_tenant_status_created ON trips (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parcels_tenant_status_created ON parcels (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drivers_tenant_status ON drivers (tenant_id, status) WHERE is_active = true;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant super admin role the ability to bypass RLS
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE drivers FORCE ROW LEVEL SECURITY;
ALTER TABLE trips FORCE ROW LEVEL SECURITY;
ALTER TABLE parcels FORCE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- Note: In production, grant wasilni_super_admin role to specific database users
-- GRANT wasilni_super_admin TO your_super_admin_db_user;
