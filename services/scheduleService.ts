'use server';

export const fetchScheduleData = async (token: string) => {
    const response = await fetch(`${process.env.API_URL}/movil/estudiante/horarios`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },

    });

    if (!response.ok) {
        throw new Error('Failed to fetch schedule data');
    }

    const data = await response.json();
    return data;
}   