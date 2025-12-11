import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsInt, IsEnum, IsOptional, IsObject, Min } from 'class-validator';

export enum VehicleType {
  VAN = 'VAN',
  MINIBUS = 'MINIBUS',
  BUS = 'BUS',
  DOUBLE_DECKER = 'DOUBLE_DECKER',
  SUV = 'SUV',
}

export class CreateVehicleDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  providerId: string;

  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  plate: string;

  @ApiProperty({ example: 'Mercedes-Benz' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Sprinter' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(1900)
  year: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  totalSeats: number;

  @ApiProperty({ example: { rows: 10, seatsPerRow: 4, layout: '2-2' }, required: false })
  @IsOptional()
  @IsObject()
  seatLayout?: object;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiProperty({ example: { wifi: true, ac: true, bathroom: true }, required: false })
  @IsOptional()
  @IsObject()
  amenities?: object;
}

