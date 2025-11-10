'use client';

import { GradesDisplay } from '@/components/ui';
import { useAuth } from '@/components/providers';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CalificacionesPage() {
    const { userToken, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !userToken) {
            router.push('/auth');
        }
    }, [userToken, isLoading, router]);

    if (isLoading) {
        return null; // El AuthProvider ya maneja el loading
    }

    if (!userToken) {
        return null; // Redirigiendo...
    }

    return <GradesDisplay />;
}