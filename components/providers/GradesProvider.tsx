'use client';

import { createContext, useContext, useReducer, useEffect, useRef, useCallback, FC, PropsWithChildren } from 'react';
import { fetchGradesData, PeriodoConMaterias, GradesResponse } from '@/services/gradesService';
import { useAuth } from './AuthProvider';

// Interfaces del contexto
interface GradesState {
    grades: PeriodoConMaterias[];
    loading: boolean;
    error: string | null;
    searchTerm: string;
    filteredGrades: PeriodoConMaterias[];
}

interface GradesContextType extends GradesState {
    fetchGrades: () => Promise<void>;
    clearGrades: () => void;
    setSearchTerm: (term: string) => void;
}

// Acciones del reducer
type GradesAction = 
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_GRADES_DATA'; payload: PeriodoConMaterias[] }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'CLEAR_DATA' }
    | { type: 'SET_SEARCH_TERM'; payload: string }
    | { type: 'SET_FILTERED_GRADES'; payload: PeriodoConMaterias[] };

// Estado inicial
const initialState: GradesState = {
    grades: [],
    loading: false,
    error: null,
    searchTerm: '',
    filteredGrades: [],
};

// Reducer
const gradesReducer = (state: GradesState, action: GradesAction): GradesState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_GRADES_DATA':
            return { 
                ...state, 
                grades: action.payload, 
                filteredGrades: action.payload,
                loading: false, 
                error: null 
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'CLEAR_DATA':
            return initialState;
        case 'SET_SEARCH_TERM':
            return { ...state, searchTerm: action.payload };
        case 'SET_FILTERED_GRADES':
            return { ...state, filteredGrades: action.payload };
        default:
            return state;
    }
};

// Función para filtrar calificaciones
const filterGrades = (grades: PeriodoConMaterias[], searchTerm: string): PeriodoConMaterias[] => {
    if (!searchTerm.trim()) {
        return grades;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    return grades.map(periodo => ({
        ...periodo,
        materias: periodo.materias.filter(materiaData => {
            const nombreMateria = materiaData.materia.nombre_materia.toLowerCase();
            const claveMateria = materiaData.materia.clave_materia.toLowerCase();
            const descripcionPeriodo = periodo.periodo.descripcion_periodo.toLowerCase();
            
            return nombreMateria.includes(lowerSearchTerm) || 
                   claveMateria.includes(lowerSearchTerm) || 
                   descripcionPeriodo.includes(lowerSearchTerm);
        })
    })).filter(periodo => periodo.materias.length > 0);
};

// Crear contexto
const GradesContext = createContext<GradesContextType | undefined>(undefined);

// Componente GradesProvider
export const GradesProvider: FC<PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(gradesReducer, initialState);
    const { userToken, registerResetHandler } = useAuth();
    const isRegistered = useRef(false);

    // Limpiar estado de calificaciones
    const clearGrades = () => {
        dispatch({ type: 'CLEAR_DATA' });
    };

    // Establecer término de búsqueda y filtrar
    const setSearchTerm = useCallback((term: string) => {
        dispatch({ type: 'SET_SEARCH_TERM', payload: term });
        const filtered = filterGrades(state.grades, term);
        dispatch({ type: 'SET_FILTERED_GRADES', payload: filtered });
    }, [state.grades]);

    // Obtener calificaciones
    const fetchGrades = useCallback(async () => {
        if (!userToken) {
            dispatch({ type: 'SET_ERROR', payload: 'No hay token de autenticación' });
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            console.log('Obteniendo calificaciones del estudiante...');
            const response: GradesResponse = await fetchGradesData(userToken);
            
            console.log('Respuesta de calificaciones:', response);

            if (response.flag && response.data) {
                dispatch({ type: 'SET_GRADES_DATA', payload: response.data });
                console.log('Calificaciones cargadas correctamente:', response.data);
            } else {
                throw new Error(response.message || 'Error al obtener calificaciones');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar calificaciones';
            console.error('Error al obtener calificaciones:', error);
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
        }
    }, [userToken]);

    // Registrar handler de reset cuando se inicializa el provider
    useEffect(() => {
        if (!isRegistered.current && registerResetHandler) {
            console.log('Registrando handler de reset para grades');
            registerResetHandler(clearGrades);
            isRegistered.current = true;
        }
    }, [registerResetHandler]);

    // Filtrar cuando cambie el término de búsqueda
    useEffect(() => {
        const filtered = filterGrades(state.grades, state.searchTerm);
        dispatch({ type: 'SET_FILTERED_GRADES', payload: filtered });
    }, [state.grades, state.searchTerm]);

    const value: GradesContextType = {
        ...state,
        fetchGrades,
        clearGrades,
        setSearchTerm,
    };

    return (
        <GradesContext.Provider value={value}>
            {children}
        </GradesContext.Provider>
    );
};

// Hook para usar el contexto
export const useGrades = (): GradesContextType => {
    const context = useContext(GradesContext);
    if (!context) {
        throw new Error('useGrades debe ser usado dentro de GradesProvider');
    }
    return context;
};