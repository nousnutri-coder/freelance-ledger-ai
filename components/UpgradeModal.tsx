import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionPlan } from '../types';
import { useTranslation } from 'react-i18next';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: SubscriptionPlan;
    limitReached: 'clients' | 'quotations' | 'dna' | 'ai';
    currentUsage: number;
    limit: number;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
    isOpen,
    onClose,
    currentPlan,
    limitReached,
    currentUsage,
    limit
}) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const getLimitMessage = () => {
        switch (limitReached) {
            case 'clients':
                return `Has alcanzado el límite de ${limit} clientes del Plan ${currentPlan.toUpperCase()}.`;
            case 'quotations':
                return `Has alcanzado el límite de ${limit} cotizaciones por mes del Plan ${currentPlan.toUpperCase()}.`;
            case 'dna':
                return `El ADN de Empresa no está disponible en el Plan ${currentPlan.toUpperCase()}.`;
            case 'ai':
                return `Las funciones de IA avanzada solo están disponibles en el Plan UNICORN.`;
            default:
                return 'Has alcanzado el límite de tu plan actual.';
        }
    };

    const navigate = useNavigate();

    const handleUpgrade = (targetPlan: 'pro' | 'unicorn' | 'lifetime') => {
        onClose();
        navigate('/checkout');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-primary to-emerald-600 p-6 rounded-t-3xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-white mb-2">🚀 Mejora tu Plan</h2>
                            <p className="text-emerald-100 text-sm">{getLimitMessage()}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>
                </div>

                {/* Plan Comparison */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Plan PRO */}
                    <div className="border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-3xl">⚡</span>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">PRO</h3>
                                <p className="text-sm text-gray-500">Para freelancers establecidos</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-4xl font-black text-blue-600 mb-1">$50.000</p>
                            <p className="text-xs text-gray-500">COP / mes</p>
                        </div>

                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-green-500 text-base">check_circle</span>
                                <span className="text-gray-700 dark:text-gray-300"><strong>Clientes ilimitados</strong></span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-green-500 text-base">check_circle</span>
                                <span className="text-gray-700 dark:text-gray-300"><strong>Cotizaciones ilimitadas</strong></span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-green-500 text-base">check_circle</span>
                                <span className="text-gray-700 dark:text-gray-300">IA con contexto completo</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-green-500 text-base">check_circle</span>
                                <span className="text-gray-700 dark:text-gray-300">1 Perfil de ADN de Empresa</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-green-500 text-base">check_circle</span>
                                <span className="text-gray-700 dark:text-gray-300">Sin marca de agua en PDFs</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleUpgrade('pro')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
                        >
                            Elegir PRO
                        </button>
                    </div>

                    {/* Plan UNICORN */}
                    <div className="border-2 border-purple-300 dark:border-purple-700 rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-xl transition-shadow relative overflow-hidden">
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black px-3 py-1 rounded-full">
                            POPULAR
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-3xl">🦄</span>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">UNICORN</h3>
                                <p className="text-sm text-gray-500">Para agencias y profesionales</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-4xl font-black text-purple-600 mb-1">$120.000</p>
                            <p className="text-xs text-gray-500">COP / mes</p>
                        </div>

                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-purple-500 text-base">check_circle</span>
                                <span className="text-gray-700 dark:text-gray-300"><strong>Todo lo de PRO, más:</strong></span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-purple-500 text-base">star</span>
                                <span className="text-gray-700 dark:text-gray-300"><strong>Perfiles ADN ilimitados</strong></span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-purple-500 text-base">star</span>
                                <span className="text-gray-700 dark:text-gray-300"><strong>Hasta 3 firmas digitales</strong></span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-purple-500 text-base">star</span>
                                <span className="text-gray-700 dark:text-gray-300"><strong>IA Avanzada</strong> (Simulaciones + Vampire Subs)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="material-icons-round text-purple-500 text-base">star</span>
                                <span className="text-gray-700 dark:text-gray-300">Soporte prioritario</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleUpgrade('unicorn')}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                        >
                            Elegir UNICORN 🦄
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-3xl border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="material-icons-round text-base">info</span>
                            <span>Puedes cancelar en cualquier momento</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                                Pago seguro con Wompi
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                                Facturación automática
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
