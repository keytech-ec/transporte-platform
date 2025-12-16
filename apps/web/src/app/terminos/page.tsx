import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Al acceder y utilizar la plataforma Transporte Platform, usted acepta estar legalmente vinculado por estos
              Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar
              nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Uso de la Plataforma</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              La plataforma Transporte Platform actúa como intermediario entre los usuarios y las empresas de transporte
              asociadas. Al utilizar nuestros servicios, usted se compromete a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Proporcionar información verídica y actualizada al momento de realizar una reserva</li>
              <li>Utilizar la plataforma únicamente para fines legales y autorizados</li>
              <li>No intentar acceder de manera no autorizada a sistemas o redes de la plataforma</li>
              <li>Respetar los derechos de propiedad intelectual de la plataforma y terceros</li>
              <li>Presentarse a tiempo en el lugar de salida con la documentación requerida</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Reservas y Pagos</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Las reservas realizadas a través de la plataforma están sujetas a disponibilidad. El precio mostrado al
              momento de la reserva es el precio final que deberá pagar el usuario.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Los asientos se bloquean por 15 minutos durante el proceso de pago</li>
              <li>La reserva se confirma únicamente después de recibir el pago completo</li>
              <li>Aceptamos pagos a través de nuestros procesadores autorizados (DeUNA, Payphone)</li>
              <li>Los precios incluyen todos los impuestos aplicables según la legislación ecuatoriana</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Cancelaciones y Modificaciones</h2>
            <p className="text-gray-700 leading-relaxed">
              Las políticas de cancelación y modificación están detalladas en nuestra{' '}
              <Link href="/politica-reembolsos" className="text-transporte-blue-600 hover:underline">
                Política de Reembolsos
              </Link>
              . Las cancelaciones deben realizarse a través de la plataforma utilizando su número de referencia de reserva.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Responsabilidades</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Transporte Platform actúa como intermediario y no es responsable de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Retrasos o cancelaciones del servicio de transporte por causas de fuerza mayor</li>
              <li>Pérdida o daño de equipaje durante el viaje</li>
              <li>Lesiones o daños ocurridos durante el transporte</li>
              <li>La calidad del servicio prestado por las empresas transportistas</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Las empresas de transporte son las únicas responsables de la prestación del servicio y de cualquier
              incidente que ocurra durante el mismo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Equipaje</h2>
            <p className="text-gray-700 leading-relaxed">
              Las políticas de equipaje son establecidas por cada empresa de transporte. Generalmente se permite
              una maleta de hasta 20 kg en bodega y un bolso de mano. El exceso de equipaje puede generar cargos
              adicionales que deben pagarse directamente a la empresa transportista.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Documentación Requerida</h2>
            <p className="text-gray-700 leading-relaxed">
              Los pasajeros deben presentar un documento de identidad válido (cédula de identidad o pasaporte) al
              momento de abordar el vehículo. Los menores de edad deben viajar acompañados de un adulto responsable
              o presentar una autorización notariada de sus padres o tutores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Protección de Datos Personales</h2>
            <p className="text-gray-700 leading-relaxed">
              El tratamiento de sus datos personales se rige por nuestra{' '}
              <Link href="/privacidad" className="text-transporte-blue-600 hover:underline">
                Política de Privacidad
              </Link>
              . Al utilizar la plataforma, usted consiente el procesamiento de sus datos personales de acuerdo con
              dicha política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modificaciones a los Términos</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Las
              modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma. Es
              responsabilidad del usuario revisar periódicamente estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-700 leading-relaxed">
              Estos Términos y Condiciones se rigen por las leyes de la República del Ecuador. Cualquier disputa
              relacionada con el uso de la plataforma será resuelta por los tribunales competentes de la ciudad
              de Cuenca, Ecuador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contacto</h2>
            <p className="text-gray-700 leading-relaxed">
              Para cualquier pregunta o inquietud relacionada con estos Términos y Condiciones, puede contactarnos
              a través de:
            </p>
            <ul className="list-none space-y-2 text-gray-700 mt-3">
              <li><strong>Email:</strong> info@transporte.com</li>
              <li><strong>Teléfono:</strong> +593 98 765 4321</li>
              <li><strong>Dirección:</strong> Av. Principal 123, Cuenca, Ecuador</li>
            </ul>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-6 border-t">
            Última actualización: Diciembre 2025
          </p>
        </div>
      </div>
    </div>
  );
}
