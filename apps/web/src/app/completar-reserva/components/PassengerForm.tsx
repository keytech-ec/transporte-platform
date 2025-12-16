'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UserCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const passengerSchema = z.object({
  seatId: z.string(),
  documentType: z.enum(['CEDULA', 'PASSPORT', 'RUC']),
  documentNumber: z.string().min(1, 'Número de documento requerido'),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  passengerType: z.enum(['ADULT', 'CHILD', 'SENIOR']),
});

const formSchema = z.object({
  passengers: z.array(passengerSchema),
});

type FormData = z.infer<typeof formSchema>;

interface PassengerFormProps {
  token: string;
  seats: Array<{
    id: string;
    seatNumber: string;
    row: number;
    column: number;
  }>;
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
  };
  passengersRequired: number;
  bookingReference: string;
}

export default function PassengerForm({
  token,
  seats,
  contact,
  passengersRequired,
  bookingReference,
}: PassengerFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultPassengers = seats.map((seat) => ({
    seatId: seat.id,
    documentType: 'CEDULA' as const,
    documentNumber: '',
    firstName: '',
    lastName: '',
    passengerType: 'ADULT' as const,
  }));

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers: defaultPassengers,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'passengers',
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/public/passenger-form/${token}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Error al enviar el formulario');
        setSubmitting(false);
        return;
      }

      // Redirigir a página de éxito
      router.push(`/completar-reserva/${token}/exito`);
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Datos de los Pasajeros
        </h2>
        <p className="text-gray-600 mb-6">
          Completa la información de cada pasajero
        </p>

        <div className="space-y-6">
          {fields.map((field, index) => {
            const seat = seats[index];
            return (
              <div
                key={field.id}
                className="border border-gray-200 rounded-lg p-6 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <UserCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                      Pasajero - Asiento {seat.seatNumber}
                    </h3>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                    {seat.seatNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tipo de Documento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Documento *
                    </label>
                    <select
                      {...register(`passengers.${index}.documentType`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CEDULA">Cédula</option>
                      <option value="PASSPORT">Pasaporte</option>
                      <option value="RUC">RUC</option>
                    </select>
                    {errors.passengers?.[index]?.documentType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.passengers[index].documentType?.message}
                      </p>
                    )}
                  </div>

                  {/* Número de Documento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      {...register(`passengers.${index}.documentNumber`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 0102030405"
                    />
                    {errors.passengers?.[index]?.documentNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.passengers[index].documentNumber?.message}
                      </p>
                    )}
                  </div>

                  {/* Nombres */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombres *
                    </label>
                    <input
                      type="text"
                      {...register(`passengers.${index}.firstName`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Juan Carlos"
                    />
                    {errors.passengers?.[index]?.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.passengers[index].firstName?.message}
                      </p>
                    )}
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      {...register(`passengers.${index}.lastName`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Pérez García"
                    />
                    {errors.passengers?.[index]?.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.passengers[index].lastName?.message}
                      </p>
                    )}
                  </div>

                  {/* Tipo de Pasajero */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Pasajero *
                    </label>
                    <select
                      {...register(`passengers.${index}.passengerType`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ADULT">Adulto</option>
                      <option value="CHILD">Niño</option>
                      <option value="SENIOR">Tercera Edad</option>
                    </select>
                    {errors.passengers?.[index]?.passengerType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.passengers[index].passengerType?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <span>Confirmar Pasajeros</span>
            )}
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center mt-4">
          * Campos obligatorios
        </p>
      </div>
    </form>
  );
}
