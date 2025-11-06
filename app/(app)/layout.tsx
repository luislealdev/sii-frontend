'use client';

import { useAuth } from "@/components/providers";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const { userToken, isLoading } = useAuth();

    useEffect(() => {
        if (!userToken && !isLoading) {
            router.replace("/auth");
        }
    }, [userToken, router, isLoading]);

    if (!userToken && isLoading) {
        return <LoadingSpinner />;
    }

    // if (role !== 'ADMINISTRATOR') {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen bg-gray-100">
    //             <div className="text-center">
    //                 <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
    //                 <p className="text-gray-600">No tienes los permisos para entrar a este sitio.</p>
    //                 <button
    //                     onClick={() => logout()}
    //                     className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring focus:border-blue-300"
    //                 >
    //                     Cerrar Sesión
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="flex">
            {/* Sidebar */}
            {/* <AdminSidebar /> */}
            {/* Contenido principal */}
            <main className="flex-1 ml-64 p-6 bg-gray-100 min-h-screen">
                {children}
            </main>
        </div>
    );
}