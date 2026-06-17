import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { SubscriptionPlan } from '../types';
import {
    calculatePrice,
    createWompiPaymentLink,
    generatePaymentReference,
    PLAN_PRICES
} from '../services/wompiService';
import { validateCoupon } from '../services/subscriptionService';

interface CheckoutProps {
    preSelectedPlan?: 'pro' | 'unicorn' | 'team';
}

const Checkout: React.FC<CheckoutProps> = ({ preSelectedPlan }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();

    const [selectedPlan, setSelectedPlan] = useState<'pro' | 'unicorn' | 'team'>(preSelectedPlan || 'pro');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [couponCode, setCouponCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatPrice = (cents: number): string => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(cents / 100);
    };

    const getBasePrice = (): number => {
        return PLAN_PRICES[selectedPlan][billingCycle];
    };

    const getFinalPrice = (): number => {
        const base = getBasePrice();
        if (appliedDiscount > 0) {
            return Math.max(0, base - (base * appliedDiscount / 100));
        }
        return base;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setLoading(true);
        setError(null);

        const result = await validateCoupon(couponCode, user?.id);
        setLoading(false);

        if (result.valid && result.discount) {
            if (result.type === 'percentage') {
                setAppliedDiscount(result.discount);
            } else if (result.type === 'free_time') {
                setAppliedDiscount(0);
            }
            setError(null);
            setCouponCode(result.message);
        } else {
            setError(result.message);
        }
    };

    const handlePurchase = async () => {
        if (!user || !userProfile) {
            setError('Debes iniciar sesión para continuar');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const finalAmount = getFinalPrice();
            const reference = generatePaymentReference(user.id, selectedPlan);

            const description = `FreelAissistPro - Plan ${selectedPlan.toUpperCase()} (${billingCycle})`;

            localStorage.setItem('pendingPurchase', JSON.stringify({
                reference,
                plan: selectedPlan,
                billingCycle: billingCycle,
                amount: finalAmount,
                timestamp: Date.now()
            }));

            const isDemoMode = true;

            if (isDemoMode) {
                navigate('/payment-success?demo=true&plan=' + selectedPlan);
            } else {
                const paymentLink = await createWompiPaymentLink(
                    finalAmount,
                    reference,
                    description,
                    userProfile.email || user.email || ''
                );
                window.location.href = paymentLink;
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError('Error al procesar el pago. Intenta nuevamente.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                        🚀 Mejora tu Plan
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Desbloquea todo el potencial de FreelAissistPro
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Plan Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Plan Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* PRO */}
                            <button
                                onClick={() => setSelectedPlan('pro')}
                                className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedPlan === 'pro'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                    }`}
                            >
                                <span className="text-2xl mb-2 block">⚡</span>
                                <h3 className="text-lg font-bold">PRO</h3>
                                <p className="text-sm text-gray-500">Freelancers</p>
                                <p className="mt-2 text-xl font-black text-blue-600">{formatPrice(PLAN_PRICES.pro.monthly)}/mes</p>
                            </button>

                            {/* UNICORN */}
                            <button
                                onClick={() => setSelectedPlan('unicorn')}
                                className={`p-6 rounded-2xl border-2 text-left transition-all relative ${selectedPlan === 'unicorn'
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                    }`}
                            >
                                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                    POPULAR
                                </span>
                                <span className="text-2xl mb-2 block">🦄</span>
                                <h3 className="text-lg font-bold">UNICORN</h3>
                                <p className="text-sm text-gray-500">Agencias</p>
                                <p className="mt-2 text-xl font-black text-purple-600">{formatPrice(PLAN_PRICES.unicorn.monthly)}/mes</p>
                            </button>

                            {/* TEAM */}
                            <button
                                onClick={() => setSelectedPlan('team')}
                                className={`p-6 rounded-2xl border-2 text-left transition-all relative ${selectedPlan === 'team'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                    }`}
                            >
                                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                    NUEVO
                                </span>
                                <span className="text-2xl mb-2 block">👥</span>
                                <h3 className="text-lg font-bold">TEAM</h3>
                                <p className="text-sm text-gray-500">Equipos</p>
                                <p className="mt-2 text-xl font-black text-blue-600">{formatPrice(PLAN_PRICES.team.monthly)}/mes</p>
                                <p className="text-xs text-gray-400 mt-1">+2 miembros</p>
                            </button>
                        </div>

                        {/* Billing Cycle */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                            <h4 className="font-bold mb-4">Ciclo de facturación</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {(['monthly', 'quarterly', 'yearly'] as const).map(cycle => (
                                    <button
                                        key={cycle}
                                        onClick={() => setBillingCycle(cycle)}
                                        className={`p-4 rounded-xl border-2 text-center ${billingCycle === cycle
                                            ? 'border-primary bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <p className="font-bold capitalize">
                                            {cycle === 'monthly' ? 'Mensual' : cycle === 'quarterly' ? 'Trimestral' : 'Anual'}
                                        </p>
                                        {cycle === 'yearly' && (
                                            <span className="text-xs text-emerald-600 font-bold">2 meses gratis</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TEAM Features */}
                        {selectedPlan === 'team' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                                <h4 className="font-bold mb-3 flex items-center gap-2">
                                    <span className="material-icons-round text-blue-600">group</span>
                                    Incluye con Plan TEAM
                                </h4>
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Todo de UNICORN
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Hasta 2 miembros adicionales
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Roles: Admin, Miembro, Viewer
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Permisos granulares por sección
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Gestión de equipo desde Configuración
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 sticky top-8">
                            <h4 className="font-bold text-lg mb-4">Resumen del pedido</h4>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Plan {selectedPlan.toUpperCase()}</span>
                                    <span className="font-bold">{formatPrice(getBasePrice())}</span>
                                </div>
                                {appliedDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Descuento ({appliedDiscount}%)</span>
                                        <span>-{formatPrice(getBasePrice() * appliedDiscount / 100)}</span>
                                    </div>
                                )}
                                <hr className="border-gray-200 dark:border-gray-700" />
                                <div className="flex justify-between text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-black text-primary">{formatPrice(getFinalPrice())}</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    {billingCycle === 'monthly' ? 'Facturado mensualmente' :
                                        billingCycle === 'quarterly' ? 'Facturado cada 3 meses' :
                                            'Facturado anualmente'}
                                </p>
                            </div>

                            {/* Coupon */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Cupón de descuento</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="CODIGO"
                                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={loading}
                                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handlePurchase}
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Procesando...' : 'Suscribirse'}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Pago seguro procesado por Wompi
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
