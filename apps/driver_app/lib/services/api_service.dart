import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ApiService {
  final Dio _dio;
  static const String baseUrl = 'http://localhost:3000/api/v1';

  ApiService()
      : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 30),
            receiveTimeout: const Duration(seconds: 30),
            headers: {
              'Content-Type': 'application/json',
            },
          ),
        );

  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  // Auth endpoints
  Future<void> sendOtp(String phone) async {
    await _dio.post('/auth/send-otp', data: {
      'phone': phone,
      'role': 'DRIVER',
    });
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    final response = await _dio.post('/auth/verify-otp', data: {
      'phone': phone,
      'otp': otp,
      'role': 'DRIVER',
    });
    return response.data;
  }

  // Driver endpoints
  Future<void> updateStatus(String status) async {
    await _dio.patch('/drivers/status', data: {'status': status});
  }

  Future<void> updateLocation(double lat, double lng) async {
    await _dio.post('/drivers/location', data: {
      'latitude': lat,
      'longitude': lng,
    });
  }

  // Trip endpoints
  Future<void> acceptTrip(String tripId) async {
    await _dio.post('/trips/$tripId/accept');
  }

  Future<void> updateTripStatus(String tripId, String status) async {
    await _dio.patch('/trips/$tripId/status', data: {'status': status});
  }

  // Parcel endpoints
  Future<void> acceptParcel(String parcelId) async {
    await _dio.post('/parcels/$parcelId/accept');
  }

  Future<void> updateParcelStatus(String parcelId, String status) async {
    await _dio.patch('/parcels/$parcelId/status', data: {'status': status});
  }
}

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});
