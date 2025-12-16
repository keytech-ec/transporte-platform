'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Download, Home, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ConfirmacionPage() {
  const params = useParams();
  const reference = params.reference as string;
  const { toast } = useToast();

  const { data: reservation, isLoading } = useQuery({
    queryKey: ['reservation', reference],
    queryFn: () => reservationsApi.getByReference(reference),
    enabled: !!reference,
  });

  const handleDownload = () => {
    // TODO: Implement PDF generation
    // For now, use browser's print functionality
    toast({
      title: "Generando comprobante",
      description: "Se abrirá la ventana de impresión. Puedes guardar como PDF desde allí.",
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleWhatsAppShare = () => {
    if (!reservation) return;

    const res = reservation as any;
    const trip = res.trip;

    // Format date and time
    let dateTimeStr = 'Fecha no disponible';
    try {
      const dateStr = typeof trip?.departureDate === 'string'
        ? trip.departureDate.split('T')[0]
        : trip?.departureDate;
      const timeStr = typeof trip?.departureTime === 'string'
        ? trip.departureTime.split('T')[1] || trip.departureTime
        : trip?.departureTime;
      dateTimeStr = format(parseISO(`${dateStr}T${timeStr}`), 'PPP p');
    } catch (e) {
      // Keep default value
    }

    const message = `*Confirmacion de Reserva - Transporte Platform*

Ruta: ${trip?.origin || '-'} → ${trip?.destination || '-'}
Fecha y hora: ${dateTimeStr}
Referencia: *${res.bookingReference}*
Pasajeros: ${res.passengers?.length || 0}
Total: ${formatCurrency(res.total)}

¡Reserva confirmada! Presenta tu numero de referencia al abordar.

_Reservado a traves de Transporte Platform_`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Reserva no encontrada</p>
            <Link href="/buscar">
              <Button variant="outline" className="mt-4">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              ¡Reserva confirmada!
            </h1>
            <p className="text-muted-foreground mb-6">
              Tu reserva ha sido procesada exitosamente
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-1">
                Número de referencia
              </p>
              <p className="text-2xl font-bold">{(reservation as any).bookingReference}</p>
            </div>
            <div className="flex justify-center mb-6">
              <QRCodeSVG value={(reservation as any).bookingReference} size={200} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalles del viaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Ruta</p>
              <p className="font-semibold text-lg">
                {(reservation as any).trip?.origin} → {(reservation as any).trip?.destination}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha y hora de salida</p>
              <p className="font-semibold">
                {(() => {
                  try {
                    const trip = (reservation as any).trip;
                    const dateStr = typeof trip?.departureDate === 'string'
                      ? trip.departureDate.split('T')[0]
                      : trip?.departureDate;
                    const timeStr = typeof trip?.departureTime === 'string'
                      ? trip.departureTime.split('T')[1] || trip.departureTime
                      : trip?.departureTime;
                    return format(parseISO(`${dateStr}T${timeStr}`), 'PPP p');
                  } catch (e) {
                    return 'Fecha no disponible';
                  }
                })()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Número de pasajeros</p>
              <p className="font-semibold">{(reservation as any).passengers?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total pagado</p>
              <p className="font-semibold text-lg">
                {formatCurrency((reservation as any).total)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pasajeros y asientos asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {((reservation as any).passengers || []).map((passenger: any, index: number) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <div className="px-3 py-1 bg-transporte-blue-500 text-white rounded-md font-bold">
                      Asiento {passenger.seat?.seatNumber || '-'}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Documento: {passenger.documentNumber}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 mt-6">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
            <Button
              variant="outline"
              onClick={handleWhatsAppShare}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Compartir
            </Button>
          </div>
          <Link href="/" className="block">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

