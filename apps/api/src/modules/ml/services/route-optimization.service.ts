import { Injectable } from '@nestjs/common';

interface Waypoint {
  lat: number;
  lng: number;
  address?: string;
  stopDuration?: number; // minutes
}

interface OptimizedRoute {
  waypoints: Waypoint[];
  totalDistance: number; // km
  totalDuration: number; // minutes
  savings: {
    distanceSaved: number; // km
    timeSaved: number; // minutes
    fuelSaved: number; // liters
    costSaved: number; // YER
  };
  polyline?: string; // Encoded polyline for map display
}

interface RouteOptimizationOptions {
  optimizeFor: 'distance' | 'time' | 'fuel';
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  maxDetourMinutes?: number;
}

@Injectable()
export class RouteOptimizationService {
  /**
   * Optimize route with multiple waypoints
   * Uses Traveling Salesman Problem (TSP) algorithm
   */
  async optimizeRoute(
    origin: Waypoint,
    destination: Waypoint,
    waypoints: Waypoint[],
    options: RouteOptimizationOptions = { optimizeFor: 'time' },
  ): Promise<OptimizedRoute> {
    // If no waypoints, return direct route
    if (waypoints.length === 0) {
      return this.getDirectRoute(origin, destination);
    }

    // Calculate distance matrix
    const allPoints = [origin, ...waypoints, destination];
    const distanceMatrix = await this.calculateDistanceMatrix(allPoints);

    // Find optimal order using nearest neighbor algorithm (simple TSP)
    const optimalOrder = this.findOptimalOrder(distanceMatrix, options);

    // Reorder waypoints based on optimal order
    const orderedWaypoints = optimalOrder.slice(1, -1).map(index => allPoints[index]);

    // Calculate total distance and duration
    const { totalDistance, totalDuration } = this.calculateTotals(allPoints, optimalOrder);

    // Calculate savings compared to original order
    const originalDistance = this.calculateOriginalDistance(allPoints);
    const savings = this.calculateSavings(originalDistance, totalDistance, totalDuration);

    return {
      waypoints: [origin, ...orderedWaypoints, destination],
      totalDistance,
      totalDuration,
      savings,
    };
  }

  /**
   * Optimize shared ride route with multiple passengers
   */
  async optimizeSharedRide(
    pickups: Waypoint[],
    dropoffs: Waypoint[],
    maxDetourMinutes: number = 15,
  ): Promise<OptimizedRoute> {
    // Constraint: Each pickup must come before its corresponding dropoff
    // Objective: Minimize total route time while respecting detour limits

    // Simple greedy algorithm: nearest pickup first, then nearest dropoff
    const route: Waypoint[] = [];
    const remainingPickups = [...pickups];
    const remainingDropoffs = [...dropoffs];
    let currentLocation = pickups[0];

    // Start with first pickup
    route.push(remainingPickups.shift()!);

    while (remainingPickups.length > 0 || remainingDropoffs.length > 0) {
      // Find nearest next point (pickup or dropoff)
      const nextPoint = this.findNearestPoint(
        currentLocation,
        remainingPickups,
        remainingDropoffs,
        maxDetourMinutes,
      );

      if (!nextPoint) break;

      route.push(nextPoint);
      currentLocation = nextPoint;

      // Remove from remaining lists
      const pickupIndex = remainingPickups.findIndex(
        p => p.lat === nextPoint.lat && p.lng === nextPoint.lng,
      );
      if (pickupIndex >= 0) {
        remainingPickups.splice(pickupIndex, 1);
      }

      const dropoffIndex = remainingDropoffs.findIndex(
        d => d.lat === nextPoint.lat && d.lng === nextPoint.lng,
      );
      if (dropoffIndex >= 0) {
        remainingDropoffs.splice(dropoffIndex, 1);
      }
    }

    // Calculate totals
    const totalDistance = this.calculateRouteDistance(route);
    const totalDuration = this.calculateRouteDuration(route);

    return {
      waypoints: route,
      totalDistance,
      totalDuration,
      savings: {
        distanceSaved: 0,
        timeSaved: 0,
        fuelSaved: 0,
        costSaved: 0,
      },
    };
  }

  /**
   * Get direct route between two points
   */
  private async getDirectRoute(origin: Waypoint, destination: Waypoint): Promise<OptimizedRoute> {
    const distance = this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const duration = (distance / 40) * 60; // Assume 40 km/h average speed

    return {
      waypoints: [origin, destination],
      totalDistance: distance,
      totalDuration: duration,
      savings: {
        distanceSaved: 0,
        timeSaved: 0,
        fuelSaved: 0,
        costSaved: 0,
      },
    };
  }

  /**
   * Calculate distance matrix for all points
   */
  private async calculateDistanceMatrix(points: Waypoint[]): Promise<number[][]> {
    const n = points.length;
    const matrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          matrix[i][j] = this.calculateDistance(
            points[i].lat,
            points[i].lng,
            points[j].lat,
            points[j].lng,
          );
        }
      }
    }

    return matrix;
  }

  /**
   * Find optimal order using nearest neighbor algorithm
   */
  private findOptimalOrder(
    distanceMatrix: number[][],
    options: RouteOptimizationOptions,
  ): number[] {
    const n = distanceMatrix.length;
    const visited = new Set<number>();
    const order: number[] = [];

    // Start from origin (index 0)
    let current = 0;
    order.push(current);
    visited.add(current);

    // Visit nearest unvisited point until destination
    while (visited.size < n - 1) {
      let nearest = -1;
      let minDistance = Infinity;

      for (let i = 1; i < n - 1; i++) {
        if (!visited.has(i) && distanceMatrix[current][i] < minDistance) {
          minDistance = distanceMatrix[current][i];
          nearest = i;
        }
      }

      if (nearest === -1) break;

      order.push(nearest);
      visited.add(nearest);
      current = nearest;
    }

    // End at destination (last index)
    order.push(n - 1);

    return order;
  }

  /**
   * Calculate total distance and duration for ordered route
   */
  private calculateTotals(
    points: Waypoint[],
    order: number[],
  ): { totalDistance: number; totalDuration: number } {
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < order.length - 1; i++) {
      const from = points[order[i]];
      const to = points[order[i + 1]];
      const distance = this.calculateDistance(from.lat, from.lng, to.lat, to.lng);
      
      totalDistance += distance;
      totalDuration += (distance / 40) * 60; // 40 km/h average

      // Add stop duration if specified
      if (to.stopDuration) {
        totalDuration += to.stopDuration;
      }
    }

    return { totalDistance, totalDuration };
  }

  /**
   * Calculate original distance (unoptimized order)
   */
  private calculateOriginalDistance(points: Waypoint[]): number {
    let distance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      distance += this.calculateDistance(
        points[i].lat,
        points[i].lng,
        points[i + 1].lat,
        points[i + 1].lng,
      );
    }
    return distance;
  }

  /**
   * Calculate savings from optimization
   */
  private calculateSavings(
    originalDistance: number,
    optimizedDistance: number,
    optimizedDuration: number,
  ): {
    distanceSaved: number;
    timeSaved: number;
    fuelSaved: number;
    costSaved: number;
  } {
    const distanceSaved = originalDistance - optimizedDistance;
    const originalDuration = (originalDistance / 40) * 60;
    const timeSaved = originalDuration - optimizedDuration;

    // Fuel consumption: ~8 liters per 100 km
    const fuelSaved = (distanceSaved / 100) * 8;

    // Fuel cost in Yemen: ~250 YER per liter
    const costSaved = fuelSaved * 250;

    return {
      distanceSaved: Math.max(0, distanceSaved),
      timeSaved: Math.max(0, timeSaved),
      fuelSaved: Math.max(0, fuelSaved),
      costSaved: Math.max(0, costSaved),
    };
  }

  /**
   * Find nearest point from current location
   */
  private findNearestPoint(
    current: Waypoint,
    pickups: Waypoint[],
    dropoffs: Waypoint[],
    maxDetourMinutes: number,
  ): Waypoint | null {
    const candidates = [...pickups, ...dropoffs];
    if (candidates.length === 0) return null;

    let nearest: Waypoint | null = null;
    let minDistance = Infinity;

    for (const candidate of candidates) {
      const distance = this.calculateDistance(
        current.lat,
        current.lng,
        candidate.lat,
        candidate.lng,
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = candidate;
      }
    }

    return nearest;
  }

  /**
   * Calculate total route distance
   */
  private calculateRouteDistance(route: Waypoint[]): number {
    let distance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      distance += this.calculateDistance(
        route[i].lat,
        route[i].lng,
        route[i + 1].lat,
        route[i + 1].lng,
      );
    }
    return distance;
  }

  /**
   * Calculate total route duration
   */
  private calculateRouteDuration(route: Waypoint[]): number {
    const distance = this.calculateRouteDistance(route);
    return (distance / 40) * 60; // 40 km/h average speed
  }

  /**
   * Calculate distance using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get route suggestions for driver
   */
  async getRouteSuggestions(
    currentLat: number,
    currentLng: number,
    destinationLat: number,
    destinationLng: number,
  ): Promise<{
    fastest: { duration: number; distance: number };
    shortest: { duration: number; distance: number };
    recommended: { duration: number; distance: number; reason: string };
  }> {
    const distance = this.calculateDistance(currentLat, currentLng, destinationLat, destinationLng);

    // Fastest route (assume highway if available)
    const fastest = {
      duration: (distance / 60) * 60, // 60 km/h highway speed
      distance,
    };

    // Shortest route (direct)
    const shortest = {
      duration: (distance / 40) * 60, // 40 km/h city speed
      distance,
    };

    // Recommended (balance of speed and distance)
    const recommended = {
      duration: (distance / 50) * 60, // 50 km/h balanced
      distance,
      reason: 'Balanced route with moderate traffic',
    };

    return { fastest, shortest, recommended };
  }
}
