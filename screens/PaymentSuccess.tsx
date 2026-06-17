import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyWompiTransaction, getTransactionDetails } from '../services/wompiService';
import { updateUserPlan, getUserSubscription } from '../services/subscriptionService';
import { sendSubscriptionConfirmation, sendPaymentReceipt } from '../services/emailService';
import { SubscriptionPlan, UserProfile } from '../types';

const PaymentSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, refreshProfile } = useAuth();

    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
    const [message, setMessage] = useState('Verificando tu pago...');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Check if this is demo mode
                const isDemo = searchParams.get('demo') === 'true';
                const demoPlan = searchParams.get('plan');

                // Get pending purchase info from localStorage
                const pendingPurchase = localStorage.getItem('pendingPurchase');
                let purchaseInfo: any = null;

                if (pendingPurchase) {
                    purchaseInfo = JSON.parse(pendingPurchase);
                }

                // DEMO MODE: Simulate successful payment
                if (isDemo && user) {
                    const plan = (demoPlan || purchaseInfo?.plan || 'pro') as SubscriptionPlan;
                    const billingCycle = (purchaseInfo?.billingCycle || 'monthly');

                    // Update subscription in database
                    try {
                        await updateUserPlan(user.id, plan, billingCycle, 'DEMO_' + Date.now());
                        // Wait a bit for DB to persist
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // Send welcome + receipt emails
                        const userEmail = user.email || '';
                        const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
                        const pendingAmount = purchaseInfo?.amount || 0;

                        Promise.all([
                            sendSubscriptionConfirmation(userEmail, displayName, plan, billingCycle),
                            sendPaymentReceipt(userEmail, displayName, plan, pendingAmount, 'DEMO_' + Date.now(), billingCycle)
                        ]).then(([subOk, receiptOk]) => {
                            console.log(`📧 Emails: sub=${subOk}, receipt=${receiptOk}`);
                        });

                        await refreshProfile();
                        // Force another refresh to ensure it updates
                        await new Promise(resolve => setTimeout(resolve, 300));
                        await refreshProfile();
                    } catch (updateError) {
                        console.warn('Could not update subscription (table may not exist):', updateError);
                    }

                    // Clean up
                    localStorage.removeItem('pendingPurchase');

                    setStatus('success');
                    setMessage(plan === 'team'
                        ? '¡Felicidades! Ahora tienes acceso TEAM!'
                        : `¡Tu suscripción ${plan.toUpperCase()} está activa!`
                    );
                    return;
                }

                // Get transaction ID from URL (Wompi redirects with ?id=...)
                const transactionId = searchParams.get('id');

                if (!transactionId && !pendingPurchase) {
                    setStatus('error');
                    setMessage('No se encontró información del pago.');
                    return;
                }

                // Verify with Wompi if we have transaction ID
                if (transactionId) {
                    const txStatus = await verifyWompiTransaction(transactionId);

                    if (txStatus === 'APPROVED') {
                        // Payment successful - update subscription
                        if (user && purchaseInfo) {
                            const plan = purchaseInfo.plan as SubscriptionPlan;
                            const billingCycle = purchaseInfo.billingCycle;

                            await updateUserPlan(
                                user.id,
                                plan,
                                billingCycle,
                                transactionId
                            );

                            // Send welcome + receipt emails
                            const userEmail = user.email || '';
                            const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';

                            Promise.all([
                                sendSubscriptionConfirmation(userEmail, displayName, plan, billingCycle),
                                sendPaymentReceipt(userEmail, displayName, plan, purchaseInfo.amount || 0, transactionId, billingCycle)
                            ]).then(([subOk, receiptOk]) => {
                                console.log(`📧 Emails: sub=${subOk}, receipt=${receiptOk}`);
                            });

                            // Refresh user profile to get updated subscription
                            await refreshProfile();
                        }

                        // Clean up
                        localStorage.removeItem('pendingPurchase');

                        setStatus('success');
                        setMessage(purchaseInfo?.plan === 'team'
                            ? '¡Felicidades! Ahora tienes acceso TEAM a FreelAissistPro.'
                            : `¡Tu suscripción ${purchaseInfo?.plan?.toUpperCase()} está activa!`
                        );
                    } else if (txStatus === 'PENDING') {
                        setStatus('loading');
                        setMessage('Tu pago está siendo procesado. Esto puede tomar unos minutos.');
                    } else {
                        setStatus('failed');
                        setMessage('El pago no fue aprobado. Por favor, intenta nuevamente.');
                        localStorage.removeItem('pendingPurchase');
                    }
                } else {
                    // No transaction ID - check if we're waiting
                    setStatus('error');
                    setMessage('No se pudo verificar el pago. Contacta soporte si el problema persiste.');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                setMessage('Error verificando el pago. Por favor contacta a soporte.');
            }
        };

        // Small delay to allow processing
        const timer = setTimeout(verifyPayment, 1500);
        return () => clearTimeout(timer);
    }, [searchParams, user, refreshProfile]);

    const getIcon = () => {
        switch (status) {
            case 'success':
                return <span className="text-6xl">🎉</span>;
            case 'failed':
                return <span className="text-6xl">😔</span>;
            case 'error':
                return <span className="text-6xl">⚠️</span>;
            default:
                return <span className="material-icons-round animate-spin text-6xl text-primary">refresh</span>;
        }
    };

    const getBgColor = () => {
        switch (status) {
            case 'success':
                return 'from-emerald-500/10 to-emerald-600/5';
            case 'failed':
            case 'error':
                return 'from-red-500/10 to-red-600/5';
            default:
                return 'from-blue-500/10 to-blue-600/5';
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getBgColor()} px-4`}>
            <div className="max-w-md w-full bg-white dark:bg-surface-dark rounded-3xl shadow-2xl p-10 text-center">
                <div className="mb-6">
                    {getIcon()}
                </div>

                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                    {status === 'success' && '¡Pago Exitoso!'}
                    {status === 'failed' && 'Pago Rechazado'}
                    {status === 'error' && 'Error'}
                    {status === 'loading' && 'Procesando...'}
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    {message}
                </p>

                {status === 'success' && (
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Ir al Dashboard
                        </button>
                        <p className="text-xs text-gray-500">
                            Tu recibo ha sido enviado a tu correo.
                        </p>
                    </div>
                )}

                {(status === 'failed' || status === 'error') && (
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold rounded-xl"
                        >
                            Intentar de nuevo
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3 text-gray-500 font-medium"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                )}

                {status === 'loading' && (
                    <p className="text-sm text-gray-500 animate-pulse">
                        No cierres esta ventana...
                    </p>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
