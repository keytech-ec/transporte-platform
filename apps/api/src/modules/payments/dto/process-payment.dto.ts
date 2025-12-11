import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsNumber, Min } from 'class-validator';

export enum PaymentGateway {
  DEUNA = 'DEUNA',
  PAYPHONE = 'PAYPHONE',
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
}

export class ProcessPaymentDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  reservationId: string;

  @ApiProperty({ example: 17.0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentGateway })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;
}

