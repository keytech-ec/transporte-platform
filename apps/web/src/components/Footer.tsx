import Link from 'next/link';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Transporte Platform</h3>
            <p className="text-sm mb-4">
              Tu plataforma de confianza para reservar viajes interprovinciales y tours en Ecuador.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-transporte-blue-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-transporte-blue-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-transporte-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-transporte-blue-400 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/buscar" className="hover:text-transporte-blue-400 transition-colors">
                  Buscar Viajes
                </Link>
              </li>
              <li>
                <Link href="/mis-reservas" className="hover:text-transporte-blue-400 transition-colors">
                  Mis Reservas
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-transporte-blue-400 transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-transporte-blue-400 transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-transporte-blue-400 transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-transporte-blue-400 transition-colors">
                  Política de Reembolsos
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-transporte-blue-400 flex-shrink-0 mt-0.5" />
                <span>Av. Principal 123, Cuenca, Ecuador</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-transporte-blue-400 flex-shrink-0" />
                <a href="tel:+593987654321" className="hover:text-transporte-blue-400 transition-colors">
                  +593 98 765 4321
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-transporte-blue-400 flex-shrink-0" />
                <a
                  href="mailto:info@transporte.com"
                  className="hover:text-transporte-blue-400 transition-colors"
                >
                  info@transporte.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} Transporte Platform. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
