import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsDateString, IsInt, IsEnum, IsNumber, Min } from 'class-validator';

export enum BookingMode {
  PER_SEAT = 'PER_SEAT',
  FULL_VEHICLE = 'FULL_VEHICLE',
  BOTH = 'BOTH',
}

export class CreateTripDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ example: '2024-12-15' })
  @IsDateString()
  departureDate: string;

  @ApiProperty({ example: '06:00:00' })
  @IsString()
  departureTime: string;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  totalSeats: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(0)
  availableSeats: number;

  @ApiProperty({ example: 8.5 })
  @IsNumber()
  @Min(0)
  pricePerSeat: number;

  @ApiProperty({ enum: BookingMode, default: BookingMode.PER_SEAT })
  @IsEnum(BookingMode)
  bookingMode: BookingMode;
}

