import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-transporte-blue-500 to-transporte-green-500 text-white">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Viaja con confianza
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-50">
              Reserva tu viaje interprovincial o tour de forma rápida y segura
            </p>
            <Link href="/buscar">
              <Button size="lg" className="bg-white text-transporte-blue-600 hover:bg-blue-50">
                <Search className="mr-2 h-5 w-5" />
                Buscar viajes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-transporte-blue-100 text-transporte-blue-600 mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Múltiples destinos</h3>
              <p className="text-gray-600">
                Conectamos las principales ciudades del Ecuador
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-transporte-green-100 text-transporte-green-600 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Horarios flexibles</h3>
              <p className="text-gray-600">
                Varios horarios disponibles durante el día
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-transporte-blue-100 text-transporte-blue-600 mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pago seguro</h3>
              <p className="text-gray-600">
                Procesamos tus pagos de forma segura y confiable
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Ya tienes una reserva?</h2>
          <p className="text-gray-600 mb-6">
            Consulta el estado de tu reserva con tu número de referencia
          </p>
          <Link href="/mis-reservas">
            <Button variant="outline" size="lg">
              Consultar reserva
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

