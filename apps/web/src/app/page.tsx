'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, MapPin, Clock, Shield, CalendarIcon } from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { searchTripsSchema, type SearchTripsInput } from '@/lib/validations';
import { useBookingStore } from '@/stores/booking-store';
import { LocationCombobox } from '@/components/LocationCombobox';

export default function HomePage() {
  const router = useRouter();
  const { setPassengerCount } = useBookingStore();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<SearchTripsInput>({
    resolver: zodResolver(searchTripsSchema),
    defaultValues: {
      origin: '',
      destination: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      passengers: 1,
    },
  });

  const onSubmit = (data: SearchTripsInput) => {
    setPassengerCount(data.passengers);
    const params = new URLSearchParams({
      origin: data.origin,
      destination: data.destination,
      date: data.date,
      passengers: data.passengers.toString(),
    });
    router.push(`/buscar?${params.toString()}`);
  };
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-transporte-blue-500 to-transporte-green-500 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Viaja con confianza
              </h1>
              <p className="text-xl md:text-2xl text-blue-50">
                Reserva tu viaje interprovincial o tour de forma rápida y segura
              </p>
            </div>

            {/* Inline Search Form */}
            <Card className="shadow-2xl">
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="origin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origen</FormLabel>
                            <FormControl>
                              <LocationCombobox
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Selecciona el origen"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destino</FormLabel>
                            <FormControl>
                              <LocationCombobox
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Selecciona el destino"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha</FormLabel>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full pl-3 text-left font-normal',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value ? (
                                      format(parseISO(field.value), 'PPP')
                                    ) : (
                                      <span>Selecciona una fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? parseISO(field.value) : undefined}
                                  onSelect={(date) => {
                                    field.onChange(
                                      date ? format(date, 'yyyy-MM-dd') : ''
                                    );
                                    setCalendarOpen(false);
                                  }}
                                  disabled={(date) => date < startOfDay(new Date())}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="passengers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pasajeros</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={50}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 1)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-transporte-blue-600 hover:bg-transporte-blue-700" size="lg">
                      <Search className="mr-2 h-5 w-5" />
                      Buscar viajes disponibles
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-transporte-blue-100 text-transporte-blue-600 mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Múltiples destinos</h3>
              <p className="text-gray-600">
                Conectamos las principales ciudades del Ecuador
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-transporte-green-100 text-transporte-green-600 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Horarios flexibles</h3>
              <p className="text-gray-600">
                Varios horarios disponibles durante el día
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-transporte-blue-100 text-transporte-blue-600 mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pago seguro</h3>
              <p className="text-gray-600">
                Procesamos tus pagos de forma segura y confiable
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Rutas Populares</h2>
            <p className="text-gray-600">
              Descubre los destinos más buscados
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Route 1: Cuenca - Guayaquil */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-2xl font-bold">Cuenca</p>
                  <p className="text-sm opacity-90">→</p>
                  <p className="text-2xl font-bold">Guayaquil</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">Desde</span>
                  <span className="text-2xl font-bold text-transporte-blue-600">$8.50</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Duración aprox: 3-4 horas
                </p>
                <Link href="/buscar?origin=Cuenca&destination=Guayaquil">
                  <Button className="w-full">Ver horarios</Button>
                </Link>
              </div>
            </div>

            {/* Route 2: Quito - Guayaquil */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-2xl font-bold">Quito</p>
                  <p className="text-sm opacity-90">→</p>
                  <p className="text-2xl font-bold">Guayaquil</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">Desde</span>
                  <span className="text-2xl font-bold text-transporte-green-600">$10.00</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Duración aprox: 8-9 horas
                </p>
                <Link href="/buscar?origin=Quito&destination=Guayaquil">
                  <Button className="w-full">Ver horarios</Button>
                </Link>
              </div>
            </div>

            {/* Route 3: Cuenca - Loja */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-2xl font-bold">Cuenca</p>
                  <p className="text-sm opacity-90">→</p>
                  <p className="text-2xl font-bold">Loja</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">Desde</span>
                  <span className="text-2xl font-bold text-purple-600">$7.00</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Duración aprox: 4-5 horas
                </p>
                <Link href="/buscar?origin=Cuenca&destination=Loja">
                  <Button className="w-full">Ver horarios</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Ya tienes una reserva?</h2>
          <p className="text-gray-600 mb-6">
            Consulta el estado de tu reserva con tu número de referencia
          </p>
          <Link href="/mis-reservas">
            <Button variant="outline" size="lg">
              Consultar reserva
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

