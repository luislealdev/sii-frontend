'use client';

import { StudentDashboard } from "@/components/ui";
import { useAuth } from "@/components/providers";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { userToken, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !userToken) {
      router.push('/auth');
    }
  }, [userToken, isLoading, router]);

  if (isLoading) {
    return null; // El AuthProvider ya maneja el loading
  }

  if (!userToken) {
    return null; // Redirigiendo...
  }

  return (
    <>
      {/* Navegación rápida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Panel del Estudiante</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link 
            href="/calificaciones"
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 className="font-semibold">Calificaciones</h3>
                <p className="text-sm text-blue-100">Ver notas y promedios</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/kardex"
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div>
                <h3 className="font-semibold">Kardex</h3>
                <p className="text-sm text-green-100">Historial académico</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/horario"
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold">Horario</h3>
                <p className="text-sm text-purple-100">Clases del semestre</p>
              </div>
            </div>
          </Link>

          <div className="bg-gray-600 text-white p-6 rounded-lg cursor-not-allowed opacity-75">
            <div className="flex items-center space-x-3">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div>
                <h3 className="font-semibold">Recursos</h3>
                <p className="text-sm text-gray-200">Próximamente</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard principal */}
      <StudentDashboard />
    </>
  );
}
