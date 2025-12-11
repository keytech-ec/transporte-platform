import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';
import { LockSeatsDto } from './dto/lock-seats.dto';
import { SearchTripsDto } from './dto/search-trips.dto';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('trips/search')
  @ApiOperation({ summary: 'Buscar viajes disponibles' })
  @ApiQuery({ name: 'origin', description: 'Ciudad de origen', example: 'Cuenca' })
  @ApiQuery({ name: 'destination', description: 'Ciudad de destino', example: 'Guayaquil' })
  @ApiQuery({ name: 'date', description: 'Fecha de salida (YYYY-MM-DD)', example: '2025-01-15' })
  @ApiQuery({ name: 'passengers', description: 'Número de pasajeros', example: 2, type: Number })
  searchTrips(@Query() searchDto: SearchTripsDto) {
    return this.reservationsService.searchTrips(searchDto);
  }

  @Get('trips/:tripId/seats')
  @ApiOperation({ summary: 'Obtener mapa de asientos de un viaje' })
  getTripSeats(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.reservationsService.getTripSeats(tripId);
  }

  @Post('lock-seats')
  @ApiOperation({ summary: 'Bloquear asientos para checkout' })
  lockSeats(@Body() lockSeatsDto: LockSeatsDto) {
    return this.reservationsService.lockSeats(lockSeatsDto);
  }

  @Post()
  @ApiOperation({ summary: 'Crear reserva' })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Confirmar reserva (después del pago)' })
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() confirmReservationDto: ConfirmReservationDto,
  ) {
    return this.reservationsService.confirm(id, confirmReservationDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar reserva' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.cancel(id);
  }

  // Legacy endpoints for compatibility
  @Get()
  @ApiOperation({ summary: 'Listar todas las reservas' })
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('by-reference/:reference')
  @ApiOperation({ summary: 'Obtener reserva por booking reference' })
  findByReference(@Param('reference') reference: string) {
    return this.reservationsService.findByReference(reference);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reserva por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.findOne(id);
  }
}
