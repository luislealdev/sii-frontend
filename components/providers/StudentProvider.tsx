'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchStudentData, Student, StudentResponse } from '@/services/studentService';
import { useAuth } from './AuthProvider';

interface StudentState {
    studentData: Student | null;
    loading: boolean;
    error: string | null;
}

type StudentAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_STUDENT_DATA'; payload: Student }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'CLEAR_DATA' };

const initialState: StudentState = {
    studentData: null,
    loading: false,
    error: null,
};

const studentReducer = (state: StudentState, action: StudentAction): StudentState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_STUDENT_DATA':
            return { ...state, studentData: action.payload, error: null };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'CLEAR_DATA':
            return initialState;
        default:
            return state;
    }
};

interface StudentContextType {
    studentData: Student | null;
    loading: boolean;
    error: string | null;
    getStudentData: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(studentReducer, initialState);
    const { userToken, registerResetHandler } = useAuth();

    const getStudentData = async () => {
        if (!userToken) {
            console.warn('No hay token de autenticación disponible');
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            console.log('Obteniendo datos del estudiante...');
            const response: StudentResponse = await fetchStudentData(userToken);
            
            console.log('Respuesta del estudiante:', response);

            if (response.flag && response.data) {
                dispatch({ type: 'SET_STUDENT_DATA', payload: response.data });
                console.log('Datos del estudiante cargados correctamente:', response.data);
            } else {
                throw new Error(response.message || 'Error al cargar datos del estudiante');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar datos del estudiante';
            console.error('Error al obtener datos del estudiante:', error);
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    // Registrar handler de reset
    useEffect(() => {
        if (registerResetHandler) {
            console.log('Registrando handler de reset para student');
            registerResetHandler(() => dispatch({ type: 'CLEAR_DATA' }));
        }
    }, [registerResetHandler]);

    // Cargar datos automáticamente cuando hay token y no hay datos
    useEffect(() => {
        if (userToken && !state.studentData && !state.loading && !state.error) {
            console.log('Token disponible y no hay datos del estudiante, cargando automáticamente...');
            getStudentData();
        }
        
        if (!userToken) {
            dispatch({ type: 'CLEAR_DATA' });
        }
    }, [userToken, state.studentData, state.loading, state.error]);

    return (
        <StudentContext.Provider 
            value={{
                studentData: state.studentData,
                loading: state.loading,
                error: state.error,
                getStudentData,
            }}
        >
            {children}
        </StudentContext.Provider>
    );
};

export const useStudent = () => {
    const context = useContext(StudentContext);
    if (context === undefined) {
        throw new Error('useStudent must be used within a StudentProvider');
    }
    return context;
};