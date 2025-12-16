import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Calendar, Clock, User, Mail, Phone } from 'lucide-react';

interface TripInfoCardProps {
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
}

export default function TripInfoCard({ tripInfo, contact, seats }: TripInfoCardProps) {
  const formattedDate = format(parseISO(tripInfo.departureDate), "EEEE d 'de' MMMM, yyyy", {
    locale: es,
  });

  const formattedTime = format(parseISO(tripInfo.departureTime), 'HH:mm', {
    locale: es,
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Información del Viaje
      </h2>

      <div className="space-y-4">
        {/* Ruta */}
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Ruta</p>
            <p className="font-semibold text-gray-900">
              {tripInfo.origin} → {tripInfo.destination}
            </p>
            <p className="text-sm text-gray-600">{tripInfo.serviceName}</p>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex items-start space-x-3">
          <Calendar className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Fecha</p>
            <p className="font-semibold text-gray-900 capitalize">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Hora */}
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-600">Hora de salida</p>
            <p className="font-semibold text-gray-900">{formattedTime}</p>
          </div>
        </div>

        {/* Asientos */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Asientos reservados</p>
          <div className="flex flex-wrap gap-2">
            {seats.map((seat) => (
              <span
                key={seat.id}
                className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded"
              >
                {seat.seatNumber}
              </span>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div className="border-t pt-4 mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Contacto Principal
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-900">
                {contact.firstName} {contact.lastName}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-900">{contact.phone}</span>
            </div>
            {contact.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-900">{contact.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
