'use client';

import { useAuth } from '@/components/providers';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export const AppBar = () => {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await logout('Sesión cerrada exitosamente');
        router.push('/auth');
    };

    const navItems = [
        {
            name: 'Inicio',
            path: '/',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
            )
        },
        {
            name: 'Calificaciones',
            path: '/calificaciones',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: 'Kardex',
            path: '/kardex',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            name: 'Horario',
            path: '/horario',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <header className="shadow-lg" style={{ backgroundColor: '#05700E' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo y título */}
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
                                <Image
                                    src="/img/logo-itc.png"
                                    alt="ITC Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-white font-semibold text-xl">
                                Instituto Tecnológico de Celaya
                            </h1>
                            {/* <p className="text-blue-100 text-sm">Campus Celaya</p> */}
                        </div>
                        <div className="md:hidden">
                            <h1 className="text-white font-semibold text-lg">ITC Celaya</h1>
                        </div>
                    </div>

                    {/* Navegación */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${isActive(item.path)
                                    ? 'bg-white shadow-md'
                                    : 'text-white hover:bg-white hover:bg-opacity-20 hover:text-white'
                                    }`}
                                style={isActive(item.path) ? { color: '#079C14' } : {}}
                            >
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Botón de logout */}
                    <div className="flex items-center space-x-4">
                        {/* Menú móvil */}
                        <div className="md:hidden">
                            <select
                                value={pathname}
                                onChange={(e) => router.push(e.target.value)}
                                className="bg-white px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-green-300"
                                style={{ color: '#079C14' }}
                            >
                                {navItems.map((item) => (
                                    <option key={item.path} value={item.path}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Botón de cerrar sesión */}
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};