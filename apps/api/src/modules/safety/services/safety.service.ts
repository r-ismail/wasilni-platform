import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Trip } from '../../../database/entities/trip.entity';
import { TripStatus } from '@wasilni/shared';
import { ActivateSOSDto, ShareTripDto } from '../dto/safety.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SafetyService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: EntityRepository<Trip>,
  ) {}

  /**
   * Activate SOS for a trip - sends alerts to emergency contacts
   */
  async activateSOS(userId: string, dto: ActivateSOSDto): Promise<Trip> {
    const trip = await this.tripRepository.findOne(
      { id: dto.tripId },
      { populate: ['customer', 'driver'] },
    );

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.customer.id !== userId) {
      throw new BadRequestException('You can only activate SOS for your own trips');
    }

    if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
      throw new BadRequestException('Cannot activate SOS for completed or cancelled trips');
    }

    if (trip.sosActivated) {
      throw new BadRequestException('SOS is already activated for this trip');
    }

    // Update trip with SOS information
    trip.sosActivated = true;
    trip.sosActivatedAt = new Date();
    
    if (dto.emergencyContacts) {
      trip.emergencyContacts = dto.emergencyContacts.map(contact => ({
        ...contact,
        notified: false,
      }));
    }

    await this.tripRepository.flush();

    // Send SMS/Push notifications to emergency contacts
    await this.notifyEmergencyContacts(trip);

    // Alert platform admins
    await this.alertAdmins(trip);

    return trip;
  }

  /**
   * Share live trip tracking with trusted contacts
   */
  async shareTripTracking(userId: string, dto: ShareTripDto): Promise<{ trackingUrl: string }> {
    const trip = await this.tripRepository.findOne(
      { id: dto.tripId },
      { populate: ['customer'] },
    );

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.customer.id !== userId) {
      throw new BadRequestException('You can only share your own trips');
    }

    // Generate unique tracking URL
    const trackingToken = uuidv4();
    trip.shareTrackingUrl = `https://wasilni.app/track/${trackingToken}`;
    trip.emergencyContacts = dto.emergencyContacts.map(contact => ({
      ...contact,
      notified: false,
    }));

    await this.tripRepository.flush();

    // Send tracking URL to emergency contacts
    await this.sendTrackingLinks(trip, dto.emergencyContacts);

    return { trackingUrl: trip.shareTrackingUrl };
  }

  /**
   * Get live trip location (for shared tracking)
   */
  async getTripLocation(trackingToken: string): Promise<any> {
    const trip = await this.tripRepository.findOne(
      { shareTrackingUrl: { $like: `%${trackingToken}%` } },
      { populate: ['driver'] },
    );

    if (!trip) {
      throw new NotFoundException('Trip not found or tracking link expired');
    }

    return {
      tripId: trip.id,
      status: trip.status,
      pickupAddress: trip.pickupAddress,
      dropoffAddress: trip.dropoffAddress,
      currentLocation: trip.driver?.currentLocation,
      estimatedArrival: trip.estimatedArrivalTime,
      driverName: trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : null,
      driverPhone: trip.driver?.phone,
      vehicleInfo: trip.driver ? {
        make: trip.driver.vehicleMake,
        model: trip.driver.vehicleModel,
        plateNumber: trip.driver.vehiclePlateNumber,
      } : null,
    };
  }

  /**
   * Deactivate SOS when situation is resolved
   */
  async deactivateSOS(userId: string, tripId: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne(
      { id: tripId },
      { populate: ['customer'] },
    );

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.customer.id !== userId) {
      throw new BadRequestException('You can only deactivate SOS for your own trips');
    }

    if (!trip.sosActivated) {
      throw new BadRequestException('SOS is not activated for this trip');
    }

    trip.sosActivated = false;

    await this.tripRepository.flush();

    return trip;
  }

  /**
   * Send notifications to emergency contacts (SMS + Push)
   */
  private async notifyEmergencyContacts(trip: Trip): Promise<void> {
    // TODO: Integrate with SMS provider and push notification service
    console.log(`[SOS] Notifying emergency contacts for trip ${trip.id}`);
    
    if (!trip.emergencyContacts) return;

    for (const contact of trip.emergencyContacts) {
      const message = `EMERGENCY ALERT: ${trip.customer.firstName} has activated SOS during a trip. Track live: ${trip.shareTrackingUrl || 'N/A'}`;
      
      // Send SMS (integrate with Twilio/local provider)
      console.log(`[SOS] SMS to ${contact.phone}: ${message}`);
      
      // Mark as notified
      contact.notified = true;
    }

    await this.tripRepository.flush();
  }

  /**
   * Alert platform admins about SOS activation
   */
  private async alertAdmins(trip: Trip): Promise<void> {
    // TODO: Send alerts to admin dashboard and support team
    console.log(`[SOS] Admin alert for trip ${trip.id} - Customer: ${trip.customer.phone}, Driver: ${trip.driver?.phone}`);
  }

  /**
   * Send tracking links to emergency contacts
   */
  private async sendTrackingLinks(trip: Trip, contacts: any[]): Promise<void> {
    console.log(`[TRACKING] Sending tracking links for trip ${trip.id}`);
    
    for (const contact of contacts) {
      const message = `${trip.customer.firstName} is sharing their trip with you. Track live: ${trip.shareTrackingUrl}`;
      
      // Send SMS
      console.log(`[TRACKING] SMS to ${contact.phone}: ${message}`);
    }
  }
}
