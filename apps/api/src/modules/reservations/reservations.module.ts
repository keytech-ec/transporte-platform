import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SeatLockSchedulerService } from './seat-lock-scheduler.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, SeatLockSchedulerService],
  exports: [ReservationsService],
})
export class ReservationsModule {}

