import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'api_service.dart';

class OfflineSyncService {
  static const String _queueKey = 'offline_queue';
  static const String _cacheKey = 'offline_cache';
  
  final ApiService _apiService;
  final SharedPreferences _prefs;
  
  OfflineSyncService(this._apiService, this._prefs);
  
  /// Check if device is online
  Future<bool> isOnline() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    return connectivityResult != ConnectivityResult.none;
  }
  
  /// Queue an API request for later execution when online
  Future<void> queueRequest({
    required String method,
    required String endpoint,
    Map<String, dynamic>? body,
    String? idempotencyKey,
  }) async {
    final queue = await _getQueue();
    
    final request = {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'method': method,
      'endpoint': endpoint,
      'body': body,
      'idempotencyKey': idempotencyKey ?? _generateIdempotencyKey(),
      'timestamp': DateTime.now().toIso8601String(),
      'retryCount': 0,
    };
    
    queue.add(request);
    await _saveQueue(queue);
  }
  
  /// Process queued requests when connection is restored
  Future<void> processQueue() async {
    if (!await isOnline()) return;
    
    final queue = await _getQueue();
    final failedRequests = <Map<String, dynamic>>[];
    
    for (final request in queue) {
      try {
        // Execute the queued request with idempotency key
        await _executeRequest(request);
        print('[SYNC] Successfully processed: ${request['endpoint']}');
      } catch (e) {
        print('[SYNC] Failed to process: ${request['endpoint']}, error: $e');
        
        // Retry logic with exponential backoff
        final retryCount = request['retryCount'] as int;
        if (retryCount < 3) {
          request['retryCount'] = retryCount + 1;
          failedRequests.add(request);
        } else {
          print('[SYNC] Max retries reached for: ${request['endpoint']}');
        }
      }
    }
    
    // Save failed requests back to queue
    await _saveQueue(failedRequests);
  }
  
  /// Cache data for offline access
  Future<void> cacheData(String key, Map<String, dynamic> data) async {
    final cache = await _getCache();
    cache[key] = {
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
    };
    await _saveCache(cache);
  }
  
  /// Get cached data
  Future<Map<String, dynamic>?> getCachedData(String key) async {
    final cache = await _getCache();
    final cached = cache[key];
    
    if (cached == null) return null;
    
    // Check if cache is still valid (24 hours)
    final timestamp = DateTime.parse(cached['timestamp'] as String);
    final age = DateTime.now().difference(timestamp);
    
    if (age.inHours > 24) {
      return null; // Cache expired
    }
    
    return cached['data'] as Map<String, dynamic>;
  }
  
  /// Clear all offline data
  Future<void> clearOfflineData() async {
    await _prefs.remove(_queueKey);
    await _prefs.remove(_cacheKey);
  }
  
  /// Get pending queue count
  Future<int> getPendingCount() async {
    final queue = await _getQueue();
    return queue.length;
  }
  
  // Private helper methods
  
  Future<List<Map<String, dynamic>>> _getQueue() async {
    final queueJson = _prefs.getString(_queueKey);
    if (queueJson == null) return [];
    
    final List<dynamic> decoded = jsonDecode(queueJson);
    return decoded.cast<Map<String, dynamic>>();
  }
  
  Future<void> _saveQueue(List<Map<String, dynamic>> queue) async {
    await _prefs.setString(_queueKey, jsonEncode(queue));
  }
  
  Future<Map<String, dynamic>> _getCache() async {
    final cacheJson = _prefs.getString(_cacheKey);
    if (cacheJson == null) return {};
    
    return jsonDecode(cacheJson) as Map<String, dynamic>;
  }
  
  Future<void> _saveCache(Map<String, dynamic> cache) async {
    await _prefs.setString(_cacheKey, jsonEncode(cache));
  }
  
  Future<void> _executeRequest(Map<String, dynamic> request) async {
    final method = request['method'] as String;
    final endpoint = request['endpoint'] as String;
    final body = request['body'] as Map<String, dynamic>?;
    final idempotencyKey = request['idempotencyKey'] as String;
    
    // Add idempotency key to headers
    final headers = {'X-Idempotency-Key': idempotencyKey};
    
    switch (method.toUpperCase()) {
      case 'POST':
        await _apiService.post(endpoint, body ?? {}, headers: headers);
        break;
      case 'PUT':
        await _apiService.put(endpoint, body ?? {}, headers: headers);
        break;
      case 'PATCH':
        await _apiService.patch(endpoint, body ?? {}, headers: headers);
        break;
      case 'DELETE':
        await _apiService.delete(endpoint, headers: headers);
        break;
    }
  }
  
  String _generateIdempotencyKey() {
    return '${DateTime.now().millisecondsSinceEpoch}_${DateTime.now().microsecond}';
  }
}
