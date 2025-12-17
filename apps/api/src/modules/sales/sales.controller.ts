import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateManualSaleDto } from './dto/create-manual-sale.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@transporte-platform/database';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('create')
  @ApiOperation({ summary: 'Crear venta manual (POS)' })
  @ApiResponse({ status: 201, description: 'Venta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o asientos no disponibles' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para crear ventas en este viaje' })
  async createManualSale(
    @Body() dto: CreateManualSaleDto,
    @CurrentUser() user: any,
  ) {
    if (!user.providerId) {
      throw new BadRequestException('El usuario debe pertenecer a un proveedor');
    }

    const result = await this.salesService.createManualSale(
      dto,
      user.id,
      user.providerId,
    );

    return {
      success: true,
      data: result,
      message: 'Venta creada exitosamente',
    };
  }

  @Get('my-sales')
  @ApiOperation({ summary: 'Obtener mis ventas como vendedor' })
  @ApiResponse({ status: 200, description: 'Lista de ventas del vendedor' })
  async getMySales(
    @CurrentUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('tripId') tripId?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const data = await this.salesService.getMySales(
      user.id,
      fromDate,
      toDate,
      tripId,
    );

    return {
      success: true,
      data,
    };
  }

  @Get('provider-sales')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.PROVIDER_ADMIN)
  @ApiOperation({ summary: 'Obtener todas las ventas del proveedor (solo admins)' })
  @ApiResponse({ status: 200, description: 'Ventas agrupadas por vendedor' })
  @ApiResponse({ status: 403, description: 'Solo admins pueden ver todas las ventas' })
  async getProviderSales(
    @CurrentUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (!user.providerId) {
      throw new BadRequestException('El usuario debe pertenecer a un proveedor');
    }

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const data = await this.salesService.getProviderSales(
      user.providerId,
      fromDate,
      toDate,
    );

    return {
      success: true,
      data,
    };
  }

  @Get('pending-forms')
  @ApiOperation({ summary: 'Obtener reservas con formularios de pasajeros pendientes' })
  @ApiResponse({ status: 200, description: 'Lista de formularios pendientes' })
  async getPendingForms(@CurrentUser() user: any) {
    if (!user.providerId) {
      throw new BadRequestException('El usuario debe pertenecer a un proveedor');
    }

    const data = await this.salesService.getPendingForms(user.providerId);

    return {
      success: true,
      data,
    };
  }

  @Post(':reservationId/resend-form')
  @ApiOperation({ summary: 'Reenviar link del formulario de pasajeros' })
  @ApiResponse({ status: 200, description: 'Link regenerado exitosamente' })
  @ApiResponse({ status: 400, description: 'El formulario ya fue completado' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  async resendForm(
    @Param('reservationId') reservationId: string,
    @Query('sendVia') sendVia: 'WHATSAPP' | 'EMAIL' | 'NONE' = 'NONE',
    @CurrentUser() user: any,
  ) {
    if (!user.providerId) {
      throw new BadRequestException('El usuario debe pertenecer a un proveedor');
    }

    const data = await this.salesService.resendForm(
      reservationId,
      user.id,
      user.providerId,
      sendVia,
    );

    return {
      success: true,
      data,
      message: 'Link regenerado exitosamente',
    };
  }
}
