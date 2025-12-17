import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear viaje programado' })
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los viajes' })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Query('serviceId') serviceId?: string,
    @Query('vehicleId') vehicleId?: string,
  ) {
    return this.tripsService.findAll({ startDate, endDate, status, serviceId, vehicleId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener viaje por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar viaje' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, updateTripDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar viaje' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.remove(id);
  }
}


