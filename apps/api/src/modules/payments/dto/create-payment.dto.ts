import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum } from 'class-validator';
import { PaymentGateway } from '@transporte-platform/database';

export class CreatePaymentLinkDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la reserva',
  })
  @IsUUID()
  reservationId: string;

  @ApiProperty({
    enum: PaymentGateway,
    example: PaymentGateway.DEUNA,
    description: 'Gateway de pago a utilizar',
  })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;
}

