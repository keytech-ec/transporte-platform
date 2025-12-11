'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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
import { Search } from 'lucide-react';

export default function MisReservasPage() {
  const router = useRouter();
  const [reference, setReference] = useState<string>('');

  const form = useForm<BookingReferenceInput>({
    resolver: zodResolver(bookingReferenceSchema),
  });

  const { data: reservation, refetch, isLoading } = useQuery<unknown>({
    queryKey: ['reservation-by-reference', reference],
    queryFn: () => reservationsApi.getByReference(reference),
    enabled: false,
  });

  const onSubmit = (data: BookingReferenceInput) => {
    setReference(data.reference);
    refetch();
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
                <p className="font-semibold">{(reservation as any).status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ruta</p>
                <p className="font-semibold">
                  {(reservation as any).trip?.service?.origin} →{' '}
                  {(reservation as any).trip?.service?.destination}
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
              <Button
                onClick={() =>
                  router.push(`/confirmacion/${(reservation as any).bookingReference}`)
                }
                className="w-full"
              >
                Ver detalles completos
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

