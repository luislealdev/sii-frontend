'use client';

import { useState, useEffect } from 'react';
import { useGrades } from '@/components/providers/GradesProvider';
import { LoadingSpinner } from './LoadingSpinner';
import { MateriaConCalificaciones, Calificacion } from '@/services/gradesService';

// Componente para mostrar una calificación individual
const GradeItem = ({ calificacion, index }: { calificacion: Calificacion; index: number }) => {
    const valor = calificacion.calificacion ? parseInt(calificacion.calificacion) : null;
    
    const getGradeColor = (grade: number | null) => {
        if (grade === null) return 'bg-gray-200 text-gray-600';
        if (grade >= 70) return 'bg-green-100 text-green-800 border-green-300';
        if (grade >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        return 'bg-red-100 text-red-800 border-red-300';
    };

    return (
        <div className={`p-2 rounded-lg border ${getGradeColor(valor)} text-center font-medium`}>
            <div className="text-xs text-gray-600 mb-1">Parcial {calificacion.numero_calificacion}</div>
            <div className="text-lg font-bold">
                {valor !== null ? valor : 'N/A'}
            </div>
        </div>
    );
};

// Componente para mostrar una materia con sus calificaciones
const SubjectCard = ({ materiaData }: { materiaData: MateriaConCalificaciones }) => {
    const { materia, calificaiones } = materiaData;
    
    // Calcular promedio (solo calificaciones que no son null)
    const calificacionesValidas = calificaiones.filter(cal => cal.calificacion !== null);
    const promedio = calificacionesValidas.length > 0 
        ? calificacionesValidas.reduce((sum, cal) => sum + parseInt(cal.calificacion!), 0) / calificacionesValidas.length
        : null;

    const getAverageColor = (average: number | null) => {
        if (average === null) return 'text-gray-600';
        if (average >= 70) return 'text-green-600';
        if (average >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            {/* Header de la materia */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{materia.nombre_materia}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        {materia.clave_materia}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                        Grupo {materia.letra_grupo}
                    </span>
                    {promedio !== null && (
                        <span className={`px-2 py-1 rounded-full font-medium ${getAverageColor(promedio) === 'text-green-600' ? 'bg-green-100 text-green-800' : 
                            getAverageColor(promedio) === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            Promedio: {promedio.toFixed(1)}
                        </span>
                    )}
                </div>
            </div>

            {/* Calificaciones */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Calificaciones</h4>
                {calificaiones.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {calificaiones.map((calificacion, index) => (
                            <GradeItem 
                                key={calificacion.id_calificacion} 
                                calificacion={calificacion} 
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                        No hay calificaciones registradas
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente principal de calificaciones
export const GradesDisplay = () => {
    const { 
        grades, 
        filteredGrades, 
        loading, 
        error, 
        searchTerm, 
        fetchGrades, 
        setSearchTerm 
    } = useGrades();

    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    // Sincronizar el término de búsqueda local con el del contexto
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    // Debounce para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(localSearchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [localSearchTerm, setSearchTerm]);

    // Cargar datos automáticamente
    useEffect(() => {
        if (grades.length === 0 && !loading && !error) {
            fetchGrades();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo ejecutar una vez al montar el componente

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Cargando calificaciones...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-800 font-medium mb-2">Error al cargar calificaciones</div>
                <div className="text-red-600 text-sm mb-4">{error}</div>
                <button
                    onClick={fetchGrades}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    const dataToShow = searchTerm ? filteredGrades : grades;
    const totalMaterias = dataToShow.reduce((total, periodo) => total + periodo.materias.length, 0);

    return (
        <div className="space-y-6">
            {/* Header con búsqueda */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calificaciones</h2>
                        <p className="text-gray-600">
                            {totalMaterias > 0 
                                ? `${totalMaterias} materia${totalMaterias !== 1 ? 's' : ''} encontrada${totalMaterias !== 1 ? 's' : ''}`
                                : 'No hay materias disponibles'
                            }
                        </p>
                    </div>
                    
                    {/* Barra de búsqueda */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por materia, clave o periodo..."
                                value={localSearchTerm}
                                onChange={(e) => setLocalSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg 
                                    className="h-5 w-5 text-gray-400" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Botón de actualizar */}
                    <button
                        onClick={fetchGrades}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Contenido de calificaciones */}
            {dataToShow.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                    <div className="text-gray-600 text-lg mb-2">
                        {searchTerm 
                            ? 'No se encontraron materias que coincidan con tu búsqueda'
                            : 'No hay calificaciones disponibles'
                        }
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => {
                                setLocalSearchTerm('');
                                setSearchTerm('');
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Limpiar búsqueda
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    {dataToShow.map((periodoData) => (
                        <div key={periodoData.periodo.clave_periodo} className="space-y-4">
                            {/* Header del periodo */}
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {periodoData.periodo.descripcion_periodo}
                                </h3>
                                <p className="text-gray-600">
                                    Periodo: {periodoData.periodo.clave_periodo} • Año {periodoData.periodo.anio}
                                </p>
                            </div>

                            {/* Grid de materias */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                {periodoData.materias.map((materiaData) => (
                                    <SubjectCard
                                        key={materiaData.materia.id_grupo}
                                        materiaData={materiaData}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};