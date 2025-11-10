'use client';

import { createContext, useContext, useState, useEffect, FC, PropsWithChildren } from 'react';
import Image from 'next/image';
import { decodeToken } from '@/utils/decode-token';

// Interfaz del contexto
interface AuthContextType {
    userToken: string | null;
    //   role: string | null;
    id: string | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: (message?: string) => Promise<void>;
    clearProvider: () => void;
    registerResetHandler: (resetHandler: () => void) => void;
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente AuthProvider
export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    //   const [role, setRole] = useState<string | null>(null);
    const [id, setId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Siempre iniciar con true
    const [mounted, setMounted] = useState<boolean>(false); // Para controlar hidratación
    const [isValidating, setIsValidating] = useState<boolean>(false); // Evitar bucles de renovación
    const [resetHandlers, setResetHandlers] = useState<(() => void)[]>([]);

    // Registrar handlers de reset
    const registerResetHandler = (resetHandler: () => void): void => {
        setResetHandlers((prev) => [...prev, resetHandler]);
    };

    // Limpiar estado del provider
    const clearProvider = () => {
        setUserToken(null);
        // setRole(null);
        setId(null);
    };

    // Manejo de logout
    const logout = async (message?: string) => {
        setIsLoading(true);
        try {
            resetHandlers.forEach((reset) => reset());
            localStorage.removeItem('token');
            clearProvider();
            if (message) {
                console.log('Logout exitoso:', message);
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Validar token (expiración)
    const handleTokenValidation = async (token: string) => {
        if (isValidating) return; // Evitar validaciones simultáneas
        setIsValidating(true);
        setIsLoading(true);

        try {
            // Validar formato del token (básico)
            if (!token || typeof token !== 'string' || !token.includes('.')) {
                throw new Error('Token inválido');
            }

            //   const newToken = await renewToken(token);
            //   if (!newToken) {
            //     await logout('Tu sesión ha expirado.');
            //     return;
            //   }

            const decodedToken = decodeToken(token);
            console.log('Token decodificado:', decodedToken);
            
            if (!decodedToken) {
                await logout('Error al procesar el token.');
                return;
            }

            // Verificar que el token tenga los campos necesarios
            if (!decodedToken.exp || !decodedToken.sub) {
                console.error('Token no tiene campos requeridos (exp, sub):', decodedToken);
                await logout('Token inválido - faltan campos requeridos.');
                return;
            }

            // Check iat and exp fields from decodedToken to check expiration
            const nowTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
            const expTime = Number(decodedToken.exp);
            
            console.log(`Tiempo actual: ${nowTime}, Tiempo de expiración: ${expTime}, Expirado: ${nowTime > expTime}`);

            if (nowTime > expTime) {
                await logout('Tu sesión ha expirado.');
                return;
            }

            // Si el token es válido, restaurar el estado del provider
            // Esto permite mantener userToken e id después de recargar la página
            setUserToken(token);
            setId(String(decodedToken.sub)); // Convertir a string sin importar si es número o string
            
            console.log('Token restaurado correctamente, userToken:', token, 'id:', String(decodedToken.sub));

        } catch (error) {
            console.error('Error en validación de token:', error);
            await logout('Error al validar la sesión.');
        } finally {
            setIsValidating(false);
            setIsLoading(false);
        }
    };

    // Manejo de login
    const login = async (token: string) => {
        setIsLoading(true);
        try {
            const decodedToken = decodeToken(token);
            if (!decodedToken) {
                console.error('Error al decodificar el token');
                return;
            }

            if (decodedToken.userStatusId === '2') {
                console.error('Cuenta desactivada - userStatusId: 2');
            } else if (decodedToken.userStatusId === '3') {
                console.error('Cuenta reportada - userStatusId: 3');
            } else {
                localStorage.setItem('token', token);
                setUserToken(token);
                // setRole(decodedToken.role);
                setId(decodedToken.sub as string);
                console.log('Inicio de sesión exitoso');
            }
        } catch (error) {
            console.error('Error en login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para controlar la hidratación
    useEffect(() => {
        setMounted(true);
    }, []);

    // Cargar token al iniciar
    useEffect(() => {
        if (!mounted) return; // Esperar a que el componente esté montado

        const loadToken = async () => {
            const token = localStorage.getItem('token');
            console.log('Iniciando carga de token, token encontrado:', !!token);
            if (token) {
                await handleTokenValidation(token);
            } else {
                console.log('No hay token, estableciendo isLoading a false');
                setIsLoading(false);
            }
        };

        loadToken();

        return () => {
            setIsValidating(false);
        };
    }, [mounted]);

    // Mostrar loading solo cuando esté montado en el cliente
    if (!mounted) {
        return null; // No renderizar nada en el servidor
    }

    return (
        <AuthContext.Provider
            value={{
                userToken,
                // role,
                id,
                isLoading,
                login,
                logout,
                clearProvider,
                registerResetHandler,
            }}
        >
            {isLoading ? (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50 transition-opacity duration-300">
                    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-lg">
                        <div className="relative w-24 h-24 animate-bounce">
                            <Image
                                src="/img/isologo.png"
                                alt="Valente Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                        <p className="text-gray-700 text-lg font-semibold tracking-wide">Cargando...</p>
                    </div>
                </div>
            ) : (
                <>
                    {children}
                </>
            )}
        </AuthContext.Provider>
    );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};