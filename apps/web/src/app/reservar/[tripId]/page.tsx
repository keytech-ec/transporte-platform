'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
import { useBookingStore } from '@/stores/booking-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ReservarPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const { setSelectedTrip, setSelectedSeats, setLockId } = useBookingStore();
  const [selectedSeats, setLocalSelectedSeats] = useState<string[]>([]);

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => reservationsApi.getTripSeats(tripId),
    enabled: !!tripId,
  });

  const lockSeatsMutation = useMutation({
    mutationFn: (seatIds: string[]) =>
      reservationsApi.lockSeats({ tripId, seatIds }),
    onSuccess: (data: any) => {
      setSelectedTrip(tripId);
      setSelectedSeats(selectedSeats);
      setLockId(data.lockId);
      router.push(`/reservar/${tripId}/checkout`);
    },
  });

  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setLocalSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setLocalSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      return;
    }
    lockSeatsMutation.mutate(selectedSeats);
  };

  if (tripLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Viaje no encontrado</p>
            <Link href="/buscar">
              <Button variant="outline" className="mt-4">
                Volver a buscar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/buscar">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecciona tus asientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {(trip as any)?.seats?.map((seat: any) => {
                const isSelected = selectedSeats.includes(seat.id);
                const isAvailable = seat.status === 'AVAILABLE';
                const isLocked = seat.status === 'LOCKED';
                const isReserved = seat.status === 'RESERVED' || seat.status === 'CONFIRMED';

                return (
                  <button
                    key={seat.id}
                    onClick={() => isAvailable && toggleSeat(seat.id)}
                    disabled={!isAvailable}
                    className={cn(
                      'h-12 rounded border-2 transition-colors',
                      isSelected && 'bg-transporte-blue-500 border-transporte-blue-600 text-white',
                      !isSelected && isAvailable && 'bg-green-100 border-green-300 hover:bg-green-200',
                      isLocked && 'bg-yellow-100 border-yellow-300 cursor-not-allowed',
                      isReserved && 'bg-red-100 border-red-300 cursor-not-allowed'
                    )}
                  >
                    {seat.seatNumber}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                <span className="text-sm">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-transporte-blue-500 border-2 border-transporte-blue-600 rounded"></div>
                <span className="text-sm">Seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                <span className="text-sm">Bloqueado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                <span className="text-sm">Ocupado</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {selectedSeats.length} asiento(s) seleccionado(s)
              </p>
              <Button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0 || lockSeatsMutation.isPending}
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

