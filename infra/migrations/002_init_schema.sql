-- Create basic tables for Wasilni platform

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address JSONB,
  settings JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  phone VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  first_name_ar VARCHAR(100),
  last_name_ar VARCHAR(100),
  avatar_url TEXT,
  password_hash VARCHAR(255),
  refresh_token VARCHAR(500),
  device_token VARCHAR(500),
  preferred_language VARCHAR(10) DEFAULT 'ar',
  role VARCHAR(50) NOT NULL,
  is_phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_phone ON users(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  first_name_ar VARCHAR(100),
  last_name_ar VARCHAR(100),
  avatar_url TEXT,
  password_hash VARCHAR(255),
  refresh_token VARCHAR(500),
  device_token VARCHAR(500),
  preferred_language VARCHAR(10) DEFAULT 'ar',
  kyc_status VARCHAR(50) DEFAULT 'PENDING',
  kyc_documents JSONB,
  kyc_notes TEXT,
  kyc_reviewed_at TIMESTAMP,
  kyc_reviewed_by UUID,
  status VARCHAR(50) DEFAULT 'OFFLINE',
  current_location GEOMETRY(Point, 4326),
  vehicle_type VARCHAR(50),
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INTEGER,
  vehicle_color VARCHAR(50),
  vehicle_plate VARCHAR(50),
  vehicle_capacity INTEGER DEFAULT 4,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_trips INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_drivers_tenant_phone ON drivers(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_location ON drivers USING GIST(current_location);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  customer_id UUID REFERENCES users(id) NOT NULL,
  driver_id UUID REFERENCES drivers(id),
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'REQUESTED',
  pickup_location GEOMETRY(Point, 4326) NOT NULL,
  pickup_address JSONB NOT NULL,
  dropoff_location GEOMETRY(Point, 4326) NOT NULL,
  dropoff_address JSONB NOT NULL,
  scheduled_pickup_time TIMESTAMP,
  actual_pickup_time TIMESTAMP,
  actual_dropoff_time TIMESTAMP,
  distance_km DECIMAL(10,2),
  duration_minutes INTEGER,
  base_fare DECIMAL(10,2),
  distance_fare DECIMAL(10,2),
  time_fare DECIMAL(10,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.00,
  total_fare DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'YER',
  payment_method VARCHAR(50) DEFAULT 'CASH',
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  customer_rating INTEGER,
  driver_rating INTEGER,
  customer_notes TEXT,
  driver_notes TEXT,
  cancelled_at TIMESTAMP,
  cancelled_by VARCHAR(50),
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trips_tenant_status ON trips(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_trips_customer ON trips(customer_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);

-- Trip events table
CREATE TABLE IF NOT EXISTS trip_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) NOT NULL,
  status VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location GEOMETRY(Point, 4326),
  notes TEXT,
  actor_id UUID,
  actor_role VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trip_events_trip ON trip_events(trip_id);

-- Parcels table
CREATE TABLE IF NOT EXISTS parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  sender_id UUID REFERENCES users(id) NOT NULL,
  receiver_id UUID REFERENCES users(id),
  receiver_name VARCHAR(200) NOT NULL,
  receiver_phone VARCHAR(50) NOT NULL,
  driver_id UUID REFERENCES drivers(id),
  status VARCHAR(50) DEFAULT 'CREATED',
  size VARCHAR(50) NOT NULL,
  weight_kg DECIMAL(10,2),
  description TEXT,
  pickup_location GEOMETRY(Point, 4326) NOT NULL,
  pickup_address JSONB NOT NULL,
  dropoff_location GEOMETRY(Point, 4326) NOT NULL,
  dropoff_address JSONB NOT NULL,
  scheduled_pickup_time TIMESTAMP,
  actual_pickup_time TIMESTAMP,
  actual_dropoff_time TIMESTAMP,
  pickup_otp VARCHAR(10),
  dropoff_otp VARCHAR(10),
  pickup_photo_url TEXT,
  dropoff_photo_url TEXT,
  is_cod BOOLEAN DEFAULT false,
  cod_amount DECIMAL(10,2),
  cod_collected_at TIMESTAMP,
  cod_settled_at TIMESTAMP,
  base_fare DECIMAL(10,2),
  distance_fare DECIMAL(10,2),
  cod_fee DECIMAL(10,2),
  total_fare DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'YER',
  payment_method VARCHAR(50) DEFAULT 'CASH',
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  sender_rating INTEGER,
  driver_rating INTEGER,
  sender_notes TEXT,
  driver_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parcels_tenant_status ON parcels(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_parcels_sender ON parcels(sender_id);
CREATE INDEX IF NOT EXISTS idx_parcels_driver ON parcels(driver_id);

-- Parcel events table
CREATE TABLE IF NOT EXISTS parcel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID REFERENCES parcels(id) NOT NULL,
  status VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location GEOMETRY(Point, 4326),
  notes TEXT,
  photo_url TEXT,
  otp_verified BOOLEAN DEFAULT false,
  actor_id UUID,
  actor_role VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parcel_events_parcel ON parcel_events(parcel_id);

-- Pricing rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  trip_type VARCHAR(50),
  parcel_size VARCHAR(50),
  from_city VARCHAR(100),
  to_city VARCHAR(100),
  corridor VARCHAR(100),
  base_fare DECIMAL(10,2),
  per_km_rate DECIMAL(10,2),
  per_minute_rate DECIMAL(10,2),
  minimum_fare DECIMAL(10,2),
  vip_multiplier DECIMAL(3,2),
  rush_hour_multiplier DECIMAL(3,2),
  rush_hour_windows JSONB,
  cod_fee_fixed DECIMAL(10,2),
  cod_fee_percentage DECIMAL(5,4),
  currency VARCHAR(10) DEFAULT 'YER',
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_tenant ON pricing_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active);

-- Ledger entries table
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  debit_account VARCHAR(100),
  credit_account VARCHAR(100),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'YER',
  fx_rate DECIMAL(10,6),
  fx_source VARCHAR(100),
  fx_timestamp TIMESTAMP,
  reporting_amount DECIMAL(15,2),
  reporting_currency VARCHAR(10),
  description TEXT,
  metadata JSONB,
  idempotency_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_tenant_type ON ledger_entries(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_ledger_entity ON ledger_entries(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ledger_idempotency ON ledger_entries(idempotency_key);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  actor_id UUID,
  actor_role VARCHAR(50),
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_action ON audit_logs(tenant_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);

-- Insert migration record
CREATE TABLE IF NOT EXISTS mikro_orm_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO mikro_orm_migrations (name) VALUES ('002_init_schema');
