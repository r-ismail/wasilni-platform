-- Seed initial data for Wasilni platform

-- Insert Tenants
INSERT INTO tenants (id, name, name_ar, slug, description, contact_email, contact_phone, address, settings, is_active)
VALUES 
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Sana''a Transport Agency',
    'وكالة نقل صنعاء',
    'sanaa-agency',
    'Main transport agency in Sana''a',
    'info@sanaa-agency.ye',
    '+967771234567',
    '{"city": "SANAA", "district": "Al-Tahrir"}',
    '{"defaultCurrency": "YER", "commissionRate": 0.15, "features": ["IN_TOWN_TAXI", "OUT_TOWN_VIP", "OUT_TOWN_SHARED", "PARCELS"]}',
    true
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Aden Transport Agency',
    'وكالة نقل عدن',
    'aden-agency',
    'Main transport agency in Aden',
    'info@aden-agency.ye',
    '+967772234567',
    '{"city": "ADEN", "district": "Crater"}',
    '{"defaultCurrency": "YER", "commissionRate": 0.15, "features": ["IN_TOWN_TAXI", "OUT_TOWN_VIP", "OUT_TOWN_SHARED", "PARCELS"]}',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert Super Admin User
INSERT INTO users (id, phone, email, first_name, last_name, first_name_ar, last_name_ar, role, is_phone_verified, phone_verified_at, is_active)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  '+967771111111',
  'admin@wasilni.ye',
  'Super',
  'Admin',
  'مدير',
  'النظام',
  'SUPER_ADMIN',
  true,
  CURRENT_TIMESTAMP,
  true
)
ON CONFLICT (phone) DO NOTHING;

-- Insert Pricing Rules
-- In-town taxi pricing for Sana'a
INSERT INTO pricing_rules (tenant_id, name, name_ar, trip_type, base_fare, per_km_rate, per_minute_rate, minimum_fare, rush_hour_multiplier, rush_hour_windows, currency, is_active)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Sana''a In-Town Taxi',
  'تاكسي داخل صنعاء',
  'IN_TOWN_TAXI',
  500,
  100,
  20,
  500,
  1.5,
  '[{"dayOfWeek": 0, "startTime": "07:00", "endTime": "09:00"}, {"dayOfWeek": 0, "startTime": "16:00", "endTime": "19:00"}]',
  'YER',
  true
);

-- Out-town VIP pricing (Sana'a to Aden)
INSERT INTO pricing_rules (name, name_ar, trip_type, from_city, to_city, corridor, base_fare, vip_multiplier, minimum_fare, currency, is_active)
VALUES (
  'Sana''a-Aden VIP',
  'صنعاء-عدن VIP',
  'OUT_TOWN_VIP',
  'SANAA',
  'ADEN',
  'SANAA_ADEN',
  50000,
  1.3,
  50000,
  'YER',
  true
);

-- Parcel pricing - Small
INSERT INTO pricing_rules (name, name_ar, parcel_size, base_fare, per_km_rate, cod_fee_fixed, cod_fee_percentage, currency, is_active)
VALUES (
  'Small Parcel - In City',
  'طرد صغير - داخل المدينة',
  'SMALL',
  300,
  50,
  100,
  0.02,
  'YER',
  true
);

-- Parcel pricing - Medium
INSERT INTO pricing_rules (name, name_ar, parcel_size, base_fare, per_km_rate, cod_fee_fixed, cod_fee_percentage, currency, is_active)
VALUES (
  'Medium Parcel - In City',
  'طرد متوسط - داخل المدينة',
  'MEDIUM',
  500,
  75,
  150,
  0.02,
  'YER',
  true
);
