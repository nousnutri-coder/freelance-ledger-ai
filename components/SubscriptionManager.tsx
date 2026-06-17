import React, { useState } from 'react';
import { UserProfile } from '../types';
import { validateCoupon } from '../services/subscriptionService';
import TeamManager from './TeamManager';

interface SubscriptionManagerProps {
    user: UserProfile;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ user }) => {
    const [couponCode, setCouponCode] = useState('');
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setIsValidating(true);
        setCouponMessage(null);

        try {
            const result = await validateCoupon(couponCode);
            if (result.valid) {
                setCouponMessage({ type: 'success', text: `¡Cupón válido! ${result.message}` });
            } else {
                setCouponMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setCouponMessage({ type: 'error', text: 'Error al validar el cupón' });
        } finally {
            setIsValidating(false);
        }
    };

    const getPlanIcon = (plan: string) => {
        switch (plan) {
            case 'pro': return '⚡';
            case 'unicorn': return '🦄';
            case 'team': return '👥';
            default: return '🌱';
        }
    };

    const getPlanDescription = (plan: string) => {
        switch (plan) {
            case 'pro': return 'Funciones avanzadas';
            case 'unicorn': return 'Todas las funciones';
            case 'team': return 'Todo UNICORN + Equipo';
            default: return 'Funciones básicas';
        }
    };

    const canUpgrade = user.currentPlan !== 'team';

    return (
        <div className="space-y-6">
            {/* Plan actual */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-3xl">
                        {getPlanIcon(user.currentPlan || 'free')}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Plan actual</p>
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white">
                            {(user.currentPlan || 'free').toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-500">
                            {getPlanDescription(user.currentPlan || 'free')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Botones de Upgrade */}
            {canUpgrade && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* PRO */}
                    {(user.currentPlan === 'free') && (
                        <a
                            href="#/checkout?plan=pro"
                            className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">⚡</span>
                                <div>
                                    <h5 className="font-bold text-gray-900 dark:text-white">PRO</h5>
                                    <p className="text-xs text-gray-500">$49.900/mes</p>
                                </div>
                            </div>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>✓ IA para cotizaciones</li>
                                <li>✓ Clientes ilimitados</li>
                                <li>✓ Exportar PDF</li>
                            </ul>
                        </a>
                    )}

                    {/* UNICORN */}
                    {(user.currentPlan === 'free' || user.currentPlan === 'pro') && (
                        <a
                            href="#/checkout?plan=unicorn"
                            className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl hover:shadow-lg hover:shadow-purple-500/20 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">🦄</span>
                                <div>
                                    <h5 className="font-bold text-gray-900 dark:text-white">UNICORN</h5>
                                    <p className="text-xs text-gray-500">$99.900/mes</p>
                                </div>
                            </div>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                <li>✓ Todo de PRO</li>
                                <li>✓ ADN de Empresa</li>
                                <li>✓ Asistente IA avanzado</li>
                            </ul>
                        </a>
                    )}

                    {/* TEAM */}
                    <a
                        href="#/checkout?plan=team"
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl hover:shadow-lg hover:shadow-blue-500/20 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                            NUEVO
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">👥</span>
                            <div>
                                <h5 className="font-bold text-gray-900 dark:text-white">TEAM</h5>
                                <p className="text-xs text-gray-500">$200.000/mes</p>
                            </div>
                        </div>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <li>✓ Todo de UNICORN</li>
                            <li>✓ 2 miembros adicionales</li>
                            <li>✓ Roles y permisos</li>
                            <li>✓ Gestión de equipo</li>
                        </ul>
                    </a>
                </div>
            )}

            {/* Team Manager - Solo para plan TEAM */}
            {user.currentPlan === 'team' && user.id && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                    <TeamManager ownerId={user.id} />
                </div>
            )}

            {/* Sección de Cupones */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <span className="material-icons-round text-lg">local_offer</span>
                    Aplicar Cupón de Descuento
                </h4>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Ingresa tu código"
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        onClick={handleApplyCoupon}
                        disabled={isValidating || !couponCode.trim()}
                        className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isValidating ? (
                            <span className="material-icons-round animate-spin text-lg">refresh</span>
                        ) : (
                            <>
                                <span className="material-icons-round text-lg">check</span>
                                Aplicar
                            </>
                        )}
                    </button>
                </div>
                {couponMessage && (
                    <div className={`mt-3 p-3 rounded-xl text-sm ${couponMessage.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }`}>
                        {couponMessage.text}
                    </div>
                )}
            </div>

            {/* Info para usuarios FREE */}
            {user.currentPlan === 'free' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-start gap-3">
                        <span className="material-icons-round text-blue-600">info</span>
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                Mejora tu plan para desbloquear más clientes, cotizaciones ilimitadas y funciones de IA avanzada.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManager;
