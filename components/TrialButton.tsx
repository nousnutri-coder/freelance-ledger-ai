import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { activateTrial } from '../services/subscriptionService';

const TrialButton: React.FC = () => {
    const { user, userProfile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Solo mostrar si el usuario es FREE y no ha usado su trial
    if (!userProfile || userProfile.currentPlan !== 'free' || userProfile.hasUsedTrial) {
        return null;
    }

    const handleActivateTrial = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            await activateTrial(user.id);
            setSuccess(true);
            // Esperar un momento y refrescar perfil
            setTimeout(async () => {
                await refreshProfile();
                window.location.reload(); // Forzar recarga para actualizar badge
            }, 1500);
        } catch (err: any) {
            console.error('Error activating trial:', err);
            setError(err.message || 'Error al activar el trial');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl shadow-xl text-white text-center">
                <span className="material-icons-round text-5xl mb-2">celebration</span>
                <h3 className="text-xl font-bold mb-2">¡Trial Activado!</h3>
                <p className="text-sm opacity-90">Tienes 7 días de acceso PRO gratis</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl shadow-lg border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <span className="material-icons-round text-white text-2xl">rocket_launch</span>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Prueba PRO Gratis
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Desbloquea todas las funciones premium por 7 días, completamente gratis. Sin tarjeta de crédito.
                    </p>
                    {error && (
                        <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-lg">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={handleActivateTrial}
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="material-icons-round animate-spin text-xl">refresh</span>
                                Activando...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round text-xl">star</span>
                                Activar Trial de 7 Días
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrialButton;
