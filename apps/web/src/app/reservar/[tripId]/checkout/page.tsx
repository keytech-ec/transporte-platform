'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { reservationsApi, paymentsApi } from '@/lib/api';
import { useBookingStore } from '@/stores/booking-store';
import {
  reservationSchema,
  type ReservationInput,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedTrip, selectedSeats, lockId, passengerCount, setCustomer, setPassengers } =
    useBookingStore();

  const { data: tripData, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', selectedTrip],
    queryFn: () => reservationsApi.getTripSeats(selectedTrip!),
    enabled: !!selectedTrip,
  });

  const form = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      tripId: selectedTrip || '',
      lockId: lockId || '',
      seatIds: selectedSeats,
      customer: {
        documentType: 'CEDULA',
        documentNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
      passengers: Array(selectedSeats.length).fill(null).map(() => ({
        documentType: 'CEDULA' as const,
        documentNumber: '',
        firstName: '',
        lastName: '',
        passengerType: 'ADULT' as const,
      })),
      reservationType: 'ONE_WAY',
    },
  });

  const createReservationMutation = useMutation({
    mutationFn: (data: ReservationInput) =>
      reservationsApi.createReservation(data),
    onSuccess: async (reservation: any) => {
      setCustomer(form.getValues('customer'));
      setPassengers(form.getValues('passengers'));

      // TODO: Payment gateway integration
      // For now, we'll skip payment and go directly to confirmation
      // In production, uncomment the payment flow below:

      // try {
      //   const paymentLink: any = await paymentsApi.createPaymentLink({
      //     reservationId: reservation.id,
      //     gateway: 'DEUNA',
      //   });
      //   if (paymentLink?.paymentUrl) {
      //     window.location.href = paymentLink.paymentUrl;
      //     return;
      //   }
      // } catch (error) {
      //   console.error('Payment link creation failed:', error);
      // }

      // Skip payment for now - go directly to confirmation
      router.push(`/confirmacion/${reservation.bookingReference}`);
    },
    onError: (error: any) => {
      console.error('Reservation creation error:', error);
      alert(`Error al crear la reserva: ${error.message || 'Por favor verifica los datos e intenta nuevamente.'}`);
    },
  });

  const onSubmit = (data: ReservationInput) => {
    console.log('Form data:', data);

    // Transform data to match backend expectations
    const transformedData = {
      tripId: data.tripId,
      lockId: data.lockId,
      seatIds: data.seatIds,
      customer: data.customer,
      passengers: data.passengers.map((passenger: any, index: number) => ({
        documentNumber: passenger.documentNumber,
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        seatId: data.seatIds[index], // Assign seat to passenger by index
      })),
      reservationType: 'PER_SEAT', // Backend expects 'PER_SEAT' not 'ONE_WAY'
    };

    console.log('Transformed reservation data:', transformedData);
    createReservationMutation.mutate(transformedData as any);
  };

  if (tripLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!tripData || !selectedTrip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Error al cargar la información del viaje</p>
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

  const trip = tripData as any;
  const selectedSeatObjects = trip.seats?.filter((seat: any) =>
    selectedSeats.includes(seat.id)
  ) || [];
  const pricePerSeat = trip.pricePerSeat || 0;
  const total = selectedSeats.length * pricePerSeat;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Link href={`/reservar/${selectedTrip}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left side: Forms */}
          <div className="md:col-span-2">
            <Card>
          <CardHeader>
            <CardTitle>Información de contacto y pasajeros</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Información de contacto
                  </h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customer.documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de documento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CEDULA">Cédula</SelectItem>
                              <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                              <SelectItem value="RUC">RUC</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customer.documentNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de documento</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customer.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customer.firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customer.lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="customer.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Información de pasajeros
                  </h3>
                  <div className="space-y-4">
                    {form.watch('passengers').map((_: unknown, index: number) => (
                      <div key={index} className="border p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">
                            Pasajero {index + 1}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Asiento:</span>
                            <div className="px-3 py-1 bg-transporte-blue-500 text-white rounded-md text-sm font-bold">
                              {selectedSeatObjects[index]?.seatNumber || '-'}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`passengers.${index}.documentType`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de documento</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="CEDULA">Cédula</SelectItem>
                                    <SelectItem value="PASAPORTE">
                                      Pasaporte
                                    </SelectItem>
                                    <SelectItem value="RUC">RUC</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`passengers.${index}.documentNumber`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número de documento</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`passengers.${index}.passengerType`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de pasajero</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="ADULT">Adulto</SelectItem>
                                      <SelectItem value="CHILD">Niño</SelectItem>
                                      <SelectItem value="SENIOR">Adulto mayor</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`passengers.${index}.firstName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`passengers.${index}.lastName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Apellido</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createReservationMutation.isPending}
                >
                  {createReservationMutation.isPending
                    ? 'Procesando...'
                    : 'Continuar al pago'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
          </div>

          {/* Right side: Purchase Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumen de compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trip Details */}
                <div>
                  <h3 className="font-semibold mb-2">Detalles del viaje</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ruta</p>
                      <p className="font-medium">{trip.origin} → {trip.destination}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fecha y hora</p>
                      <p className="font-medium">
                        {(() => {
                          try {
                            const dateStr = typeof trip.departureDate === 'string'
                              ? trip.departureDate.split('T')[0]
                              : trip.departureDate;
                            const timeStr = typeof trip.departureTime === 'string'
                              ? trip.departureTime.split('T')[1] || trip.departureTime
                              : trip.departureTime;
                            return format(parseISO(`${dateStr}T${timeStr}`), 'PPP p');
                          } catch (e) {
                            return 'Fecha no disponible';
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Seats */}
                <div>
                  <h3 className="font-semibold mb-2">Asientos seleccionados</h3>
                  <div className="space-y-2">
                    {selectedSeatObjects.map((seat: any, index: number) => (
                      <div
                        key={seat.id}
                        className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                      >
                        <span className="text-muted-foreground">Pasajero {index + 1}</span>
                        <div className="px-3 py-1 bg-transporte-blue-500 text-white rounded-md font-bold">
                          {seat.seatNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Precio por asiento:</span>
                    <span className="font-medium">${pricePerSeat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Número de asientos:</span>
                    <span className="font-medium">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pasajeros:</span>
                    <span className="font-medium">{passengerCount}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total a pagar:</span>
                    <span className="text-2xl font-bold text-transporte-blue-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Security Note */}
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-muted-foreground">
                  <p>
                    ✓ Pago seguro y encriptado
                  </p>
                  <p className="mt-1">
                    ✓ Tus asientos están reservados por 15 minutos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

