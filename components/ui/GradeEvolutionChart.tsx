'use client';

import { useKardex } from '@/components/providers/KardexProvider';
import { useMemo } from 'react';

interface SemestrePromedio {
    semestre: number;
    promedio: number;
    materiasCount: number;
}

const GradeEvolutionChart = () => {
    const { isLoading, getPromediosPorSemestre } = useKardex();

    // Obtener promedios por semestre usando el provider
    const semestrePromedios = useMemo((): SemestrePromedio[] => {
        return getPromediosPorSemestre().map(item => ({
            semestre: item.semestre,
            promedio: item.promedio,
            materiasCount: item.materiasCount
        }));
    }, [getPromediosPorSemestre]);

    // Configuraciones del gráfico
    const chartConfig = {
        width: Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 100 : 800),
        height: 300,
        padding: { top: 40, right: 40, bottom: 60, left: 60 },
        minGrade: Math.max(60, Math.min(...semestrePromedios.map(s => s.promedio)) - 5), // Ajustar escala mínima
        maxGrade: Math.min(100, Math.max(...semestrePromedios.map(s => s.promedio)) + 5)  // Ajustar escala máxima
    };

    const chartArea = {
        width: chartConfig.width - chartConfig.padding.left - chartConfig.padding.right,
        height: chartConfig.height - chartConfig.padding.top - chartConfig.padding.bottom
    };

    // Función para mapear valores a coordenadas del gráfico
    const getXCoordinate = (semestre: number, index: number) => {
        return chartConfig.padding.left + (index / Math.max(semestrePromedios.length - 1, 1)) * chartArea.width;
    };

    const getYCoordinate = (promedio: number) => {
        const normalizedValue = (promedio - chartConfig.minGrade) / (chartConfig.maxGrade - chartConfig.minGrade);
        return chartConfig.padding.top + (1 - normalizedValue) * chartArea.height;
    };

    // Generar puntos de la línea
    const linePoints = semestrePromedios.map((item, index) => ({
        x: getXCoordinate(item.semestre, index),
        y: getYCoordinate(item.promedio),
        semestre: item.semestre,
        promedio: item.promedio,
        materiasCount: item.materiasCount
    }));

    // Crear path de la línea
    const linePath = linePoints.reduce((path, point, index) => {
        return index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`;
    }, '');

    // Calcular tendencia
    const tendencia = useMemo(() => {
        if (semestrePromedios.length < 2) return null;
        
        const primer = semestrePromedios[0].promedio;
        const ultimo = semestrePromedios[semestrePromedios.length - 1].promedio;
        const diferencia = ultimo - primer;
        
        return {
            direccion: diferencia > 0 ? 'subiendo' : diferencia < 0 ? 'bajando' : 'estable',
            cantidad: Math.abs(diferencia),
            porcentaje: Math.round((diferencia / primer) * 100 * 100) / 100
        };
    }, [semestrePromedios]);

    // Generar líneas de la cuadrícula y etiquetas del eje Y
    const yAxisLines = [];
    const yAxisLabels = [];
    for (let grade = chartConfig.minGrade; grade <= chartConfig.maxGrade; grade += 10) {
        const y = getYCoordinate(grade);
        yAxisLines.push(
            <line
                key={`y-line-${grade}`}
                x1={chartConfig.padding.left}
                y1={y}
                x2={chartConfig.padding.left + chartArea.width}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
            />
        );
        yAxisLabels.push(
            <text
                key={`y-label-${grade}`}
                x={chartConfig.padding.left - 10}
                y={y + 5}
                textAnchor="end"
                className="text-sm fill-gray-600"
            >
                {grade}
            </text>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                    📈 Evolución del Promedio por Semestre
                </h3>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#057007', borderTopColor: 'transparent' }}></div>
                    <span className="ml-3 text-gray-600 font-medium">Cargando datos del kardex...</span>
                </div>
            </div>
        );
    }

    if (!isLoading && semestrePromedios.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
                    📈 Evolución del Promedio por Semestre
                </h3>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">📊 Sin datos disponibles</h4>
                        <p className="text-gray-500 mb-1">No hay datos suficientes para mostrar el gráfico</p>
                        <p className="text-sm text-gray-400">Se necesitan calificaciones de al menos un semestre</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                    📈 Evolución del Promedio por Semestre
                </h3>
                <p className="text-gray-600">Seguimiento del rendimiento académico a través de los semestres</p>
            </div>

            <div className="overflow-x-auto">
                <svg 
                    width={chartConfig.width} 
                    height={chartConfig.height}
                    className="border border-gray-200 rounded"
                >
                    {/* Líneas de cuadrícula */}
                    {yAxisLines}
                    
                    {/* Líneas verticales de cuadrícula */}
                    {linePoints.map((point, index) => (
                        <line
                            key={`x-line-${index}`}
                            x1={point.x}
                            y1={chartConfig.padding.top}
                            x2={point.x}
                            y2={chartConfig.padding.top + chartArea.height}
                            stroke="#f3f4f6"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Etiquetas del eje Y */}
                    {yAxisLabels}

                    {/* Etiquetas del eje X (semestres) */}
                    {linePoints.map((point, index) => (
                        <text
                            key={`x-label-${index}`}
                            x={point.x}
                            y={chartConfig.padding.top + chartArea.height + 20}
                            textAnchor="middle"
                            className="text-sm fill-gray-600 font-medium"
                        >
                            {point.semestre}°
                        </text>
                    ))}

                    {/* Línea del gráfico */}
                    {linePoints.length > 1 && (
                        <path
                            d={linePath}
                            fill="none"
                            stroke="#057007"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Puntos en el gráfico */}
                    {linePoints.map((point, index) => (
                        <g key={`point-${index}`}>
                            {/* Punto principal */}
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                fill="#057007"
                                stroke="#ffffff"
                                strokeWidth="3"
                                className="cursor-pointer hover:r-8 transition-all duration-200"
                            />
                            
                            {/* Tooltip con información */}
                            <g className="opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                <rect
                                    x={point.x - 50}
                                    y={point.y - 50}
                                    width="100"
                                    height="40"
                                    fill="#1f2937"
                                    rx="6"
                                    ry="6"
                                />
                                <text
                                    x={point.x}
                                    y={point.y - 32}
                                    textAnchor="middle"
                                    className="text-xs fill-white font-medium"
                                >
                                    Semestre {point.semestre}°
                                </text>
                                <text
                                    x={point.x}
                                    y={point.y - 18}
                                    textAnchor="middle"
                                    className="text-sm fill-white font-bold"
                                >
                                    {point.promedio}
                                </text>
                                <text
                                    x={point.x}
                                    y={point.y - 4}
                                    textAnchor="middle"
                                    className="text-xs fill-gray-300"
                                >
                                    {point.materiasCount} materias
                                </text>
                            </g>
                        </g>
                    ))}

                    {/* Ejes */}
                    <line
                        x1={chartConfig.padding.left}
                        y1={chartConfig.padding.top + chartArea.height}
                        x2={chartConfig.padding.left + chartArea.width}
                        y2={chartConfig.padding.top + chartArea.height}
                        stroke="#374151"
                        strokeWidth="2"
                    />
                    <line
                        x1={chartConfig.padding.left}
                        y1={chartConfig.padding.top}
                        x2={chartConfig.padding.left}
                        y2={chartConfig.padding.top + chartArea.height}
                        stroke="#374151"
                        strokeWidth="2"
                    />

                    {/* Etiquetas de los ejes */}
                    <text
                        x={chartConfig.padding.left + chartArea.width / 2}
                        y={chartConfig.height - 15}
                        textAnchor="middle"
                        className="text-sm fill-gray-700 font-medium"
                    >
                        Semestre
                    </text>
                    <text
                        x="20"
                        y={chartConfig.padding.top + chartArea.height / 2}
                        textAnchor="middle"
                        transform={`rotate(-90, 20, ${chartConfig.padding.top + chartArea.height / 2})`}
                        className="text-sm fill-gray-700 font-medium"
                    >
                        Promedio
                    </text>
                </svg>
            </div>

            {/* Estadísticas resumidas */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                    <p className="text-lg font-bold" style={{ color: '#057007' }}>
                        {semestrePromedios.length > 0 ? semestrePromedios[semestrePromedios.length - 1].promedio : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Promedio Actual</p>
                </div>
                <div>
                    <p className="text-lg font-bold" style={{ color: '#057007' }}>
                        {Math.max(...semestrePromedios.map(s => s.promedio)).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Mejor Promedio</p>
                </div>
                <div>
                    <p className="text-lg font-bold" style={{ color: '#057007' }}>
                        {semestrePromedios.length}
                    </p>
                    <p className="text-sm text-gray-600">Semestres</p>
                </div>
                <div>
                    <p className="text-lg font-bold" style={{ color: '#057007' }}>
                        {semestrePromedios.reduce((acc, s) => acc + s.materiasCount, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Materias</p>
                </div>
                {tendencia && (
                    <div>
                        <p className={`text-lg font-bold ${
                            tendencia.direccion === 'subiendo' ? 'text-green-600' : 
                            tendencia.direccion === 'bajando' ? 'text-red-600' : 
                            'text-gray-600'
                        }`}>
                            {tendencia.direccion === 'subiendo' ? '↗' : 
                             tendencia.direccion === 'bajando' ? '↘' : '→'} 
                            {tendencia.cantidad.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Tendencia</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradeEvolutionChart;