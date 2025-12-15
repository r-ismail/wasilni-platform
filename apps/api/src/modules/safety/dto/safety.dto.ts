import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class EmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;
}

export class ActivateSOSDto {
  @IsString()
  tripId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];
}

export class ShareTripDto {
  @IsString()
  tripId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts: EmergencyContactDto[];
}
