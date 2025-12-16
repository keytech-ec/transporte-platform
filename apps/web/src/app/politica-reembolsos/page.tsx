import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function PoliticaReembolsosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Política de Reembolsos</h1>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Principios Generales</h2>
            <p className="text-gray-700 leading-relaxed">
              Esta Política de Reembolsos establece las condiciones bajo las cuales los usuarios pueden cancelar
              sus reservas y recibir reembolsos. El monto del reembolso dependerá del tiempo de anticipación con
              el que se realice la cancelación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Plazos y Porcentajes de Reembolso</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Los reembolsos se calculan en función del tiempo transcurrido entre la cancelación y la hora
              programada de salida del viaje:
            </p>

            <div className="space-y-4">
              {/* Más de 24 horas */}
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      Cancelación con más de 24 horas de anticipación
                    </h3>
                    <p className="text-green-800">
                      <strong>Reembolso: 100%</strong> del valor pagado
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      Recibirá un reembolso completo sin penalización alguna. El dinero será devuelto a su
                      método de pago original en un plazo de 5 a 10 días hábiles.
                    </p>
                  </div>
                </div>
              </div>

              {/* Entre 12 y 24 horas */}
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">
                      Cancelación entre 12 y 24 horas de anticipación
                    </h3>
                    <p className="text-yellow-800">
                      <strong>Reembolso: 70%</strong> del valor pagado
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                      Se aplicará una penalización del 30%. El reembolso del 70% será procesado en un plazo
                      de 5 a 10 días hábiles.
                    </p>
                  </div>
                </div>
              </div>

              {/* Entre 6 y 12 horas */}
              <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-1">
                      Cancelación entre 6 y 12 horas de anticipación
                    </h3>
                    <p className="text-orange-800">
                      <strong>Reembolso: 50%</strong> del valor pagado
                    </p>
                    <p className="text-sm text-orange-700 mt-2">
                      Se aplicará una penalización del 50%. El reembolso será procesado en un plazo de 5 a 10
                      días hábiles.
                    </p>
                  </div>
                </div>
              </div>

              {/* Menos de 6 horas */}
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">
                      Cancelación con menos de 6 horas de anticipación
                    </h3>
                    <p className="text-red-800">
                      <strong>Reembolso: 0%</strong> del valor pagado
                    </p>
                    <p className="text-sm text-red-700 mt-2">
                      No se realizará ningún reembolso. El servicio se considera completamente penalizado
                      debido a la proximidad con la hora de salida.
                    </p>
                  </div>
                </div>
              </div>

              {/* No show */}
              <div className="border border-gray-300 bg-gray-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      No presentarse al viaje (No Show)
                    </h3>
                    <p className="text-gray-800">
                      <strong>Reembolso: 0%</strong> del valor pagado
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      Si no se presenta a la hora de salida sin haber cancelado previamente, no tendrá derecho
                      a reembolso alguno.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cómo Cancelar su Reserva</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Para cancelar su reserva, siga estos pasos:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>
                Vaya a la sección{' '}
                <Link href="/mis-reservas" className="text-transporte-blue-600 hover:underline">
                  "Mis Reservas"
                </Link>
              </li>
              <li>Ingrese su número de referencia de reserva</li>
              <li>Haga clic en el botón "Cancelar reserva"</li>
              <li>Confirme la cancelación en el diálogo que aparecerá</li>
              <li>Recibirá una confirmación de cancelación por email</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Proceso de Reembolso</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Una vez procesada la cancelación:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>El reembolso será procesado automáticamente al método de pago original</li>
              <li>Los reembolsos a tarjetas de crédito/débito toman de 5 a 10 días hábiles</li>
              <li>Los reembolsos a billeteras digitales pueden ser más rápidos (2-5 días hábiles)</li>
              <li>Recibirá un correo electrónico confirmando el monto y la fecha estimada del reembolso</li>
              <li>El tiempo exacto puede variar según su institución financiera</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cancelaciones por parte de la Empresa de Transporte</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Si la empresa de transporte cancela el viaje por cualquier motivo (fuerza mayor, falta de
              pasajeros, problemas mecánicos, etc.):
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Usted recibirá un <strong>reembolso del 100%</strong> sin penalización alguna</li>
              <li>Se le ofrecerá la opción de cambiar su reserva a otro horario disponible sin costo adicional</li>
              <li>La empresa debe notificarle la cancelación con la mayor anticipación posible</li>
              <li>El reembolso será procesado en un plazo máximo de 5 días hábiles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cambios y Modificaciones</h2>
            <p className="text-gray-700 leading-relaxed">
              Actualmente no ofrecemos modificaciones directas de reservas (cambio de fecha, hora o pasajeros).
              Si necesita realizar cambios, deberá:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li>Cancelar su reserva actual (sujeta a las políticas de reembolso mencionadas)</li>
              <li>Crear una nueva reserva con las fechas/horarios deseados</li>
            </ol>
            <p className="text-gray-700 leading-relaxed mt-3">
              Le recomendamos verificar cuidadosamente todos los detalles antes de confirmar su reserva.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Excepciones y Casos Especiales</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              En circunstancias excepcionales, podemos considerar reembolsos fuera de esta política:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Emergencias médicas documentadas</li>
              <li>Fallecimiento de un familiar directo</li>
              <li>Desastres naturales que impidan el viaje</li>
              <li>Restricciones gubernamentales o sanitarias</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Para solicitar consideración especial, contáctenos a info@transporte.com con la documentación
              de respaldo correspondiente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Gastos Administrativos</h2>
            <p className="text-gray-700 leading-relaxed">
              Los porcentajes de reembolso mencionados son sobre el valor total pagado. No se cobran gastos
              administrativos adicionales por procesamiento de cancelaciones o reembolsos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Disputas y Reclamos</h2>
            <p className="text-gray-700 leading-relaxed">
              Si tiene alguna disputa o reclamo relacionado con un reembolso, puede contactarnos a través de:
            </p>
            <ul className="list-none space-y-2 text-gray-700 mt-3">
              <li><strong>Email:</strong> info@transporte.com</li>
              <li><strong>Teléfono:</strong> +593 98 765 4321</li>
              <li><strong>Horario de atención:</strong> Lunes a Domingo, 24/7</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Nuestro equipo revisará su caso y responderá en un plazo máximo de 48 horas hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Modificaciones a esta Política</h2>
            <p className="text-gray-700 leading-relaxed">
              Nos reservamos el derecho de modificar esta Política de Reembolsos en cualquier momento. Las
              modificaciones no afectarán reservas ya confirmadas. Le recomendamos revisar esta política
              periódicamente. La fecha de la última actualización se muestra al final de este documento.
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-6 border-t">
            Última actualización: Diciembre 2025
          </p>
        </div>
      </div>
    </div>
  );
}
