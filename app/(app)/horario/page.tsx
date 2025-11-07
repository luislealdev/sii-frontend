'use client';

import React from 'react';
import { useSchedule } from '@/components/providers';

type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

const SchedulePage = () => {
  const { 
    scheduleData, 
    isLoading, 
    error, 
    fetchSchedule, 
    getCurrentPeriod, 
    getAllClasesForWeek,
    getTotalMaterias,
    getMateriasActuales
  } = useSchedule();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar el horario</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchSchedule}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (scheduleData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No hay datos del horario</h2>
          <button 
            onClick={fetchSchedule}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cargar Horario
          </button>
        </div>
      </div>
    );
  }

  const currentPeriod = getCurrentPeriod();
  const weekSchedule = getAllClasesForWeek();
  const totalMaterias = getTotalMaterias();
  
  const dias: { key: DiaSemana; label: string }[] = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
  ];

  // Función para obtener color de clase basado en el horario
  const getColorClass = (index: number) => {
    const colors = [
      'bg-blue-50 border-blue-200 text-blue-800',
      'bg-green-50 border-green-200 text-green-800',
      'bg-purple-50 border-purple-200 text-purple-800',
      'bg-orange-50 border-orange-200 text-orange-800',
      'bg-pink-50 border-pink-200 text-pink-800',
      'bg-indigo-50 border-indigo-200 text-indigo-800',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="container mx-auto p-6">
      {currentPeriod && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Horario Académico</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Período: {currentPeriod.periodo.clave_periodo}
            </h2>
            <p className="text-gray-600 mb-2">{currentPeriod.periodo.descripcion_periodo}</p>
            <p className="text-gray-600">
              <strong>Año:</strong> {currentPeriod.periodo.anio} | 
              <strong> Total de materias:</strong> {totalMaterias}
            </p>
          </div>
        </div>
      )}

      {/* Horario semanal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dias.map(({ key, label }) => {
          const clasesDelDia = weekSchedule[key];
          
          return (
            <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-lg font-semibold text-gray-800">
                  {label}
                </h3>
                <p className="text-sm text-gray-500">
                  {clasesDelDia.length} clase{clasesDelDia.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="p-4 space-y-3">
                {clasesDelDia.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Sin clases</p>
                  </div>
                ) : (
                  clasesDelDia.map((clase, index) => (
                    <div 
                      key={`${clase.materia.id_grupo}-${key}`}
                      className={`p-3 rounded-lg border ${getColorClass(index)}`}
                    >
                      <div className="font-medium text-sm mb-1">
                        {clase.materia.nombre_materia}
                      </div>
                      <div className="text-xs opacity-75 mb-2">
                        {clase.materia.clave_materia} - Grupo {clase.materia.letra_grupo}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold">{clase.horario}</span>
                        <span className="bg-white bg-opacity-50 px-2 py-1 rounded">
                          {clase.salon}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista de materias */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Lista de Materias ({totalMaterias})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clave
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campus
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getMateriasActuales().map((materia) => (
                  <tr key={materia.id_grupo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {materia.nombre_materia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {materia.clave_materia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {materia.letra_grupo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {materia.nombre_plan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {materia.clave_turno}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;