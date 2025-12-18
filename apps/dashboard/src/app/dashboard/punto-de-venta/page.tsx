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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  MapPin,
  Clock,
  Users,
  CreditCard,
  Loader2,
  ChevronDown,
  ChevronRight,
  Bus,
  Calendar,
  Minus,
  Plus,
} from 'lucide-react';
import api, { type CreateManualSaleData } from '@/lib/api';

type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD';
type SeatSelectionMode = 'NONE' | 'OPTIONAL' | 'REQUIRED';

interface AvailableTripDto {
  id: string;
  departureTime: string;
  arrivalTime?: string;
  pricePerSeat: number;
  availableSeats: number;
  seatSelectionMode: SeatSelectionMode;
  requiresPassengerInfo: boolean;
  vehicleType: string;
  vehiclePlate: string;
  hasMultipleFloors: boolean;
  floorCount?: number;
}

interface ServiceGroupDto {
  serviceId: string;
  serviceName: string;
  origin: string;
  destination: string;
  seatSelectionMode: SeatSelectionMode;
  requiresPassengerInfo: boolean;
  trips: AvailableTripDto[];
}

interface Seat {
  id: string;
  seatNumber: string;
  row: number;
  column: number;
  status: 'available' | 'locked' | 'reserved';
}

export default function PuntoDeVentaPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Date selection
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [serviceGroups, setServiceGroups] = useState<ServiceGroupDto[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());

  // Selected trip and booking data
  const [selectedTrip, setSelectedTrip] = useState<AvailableTripDto | null>(null);
  const [tripSeats, setTripSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  // Contact and payment
  const [contactData, setContactData] = useState({
    documentType: 'CEDULA' as 'CEDULA' | 'PASSPORT' | 'RUC',
    documentNumber: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'CASH' as PaymentMethod,
    receiptNumber: '',
    isPartial: false,
  });
  const [sendFormVia, setSendFormVia] = useState<'WHATSAPP' | 'EMAIL' | 'NONE'>('WHATSAPP');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load services when date changes
  useEffect(() => {
    loadAvailableTrips();
  }, [selectedDate]);

  const loadAvailableTrips = async () => {
    setLoadingServices(true);
    try {
      const response = await api.getAvailableTrips(selectedDate);
      setServiceGroups(response.services || []);

      // Auto-expand first service
      if (response.services && response.services.length > 0) {
        setExpandedServices(new Set([response.services[0].serviceId]));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar viajes',
        variant: 'destructive',
      });
    } finally {
      setLoadingServices(false);
    }
  };

  const toggleService = (serviceId: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const selectTrip = async (trip: AvailableTripDto) => {
    setSelectedTrip(trip);
    setQuantity(1);
    setSelectedSeats([]);
    setPaymentData(prev => ({ ...prev, amount: trip.pricePerSeat }));

    // Load seats if seat selection is required or optional
    if (trip.seatSelectionMode !== 'NONE') {
      try {
        const seatData = await api.getTripSeats(trip.id);
        setTripSeats(seatData.seats || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Error al cargar asientos',
          variant: 'destructive',
        });
      }
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

    let count = 0;
    if (selectedTrip.seatSelectionMode === 'NONE') {
      count = quantity;
    } else {
      count = selectedSeats.length;
    }

    const total = count * selectedTrip.pricePerSeat;
    setPaymentData(prev => ({ ...prev, amount: total }));
  };

  useEffect(() => {
    updateTotalAmount();
  }, [selectedSeats, quantity, selectedTrip]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrip) return;

    // Validation
    if (selectedTrip.seatSelectionMode === 'REQUIRED' && selectedSeats.length === 0) {
      toast({
        title: 'Atención',
        description: 'Debes seleccionar al menos un asiento',
        variant: 'destructive',
      });
      return;
    }

    if (selectedTrip.seatSelectionMode === 'NONE' && quantity < 1) {
      toast({
        title: 'Atención',
        description: 'Debes ingresar una cantidad válida',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const saleData: CreateManualSaleData = {
        tripId: selectedTrip.id,
        contact: {
          documentType: contactData.documentType,
          documentNumber: contactData.documentNumber,
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          phone: contactData.phone,
          email: contactData.email || undefined,
        },
        payment: {
          amount: paymentData.amount,
          method: paymentData.method,
          receiptNumber: paymentData.receiptNumber || undefined,
          isPartial: paymentData.isPartial,
        },
        notes: notes || undefined,
        sendFormVia: selectedTrip.requiresPassengerInfo ? sendFormVia : 'NONE',
      };

      // Add seat-based or quantity-based data
      if (selectedTrip.seatSelectionMode !== 'NONE' && selectedSeats.length > 0) {
        saleData.seatIds = selectedSeats.map(s => s.id);
      } else if (selectedTrip.seatSelectionMode === 'NONE') {
        saleData.quantity = quantity;
        if (selectedTrip.hasMultipleFloors) {
          saleData.floorNumber = selectedFloor;
        }
      }

      const result = await api.createManualSale(saleData);

      toast({
        title: 'Venta creada',
        description: sendFormVia === 'WHATSAPP' && result.whatsappUrl
          ? 'Venta registrada y enlace enviado por WhatsApp'
          : 'Venta registrada correctamente',
      });

      // Fix for ref=undefined bug: Extract bookingReference correctly
      const bookingRef = result.data?.bookingReference || result.bookingReference;

      if (!bookingRef) {
        toast({
          title: 'Advertencia',
          description: 'Venta creada pero no se generó código de reserva',
          variant: 'destructive',
        });
        // Reload page instead
        window.location.reload();
        return;
      }

      // Redirect to confirmation page
      router.push(`/dashboard/punto-de-venta/confirmacion?ref=${bookingRef}`);
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

  const formatTime = (timeString: string) => {
    try {
      return new Date(timeString).toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  // Render seat grid
  const renderSeats = () => {
    if (!selectedTrip || !tripSeats || tripSeats.length === 0) return null;

    const rows = Math.max(...tripSeats.map(s => s.row));
    const cols = Math.max(...tripSeats.map(s => s.column));

    const seatGrid: (Seat | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));

    tripSeats.forEach(seat => {
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
                    w-12 h-12 sm:w-14 sm:h-14 rounded-md border-2 font-semibold text-sm transition-all
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

  const getSeatModeLabel = (mode: SeatSelectionMode) => {
    switch (mode) {
      case 'NONE':
        return 'Solo cantidad';
      case 'OPTIONAL':
        return 'Asientos opcionales';
      case 'REQUIRED':
        return 'Asientos requeridos';
    }
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

      {/* Date Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="selectedDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha
              </Label>
              <Input
                id="selectedDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="mt-2"
              />
            </div>
            <Button onClick={loadAvailableTrips} disabled={loadingServices}>
              {loadingServices ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Groups */}
      {!selectedTrip && (
        <div className="space-y-3">
          {loadingServices ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Cargando viajes...</p>
              </CardContent>
            </Card>
          ) : serviceGroups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No hay viajes disponibles para la fecha seleccionada
                </p>
              </CardContent>
            </Card>
          ) : (
            serviceGroups.map((service) => (
              <Collapsible
                key={service.serviceId}
                open={expandedServices.has(service.serviceId)}
                onOpenChange={() => toggleService(service.serviceId)}
              >
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 text-left">
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {service.serviceName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-3 mt-2">
                            <span>{service.origin} → {service.destination}</span>
                            <Badge variant="outline">{getSeatModeLabel(service.seatSelectionMode)}</Badge>
                            <span className="text-xs">{service.trips.length} viajes</span>
                          </CardDescription>
                        </div>
                        {expandedServices.has(service.serviceId) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-2 pt-0">
                      {service.trips.map((trip) => (
                        <div
                          key={trip.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow gap-3"
                        >
                          <div className="flex-1 space-y-2 w-full sm:w-auto">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(trip.departureTime)}</span>
                              </div>
                              {trip.arrivalTime && (
                                <>
                                  <span>→</span>
                                  <span>{formatTime(trip.arrivalTime)}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                              <div className="flex items-center gap-1">
                                <Bus className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{trip.vehiclePlate}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{trip.availableSeats} disponibles</span>
                              </div>
                              {trip.hasMultipleFloors && (
                                <Badge variant="secondary" className="text-xs">
                                  {trip.floorCount} pisos
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <span className="font-bold text-primary text-lg">
                              {formatCurrency(trip.pricePerSeat)}
                            </span>
                            <Button onClick={() => selectTrip(trip)} className="w-full sm:w-auto">
                              Seleccionar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </div>
      )}

      {/* Booking Form (when trip selected) */}
      {selectedTrip && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Viaje Seleccionado</CardTitle>
                  <CardDescription className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedTrip.vehiclePlate} | {formatTime(selectedTrip.departureTime)}</span>
                    </div>
                    <Badge variant="outline">{getSeatModeLabel(selectedTrip.seatSelectionMode)}</Badge>
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={() => setSelectedTrip(null)}>
                  Cambiar Viaje
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Seat or Quantity Selection */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTrip.seatSelectionMode === 'NONE' ? 'Cantidad de Pasajeros' : 'Seleccionar Asientos'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTrip.seatSelectionMode === 'NONE' ? (
                <div className="space-y-4">
                  {/* Quantity Selector */}
                  <div>
                    <Label>Cantidad de pasajeros</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-24 text-center text-lg font-semibold"
                        min={1}
                        max={selectedTrip.availableSeats}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(selectedTrip.availableSeats, quantity + 1))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        (máx: {selectedTrip.availableSeats})
                      </span>
                    </div>
                  </div>

                  {/* Floor Selector (if multi-floor vehicle) */}
                  {selectedTrip.hasMultipleFloors && selectedTrip.floorCount && (
                    <div>
                      <Label>Piso</Label>
                      <div className="flex gap-2 mt-2">
                        {Array.from({ length: selectedTrip.floorCount }, (_, i) => i + 1).map((floor) => (
                          <Button
                            key={floor}
                            type="button"
                            variant={selectedFloor === floor ? 'default' : 'outline'}
                            onClick={() => setSelectedFloor(floor)}
                          >
                            Piso {floor}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-lg font-bold">
                      Total: {formatCurrency(quantity * selectedTrip.pricePerSeat)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Legend */}
                  <div className="flex gap-6 justify-center flex-wrap">
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
                        Total: {formatCurrency(selectedSeats.length * selectedTrip.pricePerSeat)}
                      </p>
                    </div>
                  )}

                  {selectedTrip.seatSelectionMode === 'OPTIONAL' && (
                    <p className="text-sm text-muted-foreground text-center">
                      Puedes seleccionar asientos específicos o dejar en blanco para asignación automática
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Data */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
              <CardDescription>Información de contacto del pasajero</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="documentType">Tipo de Documento *</Label>
                    <Select
                      value={contactData.documentType}
                      onValueChange={(value: 'CEDULA' | 'PASSPORT' | 'RUC') =>
                        setContactData({ ...contactData, documentType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CEDULA">Cédula</SelectItem>
                        <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                        <SelectItem value="RUC">RUC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="documentNumber">Número de Documento *</Label>
                    <Input
                      id="documentNumber"
                      value={contactData.documentNumber}
                      onChange={(e) =>
                        setContactData({ ...contactData, documentNumber: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Payment Data */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Pago</CardTitle>
              <CardDescription>Detalles de la transacción</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMethod">Método de Pago *</Label>
                    <Select
                      value={paymentData.method}
                      onValueChange={(value: PaymentMethod) =>
                        setPaymentData({ ...paymentData, method: value })
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
                  <div>
                    <Label htmlFor="amount">Monto Pagado *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={paymentData.amount}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receiptNumber">Número de Recibo (opcional)</Label>
                    <Input
                      id="receiptNumber"
                      value={paymentData.receiptNumber}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, receiptNumber: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="isPartial"
                      checked={paymentData.isPartial}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, isPartial: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isPartial" className="font-normal">
                      Pago parcial
                    </Label>
                  </div>
                </div>

                {/* Only show form sending option if trip requires passenger info */}
                {selectedTrip.requiresPassengerInfo && (
                  <div>
                    <Label htmlFor="sendFormVia">Enviar Formulario de Pasajeros *</Label>
                    <Select
                      value={sendFormVia}
                      onValueChange={(value: 'WHATSAPP' | 'EMAIL' | 'NONE') =>
                        setSendFormVia(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WHATSAPP">Por WhatsApp</SelectItem>
                        <SelectItem value="EMAIL">Por Email</SelectItem>
                        <SelectItem value="NONE">No enviar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

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

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} size="lg">
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
