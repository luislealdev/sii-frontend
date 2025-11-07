'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, FC, PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { fetchScheduleData } from '@/services/scheduleService';
import { useAuth } from './AuthProvider';

// Interfaces para los datos del horario
interface Periodo {
    clave_periodo: string;
    anio: number;
    descripcion_periodo: string;
}

interface MateriaHorario {
    id_grupo: number;
    letra_grupo: string;
    nombre_materia: string;
    clave_materia: string;
    clave_turno: string;
    nombre_plan: string;
    letra_nivel: string;
    lunes: string | null;
    lunes_clave_salon: string | null;
    martes: string | null;
    martes_clave_salon: string | null;
    miercoles: string | null;
    miercoles_clave_salon: string | null;
    jueves: string | null;
    jueves_clave_salon: string | null;
    viernes: string | null;
    viernes_clave_salon: string | null;
    sabado: string | null;
    sabado_clave_salon: string | null;
}

interface PeriodoData {
    periodo: Periodo;
    horario: MateriaHorario[];
}

interface ScheduleResponse {
    code: number;
    message: string;
    flag: boolean;
    data: PeriodoData[];
}

// Tipo para días de la semana
type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado';

// Interfaz para clases por día y hora
interface ClasePorDia {
    materia: MateriaHorario;
    horario: string;
    salon: string;
    dia: DiaSemana;
}

// Interfaz del contexto
interface ScheduleContextType {
    scheduleData: PeriodoData[];
    isLoading: boolean;
    error: string | null;
    fetchSchedule: () => Promise<void>;
    clearSchedule: () => void;
    getCurrentPeriod: () => PeriodoData | null;
    getClasesByDay: (dia: DiaSemana, periodo?: string) => ClasePorDia[];
    getAllClasesForWeek: (periodo?: string) => Record<DiaSemana, ClasePorDia[]>;
    getTotalMaterias: (periodo?: string) => number;
    getMateriasActuales: () => MateriaHorario[];
}

// Crear contexto
const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Componente ScheduleProvider
export const ScheduleProvider: FC<PropsWithChildren> = ({ children }) => {
    const [scheduleData, setScheduleData] = useState<PeriodoData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { userToken, registerResetHandler } = useAuth();
    const isRegistered = useRef(false);

    // Limpiar estado del horario usando useCallback para evitar re-renders
    const clearSchedule = useCallback(() => {
        setScheduleData([]);
        setError(null);
        setIsLoading(false);
    }, []);

    // Registrar handler de reset solo una vez para evitar loops
    useEffect(() => {
        if (!isRegistered.current && registerResetHandler) {
            console.log('Registrando handler de reset para schedule');
            registerResetHandler(clearSchedule);
            isRegistered.current = true;
        }
    }, [registerResetHandler, clearSchedule]);

    // Obtener el período actual (más reciente)
    const getCurrentPeriod = useCallback((): PeriodoData | null => {
        if (scheduleData.length === 0) return null;
        // Asumimos que el primer elemento es el período actual
        return scheduleData[0];
    }, [scheduleData]);

    // Obtener materias del período actual
    const getMateriasActuales = useCallback((): MateriaHorario[] => {
        const currentPeriod = getCurrentPeriod();
        return currentPeriod?.horario || [];
    }, [getCurrentPeriod]);

    // Obtener clases por día de la semana
    const getClasesByDay = useCallback((dia: DiaSemana, periodo?: string): ClasePorDia[] => {
        let targetPeriod: PeriodoData | null = null;
        
        if (periodo) {
            targetPeriod = scheduleData.find(p => p.periodo.clave_periodo === periodo) || null;
        } else {
            targetPeriod = getCurrentPeriod();
        }

        if (!targetPeriod) return [];

        const clases: ClasePorDia[] = [];
        
        targetPeriod.horario.forEach(materia => {
            const horario = materia[dia];
            const salon = materia[`${dia}_clave_salon` as keyof MateriaHorario] as string;
            
            if (horario) {
                clases.push({
                    materia,
                    horario,
                    salon: salon || 'Sin asignar',
                    dia
                });
            }
        });

        // Ordenar por hora de inicio
        return clases.sort((a, b) => {
            const timeA = a.horario.split('-')[0];
            const timeB = b.horario.split('-')[0];
            return timeA.localeCompare(timeB);
        });
    }, [scheduleData, getCurrentPeriod]);

    // Obtener todas las clases de la semana
    const getAllClasesForWeek = useCallback((periodo?: string): Record<DiaSemana, ClasePorDia[]> => {
        const dias: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const weekSchedule: Record<DiaSemana, ClasePorDia[]> = {} as Record<DiaSemana, ClasePorDia[]>;

        dias.forEach(dia => {
            weekSchedule[dia] = getClasesByDay(dia, periodo);
        });

        return weekSchedule;
    }, [getClasesByDay]);

    // Obtener total de materias en un período
    const getTotalMaterias = useCallback((periodo?: string): number => {
        let targetPeriod: PeriodoData | null = null;
        
        if (periodo) {
            targetPeriod = scheduleData.find(p => p.periodo.clave_periodo === periodo) || null;
        } else {
            targetPeriod = getCurrentPeriod();
        }

        return targetPeriod?.horario.length || 0;
    }, [scheduleData, getCurrentPeriod]);

    // Función para obtener datos del horario
    const fetchSchedule = useCallback(async () => {
        if (!userToken) {
            setError('No hay token de autenticación disponible');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Obteniendo datos del horario...');
            const response: ScheduleResponse = await fetchScheduleData(userToken);
            
            console.log('Respuesta del horario:', response);

            if (!response.flag) {
                throw new Error(response.message || 'Error al obtener datos del horario');
            }

            if (response.code !== 200) {
                throw new Error(`Error del servidor: ${response.code} - ${response.message}`);
            }

            setScheduleData(response.data);
            console.log('Horario cargado correctamente:', response.data);
            
        } catch (error) {
            console.error('Error al obtener horario:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener horario';
            setError(errorMessage);
            toast.error(errorMessage, { duration: 4000 });
        } finally {
            setIsLoading(false);
        }
    }, [userToken]);

    // Cargar horario automáticamente cuando hay token y no hay datos cargados
    useEffect(() => {
        if (userToken && scheduleData.length === 0 && !isLoading && !error) {
            console.log('Token disponible y no hay datos de horario, cargando automáticamente...');
            fetchSchedule();
        }
    }, [userToken, scheduleData.length, isLoading, error, fetchSchedule]);

    return (
        <ScheduleContext.Provider
            value={{
                scheduleData,
                isLoading,
                error,
                fetchSchedule,
                clearSchedule,
                getCurrentPeriod,
                getClasesByDay,
                getAllClasesForWeek,
                getTotalMaterias,
                getMateriasActuales,
            }}
        >
            {children}
        </ScheduleContext.Provider>
    );
};

// Hook para usar el contexto
export const useSchedule = (): ScheduleContextType => {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error('useSchedule must be used within a ScheduleProvider');
    }
    return context;
};
