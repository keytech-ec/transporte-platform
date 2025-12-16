'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardStats {
  todayReservations: number;
  monthlyRevenue: number;
  averageOccupancy: number;
  upcomingTrips: number;
}

interface ReservationItem {
  id: string;
  reference: string;
  passengerName: string;
  route: string;
  date: string;
  status: string;
  total: number;
}

interface TripItem {
  id: string;
  route: string;
  departureTime: string;
  vehicle: string;
  occupiedSeats: number;
  totalSeats: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReservations, setRecentReservations] = useState<ReservationItem[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<TripItem[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load dashboard stats
      const statsData = await api.getDashboardStats();
      setStats(statsData);

      // Mock chart data for last 7 days
      const mockChartData = [
        { day: 'Lun', reservations: 12 },
        { day: 'Mar', reservations: 19 },
        { day: 'Mié', reservations: 15 },
        { day: 'Jue', reservations: 22 },
        { day: 'Vie', reservations: 28 },
        { day: 'Sáb', reservations: 32 },
        { day: 'Dom', reservations: 24 },
      ];
      setChartData(mockChartData);

      // Load recent reservations
      const reservations = await api.getReservations();
      const formattedReservations = reservations.slice(0, 5).map((r: any) => ({
        id: r.id,
        reference: r.reference,
        passengerName: r.passengers?.[0]?.name || 'N/A',
        route: `${r.trip?.service?.origin || ''} → ${r.trip?.service?.destination || ''}`,
        date: r.trip?.date ? format(new Date(r.trip.date), 'dd MMM', { locale: es }) : '',
        status: r.status,
        total: r.total,
      }));
      setRecentReservations(formattedReservations);

      // Mock upcoming trips
      const mockTrips: TripItem[] = [
        {
          id: '1',
          route: 'Guayaquil → Quito',
          departureTime: '08:00',
          vehicle: 'ABC-123',
          occupiedSeats: 28,
          totalSeats: 40,
        },
        {
          id: '2',
          route: 'Quito → Cuenca',
          departureTime: '10:30',
          vehicle: 'DEF-456',
          occupiedSeats: 35,
          totalSeats: 40,
        },
        {
          id: '3',
          route: 'Cuenca → Guayaquil',
          departureTime: '14:00',
          vehicle: 'GHI-789',
          occupiedSeats: 22,
          totalSeats: 40,
        },
      ];
      setUpcomingTrips(mockTrips);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      confirmed: {
        label: 'Confirmada',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      pending: {
        label: 'Pendiente',
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      cancelled: {
        label: 'Cancelada',
        className: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Resumen general de tu plataforma de transporte
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayReservations || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupación Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageOccupancy || 0}%</div>
            <p className="text-xs text-muted-foreground">
              +5% desde la semana pasada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Viajes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingTrips || 0}</div>
            <p className="text-xs text-muted-foreground">
              En las próximas 24 horas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas de los Últimos 7 Días</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reservations" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two Columns Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReservations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay reservas recientes
                </p>
              ) : (
                recentReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {reservation.reference}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.passengerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.route} • {reservation.date}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(reservation.status)}
                      <span className="text-sm font-semibold">
                        {formatCurrency(reservation.total)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Salidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTrips.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay viajes próximos
                </p>
              ) : (
                upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{trip.route}</p>
                      <p className="text-xs text-muted-foreground">
                        {trip.departureTime} • {trip.vehicle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {trip.occupiedSeats}/{trip.totalSeats}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((trip.occupiedSeats / trip.totalSeats) * 100)}% ocupado
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
