'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bus,
  Route,
  Calendar,
  ClipboardList,
  ShoppingCart,
  DollarSign,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Vehículos',
    href: '/dashboard/vehiculos',
    icon: Bus,
  },
  {
    title: 'Servicios',
    href: '/dashboard/servicios',
    icon: Route,
  },
  {
    title: 'Viajes',
    href: '/dashboard/viajes',
    icon: Calendar,
  },
  {
    title: 'Reservas',
    href: '/dashboard/reservas',
    icon: ClipboardList,
  },
  {
    title: 'Punto de Venta',
    href: '/dashboard/punto-de-venta',
    icon: ShoppingCart,
  },
  {
    title: 'Mis Ventas',
    href: '/dashboard/mis-ventas',
    icon: DollarSign,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Bus className="h-6 w-6 text-primary" />
        <span className="ml-2 text-xl font-bold">Transporte</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
