import { IsArray, IsString, IsEnum, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PassengerDto {
  @ApiProperty()
  @IsString()
  seatId: string;

  @ApiProperty({ enum: ['CEDULA', 'PASSPORT', 'RUC'] })
  @IsEnum(['CEDULA', 'PASSPORT', 'RUC'])
  documentType: 'CEDULA' | 'PASSPORT' | 'RUC';

  @ApiProperty()
  @IsString()
  documentNumber: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ enum: ['ADULT', 'CHILD', 'SENIOR'] })
  @IsEnum(['ADULT', 'CHILD', 'SENIOR'])
  passengerType: 'ADULT' | 'CHILD' | 'SENIOR';
}

export class CompletePassengerFormDto {
  @ApiProperty({ type: [PassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];
}
