import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introducción</h2>
            <p className="text-gray-700 leading-relaxed">
              En Transporte Platform, respetamos su privacidad y nos comprometemos a proteger sus datos personales.
              Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos su información
              personal cuando utiliza nuestra plataforma de reservas de transporte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Información que Recopilamos</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Recopilamos los siguientes tipos de información:
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-2">2.1 Información Personal</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Nombre completo y apellidos</li>
              <li>Tipo y número de documento de identidad (cédula o pasaporte)</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Información de pago (procesada por nuestros proveedores de pago autorizados)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.2 Información de la Reserva</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Detalles del viaje (origen, destino, fecha, hora)</li>
              <li>Asientos seleccionados</li>
              <li>Información de los pasajeros</li>
              <li>Historial de reservas</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">2.3 Información Técnica</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Dirección IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Páginas visitadas y tiempo de navegación</li>
              <li>Cookies y tecnologías similares</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cómo Usamos su Información</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Utilizamos su información personal para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Procesar y gestionar sus reservas de transporte</li>
              <li>Enviar confirmaciones de reserva y recordatorios de viaje</li>
              <li>Procesar pagos y prevenir fraudes</li>
              <li>Proporcionar atención al cliente y soporte técnico</li>
              <li>Mejorar nuestros servicios y la experiencia del usuario</li>
              <li>Enviar comunicaciones de marketing (con su consentimiento)</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Compartir Información con Terceros</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Compartimos su información únicamente en las siguientes circunstancias:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Empresas de Transporte:</strong> Compartimos los datos necesarios (nombre, documento, asiento) con las empresas transportistas para que puedan prestar el servicio</li>
              <li><strong>Procesadores de Pago:</strong> Utilizamos proveedores de pago seguros (DeUNA, Payphone) que procesan la información de pago de acuerdo con estándares PCI-DSS</li>
              <li><strong>Proveedores de Servicios:</strong> Podemos compartir información con proveedores que nos ayudan a operar la plataforma (hosting, análisis, email)</li>
              <li><strong>Requisitos Legales:</strong> Divulgaremos información cuando sea requerido por ley o para proteger nuestros derechos legales</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              No vendemos ni alquilamos su información personal a terceros para fines de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Seguridad de los Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información
              personal contra acceso no autorizado, pérdida, destrucción o alteración. Estas medidas incluyen:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li>Encriptación SSL/TLS para todas las transmisiones de datos</li>
              <li>Controles de acceso estrictos a la información personal</li>
              <li>Monitoreo continuo de nuestros sistemas de seguridad</li>
              <li>Capacitación regular del personal en protección de datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies y Tecnologías Similares</h2>
            <p className="text-gray-700 leading-relaxed">
              Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestra plataforma. Las
              cookies son pequeños archivos de texto almacenados en su dispositivo que nos ayudan a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li>Recordar sus preferencias y configuraciones</li>
              <li>Mantener su sesión activa durante el proceso de reserva</li>
              <li>Analizar el uso de la plataforma y mejorar nuestros servicios</li>
              <li>Personalizar el contenido y las ofertas</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad de
              la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Sus Derechos</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Usted tiene los siguientes derechos respecto a sus datos personales:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Acceso:</strong> Solicitar una copia de la información personal que tenemos sobre usted</li>
              <li><strong>Rectificación:</strong> Solicitar la corrección de información inexacta o incompleta</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de su información personal (sujeto a obligaciones legales)</li>
              <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos para fines de marketing</li>
              <li><strong>Portabilidad:</strong> Solicitar una copia de sus datos en formato estructurado</li>
              <li><strong>Restricción:</strong> Solicitar la restricción del procesamiento de sus datos en ciertas circunstancias</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Para ejercer estos derechos, contáctenos a través de info@transporte.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Retención de Datos</h2>
            <p className="text-gray-700 leading-relaxed">
              Conservamos su información personal durante el tiempo necesario para cumplir con los fines descritos
              en esta política, a menos que la ley requiera o permita un período de retención más largo. Los datos
              de reservas se mantienen por un mínimo de 5 años para cumplir con obligaciones fiscales y contables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Menores de Edad</h2>
            <p className="text-gray-700 leading-relaxed">
              Nuestra plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente información
              personal de menores. Los menores deben viajar bajo la responsabilidad de un adulto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Cambios a esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Le
              notificaremos sobre cambios significativos publicando la nueva política en nuestra plataforma.
              Le recomendamos revisar periódicamente esta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contacto</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Si tiene preguntas o inquietudes sobre esta Política de Privacidad o sobre el manejo de sus datos
              personales, puede contactarnos:
            </p>
            <ul className="list-none space-y-2 text-gray-700">
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
