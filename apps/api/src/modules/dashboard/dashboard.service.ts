import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReservationStatus } from '@transporte-platform/database';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // Get today's reservations count
    const todayReservations = await this.prisma.reservation.count({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    // Get monthly revenue (confirmed reservations)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyReservations = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.CONFIRMED,
        createdAt: {
          gte: startOfMonth,
        },
      },
      select: {
        total: true,
      },
    });

    const monthlyRevenue = monthlyReservations.reduce(
      (sum, r) => sum + r.total.toNumber(),
      0,
    );

    // Get average occupancy
    const trips = await this.prisma.scheduledTrip.findMany({
      where: {
        departureDate: {
          gte: startOfToday,
        },
      },
      select: {
        vehicle: {
          select: {
            totalSeats: true,
          },
        },
        availableSeats: true,
      },
    });

    let totalOccupancy = 0;
    if (trips.length > 0) {
      trips.forEach((trip) => {
        const occupiedSeats = trip.vehicle.totalSeats - trip.availableSeats;
        const occupancyRate = (occupiedSeats / trip.vehicle.totalSeats) * 100;
        totalOccupancy += occupancyRate;
      });
      totalOccupancy = totalOccupancy / trips.length;
    }

    // Get upcoming trips count (next 24 hours)
    const tomorrow = endOfDay(today);
    const upcomingTrips = await this.prisma.scheduledTrip.count({
      where: {
        departureDate: {
          gte: startOfToday,
          lte: tomorrow,
        },
      },
    });

    return {
      todayReservations,
      monthlyRevenue,
      averageOccupancy: Math.round(totalOccupancy),
      upcomingTrips,
    };
  }

  async getReservationsChart(days: number = 7) {
    const today = new Date();
    const startDate = subDays(today, days - 1);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        createdAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(today),
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by day
    const chartData: { day: string; reservations: number }[] = [];
    for (let i = 0; i < days; i++) {
      const date = subDays(today, days - 1 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const count = reservations.filter(
        (r) => r.createdAt >= dayStart && r.createdAt <= dayEnd,
      ).length;

      chartData.push({
        day: format(date, 'EEE', { locale: require('date-fns/locale/es') }),
        reservations: count,
      });
    }

    return chartData;
  }
}
