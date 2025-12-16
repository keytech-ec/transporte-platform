'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Loader2, XCircle, MapPin, Calendar, Clock, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface SuccessPageData {
  bookingReference: string;
  tripInfo: {
    origin: string;
    destination: string;
    serviceName: string;
    departureDate: string;
    departureTime: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
  };
  seats: Array<{
    id: string;
    seatNumber: string;
  }>;
  passengersCompleted: Array<{
    id: string;
    documentType: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
    passengerType: string;
    seatNumber: string | null;
  }>;
}

export default function ExitoPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SuccessPageData | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado');
      setLoading(false);
      return;
    }

    fetchSuccessData();
  }, [token]);

  const fetchSuccessData = async () => {
    try {
      const response = await fetch(`${API_URL}/public/passenger-form/${token}`);
      const result = await response.json();

      if (!response.ok) {
        setError('No se pudo cargar la información');
        setLoading(false);
        return;
      }

      const formData = result.data;

      // Verificar que el formulario esté completado
      if (!formData.isCompleted) {
        setError('El formulario aún no ha sido completado');
        setLoading(false);
        return;
      }

      setData(formData);
      setLoading(false);
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const formattedDate = format(
    parseISO(data.tripInfo.departureDate),
    "EEEE d 'de' MMMM, yyyy",
    { locale: es }
  );

  const formattedTime = format(parseISO(data.tripInfo.departureTime), 'HH:mm', {
    locale: es,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-gray-600 mb-6">
            Los datos de los pasajeros han sido registrados exitosamente
          </p>

          {/* Booking Reference */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 mb-4">
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Código de Reserva
            </p>
            <p className="text-4xl font-bold text-blue-600 tracking-wider">
              {data.bookingReference}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Guarda este código para futuras consultas
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Presenta este código y tu documento de identidad
              al momento de abordar el bus.
            </p>
          </div>
        </div>

        {/* Trip Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Detalles del Viaje
          </h2>

          <div className="space-y-4">
            {/* Route */}
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Ruta</p>
                <p className="font-semibold text-gray-900">
                  {data.tripInfo.origin} → {data.tripInfo.destination}
                </p>
                <p className="text-sm text-gray-600">{data.tripInfo.serviceName}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Hora de salida</p>
                <p className="font-semibold text-gray-900">{formattedTime}</p>
              </div>
            </div>

            {/* Seats */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Asientos</p>
              <div className="flex flex-wrap gap-2">
                {data.seats.map((seat) => (
                  <span
                    key={seat.id}
                    className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded"
                  >
                    {seat.seatNumber}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Pasajeros Registrados
          </h2>
          <div className="space-y-3">
            {data.passengersCompleted.map((passenger, index) => (
              <div
                key={passenger.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {passenger.firstName} {passenger.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {passenger.documentType}: {passenger.documentNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {passenger.passengerType === 'ADULT' && 'Adulto'}
                        {passenger.passengerType === 'CHILD' && 'Niño'}
                        {passenger.passengerType === 'SENIOR' && 'Tercera Edad'}
                      </p>
                    </div>
                  </div>
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                    Asiento {passenger.seatNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Contacto de la Reserva
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Nombre:</strong> {data.contact.firstName} {data.contact.lastName}
            </p>
            <p className="text-gray-700">
              <strong>Teléfono:</strong> {data.contact.phone}
            </p>
            {data.contact.email && (
              <p className="text-gray-700">
                <strong>Email:</strong> {data.contact.email}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">
            Se ha enviado una confirmación al contacto registrado
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Volver al inicio
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Si tienes alguna pregunta, contacta con el vendedor que realizó tu reserva
          </p>
        </div>
      </div>
    </div>
  );
}
