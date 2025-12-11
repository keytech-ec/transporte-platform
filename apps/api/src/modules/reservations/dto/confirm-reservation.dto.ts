import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmReservationDto {
  @ApiProperty({ example: 'Payment reference or confirmation code', required: false })
  @IsOptional()
  @IsString()
  paymentReference?: string;
}


