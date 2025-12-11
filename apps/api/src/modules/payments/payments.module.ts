import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { DeunaGateway } from './gateways/deuna.gateway';
import { PayphoneGateway } from './gateways/payphone.gateway';
import { DeunaWebhook } from './webhooks/deuna.webhook';
import { PayphoneWebhook } from './webhooks/payphone.webhook';
import { ReservationsModule } from '../reservations/reservations.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [ReservationsModule, PrismaModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    DeunaGateway,
    PayphoneGateway,
    DeunaWebhook,
    PayphoneWebhook,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
