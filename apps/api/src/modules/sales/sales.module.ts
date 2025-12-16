import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { PublicSalesController } from './public-sales.controller';
import { SalesService } from './sales.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SalesController, PublicSalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
