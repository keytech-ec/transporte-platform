'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Copy, ArrowLeft, Loader2, Home } from 'lucide-react';
import api, { type MySale } from '@/lib/api';

function ConfirmacionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const bookingRef = searchParams?.get('ref');

  const [sale, setSale] = useState<MySale | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!bookingRef) {
      router.push('/dashboard/punto-de-venta');
      return;
    }

    loadSale();
  }, [bookingRef]);

  const loadSale = async () => {
    try {
      const sales = await api.getMySales();
      const foundSale = sales.find(s => s.bookingReference === bookingRef);

      if (foundSale) {
        setSale(foundSale);
      } else {
        toast({
          title: 'Error',
          description: 'No se encontró la venta',
          variant: 'destructive',
        });
        router.push('/dashboard/punto-de-venta');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar la venta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    setCopying(true);
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
    } finally {
      setCopying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!sale) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">¡Venta Completada!</h2>
          <p className="text-muted-foreground mt-2">
            La venta se ha procesado correctamente
          </p>
        </div>
      </div>

      {/* Booking Reference */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Código de Reserva</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-4xl font-bold text-primary tracking-wider">
                  {sale.bookingReference}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(sale.bookingReference)}
                  disabled={copying}
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Proporciona este código al cliente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles del Viaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ruta</p>
              <p className="font-semibold">
                {sale.tripInfo.origin} → {sale.tripInfo.destination}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Servicio</p>
              <p className="font-semibold">{sale.tripInfo.serviceName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-semibold">
                {new Date(sale.tripInfo.departureDate).toLocaleDateString('es-EC', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hora de Salida</p>
              <p className="font-semibold">{sale.tripInfo.departureTime}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Asientos</p>
            <div className="flex flex-wrap gap-2">
              {sale.seatNumbers.map((seatNumber, index) => (
                <Badge key={index} variant="default">
                  {seatNumber}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Nombre Completo</p>
            <p className="font-semibold">
              {sale.contact.firstName} {sale.contact.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Teléfono</p>
            <p className="font-semibold">{sale.contact.phone}</p>
          </div>
          {sale.contact.email && (
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{sale.contact.email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Canal de Venta</p>
              <p className="font-semibold">
                {sale.saleChannel === 'POS_CASH' && 'Efectivo (POS)'}
                {sale.saleChannel === 'POS_TRANSFER' && 'Transferencia (POS)'}
                {sale.saleChannel === 'POS_CARD' && 'Tarjeta (POS)'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Método de Pago</p>
              <p className="font-semibold">
                {sale.paymentMethod === 'CASH' && 'Efectivo'}
                {sale.paymentMethod === 'BANK_TRANSFER' && 'Transferencia Bancaria'}
                {sale.paymentMethod === 'CREDIT_CARD' && 'Tarjeta de Crédito'}
                {sale.paymentMethod === 'DEBIT_CARD' && 'Tarjeta de Débito'}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">Total Pagado</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(sale.totalAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger Form Status */}
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Pasajeros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sale.passengerFormCompleted ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Formulario completado</span>
              </div>
            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Pendiente:</strong> El cliente debe completar los datos de los pasajeros.
                    Se ha enviado un enlace al contacto proporcionado.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  El cliente recibirá un enlace para completar la información de los pasajeros.
                  Este enlace es válido por 72 horas.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/punto-de-venta')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Nueva Venta
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/mis-ventas')}
          >
            Ver Mis Ventas
          </Button>
          <Button onClick={() => router.push('/dashboard')}>
            <Home className="mr-2 h-4 w-4" />
            Ir al Dashboard
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-gray-900">Próximos Pasos:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Entregar el código de reserva al cliente</li>
              <li>El cliente completará los datos de los pasajeros mediante el enlace enviado</li>
              <li>El cliente debe presentar el código y su documento de identidad al abordar</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  );
}
