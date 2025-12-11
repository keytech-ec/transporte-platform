import { HttpException, HttpStatus } from '@nestjs/common';

export class SeatNotAvailableException extends HttpException {
  constructor(seatId?: string) {
    super(
      seatId
        ? `Seat ${seatId} is not available`
        : 'One or more seats are not available',
      HttpStatus.CONFLICT,
    );
  }
}

export class ReservationExpiredException extends HttpException {
  constructor() {
    super('Reservation lock has expired. Please try again.', HttpStatus.GONE);
  }
}

export class InvalidLockIdException extends HttpException {
  constructor() {
    super('Invalid lock ID. Seats may have been released.', HttpStatus.BAD_REQUEST);
  }
}

export class TripNotFoundException extends HttpException {
  constructor(tripId: string) {
    super(`Trip with ID ${tripId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InsufficientSeatsException extends HttpException {
  constructor(required: number, available: number) {
    super(
      `Insufficient seats available. Required: ${required}, Available: ${available}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ReservationNotFoundException extends HttpException {
  constructor(idOrReference: string) {
    super(`Reservation with ID or reference ${idOrReference} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidReservationStatusException extends HttpException {
  constructor(currentStatus: string, requiredStatus?: string) {
    super(
      requiredStatus
        ? `Reservation status is ${currentStatus}. Expected: ${requiredStatus}`
        : `Invalid reservation status: ${currentStatus}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

