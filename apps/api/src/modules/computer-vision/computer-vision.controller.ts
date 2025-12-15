import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ComputerVisionService } from './services/computer-vision.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('computer-vision')
@UseGuards(JwtAuthGuard)
export class ComputerVisionController {
  constructor(private readonly computerVisionService: ComputerVisionService) {}

  @Post('verify-pickup')
  async verifyPickup(@Body() body: any) {
    return this.computerVisionService.verifyPickupProof(
      body.parcelId,
      body.imageUrl,
      body.metadata,
    );
  }

  @Post('verify-delivery')
  async verifyDelivery(@Body() body: any) {
    return this.computerVisionService.verifyDeliveryProof(
      body.parcelId,
      body.imageUrl,
      body.metadata,
    );
  }

  @Post('verify-kyc')
  async verifyKYC(@Body() body: any) {
    return this.computerVisionService.verifyKYCDocument(
      body.driverId,
      body.documentType,
      body.frontImageUrl,
      body.backImageUrl,
      body.selfieImageUrl,
    );
  }

  @Post('detect-parcel-size')
  async detectParcelSize(@Body() body: any) {
    return this.computerVisionService.detectParcelSize(body.imageUrl);
  }

  @Post('verify-package-condition')
  async verifyPackageCondition(@Body() body: any) {
    return this.computerVisionService.verifyPackageCondition(body.imageUrl);
  }
}
