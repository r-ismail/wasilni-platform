import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Parcel } from '../../../database/entities/parcel.entity';

interface ImageAnalysisResult {
  isValid: boolean;
  confidence: number; // 0-100
  detectedObjects: string[];
  metadata: {
    timestamp: Date;
    location?: { lat: number; lng: number };
    deviceId?: string;
  };
  issues?: string[];
}

interface KYCVerificationResult {
  isVerified: boolean;
  confidence: number;
  documentType: 'national_id' | 'passport' | 'driver_license';
  extractedData: {
    name?: string;
    idNumber?: string;
    dateOfBirth?: string;
    expiryDate?: string;
  };
  faceMatch?: {
    matched: boolean;
    confidence: number;
  };
  issues?: string[];
}

@Injectable()
export class ComputerVisionService {
  constructor(
    @InjectRepository(Parcel)
    private readonly parcelRepository: EntityRepository<Parcel>,
  ) {}

  /**
   * Verify proof of pickup photo
   */
  async verifyPickupProof(
    parcelId: string,
    imageUrl: string,
    metadata?: { lat: number; lng: number; timestamp: Date },
  ): Promise<ImageAnalysisResult> {
    // In production, this would call an AI service like AWS Rekognition, Google Vision AI, or Azure Computer Vision
    // For now, we'll implement a rule-based validation

    const result: ImageAnalysisResult = {
      isValid: true,
      confidence: 0,
      detectedObjects: [],
      metadata: {
        timestamp: metadata?.timestamp || new Date(),
        location: metadata ? { lat: metadata.lat, lng: metadata.lng } : undefined,
      },
      issues: [],
    };

    // Simulate image analysis
    // In production, this would:
    // 1. Download the image from the URL
    // 2. Send it to an AI vision service
    // 3. Analyze the response

    // Rule 1: Check if image URL is valid
    if (!imageUrl || !imageUrl.startsWith('http')) {
      result.isValid = false;
      result.confidence = 0;
      result.issues?.push('Invalid image URL');
      return result;
    }

    // Rule 2: Check metadata (location and timestamp)
    if (!metadata || !metadata.lat || !metadata.lng) {
      result.confidence = 50;
      result.issues?.push('Missing GPS coordinates - cannot verify location');
    } else {
      result.confidence = 85;
    }

    // Rule 3: Check timestamp freshness (should be within last 5 minutes)
    if (metadata?.timestamp) {
      const now = new Date();
      const diff = (now.getTime() - metadata.timestamp.getTime()) / 1000 / 60;
      if (diff > 5) {
        result.confidence = Math.max(result.confidence - 20, 30);
        result.issues?.push('Photo timestamp is too old');
      }
    }

    // Simulate AI detection
    result.detectedObjects = ['package', 'person', 'hand'];

    // Final validation
    if (result.confidence < 60) {
      result.isValid = false;
    }

    return result;
  }

  /**
   * Verify proof of delivery photo
   */
  async verifyDeliveryProof(
    parcelId: string,
    imageUrl: string,
    metadata?: { lat: number; lng: number; timestamp: Date },
  ): Promise<ImageAnalysisResult> {
    // Similar to pickup proof, but with different validation rules
    const result: ImageAnalysisResult = {
      isValid: true,
      confidence: 0,
      detectedObjects: [],
      metadata: {
        timestamp: metadata?.timestamp || new Date(),
        location: metadata ? { lat: metadata.lat, lng: metadata.lng } : undefined,
      },
      issues: [],
    };

    // Rule 1: Check if image URL is valid
    if (!imageUrl || !imageUrl.startsWith('http')) {
      result.isValid = false;
      result.confidence = 0;
      result.issues?.push('Invalid image URL');
      return result;
    }

    // Rule 2: Verify delivery location matches destination
    const parcel = await this.parcelRepository.findOne({ id: parcelId });
    if (parcel && metadata) {
      const distance = this.calculateDistance(
        metadata.lat,
        metadata.lng,
        parcel.dropoffLat,
        parcel.dropoffLng,
      );

      if (distance > 0.5) {
        // More than 500 meters away
        result.confidence = 40;
        result.issues?.push(`Delivery location is ${distance.toFixed(2)}km away from destination`);
      } else {
        result.confidence = 95;
      }
    } else {
      result.confidence = 70;
      result.issues?.push('Cannot verify delivery location');
    }

    // Simulate AI detection
    result.detectedObjects = ['package', 'door', 'building'];

    // Final validation
    if (result.confidence < 60) {
      result.isValid = false;
    }

    return result;
  }

  /**
   * Verify driver KYC documents using computer vision
   */
  async verifyKYCDocument(
    driverId: string,
    documentType: 'national_id' | 'passport' | 'driver_license',
    frontImageUrl: string,
    backImageUrl?: string,
    selfieImageUrl?: string,
  ): Promise<KYCVerificationResult> {
    // In production, this would use OCR and face recognition AI services
    const result: KYCVerificationResult = {
      isVerified: false,
      confidence: 0,
      documentType,
      extractedData: {},
      issues: [],
    };

    // Rule 1: Check if images are valid
    if (!frontImageUrl || !frontImageUrl.startsWith('http')) {
      result.confidence = 0;
      result.issues?.push('Invalid front image URL');
      return result;
    }

    // Simulate OCR extraction
    // In production, this would:
    // 1. Use OCR to extract text from the document
    // 2. Parse and validate the extracted data
    // 3. Check document authenticity (security features, holograms, etc.)

    result.extractedData = {
      name: 'Ahmed Mohammed Ali', // Placeholder
      idNumber: '1234567890',
      dateOfBirth: '1990-01-15',
      expiryDate: '2030-01-15',
    };

    result.confidence = 85;

    // Rule 2: Face matching (if selfie provided)
    if (selfieImageUrl) {
      // In production, this would use face recognition AI
      result.faceMatch = {
        matched: true,
        confidence: 92,
      };
      result.confidence = Math.min(result.confidence + 10, 95);
    } else {
      result.issues?.push('No selfie provided for face matching');
    }

    // Rule 3: Document expiry check
    if (result.extractedData.expiryDate) {
      const expiryDate = new Date(result.extractedData.expiryDate);
      const now = new Date();
      if (expiryDate < now) {
        result.isVerified = false;
        result.confidence = 0;
        result.issues?.push('Document has expired');
        return result;
      }
    }

    // Final verification
    if (result.confidence >= 80) {
      result.isVerified = true;
    } else {
      result.issues?.push('Confidence too low for automatic verification');
    }

    return result;
  }

  /**
   * Detect parcel size from image
   */
  async detectParcelSize(imageUrl: string): Promise<{
    size: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
    confidence: number;
    dimensions?: { width: number; height: number; depth: number }; // in cm
  }> {
    // In production, this would use AI to estimate package dimensions
    // For now, return a placeholder

    return {
      size: 'MEDIUM',
      confidence: 75,
      dimensions: {
        width: 30,
        height: 20,
        depth: 15,
      },
    };
  }

  /**
   * Verify package condition from image
   */
  async verifyPackageCondition(imageUrl: string): Promise<{
    condition: 'GOOD' | 'DAMAGED' | 'UNKNOWN';
    confidence: number;
    damageTypes?: string[];
  }> {
    // In production, this would use AI to detect damage
    // For now, return a placeholder

    return {
      condition: 'GOOD',
      confidence: 90,
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
