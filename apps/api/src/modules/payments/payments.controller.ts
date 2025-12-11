import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentLinkDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '@transporte-platform/database';
import { DeunaWebhook } from './webhooks/deuna.webhook';
import { PayphoneWebhook } from './webhooks/payphone.webhook';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly deunaWebhook: DeunaWebhook,
    private readonly payphoneWebhook: PayphoneWebhook,
  ) {}

  @Post('create-link')
  @ApiOperation({ summary: 'Crear link de pago para una reserva' })
  async createPaymentLink(@Body() createPaymentDto: CreatePaymentLinkDto) {
    return this.paymentsService.createPaymentLink(createPaymentDto);
  }

  @Post('webhooks/deuna')
  @Public()
  @ApiOperation({ summary: 'Webhook de DeUNA para notificaciones de pago' })
  @ApiHeader({
    name: 'x-deuna-signature',
    description: 'Firma HMAC del webhook',
    required: false,
  })
  async handleDeunaWebhook(
    @Body() payload: any,
    @Headers('x-deuna-signature') signature?: string,
  ) {
    try {
      await this.deunaWebhook.handleWebhook(payload, signature);
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('DeUNA webhook error:', error);
      throw error;
    }
  }

  @Post('webhooks/payphone')
  @Public()
  @ApiOperation({ summary: 'Webhook de Payphone para notificaciones de pago' })
  @ApiHeader({
    name: 'x-payphone-signature',
    description: 'Firma HMAC del webhook',
    required: false,
  })
  async handlePayphoneWebhook(
    @Body() payload: any,
    @Headers('x-payphone-signature') signature?: string,
  ) {
    try {
      await this.payphoneWebhook.handleWebhook(payload, signature);
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Payphone webhook error:', error);
      throw error;
    }
  }

  @Get('transaction/:id')
  @ApiOperation({ summary: 'Obtener transacción por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Get('reservation/:reservationId')
  @ApiOperation({ summary: 'Obtener estado del pago por ID de reserva' })
  async getPaymentByReservationId(
    @Param('reservationId', ParseUUIDPipe) reservationId: string,
  ) {
    return this.paymentsService.getPaymentByReservationId(reservationId);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Iniciar proceso de reembolso',
    description: 'Solo disponible para SUPER_ADMIN o PROVIDER_ADMIN',
  })
  async refund(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.refund(id, user.role);
  }
}
