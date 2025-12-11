import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsInt, IsEnum, Min } from 'class-validator';

export enum ReservationType {
  PER_SEAT = 'PER_SEAT',
  FULL_VEHICLE = 'FULL_VEHICLE',
}

export enum BookingChannel {
  WEB = 'WEB',
  TELEGRAM = 'TELEGRAM',
  WHATSAPP = 'WHATSAPP',
  PHONE = 'PHONE',
  DASHBOARD = 'DASHBOARD',
}

export class CreateReservationDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  tripId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ enum: ReservationType })
  @IsEnum(ReservationType)
  reservationType: ReservationType;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  numPassengers: number;

  @ApiProperty({ enum: BookingChannel, default: BookingChannel.WEB })
  @IsEnum(BookingChannel)
  channel: BookingChannel;
}

