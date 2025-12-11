import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReservationsService } from './reservations.service';

@Injectable()
export class SeatLockSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SeatLockSchedulerService.name);

  constructor(private readonly reservationsService: ReservationsService) {}

  onModuleInit() {
    this.logger.log('Seat lock scheduler initialized');
  }

  /**
   * Run every minute to release expired locked seats
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredLocks() {
    try {
      const result = await this.reservationsService.releaseExpiredLocks();
      if (result.releasedSeats > 0) {
        this.logger.log(
          `Released ${result.releasedSeats} expired locked seats`,
        );
      }
    } catch (error) {
      this.logger.error('Error releasing expired locks', error);
    }
  }
}

