import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(createTripDto: CreateTripDto) {
    const trip = await this.prisma.scheduledTrip.create({
      data: {
        ...createTripDto,
      },
      include: {
        service: true,
        vehicle: true,
      },
    });

    // Convert Decimal fields to numbers
    return {
      ...trip,
      pricePerSeat: trip.pricePerSeat.toNumber(),
    };
  }

  async findAll() {
    const trips = await this.prisma.scheduledTrip.findMany({
      include: {
        service: true,
        vehicle: true,
      },
      orderBy: {
        departureDate: 'desc',
      },
    });

    // Convert Decimal fields to numbers
    return trips.map(trip => ({
      ...trip,
      pricePerSeat: trip.pricePerSeat.toNumber(),
    }));
  }

  async findOne(id: string) {
    const trip = await this.prisma.scheduledTrip.findUnique({
      where: { id },
      include: {
        service: true,
        vehicle: true,
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    // Convert Decimal fields to numbers
    return {
      ...trip,
      pricePerSeat: trip.pricePerSeat.toNumber(),
    };
  }

  async update(id: string, updateTripDto: UpdateTripDto) {
    // Check if trip exists
    await this.findOne(id);

    const trip = await this.prisma.scheduledTrip.update({
      where: { id },
      data: {
        ...updateTripDto,
      },
      include: {
        service: true,
        vehicle: true,
      },
    });

    // Convert Decimal fields to numbers
    return {
      ...trip,
      pricePerSeat: trip.pricePerSeat.toNumber(),
    };
  }

  async remove(id: string) {
    // Check if trip exists
    await this.findOne(id);

    await this.prisma.scheduledTrip.delete({
      where: { id },
    });

    return { message: 'Trip deleted successfully' };
  }
}

