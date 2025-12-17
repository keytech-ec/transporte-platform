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

    if (!trip) {
      throw new NotFoundException('Viaje no encontrado');
    }

    if (trip.service.providerId !== providerId) {
      throw new ForbiddenException('No tienes permiso para crear ventas en este viaje');
    }

    // 2. Validar disponibilidad de asientos
    const tripSeats = await this.prisma.tripSeat.findMany({
      where: {
        tripId: dto.tripId,
        seatId: { in: dto.seatIds },
      },
      include: { seat: true },
    });

    if (tripSeats.length !== dto.seatIds.length) {
      throw new BadRequestException('Algunos asientos no existen en este viaje');
    }

    const unavailableSeats = tripSeats.filter(ts => ts.status !== SeatStatus.AVAILABLE);
    if (unavailableSeats.length > 0) {
      const seatNumbers = unavailableSeats.map(ts => ts.seat.seatNumber).join(', ');
      throw new BadRequestException(`Los siguientes asientos no están disponibles: ${seatNumbers}`);
    }

    // 3. Validar monto del pago
    const totalAmount = trip.pricePerSeat.toNumber() * dto.seatIds.length;
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

    // 5. Generar token para formulario de pasajeros
    const passengerFormToken = uuidv4();
    const passengerFormExpiresAt = new Date();
    passengerFormExpiresAt.setHours(passengerFormExpiresAt.getHours() + 72);

    // 6. Calcular comisiones
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

    // 8. Crear reserva, transaction y actualizar asientos en una transacción
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
          numPassengers: dto.seatIds.length,
          subtotal,
          commission,
          total,
          status: ReservationStatus.CONFIRMED,
          channel: 'DASHBOARD',
          saleChannel: saleChannelMap[dto.payment.method],
          passengerFormToken,
          passengerFormExpiresAt,
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
        const tripSeat = tripSeats.find(ts => ts.seatId === seatId);
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

    // 9. Generar URL del formulario
    const passengerFormUrl = `${this.frontendUrl}/completar-reserva/${passengerFormToken}`;

    // 10. Enviar enlace por WhatsApp si se solicita
    let whatsappUrl: string | undefined;
    if (dto.sendFormVia === 'WHATSAPP') {
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
      passengerFormUrl,
      passengerFormToken,
      whatsappUrl,
    };
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
