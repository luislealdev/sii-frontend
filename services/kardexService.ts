'use server';

export const fetchKardexData = async (token: string) => {
    const response = await fetch(`${process.env.API_URL}/movil/estudiante/kardex`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },

    });

    if (!response.ok) {
        throw new Error('Failed to fetch kardex data');
    }

    const data = await response.json();
    return data;
}