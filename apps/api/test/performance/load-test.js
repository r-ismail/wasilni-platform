import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.01'],    // Error rate should be below 1%
    errors: ['rate<0.05'],              // Custom error rate below 5%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

// Test data
const testPhones = [
  '+967771111001',
  '+967771111002',
  '+967771111003',
  '+967771111004',
  '+967771111005',
];

function getRandomPhone() {
  return testPhones[Math.floor(Math.random() * testPhones.length)];
}

function authenticate() {
  const phone = getRandomPhone();
  
  // Send OTP
  const otpResponse = http.post(`${BASE_URL}/auth/send-otp`, JSON.stringify({
    phone,
    role: 'CUSTOMER',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(otpResponse, {
    'OTP sent successfully': (r) => r.status === 200,
  }) || errorRate.add(1);

  // Verify OTP
  const authResponse = http.post(`${BASE_URL}/auth/verify-otp`, JSON.stringify({
    phone,
    otp: '123456',
    role: 'CUSTOMER',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(authResponse, {
    'Authentication successful': (r) => r.status === 200,
    'Token received': (r) => r.json('accessToken') !== undefined,
  }) || errorRate.add(1);

  return authResponse.json('accessToken');
}

export default function () {
  // Authenticate
  const token = authenticate();
  
  if (!token) {
    errorRate.add(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Simulate user behavior
  const scenario = Math.random();

  if (scenario < 0.6) {
    // 60% - Create new trip
    createTrip(headers);
  } else if (scenario < 0.8) {
    // 20% - Track active trip
    trackTrip(headers);
  } else if (scenario < 0.9) {
    // 10% - View trip history
    viewHistory(headers);
  } else {
    // 10% - Wallet operations
    walletOperations(headers);
  }

  sleep(1);
}

function createTrip(headers) {
  const tripData = {
    pickupLat: 15.3694 + (Math.random() - 0.5) * 0.1,
    pickupLng: 44.191 + (Math.random() - 0.5) * 0.1,
    dropoffLat: 15.4778 + (Math.random() - 0.5) * 0.1,
    dropoffLng: 44.2097 + (Math.random() - 0.5) * 0.1,
    tripType: 'IN_TOWN_TAXI',
    womenOnlyRide: Math.random() < 0.3,
  };

  const response = http.post(
    `${BASE_URL}/trips`,
    JSON.stringify(tripData),
    { headers }
  );

  check(response, {
    'Trip created': (r) => r.status === 201,
    'Trip has ID': (r) => r.json('id') !== undefined,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  // Predict ETA
  if (response.status === 201) {
    const etaResponse = http.post(
      `${BASE_URL}/ml/predict-eta`,
      JSON.stringify({
        pickupLat: tripData.pickupLat,
        pickupLng: tripData.pickupLng,
        dropoffLat: tripData.dropoffLat,
        dropoffLng: tripData.dropoffLng,
        vehicleType: 'SEDAN',
      }),
      { headers }
    );

    check(etaResponse, {
      'ETA predicted': (r) => r.status === 200,
      'ETA response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);
  }
}

function trackTrip(headers) {
  // Get user's active trips
  const response = http.get(`${BASE_URL}/trips/active`, { headers });

  check(response, {
    'Active trips retrieved': (r) => r.status === 200,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}

function viewHistory(headers) {
  const response = http.get(`${BASE_URL}/trips/history?page=1&limit=20`, { headers });

  check(response, {
    'History retrieved': (r) => r.status === 200,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}

function walletOperations(headers) {
  // Get wallet balance
  const balanceResponse = http.get(`${BASE_URL}/wallet/balance`, { headers });

  check(balanceResponse, {
    'Balance retrieved': (r) => r.status === 200,
    'Response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  // Get transactions
  const transactionsResponse = http.get(
    `${BASE_URL}/wallet/transactions?page=1&limit=10`,
    { headers }
  );

  check(transactionsResponse, {
    'Transactions retrieved': (r) => r.status === 200,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}

// Stress test scenario
export function stressTest() {
  const token = authenticate();
  
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Rapid-fire requests
  for (let i = 0; i < 10; i++) {
    http.get(`${BASE_URL}/trips/active`, { headers });
  }
}

// Spike test configuration
export const spikeOptions = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '10s', target: 500 }, // Sudden spike
    { duration: '3m', target: 500 },
    { duration: '10s', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '10s', target: 0 },
  ],
};
