'use client';

import { useStudent } from '@/components/providers';
import { useKardex } from '@/components/providers/KardexProvider';
import { useSchedule } from '@/components/providers/ScheduleProvider';
import Image from 'next/image';

const StudentDashboard = () => {
    const { studentData, isLoading: studentLoading, error: studentError } = useStudent();
    const { kardexData, isLoading: kardexLoading } = useKardex();
    const { scheduleData, isLoading: scheduleLoading } = useSchedule();

    if (studentLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando información del estudiante...</span>
            </div>
        );
    }

    if (studentError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                    <div className="bg-red-100 rounded-full p-2">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error al cargar datos</h3>
                        <div className="mt-2 text-sm text-red-700">{studentError}</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-yellow-800">No hay datos disponibles</h3>
                    <p className="text-yellow-600">No se pudieron cargar los datos del estudiante.</p>
                </div>
            </div>
        );
    }

    // Función para convertir imagen base64 a URL
    const getImageUrl = (base64String: string) => {
        return `data:image/jpeg;base64,${base64String}`;
    };

    return (
        <div className="space-y-6">
            {/* Header con información principal */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                        {studentData.foto ? (
                            <Image
                                src={getImageUrl(studentData.foto)}
                                alt="Foto del estudiante"
                                width={100}
                                height={120}
                                className="rounded-lg border-4 border-white shadow-lg object-cover"
                            />
                        ) : (
                            <div className="w-24 h-28 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">{studentData.persona}</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="font-medium">Número de Control:</span>
                                <span className="ml-2">{studentData.numero_control}</span>
                            </div>
                            <div>
                                <span className="font-medium">Semestre:</span>
                                <span className="ml-2">{studentData.semestre}°</span>
                            </div>
                            <div>
                                <span className="font-medium">Email:</span>
                                <span className="ml-2">{studentData.email}</span>
                            </div>
                            <div>
                                <span className="font-medium">Avance:</span>
                                <span className="ml-2">{studentData.porcentaje_avance}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards de estadísticas académicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="bg-green-100 rounded-full p-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Materias Aprobadas</p>
                            <p className="text-2xl font-bold text-gray-900">{studentData.materias_aprobadas}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                    <div className="flex items-center">
                        <div className="bg-red-100 rounded-full p-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Materias Reprobadas</p>
                            <p className="text-2xl font-bold text-gray-900">{studentData.materias_reprobadas}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 00-2 2z"></path>
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Materias</p>
                            <p className="text-2xl font-bold text-gray-900">{studentData.materias_cursadas}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center">
                        <div className="bg-purple-100 rounded-full p-3">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Créditos Acumulados</p>
                            <p className="text-2xl font-bold text-gray-900">{studentData.creditos_acumulados}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Promedios y avance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento Académico</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Promedio Ponderado</span>
                                <span className="text-lg font-bold text-green-600">{parseFloat(studentData.promedio_ponderado).toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${(parseFloat(studentData.promedio_ponderado) / 100) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Promedio Aritmético</span>
                                <span className="text-lg font-bold text-blue-600">{parseFloat(studentData.promedio_aritmetico).toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(parseFloat(studentData.promedio_aritmetico) / 100) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso de Carrera</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Avance de Carrera</span>
                                <span className="text-lg font-bold text-purple-600">{studentData.porcentaje_avance}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-purple-600 h-3 rounded-full transition-all duration-300" 
                                    style={{ width: `${studentData.porcentaje_avance}%` }}
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Avance Cursando</span>
                                <span className="text-lg font-bold text-indigo-600">{studentData.percentaje_avance_cursando}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-indigo-600 h-3 rounded-full transition-all duration-300" 
                                    style={{ width: `${studentData.percentaje_avance_cursando}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="bg-yellow-100 rounded-full p-4 inline-block mb-3">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{studentData.num_mat_rep_no_acreditadas}</p>
                        <p className="text-sm text-gray-600">Materias No Acreditadas</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-orange-100 rounded-full p-4 inline-block mb-3">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{studentData.creditos_complementarios}</p>
                        <p className="text-sm text-gray-600">Créditos Complementarios</p>
                    </div>
                    <div className="text-center">
                        <div className="bg-red-100 rounded-full p-4 inline-block mb-3">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{studentData.num_materias_rep_primera}</p>
                        <p className="text-sm text-gray-600">Reprobadas (1ra vez)</p>
                    </div>
                </div>
            </div>

            {/* Estado de carga de otros datos */}
            {(kardexLoading || scheduleLoading) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                        <span className="text-blue-700">
                            Cargando información adicional...
                            {kardexLoading && ' (Kardex)'}
                            {scheduleLoading && ' (Horario)'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;