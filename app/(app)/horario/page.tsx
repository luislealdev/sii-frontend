'use client';

import React, { useState, useMemo } from 'react';
import { useSchedule } from '@/components/providers';

type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

// Componente CalendarView
type Periodo = {
  descripcion_periodo: string;
  clave_periodo: string;
  anio: string | number;
};

type CurrentPeriod = { periodo: Periodo } | null;

type Materia = {
  clave_materia: string;
  nombre_materia: string;
  id_grupo?: string | number;
  letra_grupo?: string;
};

type Clase = {
  horario: string;
  salon: string;
  materia: Materia;
};

type WeekSchedule = Record<DiaSemana, Clase[]>;

const CalendarView = ({
  currentPeriod,
  weekSchedule,
  materiaColors,
  dias,
  horas,
  parseHorario,
  isHoraEnRango
}: {
  currentPeriod: CurrentPeriod;
  weekSchedule: WeekSchedule;
  materiaColors: Map<string, string>;
  dias: { key: DiaSemana; label: string; emoji: string }[];
  horas: string[];
  parseHorario: (horario: string) => { inicio: string; fin: string };
  isHoraEnRango: (hora: string, horario: string) => boolean;
}) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
    <div className="px-8 py-6" style={{ backgroundColor: '#057007' }}>
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        📅 Calendario Semanal
        {currentPeriod && (
          <span className="text-lg font-normal opacity-90">
            - {currentPeriod.periodo.descripcion_periodo}
          </span>
        )}
      </h2>
    </div>

    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header con días */}
        <div className="grid grid-cols-7 gap-1 p-4 pb-2">
          <div className="text-center font-semibold text-gray-700 p-2">
            🕐 Hora
          </div>
          {dias.map(({ key, label, emoji }) => (
            <div key={key} className="text-center">
              <div className="rounded-lg p-3 mb-1" style={{ backgroundColor: 'rgba(5, 112, 7, 0.1)' }}>
                <div className="text-lg mb-1">{emoji}</div>
                <div className="font-semibold text-gray-800 text-sm">{label}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {weekSchedule[key]?.length || 0} clases
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid de horarios */}
        <div className="px-4 pb-4">
          {horas.map(hora => (
            <div key={hora} className="grid grid-cols-7 gap-1 mb-1">
              {/* Columna de hora */}
              <div className="text-center py-4 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg">
                {hora}
              </div>

              {/* Columnas de días */}
              {dias.map(({ key }) => {
                const clasesDelDia = weekSchedule[key] || [];
                const claseEnEstaHora = clasesDelDia.find((clase: Clase) =>
                  isHoraEnRango(hora, clase.horario)
                );

                if (claseEnEstaHora) {
                  const { inicio, fin } = parseHorario(claseEnEstaHora.horario);
                  const duracionHoras = (parseInt(fin.replace(':', '')) - parseInt(inicio.replace(':', ''))) / 100;

                  return (
                    <div
                      key={key}
                      className="relative rounded-lg p-2 text-white text-xs font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      style={{ 
                        backgroundColor: materiaColors.get(claseEnEstaHora.materia.clave_materia) || '#9ca3af',
                        gridRow: `span ${Math.max(1, Math.floor(duracionHoras))}`
                      }}
                      title={`${claseEnEstaHora.materia.nombre_materia} - ${claseEnEstaHora.salon}`}
                    >
                      <div className="font-semibold leading-tight mb-1">
                        {claseEnEstaHora.materia.nombre_materia.length > 20
                          ? claseEnEstaHora.materia.nombre_materia.substring(0, 20) + '...'
                          : claseEnEstaHora.materia.nombre_materia
                        }
                      </div>
                      <div className="opacity-90">
                        {claseEnEstaHora.horario}
                      </div>
                      <div className="opacity-80 text-xs">
                        📍 {claseEnEstaHora.salon}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={key}
                    className="min-h-16 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                  >
                    <span className="text-gray-400 text-xs">Libre</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Componente ListView
const ListView = ({
  weekSchedule,
  materiaColors,
  dias
}: {
  weekSchedule: WeekSchedule;
  materiaColors: Map<string, string>;
  dias: { key: DiaSemana; label: string; emoji: string }[];
}) => (
  <div className="space-y-6">
    {dias.map(({ key, label, emoji }) => {
      const clasesDelDia = weekSchedule[key];

      return (
        <div key={key} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4" style={{ backgroundColor: clasesDelDia.length > 0 ? '#057007' : '#9ca3af' }}>
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              {emoji} {label}
              <span className="text-sm font-normal opacity-90">
                ({clasesDelDia.length} clase{clasesDelDia.length !== 1 ? 's' : ''})
              </span>
            </h3>
          </div>

          <div className="p-6">
            {clasesDelDia.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">😴</div>
                <p className="text-gray-500 font-medium">¡Día libre! Tiempo para descansar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clasesDelDia.map((clase: Clase) => (
                  <div
                    key={`${clase.materia.id_grupo}-${key}`}
                    className="p-4 rounded-xl text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    style={{ backgroundColor: materiaColors.get(clase.materia.clave_materia) || '#9ca3af' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">
                          {clase.materia.nombre_materia}
                        </h4>
                        <p className="text-sm opacity-90">
                          {clase.materia.clave_materia} - Grupo {clase.materia.letra_grupo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full font-semibold">
                          🕐 {clase.horario}
                        </span>
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full font-semibold">
                          📍 {clase.salon}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

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

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Generar colores únicos para cada materia usando azules, rojos, morados y verdes
  const materiaColors = useMemo(() => {
    // Paleta de colores: azules, rojos, morados y verdes
    const colors = [
      // Verdes
      '#057007', // Verde principal
      '#2E7D32', // Verde medio
      '#388E3C', // Verde claro
      '#1B5E20', // Verde oscuro
      
      // Azules
      '#1976D2', // Azul medio
      '#1565C0', // Azul oscuro
      '#2196F3', // Azul claro
      '#0D47A1', // Azul muy oscuro
      
      // Rojos
      '#D32F2F', // Rojo medio
      '#C62828', // Rojo oscuro
      '#F44336', // Rojo claro
      '#B71C1C', // Rojo muy oscuro
      
      // Morados
      '#7B1FA2', // Morado medio
      '#6A1B9A', // Morado oscuro
      '#9C27B0', // Morado claro
      '#4A148C', // Morado muy oscuro
    ];

    const colorMap = new Map();
    // Asignar colores a todas las materias
    getMateriasActuales().forEach((materia, index) => {
      colorMap.set(materia.clave_materia, colors[index % colors.length]);
    });

    return colorMap;
  }, [getMateriasActuales]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-t-transparent" style={{ borderColor: '#057007', borderTopColor: 'transparent' }}></div>
        <p className="mt-4 text-gray-600 font-medium">Cargando tu horario...</p>
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
            onClick={fetchSchedule}
            className="text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:opacity-90"
            style={{ backgroundColor: '#057007' }}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (scheduleData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Listo para ver tu horario?</h2>
          <p className="text-gray-600 mb-6">Carga tu horario académico para planificar tu semana</p>
          <button
            onClick={fetchSchedule}
            className="text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:opacity-90"
            style={{ backgroundColor: '#057007' }}
          >
            📅 Cargar Horario
          </button>
        </div>
      </div>
    );
  }

  const currentPeriod = getCurrentPeriod();
  const weekSchedule = getAllClasesForWeek();
  const totalMaterias = getTotalMaterias();

  // Debug: Verificar datos de TOPICOS
  React.useEffect(() => {
    if (currentPeriod) {
      const materias = getMateriasActuales();
      const topicos = materias.find(m => m.nombre_materia.includes('TOPICOS') || m.nombre_materia.includes('DESARR'));
      
      if (topicos) {
        console.log('=== MATERIA TOPICOS ENCONTRADA ===');
        console.log('Nombre:', topicos.nombre_materia);
        console.log('Clave:', topicos.clave_materia);
        console.log('Grupo:', topicos.letra_grupo);
        console.log('Horarios por día:');
        
        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        dias.forEach(dia => {
          const horario = topicos[dia as keyof typeof topicos];
          const salon = topicos[`${dia}_clave_salon` as keyof typeof topicos];
          console.log(`  ${dia}: ${horario || 'NULL'} - Salón: ${salon || 'NULL'}`);
        });
        
        console.log('Objeto completo:', topicos);
      } else {
        console.log('⚠️ MATERIA TOPICOS NO ENCONTRADA');
        console.log('Materias disponibles:');
        materias.forEach(m => console.log(`- ${m.nombre_materia} (${m.clave_materia})`));
      }
    }
  }, [currentPeriod, getMateriasActuales]);

  const dias: { key: DiaSemana; label: string; emoji: string }[] = [
    { key: 'lunes', label: 'Lunes', emoji: '🌟' },
    { key: 'martes', label: 'Martes', emoji: '💪' },
    { key: 'miercoles', label: 'Miércoles', emoji: '🚀' },
    { key: 'jueves', label: 'Jueves', emoji: '⚡' },
    { key: 'viernes', label: 'Viernes', emoji: '🎉' },
    { key: 'sabado', label: 'Sábado', emoji: '🌈' },
  ];

  // Generar horas del día (7 AM a 7 PM)
  const horas: string[] = [];
  for (let i = 7; i <= 18; i++) {
    horas.push(`${i.toString().padStart(2, '0')}:00`);
  }

  const parseHorario = (horario: string) => {
    const [inicio, fin] = horario.split('-');
    return { inicio, fin };
  };

  const isHoraEnRango = (hora: string, horario: string) => {
    const { inicio, fin } = parseHorario(horario);
    const horaNum = parseInt(hora.replace(':', ''));
    const inicioNum = parseInt(inicio.replace(':', ''));
    const finNum = parseInt(fin.replace(':', ''));

    return horaNum >= inicioNum && horaNum < finNum;
  };

  // Generar props para los componentes
  const calendarProps = {
    currentPeriod,
    weekSchedule,
    materiaColors,
    dias,
    horas,
    parseHorario,
    isHoraEnRango
  };

  const listProps = {
    weekSchedule,
    materiaColors,
    dias
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#057007' }}>
            📅 Horario Académico
          </h1>
          <p className="text-gray-600 text-lg">¡Organiza tu semana!</p>
        </div>

        {/* Información del período */}
        {currentPeriod && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold text-gray-700">Período Actual</h3>
                <p className="font-bold" style={{ color: '#057007' }}>{currentPeriod.periodo.clave_periodo}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🗓️</div>
                <h3 className="font-semibold text-gray-700">Año Académico</h3>
                <p className="font-bold" style={{ color: '#057007' }}>{currentPeriod.periodo.anio}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📖</div>
                <h3 className="font-semibold text-gray-700">Total Materias</h3>
                <p className="font-bold" style={{ color: '#057007' }}>{totalMaterias}</p>
              </div>
            </div>
          </div>
        )}

        {/* Selector de vista */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Vista del Horario</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${viewMode === 'calendar'
                    ? 'text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                style={viewMode === 'calendar' ? { backgroundColor: '#057007' } : {}}
              >
                📅 Calendario
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${viewMode === 'list'
                    ? 'text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                style={viewMode === 'list' ? { backgroundColor: '#057007' } : {}}
              >
                📋 Lista por Días
              </button>
            </div>
          </div>
        </div>

        {/* Vista seleccionada */}
        {viewMode === 'calendar' ? <CalendarView {...calendarProps} /> : <ListView {...listProps} />}

        {/* Materias sin horario asignado */}
        {(() => {
          const materiasSinHorario = getMateriasActuales().filter(materia => {
            const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            return !dias.some(dia => materia[dia as keyof typeof materia]);
          });

          if (materiasSinHorario.length > 0) {
            return (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-2xl shadow-lg p-6 mt-8">
                <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                  ⚠️ Materias Pendientes de Horario
                </h3>
                <p className="text-yellow-700 mb-4">
                  Las siguientes materias están inscritas pero no tienen horarios asignados:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {materiasSinHorario.map((materia) => (
                    <div key={materia.id_grupo} className="bg-white rounded-lg p-4 border border-yellow-200">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {materia.nombre_materia}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {materia.clave_materia} - Grupo {materia.letra_grupo}
                      </p>
                      <div className="mt-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        📋 Horario por confirmar
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Leyenda de materias */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🎨 Leyenda de Materias</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {getMateriasActuales().map((materia) => (
              <div key={materia.id_grupo} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full shadow-md"
                  style={{ backgroundColor: materiaColors.get(materia.clave_materia) || '#9ca3af' }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {materia.nombre_materia}
                  </p>
                  <p className="text-sm text-gray-500">
                    {materia.clave_materia} - Grupo {materia.letra_grupo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;