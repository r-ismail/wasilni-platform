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
      'role': 'CUSTOMER',
    });
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp) async {
    final response = await _dio.post('/auth/verify-otp', data: {
      'phone': phone,
      'otp': otp,
      'role': 'CUSTOMER',
    });
    return response.data;
  }

  // Trip endpoints
  Future<Map<String, dynamic>> createTrip(Map<String, dynamic> tripData) async {
    final response = await _dio.post('/trips', data: tripData);
    return response.data;
  }

  Future<List<dynamic>> getMyTrips() async {
    final response = await _dio.get('/trips/my-trips');
    return response.data;
  }

  // Parcel endpoints
  Future<Map<String, dynamic>> createParcel(Map<String, dynamic> parcelData) async {
    final response = await _dio.post('/parcels', data: parcelData);
    return response.data;
  }

  Future<List<dynamic>> getMyParcels() async {
    final response = await _dio.get('/parcels/my-parcels');
    return response.data;
  }
}

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});
