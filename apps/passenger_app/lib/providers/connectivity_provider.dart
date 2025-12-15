import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:async';

class ConnectivityState {
  final bool isOnline;
  final int pendingSync;
  
  ConnectivityState({
    required this.isOnline,
    this.pendingSync = 0,
  });
  
  ConnectivityState copyWith({
    bool? isOnline,
    int? pendingSync,
  }) {
    return ConnectivityState(
      isOnline: isOnline ?? this.isOnline,
      pendingSync: pendingSync ?? this.pendingSync,
    );
  }
}

class ConnectivityNotifier extends StateNotifier<ConnectivityState> {
  StreamSubscription<ConnectivityResult>? _subscription;
  
  ConnectivityNotifier() : super(ConnectivityState(isOnline: true)) {
    _init();
  }
  
  void _init() async {
    // Check initial connectivity
    final result = await Connectivity().checkConnectivity();
    state = state.copyWith(isOnline: result != ConnectivityResult.none);
    
    // Listen to connectivity changes
    _subscription = Connectivity().onConnectivityChanged.listen((result) {
      final wasOnline = state.isOnline;
      final isOnline = result != ConnectivityResult.none;
      
      state = state.copyWith(isOnline: isOnline);
      
      // Trigger sync when coming back online
      if (!wasOnline && isOnline) {
        _onConnectionRestored();
      }
    });
  }
  
  void _onConnectionRestored() {
    print('[CONNECTIVITY] Connection restored, triggering sync...');
    // This will be handled by OfflineSyncService
  }
  
  void updatePendingSync(int count) {
    state = state.copyWith(pendingSync: count);
  }
  
  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}

final connectivityProvider = StateNotifierProvider<ConnectivityNotifier, ConnectivityState>((ref) {
  return ConnectivityNotifier();
});
