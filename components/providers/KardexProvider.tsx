'use client';

import { createContext, useContext, useState, useEffect, FC, PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { fetchKardexData } from '@/services/kardexService';
import { useAuth } from './AuthProvider';

// Interfaces para los datos del kardex
interface KardexMateria {
    nombre_materia: string;
    clave_materia: string;
    periodo: string;
    creditos: string;
    calificacion: string;
    descripcion: string;
    semestre: number;
}

interface KardexData {
    porcentaje_avance: number;
    kardex: KardexMateria[];
}

interface KardexResponse {
    code: number;
    message: string;
    flag: boolean;
    data: KardexData;
}

// Interfaz del contexto
interface KardexContextType {
    kardexData: KardexData | null;
    isLoading: boolean;
    error: string | null;
    fetchKardex: () => Promise<void>;
    clearKardex: () => void;
    getMateriasBySemestre: (semestre: number) => KardexMateria[];
    getTotalCreditos: () => number;
    getPromedioGeneral: () => number;
}

// Crear contexto
const KardexContext = createContext<KardexContextType | undefined>(undefined);

// Componente KardexProvider
export const KardexProvider: FC<PropsWithChildren> = ({ children }) => {
    const [kardexData, setKardexData] = useState<KardexData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { userToken, registerResetHandler } = useAuth();

    // Registrar handler de reset para limpiar kardex cuando se hace logout
    useEffect(() => {
        const resetKardex = () => {
            setKardexData(null);
            setError(null);
            setIsLoading(false);
        };
        registerResetHandler(resetKardex);
    }, [registerResetHandler]);

    // Limpiar estado del kardex
    const clearKardex = () => {
        setKardexData(null);
        setError(null);
        setIsLoading(false);
    };

    // Obtener materias por semestre
    const getMateriasBySemestre = (semestre: number): KardexMateria[] => {
        if (!kardexData) return [];
        return kardexData.kardex.filter(materia => materia.semestre === semestre);
    };

    // Calcular total de créditos
    const getTotalCreditos = (): number => {
        if (!kardexData) return 0;
        return kardexData.kardex.reduce((total, materia) => {
            const creditos = parseInt(materia.creditos) || 0;
            return total + creditos;
        }, 0);
    };

    // Calcular promedio general
    const getPromedioGeneral = (): number => {
        if (!kardexData) return 0;
        
        const materiasConCalificacion = kardexData.kardex.filter(materia => {
            const cal = parseFloat(materia.calificacion);
            return !isNaN(cal) && cal > 0;
        });

        if (materiasConCalificacion.length === 0) return 0;

        const sumaCalificaciones = materiasConCalificacion.reduce((suma, materia) => {
            const calificacion = parseFloat(materia.calificacion) || 0;
            return suma + calificacion;
        }, 0);

        return Math.round((sumaCalificaciones / materiasConCalificacion.length) * 100) / 100;
    };

    // Función para obtener datos del kardex
    const fetchKardex = async () => {
        if (!userToken) {
            setError('No hay token de autenticación disponible');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Obteniendo datos del kardex...');
            const response: KardexResponse = await fetchKardexData(userToken);
            
            console.log('Respuesta del kardex:', response);

            if (!response.flag) {
                throw new Error(response.message || 'Error al obtener datos del kardex');
            }

            if (response.code !== 200) {
                throw new Error(`Error del servidor: ${response.code} - ${response.message}`);
            }

            setKardexData(response.data);
            console.log('Kardex cargado correctamente:', response.data);
            
        } catch (error) {
            console.error('Error al obtener kardex:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener kardex';
            setError(errorMessage);
            toast.error(errorMessage, { duration: 4000 });
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar kardex automáticamente cuando hay token y no hay datos cargados
    useEffect(() => {
        if (userToken && !kardexData && !isLoading) {
            console.log('Token disponible y no hay datos de kardex, cargando automáticamente...');
            fetchKardex();
        }
    }, [userToken]); // Solo depende del token para evitar loops

    return (
        <KardexContext.Provider
            value={{
                kardexData,
                isLoading,
                error,
                fetchKardex,
                clearKardex,
                getMateriasBySemestre,
                getTotalCreditos,
                getPromedioGeneral,
            }}
        >
            {children}
        </KardexContext.Provider>
    );
};

// Hook para usar el contexto
export const useKardex = (): KardexContextType => {
    const context = useContext(KardexContext);
    if (!context) {
        throw new Error('useKardex must be used within a KardexProvider');
    }
    return context;
};
