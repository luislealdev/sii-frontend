'use server';

// Interfaces para las calificaciones
export interface Calificacion {
    id_calificacion: number;
    numero_calificacion: number;
    calificacion: string | null;
}

export interface Materia {
    id_grupo: number;
    nombre_materia: string;
    clave_materia: string;
    letra_grupo: string;
}

export interface MateriaConCalificaciones {
    materia: Materia;
    calificaiones: Calificacion[]; // Nota: API tiene error de ortografía "calificaiones"
}

export interface Periodo {
    clave_periodo: string;
    anio: number;
    descripcion_periodo: string;
}

export interface PeriodoConMaterias {
    periodo: Periodo;
    materias: MateriaConCalificaciones[];
}

export interface GradesResponse {
    code: number;
    message: string;
    flag: boolean;
    data: PeriodoConMaterias[];
}

// Función para obtener las calificaciones
export const fetchGradesData = async (token: string): Promise<GradesResponse> => {
    try {
        console.log('Obteniendo calificaciones del estudiante...');
        
        const response = await fetch(`${process.env.API_URL}/movil/estudiante/calificaciones`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GradesResponse = await response.json();
        console.log('Calificaciones obtenidas exitosamente:', data);
        
        return data;
    } catch (error) {
        console.error('Error al obtener calificaciones:', error);
        throw new Error(error instanceof Error ? error.message : 'Error desconocido al obtener calificaciones');
    }
};