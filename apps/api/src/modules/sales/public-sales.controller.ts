import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SalesService } from './sales.service';
import { CompletePassengerFormDto } from './dto/complete-passenger-form.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('public/passenger-form')
@Controller('public/passenger-form')
@Public()
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests por minuto
export class PublicSalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Obtener información del formulario de pasajeros por token (público)' })
  @ApiResponse({ status: 200, description: 'Información de la reserva' })
  @ApiResponse({ status: 404, description: 'Token inválido o reserva no encontrada' })
  async getPassengerForm(@Param('token') token: string) {
    const data = await this.salesService.getPassengerFormByToken(token);

    return {
      success: true,
      data,
    };
  }

  @Post(':token/complete')
  @ApiOperation({ summary: 'Completar formulario de pasajeros (público)' })
  @ApiResponse({ status: 200, description: 'Formulario completado exitosamente' })
  @ApiResponse({ status: 400, description: 'Formulario expirado o ya completado' })
  @ApiResponse({ status: 404, description: 'Token inválido' })
  async completePassengerForm(
    @Param('token') token: string,
    @Body() dto: CompletePassengerFormDto,
  ) {
    const result = await this.salesService.completePassengerForm(token, dto);

    return {
      success: true,
      data: result,
      message: result.message,
    };
  }
}
