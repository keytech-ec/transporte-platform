import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppService } from '../../common/services/whatsapp.service';
import { CreateManualSaleDto } from './dto/create-manual-sale.dto';
import { CompletePassengerFormDto } from './dto/complete-passenger-form.dto';
import { CreateManualSaleResult, SaleSummary } from './sales.types';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { SaleChannel, PaymentMethod, SeatStatus, ReservationStatus, TransactionStatus, PaymentGateway } from '@transporte-platform/database';

@Injectable()
export class SalesService {
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly whatsappService: WhatsAppService,
  ) {
    this.frontendUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
  }

  async createManualSale(
    dto: CreateManualSaleDto,
    userId: string,
    providerId: string,
  ): Promise<CreateManualSaleResult> {
    try {
      console.log('[createManualSale] Starting with dto:', JSON.stringify(dto));

      // 1. Validar que el viaje pertenece al proveedor del usuario
      const trip = await this.prisma.scheduledTrip.findUnique({
        where: { id: dto.tripId },
        include: {
          service: {
            include: { provider: true },
          },
          vehicle: true,
        },
      });

      console.log('[createManualSale] Trip found:', trip ? 'yes' : 'no');

    if (!trip) {
      throw new NotFoundException('Viaje no encontrado');
    }

    if (trip.service.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para crear ventas en este viaje');
    }

    // 2. Determine seat selection mode
    const seatMode = trip.seatSelectionMode ?? trip.service.seatSelectionMode;

    // 3. Validate seat/quantity requirements
    if (seatMode === 'REQUIRED' && (!dto.seatIds || dto.seatIds.length === 0)) {
      throw new BadRequestException('La selección de asientos es requerida para este viaje');
    }

    if (seatMode === 'NONE' && !dto.quantity) {
      throw new BadRequestException('Debe especificar la cantidad de asientos');
    }

    // 4. Validate floor for multi-floor vehicles (if using quantity)
    if (seatMode === 'NONE' && dto.quantity) {
      const seatLayout = trip.vehicle.seatLayout as any;
      const floors = seatLayout?.floors || [];
      if (floors.length > 1 && !dto.floorNumber) {
        throw new BadRequestException('Debe seleccionar un piso para vehículos de varios pisos');
      }
    }

    // 5. Validate seats availability (if using seat-based booking)
    let tripSeats: any[] = [];
    if (dto.seatIds && dto.seatIds.length > 0) {
      tripSeats = await this.prisma.tripSeat.findMany({
        where: {
          tripId: dto.tripId,
          seatId: { in: dto.seatIds },
        },
        include: { seat: true },
      });

      if (tripSeats.length !== dto.seatIds.length) {
        throw new BadRequestException('Algunos asientos no existen en este viaje');
      }

      const unavailableSeats = tripSeats.filter((ts) => ts.status !== SeatStatus.AVAILABLE);
      if (unavailableSeats.length > 0) {
        const seatNumbers = unavailableSeats.map((ts) => ts.seat.seatNumber).join(', ');
        throw new BadRequestException(`Los siguientes asientos no están disponibles: ${seatNumbers}`);
      }
    }

    // 6. Calculate total and validate payment
    const seatCount = dto.seatIds?.length || dto.quantity || 0;
    const totalAmount = trip.pricePerSeat.toNumber() * seatCount;
    if (dto.payment.amount > totalAmount) {
      throw new BadRequestException('El monto del pago no puede ser mayor al total');
    }

    // 4. Crear/obtener Customer
    let customer = await this.prisma.customer.findUnique({
      where: {
        documentType_documentNumber: {
          documentType: dto.contact.documentType,
          documentNumber: dto.contact.documentNumber,
        },
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          documentType: dto.contact.documentType,
          documentNumber: dto.contact.documentNumber,
          firstName: dto.contact.firstName,
          lastName: dto.contact.lastName,
          phone: dto.contact.phone,
          email: dto.contact.email,
        },
      });
    }

    // 7. Determine if passenger form is needed
    const needsPassengerForm = trip.service.requiresPassengerInfo;

    // 8. Calculate smart form expiration
    const formExpiresAt = needsPassengerForm ? this.calculateFormExpiration(trip) : null;
    const passengerFormToken = needsPassengerForm ? uuidv4() : null;

    // 9. Calculate commissions
    const provider = trip.service.provider;
    const subtotal = totalAmount;
    const commission = (subtotal * provider.commissionRate.toNumber()) / 100;
    const total = subtotal;

    // 7. Mapear método de pago a SaleChannel
    const saleChannelMap = {
      CASH: SaleChannel.POS_CASH,
      BANK_TRANSFER: SaleChannel.POS_TRANSFER,
      CREDIT_CARD: SaleChannel.POS_CARD,
      DEBIT_CARD: SaleChannel.POS_CARD,
    };

    const paymentMethodMap = {
      CASH: PaymentMethod.CASH,
      BANK_TRANSFER: PaymentMethod.BANK_TRANSFER,
      CREDIT_CARD: PaymentMethod.CREDIT_CARD,
      DEBIT_CARD: PaymentMethod.DEBIT_CARD,
    };

    const paymentGatewayMap = {
      CASH: PaymentGateway.CASH,
      BANK_TRANSFER: PaymentGateway.TRANSFER,
      CREDIT_CARD: PaymentGateway.CASH,
      DEBIT_CARD: PaymentGateway.CASH,
    };

    // 10. Reserve capacity for quantity-based bookings (before transaction)
    let quantitySeats: any[] = [];
    if (dto.quantity && seatMode === 'NONE') {
      quantitySeats = await this.decreaseAvailableCapacity(dto.tripId, dto.quantity, dto.floorNumber);
    }

    // 11. Crear reserva, transaction y actualizar asientos en una transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Generar booking reference
      const bookingReference = await this.generateBookingReference(tx);

      // Crear reserva
      const reservation = await tx.reservation.create({
        data: {
          tripId: dto.tripId,
          customerId: customer.id,
          soldById: userId,
          bookingReference,
          reservationType: 'PER_SEAT',
          numPassengers: seatCount,
          subtotal,
          commission,
          total,
          status: needsPassengerForm ? ReservationStatus.CONFIRMED : ReservationStatus.CONFIRMED,
          channel: 'DASHBOARD',
          saleChannel: saleChannelMap[dto.payment.method],
          passengerFormToken,
          passengerFormExpiresAt: formExpiresAt,
          notes: dto.notes,
        },
      });

      // Crear transaction
      const providerAmount = subtotal - commission;
      await tx.transaction.create({
        data: {
          reservationId: reservation.id,
          providerId: provider.id,
          receivedBy: userId,
          amount: dto.payment.amount,
          commission,
          providerAmount,
          gateway: paymentGatewayMap[dto.payment.method],
          paymentMethod: paymentMethodMap[dto.payment.method],
          status: TransactionStatus.COMPLETED,
          isPartialPayment: dto.payment.isPartial,
          receiptNumber: dto.payment.receiptNumber,
        },
      });

      // Handle seat assignment based on booking mode
      if (dto.seatIds && dto.seatIds.length > 0) {
        // Seat-based booking
        // Actualizar TripSeats a CONFIRMED
        await tx.tripSeat.updateMany({
          where: {
            tripId: dto.tripId,
            seatId: { in: dto.seatIds },
          },
          data: {
            status: SeatStatus.CONFIRMED,
          },
        });

        // Crear ReservationSeats
        const reservationSeatsData = dto.seatIds.map((seatId) => {
          const tripSeat = tripSeats.find((ts) => ts.seatId === seatId);
          return {
            reservationId: reservation.id,
            tripSeatId: tripSeat.id,
            seatId,
          };
        });

        await tx.reservationSeat.createMany({
          data: reservationSeatsData,
        });

        // Actualizar availableSeats del viaje
        await tx.scheduledTrip.update({
          where: { id: dto.tripId },
          data: {
            availableSeats: { decrement: dto.seatIds.length },
          },
        });
      } else if (dto.quantity) {
        // Quantity-based booking
        // Create ReservationSeats without specific seat assignment
        const quantityReservationSeatsData = quantitySeats.map((tripSeat) => ({
          reservationId: reservation.id,
          tripSeatId: tripSeat.id,
          seatId: null, // No specific seat assigned
          floorNumber: dto.floorNumber || null,
        }));

        await tx.reservationSeat.createMany({
          data: quantityReservationSeatsData,
        });

        // Actualizar availableSeats del viaje
        await tx.scheduledTrip.update({
          where: { id: dto.tripId },
          data: {
            availableSeats: { decrement: dto.quantity },
          },
        });
      }

      // Actualizar estadísticas del vendedor
      await tx.user.update({
        where: { id: userId },
        data: {
          salesCount: { increment: 1 },
          totalSalesAmount: { increment: dto.payment.amount },
        },
      });

      return { reservation, bookingReference };
    });

    // 12. Generar URL del formulario (only if needed)
    const passengerFormUrl = needsPassengerForm && passengerFormToken
      ? `${this.frontendUrl}/completar-reserva/${passengerFormToken}`
      : null;

    // 13. Enviar enlace por WhatsApp si se solicita y se necesita formulario
    let whatsappUrl: string | undefined;
    if (needsPassengerForm && dto.sendFormVia === 'WHATSAPP' && passengerFormUrl) {
      const whatsappResult = await this.whatsappService.sendPassengerFormLink(
        dto.contact.phone,
        `${dto.contact.firstName} ${dto.contact.lastName}`,
        result.bookingReference,
        passengerFormUrl,
        {
          origin: trip.service.origin,
          destination: trip.service.destination,
          serviceName: trip.service.name,
          departureDate: trip.departureDate.toISOString(),
          departureTime: typeof trip.departureTime === 'string' ? trip.departureTime : trip.departureTime.toISOString(),
        },
      );

      if (whatsappResult.success) {
        whatsappUrl = whatsappResult.whatsappUrl;
      }
    }

      return {
        reservationId: result.reservation.id,
        bookingReference: result.bookingReference,
        needsPassengerForm,
        passengerFormUrl: needsPassengerForm ? passengerFormUrl : undefined,
        passengerFormToken: needsPassengerForm ? passengerFormToken : undefined,
        formExpiresAt: needsPassengerForm ? formExpiresAt : undefined,
        whatsappUrl,
      };
    } catch (error) {
      console.error('[createManualSale] Error:', error);
      throw error;
    }
  }

  async getMySales(
    userId: string,
    from?: Date,
    to?: Date,
    tripId?: string,
  ) {
    const where: any = {
      soldById: userId,
    };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    if (tripId) {
      where.tripId = tripId;
    }

    const reservations = await this.prisma.reservation.findMany({
      where,
      include: {
        trip: {
          include: {
            service: true,
            vehicle: true,
          },
        },
        customer: true,
        transactions: true,
        reservationSeats: {
          include: {
            seat: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular totales
    const summary: SaleSummary = {
      salesCount: reservations.length,
      totalAmount: 0,
      cashAmount: 0,
      transferAmount: 0,
      cardAmount: 0,
    };

    reservations.forEach((reservation) => {
      const amount = reservation.total.toNumber();
      summary.totalAmount += amount;

      const transaction = reservation.transactions[0];
      if (transaction) {
        switch (transaction.paymentMethod) {
          case PaymentMethod.CASH:
            summary.cashAmount += amount;
            break;
          case PaymentMethod.BANK_TRANSFER:
            summary.transferAmount += amount;
            break;
          case PaymentMethod.CREDIT_CARD:
          case PaymentMethod.DEBIT_CARD:
            summary.cardAmount += amount;
            break;
        }
      }
    });

    return {
      reservations: reservations.map(r => ({
        ...r,
        subtotal: r.subtotal.toNumber(),
        commission: r.commission.toNumber(),
        total: r.total.toNumber(),
        trip: {
          ...r.trip,
          pricePerSeat: r.trip.pricePerSeat.toNumber(),
        },
        transactions: r.transactions.map(t => ({
          ...t,
          amount: t.amount.toNumber(),
          commission: t.commission.toNumber(),
          providerAmount: t.providerAmount.toNumber(),
        })),
      })),
      summary,
    };
  }

  async getProviderSales(
    providerId: string,
    from?: Date,
    to?: Date,
  ) {
    const where: any = {
      soldBy: {
        providerId,
      },
    };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const reservations = await this.prisma.reservation.findMany({
      where,
      include: {
        soldBy: true,
        trip: {
          include: {
            service: true,
          },
        },
        customer: true,
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Agrupar por vendedor
    const salesByVendor = new Map<string, any>();

    reservations.forEach((reservation) => {
      const vendorId = reservation.soldById;
      if (!vendorId) return;

      if (!salesByVendor.has(vendorId)) {
        salesByVendor.set(vendorId, {
          vendor: reservation.soldBy,
          salesCount: 0,
          totalAmount: 0,
          cashAmount: 0,
          transferAmount: 0,
          cardAmount: 0,
          sales: [],
        });
      }

      const vendorData = salesByVendor.get(vendorId);
      const amount = reservation.total.toNumber();

      vendorData.salesCount += 1;
      vendorData.totalAmount += amount;
      vendorData.sales.push({
        ...reservation,
        subtotal: reservation.subtotal.toNumber(),
        commission: reservation.commission.toNumber(),
        total: reservation.total.toNumber(),
        trip: {
          ...reservation.trip,
          pricePerSeat: reservation.trip.pricePerSeat.toNumber(),
        },
        transactions: reservation.transactions.map(t => ({
          ...t,
          amount: t.amount.toNumber(),
          commission: t.commission.toNumber(),
          providerAmount: t.providerAmount.toNumber(),
        })),
      });

      const transaction = reservation.transactions[0];
      if (transaction) {
        switch (transaction.paymentMethod) {
          case PaymentMethod.CASH:
            vendorData.cashAmount += amount;
            break;
          case PaymentMethod.BANK_TRANSFER:
            vendorData.transferAmount += amount;
            break;
          case PaymentMethod.CREDIT_CARD:
          case PaymentMethod.DEBIT_CARD:
            vendorData.cardAmount += amount;
            break;
        }
      }
    });

    return Array.from(salesByVendor.values());
  }

  async getPendingForms(providerId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: {
        passengerFormCompletedAt: null,
        passengerFormToken: { not: null },
        soldBy: {
          providerId,
        },
      },
      include: {
        trip: {
          include: {
            service: true,
          },
        },
        customer: true,
        soldBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reservations.map(r => ({
      ...r,
      subtotal: r.subtotal.toNumber(),
      commission: r.commission.toNumber(),
      total: r.total.toNumber(),
      trip: {
        ...r.trip,
        pricePerSeat: r.trip.pricePerSeat.toNumber(),
      },
      isExpired: r.passengerFormExpiresAt ? new Date() > r.passengerFormExpiresAt : false,
    }));
  }

  async resendForm(
    reservationId: string,
    userId: string,
    providerId: string,
    sendVia: 'WHATSAPP' | 'EMAIL' | 'NONE' = 'NONE',
  ) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        soldBy: true,
        customer: true,
        trip: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva no encontrada');
    }

    // Verificar que pertenece al proveedor
    if (reservation.soldBy?.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para reenviar este formulario');
    }

    // Si ya se completó, no permitir reenvío
    if (reservation.passengerFormCompletedAt) {
      throw new BadRequestException('El formulario ya fue completado');
    }

    // Si expiró, regenerar token y extender fecha
    let token = reservation.passengerFormToken;
    let expiresAt = reservation.passengerFormExpiresAt;

    if (!expiresAt || new Date() > expiresAt) {
      token = uuidv4();
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 72);

      await this.prisma.reservation.update({
        where: { id: reservationId },
        data: {
          passengerFormToken: token,
          passengerFormExpiresAt: expiresAt,
        },
      });
    }

    const passengerFormUrl = `${this.frontendUrl}/completar-reserva/${token}`;

    // Enviar por WhatsApp si se solicita
    let whatsappUrl: string | undefined;
    if (sendVia === 'WHATSAPP') {
      const whatsappResult = await this.whatsappService.sendPassengerFormLink(
        reservation.customer.phone,
        `${reservation.customer.firstName} ${reservation.customer.lastName}`,
        reservation.bookingReference,
        passengerFormUrl,
        {
          origin: reservation.trip.service.origin,
          destination: reservation.trip.service.destination,
          serviceName: reservation.trip.service.name,
          departureDate: reservation.trip.departureDate.toISOString(),
          departureTime: typeof reservation.trip.departureTime === 'string' ? reservation.trip.departureTime : reservation.trip.departureTime.toISOString(),
        },
      );

      if (whatsappResult.success) {
        whatsappUrl = whatsappResult.whatsappUrl;
      }
    }

    return {
      passengerFormUrl,
      passengerFormToken: token,
      expiresAt,
      whatsappUrl,
    };
  }

  // ============================================
  // ENDPOINTS PÚBLICOS PARA FORMULARIO DE PASAJEROS
  // ============================================

  async getPassengerFormByToken(token: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { passengerFormToken: token },
      include: {
        trip: {
          include: {
            service: true,
            vehicle: true,
          },
        },
        customer: true,
        reservationSeats: {
          include: {
            seat: true,
          },
        },
        passengers: {
          include: {
            reservationSeat: {
              include: {
                seat: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Token inválido o reserva no encontrada');
    }

    const isExpired = reservation.passengerFormExpiresAt
      ? new Date() > reservation.passengerFormExpiresAt
      : true;

    const isCompleted = !!reservation.passengerFormCompletedAt;

    // Formatear información del viaje
    const tripInfo = {
      origin: reservation.trip.service.origin,
      destination: reservation.trip.service.destination,
      serviceName: reservation.trip.service.name,
      departureDate: reservation.trip.departureDate,
      departureTime: reservation.trip.departureTime,
      pricePerSeat: reservation.trip.pricePerSeat.toNumber(),
    };

    // Formatear asientos
    const seats = reservation.reservationSeats.map((rs) => ({
      id: rs.seatId,
      seatNumber: rs.seat.seatNumber,
      row: rs.seat.row,
      column: rs.seat.column,
    }));

    // Formatear pasajeros existentes (si ya hay)
    const passengersCompleted = reservation.passengers.map((p) => ({
      id: p.id,
      documentType: p.documentType,
      documentNumber: p.documentNumber,
      firstName: p.firstName,
      lastName: p.lastName,
      passengerType: p.passengerType,
      seatNumber: p.reservationSeat?.seat?.seatNumber || null,
    }));

    return {
      bookingReference: reservation.bookingReference,
      tripInfo,
      contact: {
        firstName: reservation.customer.firstName,
        lastName: reservation.customer.lastName,
        phone: reservation.customer.phone,
        email: reservation.customer.email,
      },
      seats,
      passengersRequired: reservation.numPassengers,
      passengersCompleted,
      isExpired,
      isCompleted,
    };
  }

  async completePassengerForm(token: string, dto: CompletePassengerFormDto) {
    // 1. Obtener reserva por token
    const reservation = await this.prisma.reservation.findUnique({
      where: { passengerFormToken: token },
      include: {
        reservationSeats: {
          include: {
            seat: true,
          },
        },
        passengers: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Token inválido o reserva no encontrada');
    }

    // 2. Validar que no haya expirado
    if (reservation.passengerFormExpiresAt && new Date() > reservation.passengerFormExpiresAt) {
      throw new BadRequestException('El formulario ha expirado. Contacta al vendedor.');
    }

    // 3. Validar que no esté completado
    if (reservation.passengerFormCompletedAt) {
      throw new BadRequestException('El formulario ya fue completado anteriormente');
    }

    // 4. Validar cantidad de pasajeros
    if (dto.passengers.length !== reservation.numPassengers) {
      throw new BadRequestException(
        `Se requieren ${reservation.numPassengers} pasajeros, pero se enviaron ${dto.passengers.length}`,
      );
    }

    // 5. Validar que los asientos coincidan con los de la reserva
    const reservedSeatIds = reservation.reservationSeats.map((rs) => rs.seatId);
    const providedSeatIds = dto.passengers.map((p) => p.seatId);

    const invalidSeats = providedSeatIds.filter((seatId) => !reservedSeatIds.includes(seatId));
    if (invalidSeats.length > 0) {
      throw new BadRequestException('Algunos asientos no pertenecen a esta reserva');
    }

    // 6. Validar que cada asiento tenga solo un pasajero
    const seatCounts = new Map<string, number>();
    providedSeatIds.forEach((seatId) => {
      seatCounts.set(seatId, (seatCounts.get(seatId) || 0) + 1);
    });

    const duplicateSeats = Array.from(seatCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([seatId]) => seatId);

    if (duplicateSeats.length > 0) {
      throw new BadRequestException('Cada asiento debe tener solo un pasajero asignado');
    }

    // 7. Crear pasajeros y actualizar la reserva en una transacción
    await this.prisma.$transaction(async (tx) => {
      // Crear pasajeros
      for (const passengerDto of dto.passengers) {
        const passenger = await tx.passenger.create({
          data: {
            reservationId: reservation.id,
            documentType: passengerDto.documentType,
            documentNumber: passengerDto.documentNumber,
            firstName: passengerDto.firstName,
            lastName: passengerDto.lastName,
            passengerType: passengerDto.passengerType,
          },
        });

        // Encontrar el ReservationSeat correspondiente
        const reservationSeat = reservation.reservationSeats.find(
          (rs) => rs.seatId === passengerDto.seatId,
        );

        if (reservationSeat) {
          // Actualizar ReservationSeat con el passengerId
          await tx.reservationSeat.update({
            where: { id: reservationSeat.id },
            data: { passengerId: passenger.id },
          });
        }
      }

      // Marcar formulario como completado
      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          passengerFormCompletedAt: new Date(),
        },
      });
    });

    return {
      success: true,
      bookingReference: reservation.bookingReference,
      message: 'Formulario completado exitosamente',
    };
  }

  // ============================================
  // NEW: Get available trips grouped by service for POS
  // ============================================

  async getAvailableTripsByDate(date: string, providerId?: string) {
    // Parse date in local timezone
    const [year, month, day] = date.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(year, month - 1, day + 1);

    const trips = await this.prisma.scheduledTrip.findMany({
      where: {
        departureDate: { gte: startDate, lt: endDate },
        status: 'SCHEDULED',
        availableSeats: { gt: 0 },
        ...(providerId && { service: { providerId } }),
      },
      include: {
        service: {
          include: {
            serviceType: true,
            provider: true,
          },
        },
        vehicle: true,
      },
      orderBy: [
        { service: { name: 'asc' } },
        { departureTime: 'asc' },
      ],
    });

    // Group by service
    const grouped: Record<string, any> = {};

    trips.forEach((trip) => {
      const serviceId = trip.serviceId;
      if (!grouped[serviceId]) {
        grouped[serviceId] = {
          serviceId,
          serviceName: trip.service.name,
          origin: trip.service.origin,
          destination: trip.service.destination,
          seatSelectionMode: trip.service.seatSelectionMode,
          requiresPassengerInfo: trip.service.requiresPassengerInfo,
          trips: [],
        };
      }

      // Detect floors from vehicle seatLayout
      const seatLayout = trip.vehicle.seatLayout as any;
      const floors = seatLayout?.floors || [];

      grouped[serviceId].trips.push({
        id: trip.id,
        departureTime: trip.departureTime.toString(),
        arrivalTime: trip.service.duration
          ? this.calculateArrivalTime(trip.departureTime, trip.service.duration)
          : null,
        pricePerSeat: trip.pricePerSeat.toNumber(),
        availableSeats: trip.availableSeats,
        seatSelectionMode: trip.seatSelectionMode ?? trip.service.seatSelectionMode,
        requiresPassengerInfo: trip.service.requiresPassengerInfo,
        vehicleType: trip.vehicle.type,
        vehiclePlate: trip.vehicle.plate,
        hasMultipleFloors: floors.length > 1,
        floorCount: floors.length,
      });
    });

    return {
      date,
      services: Object.values(grouped),
    };
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private calculateArrivalTime(departureTime: Date, durationMinutes: number): string {
    const departure = new Date(departureTime);
    const arrival = new Date(departure.getTime() + durationMinutes * 60000);
    return arrival.toISOString();
  }

  private calculateFormExpiration(trip: any): Date {
    const now = new Date();
    const standard = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now

    // Parse departure date (handle if already Date object)
    const departure = trip.departureDate instanceof Date
      ? new Date(trip.departureDate.getTime())
      : new Date(trip.departureDate);

    // Parse departure time
    const departureTimeStr = trip.departureTime?.toString() || '00:00';
    const timeParts = departureTimeStr.split(':');
    const hours = parseInt(timeParts[0]) || 0;
    const minutes = parseInt(timeParts[1]) || 0;

    departure.setHours(hours, minutes, 0, 0);

    const departureLimit = new Date(departure.getTime() + 10 * 60 * 1000); // departure + 10 min

    // Return whichever is sooner
    return standard < departureLimit ? standard : departureLimit;
  }

  private async decreaseAvailableCapacity(
    tripId: string,
    quantity: number,
    floorNumber?: number,
  ): Promise<any[]> {
    // Find available TripSeats
    const whereClause: any = {
      tripId,
      status: SeatStatus.AVAILABLE,
    };

    // If floor specified, filter by seat tier
    if (floorNumber !== undefined && floorNumber !== null) {
      // Map floor number to SeatTier enum
      const tierMap: Record<number, any> = {
        1: 'LOWER_DECK',
        2: 'UPPER_DECK',
        // Add more if needed
      };

      const tier = tierMap[floorNumber];
      if (tier) {
        whereClause.seat = {
          tier,
        };
      }
    }

    const availableSeats = await this.prisma.tripSeat.findMany({
      where: whereClause,
      take: quantity,
      include: { seat: true },
    });

    if (availableSeats.length < quantity) {
      const floorMsg = floorNumber ? ` on floor ${floorNumber}` : '';
      throw new BadRequestException(
        `Not enough available seats${floorMsg}. Requested: ${quantity}, Available: ${availableSeats.length}`,
      );
    }

    // Mark as CONFIRMED (skip RESERVED status for quantity bookings)
    await this.prisma.tripSeat.updateMany({
      where: {
        id: { in: availableSeats.map((s) => s.id) },
      },
      data: {
        status: SeatStatus.CONFIRMED,
      },
    });

    return availableSeats;
  }

  private async generateBookingReference(tx: any): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let reference: string;
    let exists = true;

    while (exists) {
      // Generar 3 letras
      let ref = '';
      for (let i = 0; i < 3; i++) {
        ref += characters.charAt(Math.floor(Math.random() * 25));
      }
      // Generar 5 alfanuméricos
      for (let i = 0; i < 5; i++) {
        ref += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      reference = ref;

      // Verificar que no exista
      const existing = await tx.reservation.findUnique({
        where: { bookingReference: reference },
      });

      exists = !!existing;
    }

    return reference;
  }
}
