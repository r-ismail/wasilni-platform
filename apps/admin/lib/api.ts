const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://3000-inf588rlza16tttozgom9-66cb9b6b.manusvm.computer/api/v1';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async sendOTP(phone: string, role: string) {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, role }),
    });
  }

  async verifyOTP(phone: string, otp: string, role: string) {
    const data = await this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, role }),
    });
    if (data.accessToken) {
      this.setToken(data.accessToken);
    }
    return data;
  }

  // Users
  async getProfile() {
    return this.request('/users/me');
  }

  // Trips (mock for now)
  async getTrips() {
    // TODO: Replace with real API call when backend is ready
    return {
      trips: [
        { id: 'T-1001', customer: 'Ahmed Ali', driver: 'Mohammed Hassan', from: 'Sana\'a Downtown', to: 'Airport', type: 'In-Town Taxi', status: 'Completed', amount: '2,500 YER', date: '2025-12-15 10:30' },
        { id: 'T-1002', customer: 'Fatima Said', driver: 'Ali Abdullah', from: 'Taiz', to: 'Aden', type: 'Out-Town VIP', status: 'In Progress', amount: '15,000 YER', date: '2025-12-15 09:15' },
      ]
    };
  }

  async createTrip(tripData: any) {
    // TODO: Replace with real API call
    console.log('Creating trip:', tripData);
    return { success: true, message: 'Trip created successfully' };
  }

  // Parcels (mock for now)
  async getParcels() {
    return {
      parcels: [
        { id: 'P-2001', sender: 'Ahmed Store', receiver: 'Fatima Ali', from: 'Sana\'a', to: 'Taiz', size: 'Medium', cod: '5,000 YER', status: 'Delivered', driver: 'Mohammed Hassan' },
      ]
    };
  }

  async createParcel(parcelData: any) {
    console.log('Creating parcel:', parcelData);
    return { success: true, message: 'Parcel created successfully' };
  }

  // Drivers (mock for now)
  async getDrivers() {
    return {
      drivers: [
        { id: 'D-3001', name: 'Mohammed Hassan', phone: '+967 777 111 222', vehicle: 'Toyota Corolla 2020', license: 'SAN-12345', status: 'Online', rating: 4.8, trips: 245, kyc: 'Approved' },
      ]
    };
  }

  async createDriver(driverData: any) {
    console.log('Creating driver:', driverData);
    return { success: true, message: 'Driver created successfully' };
  }

  // Agencies (mock for now)
  async getAgencies() {
    return {
      agencies: [
        { id: 'A-4001', name: 'Sana\'a Transport Agency', city: 'Sana\'a', drivers: 45, trips: 1234, revenue: '2.5M YER', status: 'Active', type: 'Taxi' },
      ]
    };
  }

  async createAgency(agencyData: any) {
    console.log('Creating agency:', agencyData);
    return { success: true, message: 'Agency created successfully' };
  }
}

export const api = new ApiService();
