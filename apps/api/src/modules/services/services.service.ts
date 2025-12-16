import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: {
        ...createServiceDto,
      },
      include: {
        provider: true,
        serviceType: true,
      },
    });

    // Convert Decimal fields to numbers
    return {
      ...service,
      basePrice: service.basePrice.toNumber(),
    };
  }

  async findAll() {
    const services = await this.prisma.service.findMany({
      include: {
        provider: true,
        serviceType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert Decimal fields to numbers
    return services.map(service => ({
      ...service,
      basePrice: service.basePrice.toNumber(),
    }));
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        provider: true,
        serviceType: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Convert Decimal fields to numbers
    return {
      ...service,
      basePrice: service.basePrice.toNumber(),
    };
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    // Check if service exists
    await this.findOne(id);

    const service = await this.prisma.service.update({
      where: { id },
      data: {
        ...updateServiceDto,
      },
      include: {
        provider: true,
        serviceType: true,
      },
    });

    // Convert Decimal fields to numbers
    return {
      ...service,
      basePrice: service.basePrice.toNumber(),
    };
  }

  async remove(id: string) {
    // Check if service exists
    await this.findOne(id);

    await this.prisma.service.delete({
      where: { id },
    });

    return { message: 'Service deleted successfully' };
  }
}

