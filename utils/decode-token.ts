export const decodeToken = (token: string): Record<string, unknown> | null => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = parts[1];
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);

        const decoded = atob(padded); // Usa atob si estás en navegador
        // O usa Buffer si estás en Node: Buffer.from(padded, 'base64').toString('utf-8')

        return JSON.parse(decoded) as Record<string, unknown>;
    } catch (e) {
        console.error("Error decodificando token:", e);
        return null;
    }
};