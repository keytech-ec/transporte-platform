import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';
import { LockSeatsDto } from './dto/lock-seats.dto';
import { SearchTripsDto } from './dto/search-trips.dto';
import {
  SeatNotAvailableException,
  ReservationExpiredException,
  InvalidLockIdException,
  TripNotFoundException,
  ReservationNotFoundException,
  InvalidReservationStatusException,
} from './exceptions/reservation.exceptions';
import { generateBookingReference } from './utils/booking-reference.util';
import { DocumentType, ReservationType, BookingChannel } from '@transporte-platform/database';

// Map to store lock information: lockId -> { tripId, seatIds, lockedUntil }
const lockStore = new Map<
  string,
  { tripId: string; seatIds: string[]; lockedUntil: Date }
>();

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 1. Search available trips
   */
  async searchTrips(searchDto: SearchTripsDto) {
    const { origin, destination, date, passengers } = searchDto;

    // Parse date to start of day for comparison (in local timezone, not UTC)
    const [year, month, day] = date.split('-').map(Number);
    const searchDate = new Date(year, month - 1, day); // month is 0-indexed
    searchDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(year, month - 1, day);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    const trips = await this.prisma.scheduledTrip.findMany({
      where: {
        service: {
          origin: {
            contains: origin,
            mode: 'insensitive',
          },
          destination: {
            contains: destination,
            mode: 'insensitive',
          },
        },
        departureDate: {
          gte: searchDate,
          lt: nextDay,
        },
        status: 'SCHEDULED',
        availableSeats: { gte: passengers },
      },
      include: {
        service: {
          include: {
            provider: true,
          },
        },
        vehicle: {
          include: {
            seats: true,
          },
        },
      },
      orderBy: {
        departureTime: 'asc',
      },
    });

    return trips.map((trip) => ({
      id: trip.id,
      origin: trip.service.origin,
      destination: trip.service.destination,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      pricePerSeat: trip.pricePerSeat.toNumber(),
      availableSeats: trip.availableSeats,
      totalSeats: trip.totalSeats,
      vehicle: {
        id: trip.vehicle.id,
        plate: trip.vehicle.plate,
        brand: trip.vehicle.brand,
        model: trip.vehicle.model,
        type: trip.vehicle.type,
        amenities: trip.vehicle.amenities,
        seatLayout: trip.vehicle.seatLayout,
      },
      provider: {
        id: trip.service.provider.id,
        businessName: trip.service.provider.businessName,
      },
    }));
  }

  /**
   * 2. Get seats for a trip
   */
  async getTripSeats(tripId: string) {
    const trip = await this.prisma.scheduledTrip.findUnique({
      where: { id: tripId },
      include: {
        service: true,
        vehicle: {
          include: {
            seats: {
              orderBy: [{ row: 'asc' }, { column: 'asc' }],
            },
          },
        },
        tripSeats: {
          include: {
            seat: true,
          },
        },
      },
    });

    if (!trip) {
      throw new TripNotFoundException(tripId);
    }

    // Create a map of seatId -> tripSeat for quick lookup
    const tripSeatMap = new Map(
      trip.tripSeats.map((ts) => [ts.seatId, ts]),
    );

    // Build seat layout
    const seats = trip.vehicle.seats.map((seat) => {
      const tripSeat = tripSeatMap.get(seat.id);
      const now = new Date();

      let status: 'available' | 'locked' | 'confirmed' | 'reserved' | 'blocked' = 'available';
      if (tripSeat) {
        if (tripSeat.status === 'CONFIRMED') {
          status = 'confirmed';
        } else if (tripSeat.status === 'RESERVED') {
          status = 'reserved';
        } else if (tripSeat.status === 'BLOCKED') {
          status = 'blocked';
        } else if (tripSeat.status === 'LOCKED' && tripSeat.lockedUntil && tripSeat.lockedUntil > now) {
          status = 'locked';
        } else if (tripSeat.status === 'LOCKED' && tripSeat.lockedUntil && tripSeat.lockedUntil <= now) {
          status = 'available'; // Expired lock
        }
      }

      return {
        id: seat.id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        column: seat.column,
        position: seat.position,
        tier: seat.tier,
        status,
        lockedUntil: tripSeat?.lockedUntil || null,
      };
    });

    return {
      tripId: trip.id,
      vehicleId: trip.vehicle.id,
      pricePerSeat: trip.pricePerSeat.toNumber(),
      origin: trip.service.origin,
      destination: trip.service.destination,
      departureDate: trip.departureDate,
      departureTime: trip.departureTime,
      seatLayout: trip.vehicle.seatLayout,
      seats,
    };
  }

  /**
   * 3. Lock seats for checkout
   */
  async lockSeats(lockDto: LockSeatsDto) {
    const { tripId, seatIds } = lockDto;

    // Verify trip exists
    const trip = await this.prisma.scheduledTrip.findUnique({
      where: { id: tripId },
      include: {
        tripSeats: {
          where: {
            seatId: { in: seatIds },
          },
        },
      },
    });

    if (!trip) {
      throw new TripNotFoundException(tripId);
    }

    // Check if seats are available
    const now = new Date();
    const lockDuration = 15 * 60 * 1000; // 15 minutes
    const lockedUntil = new Date(now.getTime() + lockDuration);

    // Use transaction to lock seats atomically
    const result = await this.prisma.$transaction(async (tx) => {
      // Verify all seats are available
      for (const seatId of seatIds) {
        const tripSeat = await tx.tripSeat.findFirst({
          where: {
            tripId,
            seatId,
          },
        });

        if (!tripSeat) {
          // Create trip seat if it doesn't exist
          await tx.tripSeat.create({
            data: {
              tripId,
              seatId,
              status: 'LOCKED',
              lockedUntil,
            },
          });
        } else {
          // Check if seat is available
          if (
            tripSeat.status === 'CONFIRMED' ||
            tripSeat.status === 'RESERVED' ||
            tripSeat.status === 'BLOCKED'
          ) {
            throw new SeatNotAvailableException(seatId);
          }

          // Check if lock expired
          if (
            tripSeat.status === 'LOCKED' &&
            tripSeat.lockedUntil &&
            tripSeat.lockedUntil > now
          ) {
            throw new SeatNotAvailableException(seatId);
          }

          // Lock the seat
          await tx.tripSeat.update({
            where: { id: tripSeat.id },
            data: {
              status: 'LOCKED',
              lockedUntil,
            },
          });
        }
      }

      return { lockedUntil };
    });

    // Generate lock ID
    const lockId = `lock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store lock information
    lockStore.set(lockId, {
      tripId,
      seatIds,
      lockedUntil: result.lockedUntil,
    });

    return {
      lockId,
      lockedUntil: result.lockedUntil,
      expiresIn: 15 * 60, // seconds
    };
  }

  /**
   * 4. Create reservation
   */
  async create(createReservationDto: CreateReservationDto) {
    const {
      tripId,
      lockId,
      seatIds,
      customer: customerInfo,
      passengers,
      reservationType,
    } = createReservationDto;

    // Verify lock is valid
    const lockInfo = lockStore.get(lockId);
    if (!lockInfo) {
      throw new InvalidLockIdException();
    }

    if (lockInfo.tripId !== tripId) {
      throw new InvalidLockIdException();
    }

    if (new Date() > lockInfo.lockedUntil) {
      lockStore.delete(lockId);
      throw new ReservationExpiredException();
    }

    // Verify seatIds match lock
    const lockedSeatIds = new Set(lockInfo.seatIds);
    const requestedSeatIds = new Set(seatIds);
    if (lockedSeatIds.size !== requestedSeatIds.size || 
        ![...requestedSeatIds].every(id => lockedSeatIds.has(id))) {
      throw new InvalidLockIdException();
    }

    // Use transaction for atomicity
    return await this.prisma.$transaction(async (tx) => {
      // Verify trip exists
      const trip = await tx.scheduledTrip.findUnique({
        where: { id: tripId },
        include: {
          service: {
            include: {
              provider: true,
            },
          },
        },
      });

      if (!trip) {
        throw new TripNotFoundException(tripId);
      }

      // Verify seats are still locked by this lockId
      const tripSeats = await tx.tripSeat.findMany({
        where: {
          tripId,
          seatId: { in: seatIds },
        },
      });

      if (tripSeats.length !== seatIds.length) {
        throw new SeatNotAvailableException();
      }

      for (const tripSeat of tripSeats) {
        if (tripSeat.status !== 'LOCKED') {
          throw new SeatNotAvailableException(tripSeat.seatId);
        }
        if (!tripSeat.lockedUntil || tripSeat.lockedUntil < new Date()) {
          throw new ReservationExpiredException();
        }
      }

      // Find or create customer
      let customer = await tx.customer.findUnique({
        where: {
          documentType_documentNumber: {
            documentType: customerInfo.documentType as DocumentType,
            documentNumber: customerInfo.documentNumber,
          },
        },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            documentType: customerInfo.documentType as DocumentType,
            documentNumber: customerInfo.documentNumber,
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            email: customerInfo.email || null,
            phone: customerInfo.phone,
          },
        });
      } else {
        // Update customer info if provided
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            email: customerInfo.email ?? customer.email,
            phone: customerInfo.phone,
          },
        });
      }

      // Calculate pricing
      const subtotal = trip.pricePerSeat.toNumber() * seatIds.length;
      const commissionRate = trip.service.provider.commissionRate.toNumber() / 100;
      const commission = subtotal * commissionRate;
      const total = subtotal + commission;

      // Generate unique booking reference
      let bookingReference = generateBookingReference();
      let referenceExists = await tx.reservation.findUnique({
        where: { bookingReference },
      });

      while (referenceExists) {
        bookingReference = generateBookingReference();
        referenceExists = await tx.reservation.findUnique({
          where: { bookingReference },
        });
      }

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          tripId,
          customerId: customer.id,
          bookingReference,
          reservationType: reservationType as ReservationType,
          numPassengers: passengers.length,
          subtotal,
          commission,
          total,
          status: 'PENDING',
          channel: 'WEB' as BookingChannel,
        },
      });

      // Create passengers
      const passengerRecords = await Promise.all(
        passengers.map((passenger) =>
          tx.passenger.create({
            data: {
              reservationId: reservation.id,
              documentNumber: passenger.documentNumber,
              firstName: passenger.firstName,
              lastName: passenger.lastName,
              passengerType: 'ADULT',
            },
          }),
        ),
      );

      // Create reservation seats and update trip seats
      for (let i = 0; i < seatIds.length; i++) {
        const seatId = seatIds[i];
        const passenger = passengerRecords[i];

        // Find trip seat
        const tripSeat = tripSeats.find((ts) => ts.seatId === seatId);
        if (!tripSeat) {
          throw new SeatNotAvailableException(seatId);
        }

        // Create reservation seat
        await tx.reservationSeat.create({
          data: {
            reservationId: reservation.id,
            tripSeatId: tripSeat.id,
            passengerId: passenger!.id,
            seatId: seatId!,
          },
        });

        // Update trip seat status to RESERVED
        await tx.tripSeat.update({
          where: { id: tripSeat.id },
          data: {
            status: 'RESERVED',
            lockedUntil: null,
          },
        });
      }

      // Update trip available seats
      await tx.scheduledTrip.update({
        where: { id: tripId },
        data: {
          availableSeats: {
            decrement: seatIds.length,
          },
        },
      });

      // Remove lock from store
      lockStore.delete(lockId);

      return {
        reservationId: reservation.id,
        bookingReference: reservation.bookingReference,
        status: reservation.status,
        total: reservation.total.toNumber(),
        subtotal: reservation.subtotal.toNumber(),
        commission: reservation.commission.toNumber(),
      };
    });
  }

  /**
   * 5. Confirm reservation (after payment)
   */
  async confirm(id: string, _confirmReservationDto: ConfirmReservationDto) {
    return await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: {
          reservationSeats: {
            include: {
              tripSeat: true,
            },
          },
        },
      });

      if (!reservation) {
        throw new ReservationNotFoundException(id);
      }

      if (reservation.status !== 'PENDING') {
        throw new InvalidReservationStatusException(
          reservation.status,
          'PENDING',
        );
      }

      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
        },
      });

      // Update trip seats to CONFIRMED
      await Promise.all(
        reservation.reservationSeats.map((rs) =>
          tx.tripSeat.update({
            where: { id: rs.tripSeatId },
            data: {
              status: 'CONFIRMED',
            },
          }),
        ),
      );

      return {
        id: updatedReservation.id,
        bookingReference: updatedReservation.bookingReference,
        status: updatedReservation.status,
      };
    });
  }

  /**
   * 6. Cancel reservation
   */
  async cancel(id: string) {
    return await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id },
        include: {
          reservationSeats: {
            include: {
              tripSeat: true,
            },
          },
          transactions: true,
        },
      });

      if (!reservation) {
        throw new ReservationNotFoundException(id);
      }

      if (reservation.status !== 'PENDING' && reservation.status !== 'CONFIRMED') {
        throw new InvalidReservationStatusException(
          reservation.status,
          'PENDING or CONFIRMED',
        );
      }

      // Check if payment was made
      const hasPayment = reservation.transactions.some(
        (t) => t.status === 'COMPLETED',
      );

      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: {
          status: hasPayment ? 'CANCELLED' : 'CANCELLED',
          // Note: In a real system, you'd mark for refund if payment was made
        },
      });

      // Free seats
      await Promise.all(
        reservation.reservationSeats.map((rs) =>
          tx.tripSeat.update({
            where: { id: rs.tripSeatId },
            data: {
              status: 'AVAILABLE',
              lockedUntil: null,
            },
          }),
        ),
      );

      // Update trip available seats
      await tx.scheduledTrip.update({
        where: { id: reservation.tripId },
        data: {
          availableSeats: {
            increment: reservation.reservationSeats.length,
          },
        },
      });

      return {
        id: updatedReservation.id,
        bookingReference: updatedReservation.bookingReference,
        status: updatedReservation.status,
        refundRequired: hasPayment,
      };
    });
  }

  /**
   * 7. Get reservation by booking reference
   */
  async findByReference(reference: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { bookingReference: reference },
      include: {
        trip: {
          include: {
            service: true,
            vehicle: true,
          },
        },
        customer: true,
        passengers: {
          include: {
            reservationSeat: {
              include: {
                seat: true,
              },
            },
          },
        },
        reservationSeats: {
          include: {
            seat: true,
            passenger: true,
          },
        },
        transactions: true,
      },
    });

    if (!reservation) {
      throw new ReservationNotFoundException(reference);
    }

    return {
      id: reservation.id,
      bookingReference: reservation.bookingReference,
      status: reservation.status,
      reservationType: reservation.reservationType,
      numPassengers: reservation.numPassengers,
      subtotal: reservation.subtotal.toNumber(),
      commission: reservation.commission.toNumber(),
      total: reservation.total.toNumber(),
      channel: reservation.channel,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      trip: {
        id: reservation.trip.id,
        origin: reservation.trip.service.origin,
        destination: reservation.trip.service.destination,
        departureDate: reservation.trip.departureDate,
        departureTime: reservation.trip.departureTime,
        vehicle: {
          id: reservation.trip.vehicle.id,
          plate: reservation.trip.vehicle.plate,
          brand: reservation.trip.vehicle.brand,
          model: reservation.trip.vehicle.model,
        },
      },
      customer: {
        id: reservation.customer.id,
        documentType: reservation.customer.documentType,
        documentNumber: reservation.customer.documentNumber,
        firstName: reservation.customer.firstName,
        lastName: reservation.customer.lastName,
        email: reservation.customer.email,
        phone: reservation.customer.phone,
      },
      passengers: reservation.passengers.map((p) => ({
        id: p.id,
        documentNumber: p.documentNumber,
        firstName: p.firstName,
        lastName: p.lastName,
        seat: p.reservationSeat
          ? {
              id: p.reservationSeat.seat.id,
              seatNumber: p.reservationSeat.seat.seatNumber,
            }
          : null,
      })),
      transactions: reservation.transactions.map((t) => ({
        id: t.id,
        amount: t.amount.toNumber(),
        status: t.status,
        gateway: t.gateway,
        createdAt: t.createdAt,
      })),
    };
  }

  /**
   * Helper: Release expired locked seats (called by scheduler)
   */
  async releaseExpiredLocks() {
    const now = new Date();

    // Clean up expired locks from store
    for (const [lockId, lockInfo] of lockStore.entries()) {
      if (lockInfo.lockedUntil < now) {
        lockStore.delete(lockId);
      }
    }

    // Release expired seats in database
    const expiredSeats = await this.prisma.tripSeat.updateMany({
      where: {
        status: 'LOCKED',
        lockedUntil: {
          lte: now,
        },
      },
      data: {
        status: 'AVAILABLE',
        lockedUntil: null,
      },
    });

    return {
      releasedSeats: expiredSeats.count,
      timestamp: now,
    };
  }

  // Legacy methods for compatibility
  async findAll() {
    return this.prisma.reservation.findMany({
      include: {
        trip: {
          include: {
            service: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            service: true,
            vehicle: true,
          },
        },
        customer: true,
        passengers: true,
        reservationSeats: {
          include: {
            seat: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new ReservationNotFoundException(id);
    }

    return reservation;
  }
}
