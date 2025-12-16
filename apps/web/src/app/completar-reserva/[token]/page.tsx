'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import PassengerForm from '../components/PassengerForm';
import TripInfoCard from '../components/TripInfoCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface PassengerFormData {
  bookingReference: string;
  tripInfo: {
    origin: string;
    destination: string;
    serviceName: string;
    departureDate: string;
    departureTime: string;
    pricePerSeat: number;
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
    row: number;
    column: number;
  }>;
  passengersRequired: number;
  passengersCompleted: Array<{
    id: string;
    documentType: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
    passengerType: string;
    seatNumber: string | null;
  }>;
  isExpired: boolean;
  isCompleted: boolean;
}

export default function CompletarReservaPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PassengerFormData | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token no proporcionado');
      setLoading(false);
      return;
    }

    fetchFormData();
  }, [token]);

  const fetchFormData = async () => {
    try {
      const response = await fetch(`${API_URL}/public/passenger-form/${token}`);
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Enlace no válido o reserva no encontrada');
        } else {
          setError(result.message || 'Error al cargar el formulario');
        }
        setLoading(false);
        return;
      }

      const data = result.data;
      setFormData(data);
      setLoading(false);
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error
          </h1>
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

  if (!formData) {
    return null;
  }

  // Si el formulario ya está completado
  if (formData.isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Formulario Completado
            </h1>
            <p className="text-gray-600">
              Ya registraste los datos de los pasajeros para esta reserva
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">
              Código de Reserva
            </h2>
            <p className="text-3xl font-bold text-blue-600">
              {formData.bookingReference}
            </p>
          </div>

          <TripInfoCard
            tripInfo={formData.tripInfo}
            contact={formData.contact}
            seats={formData.seats}
          />

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Pasajeros Registrados:</h3>
            <div className="space-y-3">
              {formData.passengersCompleted.map((passenger, index) => (
                <div
                  key={passenger.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {passenger.firstName} {passenger.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {passenger.documentType}: {passenger.documentNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                        Asiento {passenger.seatNumber}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Si el formulario ha expirado
  if (formData.isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Enlace Expirado
          </h1>
          <p className="text-gray-600 mb-6">
            Este enlace ha expirado (72 horas). Por favor, contacta al vendedor para obtener un nuevo enlace.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              Código de Reserva:{' '}
              <span className="font-bold text-blue-600">
                {formData.bookingReference}
              </span>
            </p>
          </div>
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

  // Formulario activo - mostrar el formulario de pasajeros
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Completa tu Reserva
            </h1>
            <p className="text-gray-600">
              Ingresa los datos de los pasajeros para completar tu reserva
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 text-center">
              Código de Reserva:{' '}
              <span className="font-bold text-blue-600 text-lg">
                {formData.bookingReference}
              </span>
            </p>
          </div>
        </div>

        {/* Trip Info */}
        <TripInfoCard
          tripInfo={formData.tripInfo}
          contact={formData.contact}
          seats={formData.seats}
        />

        {/* Passenger Form */}
        <PassengerForm
          token={token}
          seats={formData.seats}
          contact={formData.contact}
          passengersRequired={formData.passengersRequired}
          bookingReference={formData.bookingReference}
        />
      </div>
    </div>
  );
}
