'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, FC, PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { fetchStudentData, Student, StudentResponse } from '@/services/studentService';
import { useAuth } from './AuthProvider';

// Interfaz del contexto
interface StudentContextType {
    studentData: Student | null;
    isLoading: boolean;
    error: string | null;
    fetchStudent: () => Promise<void>;
    clearStudent: () => void;
}

// Crear contexto
const StudentContext = createContext<StudentContextType | undefined>(undefined);

// Componente StudentProvider
export const StudentProvider: FC<PropsWithChildren> = ({ children }) => {
    const [studentData, setStudentData] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { userToken, registerResetHandler } = useAuth();
    const isRegistered = useRef(false);

    // Limpiar estado del estudiante
    const clearStudent = useCallback(() => {
        setStudentData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    // Obtener datos del estudiante
    const fetchStudent = useCallback(async () => {
        if (!userToken) {
            setError('No hay token de autenticación');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Obteniendo datos del estudiante...');
            const response: StudentResponse = await fetchStudentData(userToken);
            
            console.log('Respuesta del estudiante:', response);

            if (response.flag && response.data) {
                setStudentData(response.data);
                console.log('Datos del estudiante cargados correctamente:', response.data);
            } else {
                throw new Error(response.message || 'Error al obtener datos del estudiante');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar datos del estudiante';
            console.error('Error al obtener datos del estudiante:', error);
            setError(errorMessage);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [userToken]);

    // Registrar handler de reset cuando se inicializa el provider
    useEffect(() => {
        if (!isRegistered.current && registerResetHandler) {
            console.log('Registrando handler de reset para student');
            registerResetHandler(clearStudent);
            isRegistered.current = true;
        }
    }, [registerResetHandler, clearStudent]);

    // Cargar datos automáticamente cuando hay token y no hay datos
    useEffect(() => {
        if (userToken && !studentData && !isLoading && !error) {
            console.log('Token disponible y no hay datos del estudiante, cargando automáticamente...');
            fetchStudent();
        }
    }, [userToken, studentData, isLoading, error, fetchStudent]);

    const value: StudentContextType = {
        studentData,
        isLoading,
        error,
        fetchStudent,
        clearStudent,
    };

    return (
        <StudentContext.Provider value={value}>
            {children}
        </StudentContext.Provider>
    );
};

// Hook para usar el contexto
export const useStudent = (): StudentContextType => {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error('useStudent debe ser usado dentro de StudentProvider');
    }
    return context;
};