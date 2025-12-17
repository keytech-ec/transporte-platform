'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCcw,
  CheckCircle2,
  Clock,
  Copy,
  Send,
  Filter,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import api, { type MySale } from '@/lib/api';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MisVentasPage() {
  const { toast } = useToast();

  const [sales, setSales] = useState<MySale[]>([]);
  const [filteredSales, setFilteredSales] = useState<MySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState<string | null>(null);

  // Filters
  const [fromDate, setFromDate] = useState<string>(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [toDate, setToDate] = useState<string>(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sales, fromDate, toDate]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await api.getMySales();
      setSales(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar ventas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!Array.isArray(sales)) return;
    let filtered = [...sales];

    if (fromDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.createdAt) >= new Date(fromDate)
      );
    }

    if (toDate) {
      const endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (sale) => new Date(sale.createdAt) <= endOfDay
      );
    }

    setFilteredSales(filtered);
  };

  const handleResendForm = async (reservationId: string) => {
    setResending(reservationId);
    try {
      await api.resendPassengerForm(reservationId);
      toast({
        title: 'Enlace Reenviado',
        description: 'Se ha reenviado el enlace del formulario de pasajeros',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al reenviar formulario',
        variant: 'destructive',
      });
    } finally {
      setResending(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado',
        description: 'Código copiado al portapapeles',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el código',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateStats = () => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const completedForms = filteredSales.filter(s => s.passengerFormCompleted).length;

    return {
      totalSales,
      totalRevenue,
      completedForms,
      pendingForms: totalSales - completedForms,
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mis Ventas</h2>
          <p className="text-muted-foreground">
            Historial de ventas realizadas
          </p>
        </div>
        <Button onClick={loadSales} disabled={loading}>
          <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Monto total recaudado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formularios Completados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedForms}</div>
            <p className="text-xs text-muted-foreground">
              Datos de pasajeros registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formularios Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingForms}</div>
            <p className="text-xs text-muted-foreground">
              Pendientes de completar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromDate">Desde</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="toDate">Hasta</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Realizadas</CardTitle>
          <CardDescription>
            {filteredSales.length} {filteredSales.length === 1 ? 'venta encontrada' : 'ventas encontradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Fecha Venta</TableHead>
                  <TableHead>Viaje</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Asientos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Formulario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontraron ventas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{sale.bookingReference}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(sale.bookingReference)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(sale.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {sale.tripInfo.origin} → {sale.tripInfo.destination}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(sale.tripInfo.departureDate), 'dd MMM', { locale: es })} | {sale.tripInfo.departureTime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {sale.contact.firstName} {sale.contact.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {sale.contact.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sale.seatNumbers.map((seatNumber, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {seatNumber}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(sale.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {sale.passengerFormCompleted ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!sale.passengerFormCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendForm(sale.id)}
                            disabled={resending === sale.id}
                          >
                            {resending === sale.id ? (
                              <RefreshCcw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Reenviar
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
