'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Download, Home } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export default function ConfirmacionPage() {
  const params = useParams();
  const reference = params.reference as string;

  const { data: reservation, isLoading } = useQuery({
    queryKey: ['reservation', reference],
    queryFn: () => reservationsApi.getByReference(reference),
    enabled: !!reference,
  });

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
              <p className="font-semibold">
                {(reservation as any).trip?.service?.origin} →{' '}
                {(reservation as any).trip?.service?.destination}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha y hora</p>
              <p className="font-semibold">
                {formatDateTime((reservation as any).trip?.departureTime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pasajeros</p>
              <p className="font-semibold">{(reservation as any).passengerCount}</p>
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
            <CardTitle>Pasajeros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {((reservation as any).passengers || []).map((passenger: any, index: number) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <p className="font-semibold">
                    {passenger.firstName} {passenger.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {passenger.documentType}: {passenger.documentNumber}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6">
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Descargar comprobante
          </Button>
          <Link href="/" className="flex-1">
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

