import { IsNumber, IsString, IsOptional } from 'class-validator';

export class PredictETADto {
  @IsNumber()
  pickupLat: number;

  @IsNumber()
  pickupLng: number;

  @IsNumber()
  dropoffLat: number;

  @IsNumber()
  dropoffLng: number;

  @IsString()
  @IsOptional()
  vehicleType?: string = 'taxi';
}
