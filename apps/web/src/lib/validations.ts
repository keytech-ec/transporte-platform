import { z } from 'zod';

export const searchTripsSchema = z.object({
  origin: z.string().min(1, 'El origen es requerido'),
  destination: z.string().min(1, 'El destino es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  passengers: z.coerce.number().min(1, 'Debe haber al menos 1 pasajero').max(50),
});

export const passengerSchema = z.object({
  documentType: z.enum(['CEDULA', 'PASAPORTE', 'RUC']),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  passengerType: z.enum(['ADULT', 'CHILD', 'SENIOR']),
});

export const customerSchema = z.object({
  documentType: z.enum(['CEDULA', 'PASAPORTE', 'RUC']),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
});

export const reservationSchema = z.object({
  tripId: z.string().min(1),
  lockId: z.string().min(1),
  seatIds: z.array(z.string()).min(1, 'Debe seleccionar al menos un asiento'),
  customer: customerSchema,
  passengers: z.array(passengerSchema).min(1),
  reservationType: z.enum(['ONE_WAY', 'ROUND_TRIP']),
});

export const bookingReferenceSchema = z.object({
  reference: z.string().min(1, 'La referencia es requerida'),
});

export type SearchTripsInput = z.infer<typeof searchTripsSchema>;
export type PassengerInput = z.infer<typeof passengerSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
export type BookingReferenceInput = z.infer<typeof bookingReferenceSchema>;

