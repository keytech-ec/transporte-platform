'use client';

import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  Banknote,
  Building2,
  BarChart3,
  Download,
} from 'lucide-react';
import api, { type VendorReportSummary } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function ReportsPage() {
  const [vendorReports, setVendorReports] = useState<VendorReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [toDate, setToDate] = useState<string>(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.getProviderSales({
        from: fromDate,
        to: toDate,
      });
      setVendorReports(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar reportes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    loadReports();
  };

  const handleReset = () => {
    setFromDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    setToDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    setTimeout(loadReports, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getOverallStats = () => {
    if (!Array.isArray(vendorReports)) {
      return { totalSales: 0, totalRevenue: 0, totalCash: 0, totalTransfer: 0, totalCard: 0, activeVendors: 0 };
    }

    const totalSales = vendorReports.reduce((sum, v) => sum + v.salesCount, 0);
    const totalRevenue = vendorReports.reduce((sum, v) => sum + v.totalAmount, 0);
    const totalCash = vendorReports.reduce((sum, v) => sum + v.cashAmount, 0);
    const totalTransfer = vendorReports.reduce((sum, v) => sum + v.transferAmount, 0);
    const totalCard = vendorReports.reduce((sum, v) => sum + v.cardAmount, 0);
    const activeVendors = vendorReports.filter((v) => v.salesCount > 0).length;

    return { totalSales, totalRevenue, totalCash, totalTransfer, totalCard, activeVendors };
  };

  const stats = getOverallStats();

  const getTopVendor = () => {
    if (!Array.isArray(vendorReports) || vendorReports.length === 0) return null;
    return vendorReports.reduce((top, current) =>
      current.totalAmount > top.totalAmount ? current : top
    );
  };

  const topVendor = getTopVendor();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes de Vendedores</h2>
          <p className="text-muted-foreground">
            Análisis de desempeño de ventas por vendedor
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecciona el rango de fechas para el reporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="from">Desde</Label>
              <Input
                id="from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="to">Hasta</Label>
              <Input
                id="to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <Button onClick={handleFilterChange}>Aplicar Filtros</Button>
            <Button variant="outline" onClick={handleReset}>
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeVendors} vendedores activos
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
              Promedio: {formatCurrency(stats.totalSales > 0 ? stats.totalRevenue / stats.totalSales : 0)} por venta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos en Efectivo</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCash)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRevenue > 0 ? Math.round((stats.totalCash / stats.totalRevenue) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferencias</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalTransfer)}</div>
            <p className="text-xs text-muted-foreground">
              Tarjetas: {formatCurrency(stats.totalCard)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Vendor Highlight */}
      {topVendor && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Mejor Vendedor del Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {topVendor.vendor.firstName} {topVendor.vendor.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{topVendor.vendor.email}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(topVendor.totalAmount)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {topVendor.salesCount} ventas realizadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendor Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Desempeño por Vendedor</CardTitle>
          <CardDescription>
            Detalle de ventas e ingresos por cada vendedor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead className="text-right">Total Ingresos</TableHead>
                  <TableHead className="text-right">Efectivo</TableHead>
                  <TableHead className="text-right">Transferencias</TableHead>
                  <TableHead className="text-right">Tarjetas</TableHead>
                  <TableHead className="text-right">Promedio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(vendorReports) || vendorReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron ventas en el período seleccionado
                    </TableCell>
                  </TableRow>
                ) : (
                  vendorReports
                    .sort((a, b) => b.totalAmount - a.totalAmount)
                    .map((report) => (
                      <TableRow key={report.vendor.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {report.vendor.firstName} {report.vendor.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {report.vendor.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{report.salesCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(report.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(report.cashAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(report.transferAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(report.cardAmount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(
                            report.salesCount > 0 ? report.totalAmount / report.salesCount : 0
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
