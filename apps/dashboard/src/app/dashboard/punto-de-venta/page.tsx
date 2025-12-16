'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Search,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import api, { type Trip, type Seat, type CreateManualSaleData } from '@/lib/api';

type SaleChannel = 'POS_CASH' | 'POS_TRANSFER' | 'POS_CARD';
type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD';

interface TripWithSeats extends Trip {
  seats: Seat[];
}

export default function PuntoDeVentaPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Search trips
  const [searchDate, setSearchDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripWithSeats | null>(null);

  // Step 2: Select seats
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // Step 3: Contact and payment
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [paymentData, setPaymentData] = useState({
    saleChannel: 'POS_CASH' as SaleChannel,
    paymentMethod: 'CASH' as PaymentMethod,
    amountPaid: 0,
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const searchTrips = async () => {
    setLoadingTrips(true);
    try {
      const data = await api.getTrips({
        startDate: searchDate,
        endDate: searchDate,
      });

      // Filter only scheduled trips
      const scheduledTrips = data.filter(trip => trip.status === 'scheduled');
      setTrips(scheduledTrips);

      if (scheduledTrips.length === 0) {
        toast({
          title: 'Sin resultados',
          description: 'No se encontraron viajes para la fecha seleccionada',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al buscar viajes',
        variant: 'destructive',
      });
    } finally {
      setLoadingTrips(false);
    }
  };

  const selectTrip = async (trip: Trip) => {
    try {
      const seats = await api.getTripSeats(trip.id);
      setSelectedTrip({ ...trip, seats });
      setPaymentData(prev => ({
        ...prev,
        amountPaid: trip.price,
      }));
      setCurrentStep(2);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar asientos',
        variant: 'destructive',
      });
    }
  };

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'available') return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const updateTotalAmount = () => {
    if (!selectedTrip) return;
    const total = selectedSeats.length * selectedTrip.price;
    setPaymentData(prev => ({ ...prev, amountPaid: total }));
  };

  useEffect(() => {
    updateTotalAmount();
  }, [selectedSeats]);

  const goToPayment = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: 'Atención',
        description: 'Debes seleccionar al menos un asiento',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrip || selectedSeats.length === 0) return;

    setSubmitting(true);

    try {
      const saleData: CreateManualSaleData = {
        tripId: selectedTrip.id,
        seatIds: selectedSeats.map(s => s.id),
        contact: {
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          phone: contactData.phone,
          email: contactData.email || undefined,
        },
        payment: {
          saleChannel: paymentData.saleChannel,
          paymentMethod: paymentData.paymentMethod,
          amountPaid: paymentData.amountPaid,
        },
        notes: notes || undefined,
      };

      const result = await api.createManualSale(saleData);

      // Redirect to confirmation page with sale data
      router.push(`/dashboard/punto-de-venta/confirmacion?ref=${result.bookingReference}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al procesar la venta',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Render seat grid
  const renderSeats = () => {
    if (!selectedTrip || !selectedTrip.seats) return null;

    const rows = Math.max(...selectedTrip.seats.map(s => s.row));
    const cols = Math.max(...selectedTrip.seats.map(s => s.column));

    const seatGrid: (Seat | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));

    selectedTrip.seats.forEach(seat => {
      if (seat.row > 0 && seat.column > 0 && seatGrid[seat.row - 1]) {
        seatGrid[seat.row - 1]![seat.column - 1] = seat;
      }
    });

    return (
      <div className="space-y-2">
        {seatGrid.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2 justify-center">
            {row.map((seat, colIndex) => {
              if (!seat) {
                return <div key={colIndex} className="w-12 h-12" />;
              }

              const isSelected = selectedSeats.some(s => s.id === seat.id);
              const isAvailable = seat.status === 'available';

              return (
                <button
                  key={seat.id}
                  onClick={() => toggleSeat(seat)}
                  disabled={!isAvailable}
                  className={`
                    w-12 h-12 rounded-md border-2 font-semibold text-sm transition-all
                    ${isSelected
                      ? 'bg-green-500 border-green-600 text-white'
                      : isAvailable
                      ? 'bg-white border-gray-300 hover:border-blue-500'
                      : 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  {seat.seatNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Punto de Venta</h2>
        <p className="text-muted-foreground">
          Realiza ventas de pasajes de forma manual
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      ${currentStep >= step
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}
                  >
                    {currentStep > step ? <Check className="h-5 w-5" /> : step}
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-medium">
                      {step === 1 && 'Seleccionar Viaje'}
                      {step === 2 && 'Seleccionar Asientos'}
                      {step === 3 && 'Datos y Pago'}
                    </p>
                  </div>
                </div>
                {step < 3 && (
                  <div className="flex-1 h-1 mx-4 bg-gray-200">
                    <div
                      className={`h-full transition-all ${
                        currentStep > step ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Search and select trip */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Viajes</CardTitle>
              <CardDescription>
                Selecciona la fecha para ver los viajes disponibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="searchDate">Fecha</Label>
                  <Input
                    id="searchDate"
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={searchTrips} disabled={loadingTrips}>
                    {loadingTrips ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {trips.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Viajes Disponibles</CardTitle>
                <CardDescription>
                  {trips.length} {trips.length === 1 ? 'viaje encontrado' : 'viajes encontrados'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trips.map((trip) => (
                    <Card key={trip.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">
                                {trip.origin} → {trip.destination}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{trip.departureTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{trip.availableSeats} disponibles</span>
                              </div>
                              <span className="font-semibold text-primary">
                                {formatCurrency(trip.price)}
                              </span>
                            </div>
                          </div>
                          <Button onClick={() => selectTrip(trip)}>
                            Seleccionar
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Select seats */}
      {currentStep === 2 && selectedTrip && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Asientos</CardTitle>
              <CardDescription>
                Viaje: {selectedTrip.origin} → {selectedTrip.destination} | {selectedTrip.departureTime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Legend */}
                <div className="flex gap-6 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border-2 bg-white border-gray-300" />
                    <span className="text-sm">Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border-2 bg-green-500 border-green-600" />
                    <span className="text-sm">Seleccionado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded border-2 bg-gray-200 border-gray-300" />
                    <span className="text-sm">Ocupado</span>
                  </div>
                </div>

                {/* Seat Grid */}
                {renderSeats()}

                {/* Selected seats summary */}
                {selectedSeats.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold mb-2">Asientos seleccionados:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedSeats.map((seat) => (
                        <Badge key={seat.id} variant="default">
                          {seat.seatNumber}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-lg font-bold">
                      Total: {formatCurrency(selectedSeats.length * selectedTrip.price)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button onClick={goToPayment} disabled={selectedSeats.length === 0}>
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Contact and payment */}
      {currentStep === 3 && selectedTrip && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
              <CardDescription>Información de contacto del pasajero</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombres *</Label>
                    <Input
                      id="firstName"
                      value={contactData.firstName}
                      onChange={(e) =>
                        setContactData({ ...contactData, firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellidos *</Label>
                    <Input
                      id="lastName"
                      value={contactData.lastName}
                      onChange={(e) =>
                        setContactData({ ...contactData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactData.phone}
                      onChange={(e) =>
                        setContactData({ ...contactData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactData.email}
                      onChange={(e) =>
                        setContactData({ ...contactData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
              <CardDescription>Detalles de la transacción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="saleChannel">Canal de Venta *</Label>
                    <Select
                      value={paymentData.saleChannel}
                      onValueChange={(value: SaleChannel) =>
                        setPaymentData({ ...paymentData, saleChannel: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POS_CASH">Efectivo (POS)</SelectItem>
                        <SelectItem value="POS_TRANSFER">Transferencia (POS)</SelectItem>
                        <SelectItem value="POS_CARD">Tarjeta (POS)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Método de Pago *</Label>
                    <Select
                      value={paymentData.paymentMethod}
                      onValueChange={(value: PaymentMethod) =>
                        setPaymentData({ ...paymentData, paymentMethod: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Efectivo</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Transferencia Bancaria</SelectItem>
                        <SelectItem value="CREDIT_CARD">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="DEBIT_CARD">Tarjeta de Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="amountPaid">Monto Pagado *</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    step="0.01"
                    value={paymentData.amountPaid}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amountPaid: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la Venta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Viaje:</span>
                  <span className="font-medium">
                    {selectedTrip.origin} → {selectedTrip.destination}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span className="font-medium">
                    {format(parseISO(selectedTrip.date), 'dd MMM yyyy', { locale: es })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hora:</span>
                  <span className="font-medium">{selectedTrip.departureTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Asientos:</span>
                  <div className="flex gap-1">
                    {selectedSeats.map((seat) => (
                      <Badge key={seat.id} variant="outline">
                        {seat.seatNumber}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(selectedSeats.length * selectedTrip.price)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Completar Venta
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
