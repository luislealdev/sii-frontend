'use client';

import { useSchedule } from '@/components/providers/ScheduleProvider';
import { useEffect, useState } from 'react';

type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

interface ClaseInfo {
    materia: string;
    clave: string;
    horario: string;
    salon: string;
    isCurrentClass: boolean;
}

const ClassWidgets = () => {
    const { getClasesByDay, isLoading } = useSchedule();
    const [currentClass, setCurrentClass] = useState<ClaseInfo | null>(null);
    const [nextClass, setNextClass] = useState<ClaseInfo | null>(null);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    // Actualizar la hora cada minuto
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Actualizar cada minuto

        return () => clearInterval(timer);
    }, []);

    // Obtener día actual en español
    const getCurrentDay = (): DiaSemana => {
        const days: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const currentDay = new Date().getDay();
        // JavaScript: 0=domingo, 1=lunes, etc. Ajustamos para nuestro array
        if (currentDay === 0) return 'lunes'; // Si es domingo, tratamos como lunes
        return days[currentDay - 1];
    };

    // Convertir hora string (HH:MM) a minutos desde medianoche
    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Obtener hora actual en minutos
    const getCurrentTimeInMinutes = (): number => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    };

    // Encontrar clase actual y siguiente
    useEffect(() => {
        const today = getCurrentDay();
        const todayClasses = getClasesByDay(today);
        const currentTimeMinutes = getCurrentTimeInMinutes();

        if (todayClasses.length === 0) {
            setCurrentClass(null);
            setNextClass(null);
            return;
        }

        let foundCurrentClass = null;
        let foundNextClass = null;

        for (let i = 0; i < todayClasses.length; i++) {
            const clase = todayClasses[i];
            const [startTime, endTime] = clase.horario.split('-');
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);

            // Verificar si estamos en horario de esta clase
            if (currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes) {
                foundCurrentClass = {
                    materia: clase.materia.nombre_materia,
                    clave: clase.materia.clave_materia,
                    horario: clase.horario,
                    salon: clase.salon,
                    isCurrentClass: true
                };
                // La siguiente clase sería la próxima en el array
                if (i + 1 < todayClasses.length) {
                    const nextClase = todayClasses[i + 1];
                    foundNextClass = {
                        materia: nextClase.materia.nombre_materia,
                        clave: nextClase.materia.clave_materia,
                        horario: nextClase.horario,
                        salon: nextClase.salon,
                        isCurrentClass: false
                    };
                }
                break;
            }
            // Si la clase aún no ha empezado y es la primera que encontramos después de la hora actual
            else if (currentTimeMinutes < startMinutes && !foundNextClass) {
                foundNextClass = {
                    materia: clase.materia.nombre_materia,
                    clave: clase.materia.clave_materia,
                    horario: clase.horario,
                    salon: clase.salon,
                    isCurrentClass: false
                };
            }
        }

        setCurrentClass(foundCurrentClass);
        setNextClass(foundNextClass);
    }, [getClasesByDay, currentTime]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-1"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-300 rounded w-3/4 mb-1"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Widget de Clase Actual */}
            <div className={`bg-white rounded-lg shadow-md border-l-4 p-4 ${
                currentClass ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}>
                <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                        currentClass ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <h3 className={`text-sm font-semibold uppercase tracking-wide ${
                        currentClass ? 'text-green-700' : 'text-gray-600'
                    }`}>
                        Clase Actual
                    </h3>
                </div>
                
                {currentClass ? (
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1 leading-tight">
                            {currentClass.materia}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">{currentClass.clave}</span>
                        </p>
                        <div className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="mr-3">{currentClass.horario}</span>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{currentClass.salon}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500 text-sm">No hay clase en este momento</p>
                    </div>
                )}
            </div>

            {/* Widget de Siguiente Clase */}
            <div className={`bg-white rounded-lg shadow-md border-l-4 p-4 ${
                nextClass ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}>
                <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                        nextClass ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></div>
                    <h3 className={`text-sm font-semibold uppercase tracking-wide ${
                        nextClass ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                        Siguiente Clase
                    </h3>
                </div>
                
                {nextClass ? (
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1 leading-tight">
                            {nextClass.materia}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">{nextClass.clave}</span>
                        </p>
                        <div className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="mr-3">{nextClass.horario}</span>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{nextClass.salon}</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500 text-sm">No hay más clases hoy</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassWidgets;