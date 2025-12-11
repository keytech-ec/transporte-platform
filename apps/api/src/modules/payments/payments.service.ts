import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentLinkDto } from './dto/create-payment.dto';
import { DeunaGateway } from './gateways/deuna.gateway';
import { PayphoneGateway } from './gateways/payphone.gateway';
import { PaymentGateway, TransactionStatus, UserRole } from '@transporte-platform/database';
import { ReservationsService } from '../reservations/reservations.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deunaGateway: DeunaGateway,
    private readonly payphoneGateway: PayphoneGateway,
    private readonly reservationsService: ReservationsService,
  ) {}

  /**
   * Create payment link for a reservation
   */
  async createPaymentLink(createPaymentDto: CreatePaymentLinkDto) {
    const { reservationId, gateway } = createPaymentDto;

    // Get reservation with related data
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        trip: {
          include: {
            service: {
              include: {
                provider: true,
              },
            },
          },
        },
        customer: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
    }

    if (reservation.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot create payment link for reservation with status ${reservation.status}. Only PENDING reservations can be paid.`,
      );
    }

    // Check if transaction already exists
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        reservationId,
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
      },
    });

    if (existingTransaction) {
      throw new BadRequestException(
        'A payment is already in progress for this reservation',
      );
    }

    // Select gateway
    const selectedGateway = this.getGateway(gateway);

    // Create payment link
    const paymentLinkResult = await selectedGateway.createPaymentLink({
      reservationId,
      amount: Number(reservation.total),
      currency: 'USD',
      customerEmail: reservation.customer.email || undefined,
      customerName: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
      metadata: {
        reservationId,
        bookingReference: reservation.bookingReference,
        providerId: reservation.trip.service.provider.id,
      },
    });

    // Calculate commission
    const provider = reservation.trip.service.provider;
    const commissionRate = Number(provider.commissionRate);
    const total = Number(reservation.total);
    const commission = (total * commissionRate) / 100;
    const providerAmount = total - commission;

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        reservationId,
        providerId: provider.id,
        amount: total,
        commission,
        providerAmount,
        gateway,
        status: TransactionStatus.PENDING,
      },
    });

    return {
      paymentUrl: paymentLinkResult.paymentUrl,
      transactionId: transaction.id,
      reservationId: reservation.id,
      bookingReference: reservation.bookingReference,
    };
  }

  /**
   * Get payment status by reservation ID
   */
  async getPaymentByReservationId(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${reservationId} not found`);
    }

    const latestTransaction = reservation.transactions[0];

    return {
      reservationId: reservation.id,
      bookingReference: reservation.bookingReference,
      status: reservation.status,
      total: reservation.total,
      transaction: latestTransaction
        ? {
            id: latestTransaction.id,
            amount: latestTransaction.amount,
            commission: latestTransaction.commission,
            providerAmount: latestTransaction.providerAmount,
            gateway: latestTransaction.gateway,
            status: latestTransaction.status,
            createdAt: latestTransaction.createdAt,
            updatedAt: latestTransaction.updatedAt,
          }
        : null,
    };
  }

  /**
   * Get transaction by ID
   */
  async findOne(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        reservation: {
          include: {
            customer: true,
            trip: {
              include: {
                service: true,
              },
            },
          },
        },
        provider: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    return transaction;
  }

  /**
   * Process refund
   */
  async refund(transactionId: string, userRole: UserRole) {
    // Check permissions
    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.PROVIDER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN or PROVIDER_ADMIN can process refunds',
      );
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        reservation: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot refund transaction with status ${transaction.status}. Only COMPLETED transactions can be refunded.`,
      );
    }

    // Update transaction status to REFUNDED
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.REFUNDED,
      },
    });

    // Update reservation status to REFUNDED
    await this.prisma.reservation.update({
      where: { id: transaction.reservationId },
      data: {
        status: 'REFUNDED',
      },
    });

    // In a real implementation, you would call the gateway's refund API here
    // For MVP, we just update the status

    return {
      id: updatedTransaction.id,
      status: updatedTransaction.status,
      message: 'Refund processed successfully',
    };
  }

  /**
   * Update transaction from webhook
   * This is called by webhook handlers
   */
  async updateTransactionFromWebhook(
    gatewayTransactionId: string,
    status: string,
    webhookPayload: any,
  ) {
    // Find transaction by reservation ID from metadata
    // The gateway transaction ID is used for validation, but we find by reservation ID
    const reservationId =
      webhookPayload.metadata?.reservationId ||
      webhookPayload.reference ||
      webhookPayload.order_id ||
      webhookPayload.reservation_id;

    if (!reservationId) {
      throw new BadRequestException('Could not find reservation ID in webhook payload');
    }

    // Find the latest pending transaction for this reservation
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        reservationId,
        status: {
          in: [TransactionStatus.PENDING, TransactionStatus.PROCESSING],
        },
      },
      include: {
        reservation: {
          include: {
            reservationSeats: {
              include: {
                tripSeat: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!transaction) {
      throw new NotFoundException(
        `No pending transaction found for reservation ${reservationId}`,
      );
    }

    // Map webhook status to TransactionStatus
    let transactionStatus: TransactionStatus;
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'PAID':
      case 'APPROVED':
        transactionStatus = TransactionStatus.COMPLETED;
        break;
      case 'FAILED':
      case 'REJECTED':
      case 'DECLINED':
        transactionStatus = TransactionStatus.FAILED;
        break;
      case 'PROCESSING':
        transactionStatus = TransactionStatus.PROCESSING;
        break;
      default:
        transactionStatus = TransactionStatus.PENDING;
    }

    // Update transaction
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: transactionStatus,
      },
    });

    // If payment was successful, confirm the reservation
    if (transactionStatus === TransactionStatus.COMPLETED) {
      await this.confirmReservationAfterPayment(transaction.reservationId);
    }

    return updatedTransaction;
  }

  /**
   * Confirm reservation after successful payment
   */
  private async confirmReservationAfterPayment(reservationId: string) {
    try {
      // Use the reservations service to confirm
      await this.reservationsService.confirm(reservationId, {
        paymentReference: `Transaction confirmed via webhook`,
      });
    } catch (error) {
      // Log error but don't fail the webhook
      // The reservation might already be confirmed, which is fine
      console.error(`Failed to confirm reservation ${reservationId} after payment:`, error);
    }
  }

  /**
   * Get gateway instance
   */
  private getGateway(gateway: PaymentGateway) {
    switch (gateway) {
      case PaymentGateway.DEUNA:
        return this.deunaGateway;
      case PaymentGateway.PAYPHONE:
        return this.payphoneGateway;
      default:
        throw new BadRequestException(`Unsupported payment gateway: ${gateway}`);
    }
  }
}
