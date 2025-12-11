import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsEnum,
  IsEmail,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export enum DocumentType {
  CEDULA = 'CEDULA',
  RUC = 'RUC',
  PASSPORT = 'PASSPORT',
}

export class CustomerInfoDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.CEDULA })
  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  documentNumber!: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: 'juan.perez@example.com', required: false })
  @IsOptional()
  @IsEmail()
  @IsString()
  email?: string;

  @ApiProperty({ example: '+593999999999' })
  @IsString()
  phone!: string;
}

export class PassengerDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  documentNumber!: string;

  @ApiProperty({ example: 'María' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'González' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  seatId!: string;
}

export class CreateReservationDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  tripId!: string;

  @ApiProperty({ example: 'lock-1234567890', description: 'Lock ID from lock-seats endpoint' })
  @IsString()
  lockId!: string;

  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    description: 'Array of seat IDs',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  seatIds!: string[];

  @ApiProperty({ type: CustomerInfoDto })
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer!: CustomerInfoDto;

  @ApiProperty({ type: [PassengerDto], description: 'Array of passengers' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];

  @ApiProperty({ enum: ReservationType })
  @IsEnum(ReservationType)
  reservationType!: ReservationType;
}
