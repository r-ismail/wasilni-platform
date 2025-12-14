// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER',
  AGENCY_ADMIN = 'AGENCY_ADMIN',
  DISPATCHER = 'DISPATCHER',
  FINANCE = 'FINANCE',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum TripStatus {
  REQUESTED = 'REQUESTED',
  ASSIGNED = 'ASSIGNED',
  DRIVER_ARRIVED = 'DRIVER_ARRIVED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ParcelStatus {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum TripType {
  IN_TOWN_TAXI = 'IN_TOWN_TAXI',
  IN_TOWN_SHARED = 'IN_TOWN_SHARED',
  OUT_TOWN_VIP = 'OUT_TOWN_VIP',
  OUT_TOWN_SHARED = 'OUT_TOWN_SHARED',
}

export enum ParcelSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTRA_LARGE = 'EXTRA_LARGE',
}

export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum Currency {
  YER = 'YER',
  USD = 'USD',
}

export enum LedgerEntryType {
  TRIP_CHARGE = 'TRIP_CHARGE',
  PARCEL_CHARGE = 'PARCEL_CHARGE',
  COMMISSION = 'COMMISSION',
  DRIVER_EARNING = 'DRIVER_EARNING',
  COD_COLLECTED = 'COD_COLLECTED',
  COD_SETTLEMENT = 'COD_SETTLEMENT',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum PaymentMethod {
  CASH = 'CASH',
  WALLET = 'WALLET',
  CARD = 'CARD',
}

export enum DriverStatus {
  OFFLINE = 'OFFLINE',
  ONLINE = 'ONLINE',
  BUSY = 'BUSY',
}

export enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  VAN = 'VAN',
  MINIBUS = 'MINIBUS',
}

export enum NotificationType {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const CITIES = {
  SANAA: 'SANAA',
  ADEN: 'ADEN',
} as const;

export const CORRIDORS = {
  SANAA_ADEN: 'SANAA_ADEN',
  ADEN_SANAA: 'ADEN_SANAA',
} as const;

export const DEFAULT_CURRENCY = Currency.YER;

export const PARCEL_SIZE_CONFIG = {
  [ParcelSize.SMALL]: { maxWeight: 5, maxDimensions: '30x30x30' },
  [ParcelSize.MEDIUM]: { maxWeight: 15, maxDimensions: '50x50x50' },
  [ParcelSize.LARGE]: { maxWeight: 30, maxDimensions: '80x80x80' },
  [ParcelSize.EXTRA_LARGE]: { maxWeight: 50, maxDimensions: '120x120x120' },
};

// ============================================================================
// TYPES
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city: string;
  district?: string;
  landmark?: string;
  coordinates: Coordinates;
}

export interface PricingBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  rushHourMultiplier?: number;
  vipMultiplier?: number;
  codFee?: number;
  urgencyFee?: number;
  discount?: number;
  total: number;
  currency: Currency;
}

export interface MoneyAmount {
  amount: number;
  currency: Currency;
  fxRate?: number;
  fxSource?: string;
  fxTimestamp?: Date;
  reportingAmount?: number;
  reportingCurrency?: Currency;
}

export interface TripEventPayload {
  status: TripStatus;
  timestamp: Date;
  location?: Coordinates;
  notes?: string;
  actorId?: string;
  actorRole?: UserRole;
}

export interface ParcelEventPayload {
  status: ParcelStatus;
  timestamp: Date;
  location?: Coordinates;
  notes?: string;
  photoUrl?: string;
  otpVerified?: boolean;
  actorId?: string;
  actorRole?: UserRole;
}

export interface DriverLocation {
  driverId: string;
  coordinates: Coordinates;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: Date;
}

export interface RatingData {
  score: number;
  comment?: string;
  tags?: string[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// SOCKET EVENTS
// ============================================================================

export enum SocketEvent {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Driver location
  DRIVER_LOCATION_UPDATE = 'driver:location:update',
  
  // Trip events
  TRIP_REQUESTED = 'trip:requested',
  TRIP_ASSIGNED = 'trip:assigned',
  TRIP_DRIVER_ARRIVED = 'trip:driver_arrived',
  TRIP_STARTED = 'trip:started',
  TRIP_COMPLETED = 'trip:completed',
  TRIP_CANCELLED = 'trip:cancelled',
  
  // Parcel events
  PARCEL_ASSIGNED = 'parcel:assigned',
  PARCEL_PICKED_UP = 'parcel:picked_up',
  PARCEL_IN_TRANSIT = 'parcel:in_transit',
  PARCEL_DELIVERED = 'parcel:delivered',
  PARCEL_CANCELLED = 'parcel:cancelled',
  
  // Notifications
  NOTIFICATION = 'notification',
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const isValidCoordinates = (coords: Coordinates): boolean => {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Yemen phone number format: +967XXXXXXXXX
  return /^\+967[0-9]{9}$/.test(phone);
};

export const isValidOTP = (otp: string): boolean => {
  return /^[0-9]{6}$/.test(otp);
};
