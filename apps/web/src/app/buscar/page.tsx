'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, MapPin, Search, SlidersHorizontal } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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

  // Filter states
  const [timeFilters, setTimeFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);

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

  // Apply filters to trips
  const filteredTrips = useMemo(() => {
    if (!trips || !Array.isArray(trips)) return [];

    return (trips as any[]).filter((trip: any) => {
      // Time filter
      if (timeFilters.length > 0) {
        try {
          // Use same logic as display - combine date and time, then extract local hours
          const dateStr = typeof trip.departureDate === 'string'
            ? trip.departureDate.split('T')[0]
            : trip.departureDate;
          const timeStr = typeof trip.departureTime === 'string'
            ? trip.departureTime.split('T')[1] || trip.departureTime
            : trip.departureTime;

          // Create Date object and get local hours
          const dateTime = parseISO(`${dateStr}T${timeStr}`);
          const hours = dateTime.getHours(); // This gives local time hours

          const isMorning = hours >= 6 && hours < 12;
          const isAfternoon = hours >= 12 && hours < 18;
          const isNight = hours >= 18 || hours < 6;

          const matches =
            (timeFilters.includes('morning') && isMorning) ||
            (timeFilters.includes('afternoon') && isAfternoon) ||
            (timeFilters.includes('night') && isNight);

          if (!matches) return false;
        } catch (e) {
          console.error('Error parsing time for filter:', trip.departureTime, e);
          // If we can't parse, don't filter out this trip
        }
      }

      // Price filter
      const price = trip.pricePerSeat;
      if (price < priceRange[0] || price > priceRange[1]) {
        return false;
      }

      // Vehicle type filter
      if (vehicleTypes.length > 0) {
        if (!vehicleTypes.includes(trip.vehicle?.type)) {
          return false;
        }
      }

      return true;
    });
  }, [trips, timeFilters, priceRange, vehicleTypes]);

  // Calculate price range from available trips
  const availablePriceRange = useMemo(() => {
    if (!trips || !Array.isArray(trips)) return { min: 0, max: 1000 };

    const prices = (trips as any[]).map((t: any) => t.pricePerSeat);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [trips]);

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

  // Filter toggle handlers
  const toggleTimeFilter = (value: string) => {
    setTimeFilters((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const toggleVehicleType = (value: string) => {
    setVehicleTypes((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setTimeFilters([]);
    setPriceRange([availablePriceRange.min, availablePriceRange.max]);
    setVehicleTypes([]);
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
          <div className="grid md:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="md:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <SlidersHorizontal className="h-5 w-5" />
                      Filtros
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-2 text-xs"
                    >
                      Limpiar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" defaultValue={['time', 'price', 'vehicle']} className="w-full">
                    {/* Time Filter */}
                    <AccordionItem value="time">
                      <AccordionTrigger className="text-sm">Horario</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="morning"
                              checked={timeFilters.includes('morning')}
                              onCheckedChange={() => toggleTimeFilter('morning')}
                            />
                            <Label htmlFor="morning" className="text-sm cursor-pointer">
                              Mañana (6:00 - 12:00)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="afternoon"
                              checked={timeFilters.includes('afternoon')}
                              onCheckedChange={() => toggleTimeFilter('afternoon')}
                            />
                            <Label htmlFor="afternoon" className="text-sm cursor-pointer">
                              Tarde (12:00 - 18:00)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="night"
                              checked={timeFilters.includes('night')}
                              onCheckedChange={() => toggleTimeFilter('night')}
                            />
                            <Label htmlFor="night" className="text-sm cursor-pointer">
                              Noche (18:00 - 6:00)
                            </Label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Price Filter */}
                    <AccordionItem value="price">
                      <AccordionTrigger className="text-sm">Precio</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="min-price" className="text-xs">Mínimo</Label>
                            <Input
                              id="min-price"
                              type="number"
                              min={availablePriceRange.min}
                              max={availablePriceRange.max}
                              value={priceRange[0]}
                              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="max-price" className="text-xs">Máximo</Label>
                            <Input
                              id="max-price"
                              type="number"
                              min={availablePriceRange.min}
                              max={availablePriceRange.max}
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Vehicle Type Filter */}
                    <AccordionItem value="vehicle">
                      <AccordionTrigger className="text-sm">Tipo de vehículo</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="bus"
                              checked={vehicleTypes.includes('BUS')}
                              onCheckedChange={() => toggleVehicleType('BUS')}
                            />
                            <Label htmlFor="bus" className="text-sm cursor-pointer">
                              Bus
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="minibus"
                              checked={vehicleTypes.includes('MINIBUS')}
                              onCheckedChange={() => toggleVehicleType('MINIBUS')}
                            />
                            <Label htmlFor="minibus" className="text-sm cursor-pointer">
                              Minibus
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="van"
                              checked={vehicleTypes.includes('VAN')}
                              onCheckedChange={() => toggleVehicleType('VAN')}
                            />
                            <Label htmlFor="van" className="text-sm cursor-pointer">
                              Van
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="double_decker"
                              checked={vehicleTypes.includes('DOUBLE_DECKER')}
                              onCheckedChange={() => toggleVehicleType('DOUBLE_DECKER')}
                            />
                            <Label htmlFor="double_decker" className="text-sm cursor-pointer">
                              Bus de dos pisos
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="suv"
                              checked={vehicleTypes.includes('SUV')}
                              onCheckedChange={() => toggleVehicleType('SUV')}
                            />
                            <Label htmlFor="suv" className="text-sm cursor-pointer">
                              SUV
                            </Label>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="md:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  {filteredTrips.length} de {trips.length} viajes
                </h2>
                {filteredTrips.length !== trips.length && (
                  <p className="text-sm text-muted-foreground">
                    {trips.length - filteredTrips.length} viajes filtrados
                  </p>
                )}
              </div>

              {filteredTrips.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No hay viajes que coincidan con los filtros seleccionados.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredTrips.map((trip: any) => (
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
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

