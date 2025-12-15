'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, MapPin, Search } from 'lucide-react';
import { format, parseISO, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { searchTripsSchema, type SearchTripsInput } from '@/lib/validations';
import { useQuery } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/stores/booking-store';
import { useToast } from '@/hooks/use-toast';

export default function BuscarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setPassengerCount } = useBookingStore();
  const [searchParams, setSearchParams] = useState<SearchTripsInput | null>(
    null
  );
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

  const { data: trips, isLoading } = useQuery({
    queryKey: ['search-trips', searchParams],
    queryFn: () => reservationsApi.searchTrips(searchParams!),
    enabled: !!searchParams,
  });

  const onSubmit = (data: SearchTripsInput) => {
    setSearchParams(data);
    // Store passenger count when search is submitted
    setPassengerCount(data.passengers);
  };

  const handleSelectTrip = (tripId: string, availableSeats: number) => {
    // Use passenger count from the actual search performed, not current form value
    if (!searchParams) return;

    // Cap passenger count to available seats if needed
    const effectivePassengerCount = Math.min(searchParams.passengers, availableSeats);

    // Notify user if passenger count was reduced
    if (effectivePassengerCount < searchParams.passengers) {
      toast({
        title: "Asientos limitados",
        description: `Este viaje solo tiene ${availableSeats} asientos disponibles. Seleccionarás ${effectivePassengerCount} asiento${effectivePassengerCount !== 1 ? 's' : ''}.`,
        variant: "default",
      });
    }

    setPassengerCount(effectivePassengerCount);
    router.push(`/reservar/${tripId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Buscar viajes</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buscar disponibilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origen</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Cuenca" {...field} />
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
                          <Input placeholder="Ej: Guayaquil" {...field} />
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

                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar viajes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {Array.isArray(trips) && trips.length === 0 && searchParams && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No se encontraron viajes disponibles para esta búsqueda.
              </p>
            </CardContent>
          </Card>
        )}

        {Array.isArray(trips) && trips.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Viajes disponibles ({trips.length})
            </h2>
            {(trips as any[]).map((trip: any) => (
              <Card key={trip.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {trip.origin} → {trip.destination}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {(() => {
                          try {
                            // Extract date from departureDate (YYYY-MM-DD)
                            const dateStr = typeof trip.departureDate === 'string'
                              ? trip.departureDate.split('T')[0]
                              : trip.departureDate;
                            // Extract time from departureTime (HH:MM:SS)
                            const timeStr = typeof trip.departureTime === 'string'
                              ? trip.departureTime.split('T')[1] || trip.departureTime
                              : trip.departureTime;
                            return format(parseISO(`${dateStr}T${timeStr}`), 'PPP p');
                          } catch (e) {
                            return 'Fecha no disponible';
                          }
                        })()}
                      </p>
                      <p className="text-sm">
                        Asientos disponibles: {trip.availableSeats}
                      </p>
                      <p className="text-lg font-bold mt-2">
                        ${trip.pricePerSeat.toFixed(2)} por asiento
                      </p>
                    </div>
                    <Button onClick={() => handleSelectTrip(trip.id, trip.availableSeats)}>
                      Seleccionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

