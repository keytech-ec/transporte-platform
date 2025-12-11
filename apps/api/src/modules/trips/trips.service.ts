import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  create(_createTripDto: CreateTripDto) {
    // TODO: Implement create logic
    return { message: 'Create trip - to be implemented' };
  }

  findAll() {
    // TODO: Implement findAll logic
    return { message: 'Find all trips - to be implemented' };
  }

  findOne(id: string) {
    // TODO: Implement findOne logic
    return { message: 'Find one trip - to be implemented', id };
  }

  update(id: string, _updateTripDto: UpdateTripDto) {
    // TODO: Implement update logic
    return { message: 'Update trip - to be implemented', id };
  }

  remove(id: string) {
    // TODO: Implement remove logic
    return { message: 'Remove trip - to be implemented', id };
  }
}

