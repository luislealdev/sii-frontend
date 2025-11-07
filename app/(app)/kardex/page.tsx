'use client';

import { useKardex } from '@/components/providers';
import { useState } from 'react';

const KardexPage = () => {
  const { 
    kardexData, 
    isLoading, 
    error, 
    fetchKardex, 
    getMateriasBySemestre, 
    getTotalCreditos, 
    getPromedioGeneral 
  } = useKardex();

  const [selectedSemestre, setSelectedSemestre] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">Cargando tu kardex...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Ups! Algo salió mal</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchKardex}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!kardexData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Listo para ver tu progreso?</h2>
          <p className="text-gray-600 mb-6">Carga tu kardex académico para ver todas tus materias y calificaciones</p>
          <button 
            onClick={fetchKardex}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
          >
            📚 Cargar Kardex
          </button>
        </div>
      </div>
    );
  }

  const semestres = [...new Set(kardexData.kardex.map(materia => materia.semestre))].sort((a, b) => a - b);
  const totalCreditos = getTotalCreditos();
  const promedioGeneral = getPromedioGeneral();
  const avance = kardexData.porcentaje_avance;

  // Función para obtener el color según la calificación
  const getGradeColor = (calificacion: string) => {
    const cal = parseFloat(calificacion);
    if (isNaN(cal)) {
      if (calificacion === 'AC') return 'from-blue-400 to-blue-600';
      return 'from-gray-400 to-gray-600';
    }
    if (cal >= 95) return 'from-emerald-400 to-emerald-600';
    if (cal >= 90) return 'from-green-400 to-green-600';
    if (cal >= 85) return 'from-lime-400 to-lime-600';
    if (cal >= 80) return 'from-yellow-400 to-yellow-600';
    if (cal >= 75) return 'from-orange-400 to-orange-600';
    if (cal >= 70) return 'from-red-400 to-red-600';
    return 'from-red-600 to-red-800';
  };

  const getGradeEmoji = (calificacion: string) => {
    const cal = parseFloat(calificacion);
    if (isNaN(cal)) return calificacion === 'AC' ? '✅' : '❓';
    if (cal >= 95) return '🌟';
    if (cal >= 90) return '🎉';
    if (cal >= 85) return '😊';
    if (cal >= 80) return '👍';
    if (cal >= 75) return '😐';
    return '😔';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header con animación */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            📊 Kardex
          </h1>
          <p className="text-gray-600 text-lg">¡Revisa tu progreso académico!</p>
        </div>

        {/* Estadísticas principales con diseño moderno */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Avance de Carrera */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Avance de Carrera</h3>
              <div className="text-3xl">🎯</div>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${avance}%` }}
                ></div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {avance.toFixed(1)}%
              </p>
            </div>
          </div>
          
          {/* Total Créditos */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Créditos</h3>
              <div className="text-3xl">📚</div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              {totalCreditos}
            </p>
            <p className="text-sm text-gray-500 mt-2">créditos acumulados</p>
          </div>
          
          {/* Promedio General */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Promedio General</h3>
              <div className="text-3xl">⭐</div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              {promedioGeneral}
            </p>
            <p className="text-sm text-gray-500 mt-2">promedio ponderado</p>
          </div>
        </div>

        {/* Navegación por semestres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🗓️ Explora por Semestres</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedSemestre(null)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                selectedSemestre === null
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos los Semestres
            </button>
            {semestres.map(semestre => (
              <button
                key={semestre}
                onClick={() => setSelectedSemestre(semestre)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedSemestre === semestre
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semestre {semestre}
              </button>
            ))}
          </div>
        </div>

        {/* Materias */}
        <div className="space-y-8">
          {(selectedSemestre ? [selectedSemestre] : semestres).map(semestre => {
            const materias = getMateriasBySemestre(semestre);
            return (
              <div key={semestre} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    🎓 Semestre {semestre}
                    <span className="text-lg font-normal opacity-90">({materias.length} materias)</span>
                  </h2>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materias.map((materia, index) => (
                      <div 
                        key={`${materia.clave_materia}-${index}`}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        {/* Header de la materia */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                              {materia.nombre_materia}
                            </h3>
                            <p className="text-sm text-gray-600 font-mono">
                              {materia.clave_materia}
                            </p>
                          </div>
                          <div className="text-2xl ml-2">
                            {getGradeEmoji(materia.calificacion)}
                          </div>
                        </div>

                        {/* Calificación destacada */}
                        <div className="mb-4">
                          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getGradeColor(materia.calificacion)} text-white font-bold text-lg shadow-md`}>
                            {materia.calificacion}
                          </div>
                        </div>

                        {/* Detalles */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">📅 Período:</span>
                            <span className="font-semibold">{materia.periodo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">⭐ Créditos:</span>
                            <span className="font-semibold">{materia.creditos}</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                              {materia.descripcion}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KardexPage;