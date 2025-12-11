'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
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

export default function CheckoutPage() {
  const router = useRouter();
  const { selectedTrip, selectedSeats, lockId, setCustomer, setPassengers } =
    useBookingStore();

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
      
      // Crear link de pago
      const paymentLink: any = await paymentsApi.createPaymentLink({
        reservationId: reservation.id,
        gateway: 'DEUNA', // o 'PAYPHONE'
      });

      // Redirigir a la URL de pago
      if (paymentLink?.paymentUrl) {
        window.location.href = paymentLink.paymentUrl;
      } else {
        router.push(`/confirmacion/${reservation.bookingReference}`);
      }
    },
  });

  const onSubmit = (data: ReservationInput) => {
    createReservationMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/reservar/${selectedTrip}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>

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
                        <h4 className="font-medium mb-3">
                          Pasajero {index + 1}
                        </h4>
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
    </div>
  );
}

