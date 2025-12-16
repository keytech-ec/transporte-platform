import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        ...createVehicleDto,
      },
    });
    return vehicle;
  }

  async findAll() {
    const vehicles = await this.prisma.vehicle.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return vehicles;
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    // Check if vehicle exists
    await this.findOne(id);

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...updateVehicleDto,
      },
    });

    return vehicle;
  }

  async remove(id: string) {
    // Check if vehicle exists
    await this.findOne(id);

    await this.prisma.vehicle.delete({
      where: { id },
    });

    return { message: 'Vehicle deleted successfully' };
  }
}

