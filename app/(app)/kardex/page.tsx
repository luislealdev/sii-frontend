'use client';

import React from 'react';
import { useKardex } from '@/components/providers';

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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar el kardex</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchKardex}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!kardexData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No hay datos del kardex</h2>
          <button 
            onClick={fetchKardex}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cargar Kardex
          </button>
        </div>
      </div>
    );
  }

  const semestres = [...new Set(kardexData.kardex.map(materia => materia.semestre))].sort((a, b) => a - b);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Kardex Académico</h1>
        
        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Avance de Carrera</h3>
            <p className="text-3xl font-bold text-blue-600">{kardexData.porcentaje_avance.toFixed(1)}%</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Créditos</h3>
            <p className="text-3xl font-bold text-green-600">{getTotalCreditos()}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Promedio General</h3>
            <p className="text-3xl font-bold text-purple-600">{getPromedioGeneral()}</p>
          </div>
        </div>
      </div>

      {/* Materias por semestre */}
      <div className="space-y-8">
        {semestres.map(semestre => {
          const materias = getMateriasBySemestre(semestre);
          return (
            <div key={semestre} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Semestre {semestre} ({materias.length} materias)
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
                        Período
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Créditos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calificación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {materias.map((materia, index) => (
                      <tr key={`${materia.clave_materia}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {materia.nombre_materia}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {materia.clave_materia}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {materia.periodo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {materia.creditos}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          <span className={`px-2 py-1 rounded ${
                            parseFloat(materia.calificacion) >= 90 ? 'bg-green-100 text-green-800' :
                            parseFloat(materia.calificacion) >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            parseFloat(materia.calificacion) >= 70 ? 'bg-orange-100 text-orange-800' :
                            materia.calificacion === 'AC' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {materia.calificacion}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {materia.descripcion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KardexPage;