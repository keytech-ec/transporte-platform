import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
        <p className="text-gray-600 mb-8">
          Encuentra respuestas a las preguntas más comunes sobre nuestros servicios
        </p>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <Accordion type="single" collapsible className="w-full">
            {/* Reservas */}
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                ¿Cómo puedo hacer una reserva?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Para hacer una reserva, siga estos pasos:
                <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                  <li>Ingrese su origen, destino, fecha y número de pasajeros en la página de inicio</li>
                  <li>Seleccione el viaje que mejor se ajuste a sus necesidades</li>
                  <li>Elija sus asientos en el mapa interactivo</li>
                  <li>Complete la información de contacto y de los pasajeros</li>
                  <li>Realice el pago a través de nuestro procesador seguro</li>
                  <li>Recibirá una confirmación con su número de referencia y código QR</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                ¿Cuánto tiempo tengo para completar mi pago?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Una vez que seleccione sus asientos, estos quedarán bloqueados por 15 minutos. Durante este
                tiempo debe completar la información de los pasajeros y realizar el pago. Si no completa el
                proceso en 15 minutos, los asientos se liberarán automáticamente y deberá comenzar de nuevo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                ¿Puedo seleccionar mis asientos?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Sí, nuestra plataforma le permite seleccionar exactamente los asientos que prefiera mediante
                un mapa interactivo del vehículo. Puede ver qué asientos están disponibles, ocupados o bloqueados
                en tiempo real. Los asientos junto a la ventana y en pasillos están claramente identificados.
              </AccordionContent>
            </AccordionItem>

            {/* Pagos */}
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                ¿Qué métodos de pago aceptan?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Aceptamos los siguientes métodos de pago a través de nuestros procesadores seguros:
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Tarjetas de crédito (Visa, Mastercard, American Express)</li>
                  <li>Tarjetas de débito</li>
                  <li>Transferencias bancarias</li>
                  <li>Billeteras digitales</li>
                </ul>
                Todos los pagos son procesados de forma segura con encriptación SSL/TLS.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                ¿Es seguro pagar en línea?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Absolutamente. Utilizamos procesadores de pago certificados PCI-DSS (DeUNA y Payphone) que
                cumplen con los más altos estándares de seguridad. Nunca almacenamos información de tarjetas
                de crédito en nuestros servidores. Todas las transacciones están encriptadas y protegidas.
              </AccordionContent>
            </AccordionItem>

            {/* Cancelaciones */}
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                ¿Puedo cancelar mi reserva?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Sí, puede cancelar su reserva desde la sección "Mis Reservas" utilizando su número de referencia.
                Las políticas de reembolso varían según el tiempo de anticipación de la cancelación. Consulte
                nuestra{' '}
                <Link href="/politica-reembolsos" className="text-transporte-blue-600 hover:underline">
                  Política de Reembolsos
                </Link>{' '}
                para más detalles.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                ¿Cómo puedo consultar mi reserva?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Puede consultar su reserva en la sección{' '}
                <Link href="/mis-reservas" className="text-transporte-blue-600 hover:underline">
                  "Mis Reservas"
                </Link>
                . Simplemente ingrese su número de referencia (que recibió por email al confirmar la reserva).
                Allí podrá ver todos los detalles de su viaje, el estado de su reserva y cancelar si es necesario.
              </AccordionContent>
            </AccordionItem>

            {/* Viaje */}
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                ¿Qué documentos necesito para viajar?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Debe presentar al momento de abordar:
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Documento de identidad válido (cédula de identidad o pasaporte)</li>
                  <li>Número de referencia de su reserva (puede mostrarlo en su celular)</li>
                  <li>Código QR de confirmación (opcional pero recomendado)</li>
                </ul>
                Los menores de edad deben viajar con un adulto responsable o presentar autorización notariada.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left">
                ¿Cuánto equipaje puedo llevar?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                La política general de equipaje es:
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>1 maleta en bodega (hasta 20 kg)</li>
                  <li>1 bolso de mano o mochila pequeña</li>
                </ul>
                El equipaje adicional o con sobrepeso puede generar cargos extra que deben pagarse directamente
                a la empresa de transporte. Las políticas específicas pueden variar según el proveedor.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger className="text-left">
                ¿Con cuánta anticipación debo llegar?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Recomendamos llegar al menos 30 minutos antes de la hora de salida programada. Esto le dará
                tiempo suficiente para:
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Registrarse en el counter de la empresa</li>
                  <li>Despachar su equipaje en bodega</li>
                  <li>Ubicar su asiento en el vehículo</li>
                </ul>
                Los vehículos no esperan a pasajeros retrasados y la salida es puntual.
              </AccordionContent>
            </AccordionItem>

            {/* Servicios */}
            <AccordionItem value="item-11">
              <AccordionTrigger className="text-left">
                ¿Los vehículos tienen WiFi y aire acondicionado?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                La disponibilidad de amenidades varía según el vehículo y la empresa. En los resultados de
                búsqueda puede ver las amenidades disponibles para cada viaje (WiFi, aire acondicionado, baño,
                TV). Le recomendamos seleccionar el viaje que mejor se ajuste a sus necesidades de confort.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12">
              <AccordionTrigger className="text-left">
                ¿Puedo modificar mi reserva después de confirmarla?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Las modificaciones de reserva (cambio de fecha, hora o pasajeros) deben solicitarse cancelando
                la reserva actual y creando una nueva. Los reembolsos por cancelación están sujetos a nuestra
                política de reembolsos según el tiempo de anticipación. Le recomendamos verificar todos los
                datos antes de confirmar su reserva.
              </AccordionContent>
            </AccordionItem>

            {/* Soporte */}
            <AccordionItem value="item-13">
              <AccordionTrigger className="text-left">
                ¿Cómo puedo contactar a soporte si tengo un problema?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Puede contactarnos a través de:
                <ul className="list-none mt-2 space-y-1">
                  <li><strong>Email:</strong> info@transporte.com</li>
                  <li><strong>Teléfono:</strong> +593 98 765 4321</li>
                  <li><strong>Horario:</strong> Lunes a Domingo, 24/7</li>
                </ul>
                Nuestro equipo de soporte estará encantado de ayudarle con cualquier consulta o problema.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-14">
              <AccordionTrigger className="text-left">
                ¿Qué hago si pierdo mi número de referencia?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Su número de referencia fue enviado a su correo electrónico al momento de confirmar la reserva.
                Revise su bandeja de entrada y spam. Si no lo encuentra, contáctenos a info@transporte.com con
                su nombre completo, número de documento y fecha del viaje para que podamos ayudarle a recuperarlo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-15">
              <AccordionTrigger className="text-left">
                ¿Qué sucede si el viaje se cancela o retrasa?
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                En caso de cancelación o retraso significativo del viaje por parte de la empresa de transporte,
                usted tiene derecho a:
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Reembolso completo del valor pagado</li>
                  <li>Cambio sin costo a otro horario disponible</li>
                </ul>
                La empresa transportista deberá notificarle cualquier cambio. Si experimenta este problema,
                contáctenos inmediatamente para asistirle con el reembolso o cambio.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-8 pt-8 border-t">
            <p className="text-gray-600 text-center">
              ¿No encontró respuesta a su pregunta?{' '}
              <a href="mailto:info@transporte.com" className="text-transporte-blue-600 hover:underline">
                Contáctenos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
