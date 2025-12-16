import Link from 'next/link';
import { Bus, Search, FileText, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Bus className="h-6 w-6 text-transporte-blue-600" />
            <span className="font-bold text-lg hidden sm:inline-block">Transporte Platform</span>
            <span className="font-bold text-lg sm:hidden">TP</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-transporte-blue-600 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/buscar"
              className="text-sm font-medium text-gray-700 hover:text-transporte-blue-600 transition-colors flex items-center gap-1"
            >
              <Search className="h-4 w-4" />
              Buscar Viajes
            </Link>
            <Link
              href="/mis-reservas"
              className="text-sm font-medium text-gray-700 hover:text-transporte-blue-600 transition-colors flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Mis Reservas
            </Link>
          </nav>

          {/* Contact Button */}
          <div className="flex items-center gap-2">
            <a href="tel:+593987654321" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-2">
                <Phone className="h-4 w-4" />
                <span className="hidden lg:inline">+593 98 765 4321</span>
                <span className="lg:hidden">Contacto</span>
              </Button>
            </a>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Link href="/buscar">
                <Button size="sm" className="gap-1">
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - shown below header on small screens */}
        <nav className="md:hidden border-t py-3 flex justify-around text-xs">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 text-gray-700 hover:text-transporte-blue-600 transition-colors"
          >
            <Bus className="h-4 w-4" />
            <span>Inicio</span>
          </Link>
          <Link
            href="/buscar"
            className="flex flex-col items-center gap-1 text-gray-700 hover:text-transporte-blue-600 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </Link>
          <Link
            href="/mis-reservas"
            className="flex flex-col items-center gap-1 text-gray-700 hover:text-transporte-blue-600 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Reservas</span>
          </Link>
          <a
            href="tel:+593987654321"
            className="flex flex-col items-center gap-1 text-gray-700 hover:text-transporte-blue-600 transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span>Llamar</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
