import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';

class AuthState {
  final bool isAuthenticated;
  final String? accessToken;
  final String? driverId;
  final String? phone;
  final String? kycStatus;

  AuthState({
    this.isAuthenticated = false,
    this.accessToken,
    this.driverId,
    this.phone,
    this.kycStatus,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    String? accessToken,
    String? driverId,
    String? phone,
    String? kycStatus,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      accessToken: accessToken ?? this.accessToken,
      driverId: driverId ?? this.driverId,
      phone: phone ?? this.phone,
      kycStatus: kycStatus ?? this.kycStatus,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _apiService;

  AuthNotifier(this._apiService) : super(AuthState());

  Future<void> sendOtp(String phone) async {
    await _apiService.sendOtp(phone);
  }

  Future<bool> verifyOtp(String phone, String otp) async {
    try {
      final response = await _apiService.verifyOtp(phone, otp);
      state = state.copyWith(
        isAuthenticated: true,
        accessToken: response['accessToken'],
        driverId: response['user']['id'],
        phone: response['user']['phone'],
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  void logout() {
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return AuthNotifier(apiService);
});
