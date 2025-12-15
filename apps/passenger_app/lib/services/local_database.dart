import 'dart:async';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabase {
  static final LocalDatabase instance = LocalDatabase._init();
  static Database? _database;

  LocalDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('wasilni_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Trips table
    await db.execute('''
      CREATE TABLE trips (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        pickup_lat REAL NOT NULL,
        pickup_lng REAL NOT NULL,
        pickup_address TEXT NOT NULL,
        dropoff_lat REAL NOT NULL,
        dropoff_lng REAL NOT NULL,
        dropoff_address TEXT NOT NULL,
        estimated_fare REAL NOT NULL,
        currency TEXT NOT NULL,
        women_only_ride INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      )
    ''');

    // Parcels table
    await db.execute('''
      CREATE TABLE parcels (
        id TEXT PRIMARY KEY,
        sender_name TEXT NOT NULL,
        sender_phone TEXT NOT NULL,
        receiver_name TEXT NOT NULL,
        receiver_phone TEXT NOT NULL,
        pickup_address TEXT NOT NULL,
        dropoff_address TEXT NOT NULL,
        size TEXT NOT NULL,
        cod_amount REAL DEFAULT 0,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      )
    ''');

    // Favorites table
    await db.execute('''
      CREATE TABLE favorites (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        type TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');

    // Cache table for API responses
    await db.execute('''
      CREATE TABLE cache (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )
    ''');
  }

  // Trip operations
  Future<void> insertTrip(Map<String, dynamic> trip) async {
    final db = await database;
    await db.insert('trips', trip, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<Map<String, dynamic>>> getUnsyncedTrips() async {
    final db = await database;
    return await db.query('trips', where: 'synced = ?', whereArgs: [0]);
  }

  Future<void> markTripSynced(String id) async {
    final db = await database;
    await db.update('trips', {'synced': 1}, where: 'id = ?', whereArgs: [id]);
  }

  Future<List<Map<String, dynamic>>> getRecentTrips({int limit = 20}) async {
    final db = await database;
    return await db.query(
      'trips',
      orderBy: 'created_at DESC',
      limit: limit,
    );
  }

  // Parcel operations
  Future<void> insertParcel(Map<String, dynamic> parcel) async {
    final db = await database;
    await db.insert('parcels', parcel, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<Map<String, dynamic>>> getUnsyncedParcels() async {
    final db = await database;
    return await db.query('parcels', where: 'synced = ?', whereArgs: [0]);
  }

  Future<void> markParcelSynced(String id) async {
    final db = await database;
    await db.update('parcels', {'synced': 1}, where: 'id = ?', whereArgs: [id]);
  }

  // Favorites operations
  Future<void> insertFavorite(Map<String, dynamic> favorite) async {
    final db = await database;
    await db.insert('favorites', favorite, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<Map<String, dynamic>>> getFavorites() async {
    final db = await database;
    return await db.query('favorites', orderBy: 'created_at DESC');
  }

  Future<void> deleteFavorite(String id) async {
    final db = await database;
    await db.delete('favorites', where: 'id = ?', whereArgs: [id]);
  }

  // Cache operations
  Future<void> setCache(String key, String data, Duration ttl) async {
    final db = await database;
    final expiresAt = DateTime.now().add(ttl).toIso8601String();
    
    await db.insert(
      'cache',
      {'key': key, 'data': data, 'expires_at': expiresAt},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<String?> getCache(String key) async {
    final db = await database;
    final results = await db.query('cache', where: 'key = ?', whereArgs: [key]);
    
    if (results.isEmpty) return null;
    
    final expiresAt = DateTime.parse(results.first['expires_at'] as String);
    if (DateTime.now().isAfter(expiresAt)) {
      await db.delete('cache', where: 'key = ?', whereArgs: [key]);
      return null;
    }
    
    return results.first['data'] as String;
  }

  Future<void> clearExpiredCache() async {
    final db = await database;
    final now = DateTime.now().toIso8601String();
    await db.delete('cache', where: 'expires_at < ?', whereArgs: [now]);
  }

  Future<void> clearAllData() async {
    final db = await database;
    await db.delete('trips');
    await db.delete('parcels');
    await db.delete('favorites');
    await db.delete('cache');
  }

  Future<void> close() async {
    final db = await database;
    await db.close();
  }
}
