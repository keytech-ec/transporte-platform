import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  providerId!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  serviceTypeId!: string;

  @ApiProperty({ example: 'Cuenca' })
  @IsString()
  origin!: string;

  @ApiProperty({ example: 'Guayaquil' })
  @IsString()
  destination!: string;

  @ApiProperty({ example: 'Cuenca - Guayaquil' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 8.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiProperty({ example: 240, required: false, description: 'Duración en minutos' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;
}

