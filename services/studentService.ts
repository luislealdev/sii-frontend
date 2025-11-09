'use server';

export interface Student {
    numero_control: string;
    persona: string;
    email: string;
    semestre: number;
    num_mat_rep_no_acreditadas: string;
    creditos_acumulados: string;
    promedio_ponderado: string;
    promedio_aritmetico: string;
    materias_cursadas: string;
    materias_reprobadas: string;
    materias_aprobadas: string;
    creditos_complementarios: number;
    porcentaje_avance: number;
    num_materias_rep_primera: number;
    num_materias_rep_segunda: number | null;
    percentaje_avance_cursando: number;
    foto: string;
}

export interface StudentResponse {
    code: number;
    message: string;
    flag: boolean;
    data: Student;
}

export const fetchStudentData = async (token: string): Promise<StudentResponse> => {
    const response = await fetch(`${process.env.API_URL}/movil/estudiante`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch student data');
    }

    const data = await response.json();
    return data;
};