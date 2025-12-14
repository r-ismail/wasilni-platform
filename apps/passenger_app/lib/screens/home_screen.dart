import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Wasilni'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.blue.shade50,
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 30,
                  child: Icon(Icons.person, size: 30),
                ),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Welcome',
                      style: TextStyle(fontSize: 14, color: Colors.grey),
                    ),
                    Text(
                      authState.phone ?? 'User',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              padding: const EdgeInsets.all(16),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _ServiceCard(
                  icon: Icons.local_taxi,
                  title: 'In-Town Taxi',
                  color: Colors.blue,
                  onTap: () {
                    // Navigate to taxi booking
                  },
                ),
                _ServiceCard(
                  icon: Icons.directions_car,
                  title: 'Out-Town VIP',
                  color: Colors.purple,
                  onTap: () {
                    // Navigate to VIP booking
                  },
                ),
                _ServiceCard(
                  icon: Icons.people,
                  title: 'Shared Ride',
                  color: Colors.green,
                  onTap: () {
                    // Navigate to shared ride booking
                  },
                ),
                _ServiceCard(
                  icon: Icons.local_shipping,
                  title: 'Send Parcel',
                  color: Colors.orange,
                  onTap: () {
                    // Navigate to parcel booking
                  },
                ),
                _ServiceCard(
                  icon: Icons.history,
                  title: 'My Trips',
                  color: Colors.teal,
                  onTap: () {
                    // Navigate to trips history
                  },
                ),
                _ServiceCard(
                  icon: Icons.inventory,
                  title: 'My Parcels',
                  color: Colors.brown,
                  onTap: () {
                    // Navigate to parcels history
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback onTap;

  const _ServiceCard({
    required this.icon,
    required this.title,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: color),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
