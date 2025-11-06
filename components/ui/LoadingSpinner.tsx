export const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center space-y-4">
                {/* Spinner circular */}
                <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin border-t-transparent"></div>
                {/* Texto */}
                <p className="text-lg font-semibold text-gray-700">Cargando...</p>
            </div>
        </div>
    );
}