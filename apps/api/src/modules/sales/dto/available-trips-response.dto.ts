import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, IsArray } from 'class-validator';
import { SeatSelectionMode } from '@transporte-platform/database';

export class AvailableTripDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  departureTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  arrivalTime?: string;

  @ApiProperty()
  @IsNumber()
  pricePerSeat: number;

  @ApiProperty()
  @IsNumber()
  availableSeats: number;

  @ApiProperty({ enum: ['NONE', 'OPTIONAL', 'REQUIRED'] })
  @IsEnum(['NONE', 'OPTIONAL', 'REQUIRED'])
  seatSelectionMode: SeatSelectionMode;

  @ApiProperty()
  @IsBoolean()
  requiresPassengerInfo: boolean;

  @ApiProperty()
  @IsString()
  vehicleType: string;

  @ApiProperty()
  @IsString()
  vehiclePlate: string;

  @ApiProperty()
  @IsBoolean()
  hasMultipleFloors: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  floorCount?: number;
}

export class ServiceGroupDto {
  @ApiProperty()
  @IsString()
  serviceId: string;

  @ApiProperty()
  @IsString()
  serviceName: string;

  @ApiProperty()
  @IsString()
  origin: string;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiProperty({ enum: ['NONE', 'OPTIONAL', 'REQUIRED'] })
  @IsEnum(['NONE', 'OPTIONAL', 'REQUIRED'])
  seatSelectionMode: SeatSelectionMode;

  @ApiProperty()
  @IsBoolean()
  requiresPassengerInfo: boolean;

  @ApiProperty({ type: [AvailableTripDto] })
  @IsArray()
  trips: AvailableTripDto[];
}

export class AvailableTripsResponseDto {
  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty({ type: [ServiceGroupDto] })
  @IsArray()
  services: ServiceGroupDto[];
}
