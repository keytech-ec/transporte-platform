'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { reservationsApi } from '@/lib/api';
import {
  bookingReferenceSchema,
  type BookingReferenceInput,
} from '@/lib/validations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MisReservasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reference, setReference] = useState<string>('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const form = useForm<BookingReferenceInput>({
    resolver: zodResolver(bookingReferenceSchema),
    defaultValues: {
      reference: '',
    },
  });

  const { data: reservation, refetch, isLoading } = useQuery<unknown>({
    queryKey: ['reservation-by-reference', reference],
    queryFn: () => reservationsApi.getByReference(reference),
    enabled: false,
  });

  // Trigger refetch when reference state updates
  useEffect(() => {
    if (reference && reference.trim() !== '') {
      refetch();
    }
  }, [reference, refetch]);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      toast({
        title: "Reserva cancelada",
        description: "Tu reserva ha sido cancelada exitosamente. Los asientos han sido liberados.",
      });
      setShowCancelDialog(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error al cancelar",
        description: error.message || "No se pudo cancelar la reserva. Intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingReferenceInput) => {
    setReference(data.reference.trim().toUpperCase());
  };

  const handleCancelReservation = () => {
    if (reservation) {
      cancelMutation.mutate((reservation as any).id);
    }
  };

  const canBeCanceled = (status: string) => {
    return status === 'PENDING' || status === 'CONFIRMED';
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      REFUNDED: 'Reembolsada',
    };
    return labels[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Consultar mi reserva</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar por número de referencia</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de referencia</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: CUE8X9Z2P"
                          {...field}
                          className="uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Search className="mr-2 h-4 w-4" />
                  {isLoading ? 'Buscando...' : 'Buscar'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {reservation ? (
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Número de referencia
                </p>
                <p className="font-semibold text-lg">
                  {(reservation as any).bookingReference}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge((reservation as any).status)}`}>
                  {getStatusLabel((reservation as any).status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ruta</p>
                <p className="font-semibold">
                  {(reservation as any).trip?.origin} → {(reservation as any).trip?.destination}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-semibold">
                  {new Date((reservation as any).trip?.departureTime).toLocaleString(
                    'es-EC'
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold text-lg">
                  ${(reservation as any).total?.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    router.push(`/confirmacion/${(reservation as any).bookingReference}`)
                  }
                  className="flex-1"
                >
                  Ver detalles completos
                </Button>
                {canBeCanceled((reservation as any).status) && (
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    variant="destructive"
                    className="flex-1"
                  >
                    Cancelar reserva
                  </Button>
                )}
              </div>
              {(reservation as any).status === 'CANCELLED' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  <p className="font-semibold">Esta reserva ha sido cancelada</p>
                  <p className="text-xs mt-1">Los asientos han sido liberados y están disponibles para otros usuarios.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Cancel Confirmation Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                ¿Cancelar reserva?
              </DialogTitle>
              <DialogDescription className="space-y-2 pt-2">
                <p>¿Estás seguro que deseas cancelar esta reserva?</p>
                <p className="font-semibold">
                  Referencia: {(reservation as any)?.bookingReference}
                </p>
                <p className="text-sm">
                  Los asientos serán liberados y estarán disponibles para otros usuarios.
                  Si ya realizaste el pago, deberás contactar con soporte para procesar el reembolso.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelMutation.isPending}
              >
                No, mantener reserva
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelReservation}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelando...' : 'Sí, cancelar reserva'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

