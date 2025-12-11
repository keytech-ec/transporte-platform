import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchTripsDto {
  @ApiProperty({ example: 'Cuenca', description: 'Origin city' })
  @IsString()
  origin!: string;

  @ApiProperty({ example: 'Guayaquil', description: 'Destination city' })
  @IsString()
  destination!: string;

  @ApiProperty({ example: '2025-01-15', description: 'Departure date (YYYY-MM-DD)' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 2, description: 'Number of passengers', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  passengers!: number;
}

