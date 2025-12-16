'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, List, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface Trip {
  id: string;
  serviceId: string;
  serviceName?: string;
  route?: string;
  vehicleId: string;
  vehiclePlate?: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface TripFormData {
  serviceId: string;
  vehicleId: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<TripFormData>({
    serviceId: '',
    vehicleId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    departureTime: '08:00',
    arrivalTime: '12:00',
    price: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTripsByDate();
  }, [selectedDate, trips]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, servicesData, vehiclesData] = await Promise.all([
        api.getTrips(),
        api.getServices(),
        api.getVehicles(),
      ]);

      // Enrich trips with service and vehicle info
      const enrichedTrips = tripsData.map((trip: any) => {
        const service = servicesData.find((s: any) => s.id === trip.serviceId);
        const vehicle = vehiclesData.find((v: any) => v.id === trip.vehicleId);
        return {
          ...trip,
          serviceName: service?.name,
          route: service ? `${service.origin} → ${service.destination}` : '',
          vehiclePlate: vehicle?.licensePlate,
          totalSeats: vehicle?.capacity || 40,
          availableSeats: vehicle?.capacity ? vehicle.capacity - (trip.occupiedSeats || 0) : 40,
        };
      });

      setTrips(enrichedTrips);
      setServices(servicesData);
      setVehicles(vehiclesData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTripsByDate = () => {
    if (!selectedDate) {
      setFilteredTrips(trips);
      return;
    }

    const filtered = trips.filter((trip) => {
      const tripDate = parseISO(trip.date);
      return isSameDay(tripDate, selectedDate);
    });

    setFilteredTrips(filtered);
  };

  const handleOpenDialog = (trip?: Trip) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        serviceId: trip.serviceId,
        vehicleId: trip.vehicleId,
        date: trip.date,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        price: trip.price,
      });
    } else {
      setEditingTrip(null);
      setFormData({
        serviceId: '',
        vehicleId: '',
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        departureTime: '08:00',
        arrivalTime: '12:00',
        price: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTrip(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTrip) {
        await api.updateTrip(editingTrip.id, formData as any);
        toast({
          title: 'Viaje actualizado',
          description: 'El viaje se ha actualizado correctamente',
        });
      } else {
        await api.createTrip(formData as any);
        toast({
          title: 'Viaje creado',
          description: 'El viaje se ha creado correctamente',
        });
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al guardar viaje',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este viaje?')) {
      return;
    }

    try {
      await api.deleteTrip(id);
      toast({
        title: 'Viaje cancelado',
        description: 'El viaje se ha cancelado correctamente',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cancelar viaje',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      scheduled: { label: 'Programado', variant: 'outline' },
      in_progress: { label: 'En Curso', variant: 'default' },
      completed: { label: 'Completado', variant: 'secondary' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };

    const config = (statusConfig[status] || statusConfig['scheduled'])!;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getOccupancyBadge = (availableSeats: number, totalSeats: number) => {
    const occupancy = ((totalSeats - availableSeats) / totalSeats) * 100;

    if (occupancy >= 90) {
      return <Badge variant="destructive">Casi lleno</Badge>;
    } else if (occupancy >= 70) {
      return <Badge variant="default">Buena ocupación</Badge>;
    } else {
      return <Badge variant="outline">Disponible</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Viajes</h2>
          <p className="text-muted-foreground">
            Gestiona los viajes programados
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Viaje
        </Button>
      </div>

      {/* Tabs for Calendar and List View */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">
            <List className="mr-2 h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendario
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viajes Programados</CardTitle>
              <CardDescription>
                {selectedDate
                  ? `Viajes para el ${format(selectedDate, 'dd MMMM yyyy', { locale: es })}`
                  : 'Todos los viajes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Filtrar por fecha</Label>
                <Input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => setSelectedDate(e.target.value ? parseISO(e.target.value) : undefined)}
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Ruta</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Ocupación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : filteredTrips.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No se encontraron viajes para esta fecha
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTrips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>
                            {format(parseISO(trip.date), 'dd MMM yyyy', { locale: es })}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span className="text-sm">{trip.serviceName}</span>
                              <span className="text-xs text-muted-foreground">{trip.route}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {trip.departureTime} - {trip.arrivalTime}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{trip.vehiclePlate}</TableCell>
                          <TableCell>{formatCurrency(trip.price)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">
                                {trip.totalSeats - trip.availableSeats}/{trip.totalSeats}
                              </span>
                              {getOccupancyBadge(trip.availableSeats, trip.totalSeats)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(trip.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(trip)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(trip.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-[300px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Calendario</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={es}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Viajes para {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: es }) : 'Hoy'}
                </CardTitle>
                <CardDescription>
                  {filteredTrips.length} {filteredTrips.length === 1 ? 'viaje programado' : 'viajes programados'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTrips.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No hay viajes programados para esta fecha</p>
                    <Button onClick={() => handleOpenDialog()} className="mt-4" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Viaje
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTrips.map((trip) => (
                      <Card key={trip.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{trip.serviceName}</h4>
                                {getStatusBadge(trip.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{trip.route}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{trip.departureTime} - {trip.arrivalTime}</span>
                                </div>
                                <span>•</span>
                                <span>{trip.vehiclePlate}</span>
                                <span>•</span>
                                <span className="font-medium">{formatCurrency(trip.price)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  Ocupación: {trip.totalSeats - trip.availableSeats}/{trip.totalSeats}
                                </span>
                                {getOccupancyBadge(trip.availableSeats, trip.totalSeats)}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(trip)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(trip.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingTrip ? 'Editar Viaje' : 'Nuevo Viaje'}
              </DialogTitle>
              <DialogDescription>
                {editingTrip
                  ? 'Actualiza la información del viaje'
                  : 'Programa un nuevo viaje'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="serviceId">Servicio *</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({service.origin} → {service.destination})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="vehicleId">Vehículo *</Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, vehicleId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles
                      .filter((v) => v.status === 'active')
                      .map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.licensePlate} - {vehicle.brand} {vehicle.model} ({vehicle.capacity} asientos)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="departureTime">Hora de Salida *</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) =>
                      setFormData({ ...formData, departureTime: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="arrivalTime">Hora de Llegada *</Label>
                  <Input
                    id="arrivalTime"
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) =>
                      setFormData({ ...formData, arrivalTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Precio (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                  min="0"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTrip ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
