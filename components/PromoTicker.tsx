import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SubscriptionPlan } from '../types';

interface PromoTickerProps {
    userPlan: SubscriptionPlan;
    userName?: string;
}

// Mensajes para usuarios FREE - incitan a mejorar plan
const FREE_MESSAGES = [
    { text: '🚀 ¡Mejora a PRO y desbloquea clientes ilimitados!', link: '/checkout', cta: 'Mejorar ahora' },
    { text: '💡 Tip: Registra tus gastos diariamente para un mejor control financiero', link: null, cta: null },
    { text: '🦄 Los usuarios UNICORN ahorran 4+ horas por semana con IA avanzada', link: '/checkout', cta: 'Ver planes' },
    { text: '📊 Tip: Usa el panel de Salud Financiera para monitorear tu progreso', link: '/health', cta: 'Ver Salud' },
    { text: '⚡ ¡Oferta especial! Usa el código LAUNCH70 para 70% de descuento', link: '/checkout', cta: 'Aplicar' },
    { text: '🎯 Tip: Organiza tus proyectos en el Kanban para mayor productividad', link: '/kanban', cta: 'Ver Kanban' },
    { text: '💎 Acceso LIFETIME disponible - Paga una vez, usa para siempre', link: '/checkout', cta: 'Ver oferta' },
    { text: '📈 Tip: Revisa tus transacciones semanalmente para detectar patrones', link: '/transactions', cta: 'Ver' },
];

// Mensajes para usuarios PRO - tips y funciones avanzadas
const PRO_MESSAGES = [
    { text: '⚡ Tip PRO: Usa la IA para generar cotizaciones profesionales en segundos', link: '/quotations', cta: 'Crear' },
    { text: '📊 Tip PRO: El calendario te ayuda a nunca perder una fecha de cobro', link: '/calendar', cta: 'Ver' },
    { text: '🦄 ¡Mejora a UNICORN para multi-usuario y exportación a CRM!', link: '/checkout', cta: 'Mejorar' },
    { text: '💡 Tip PRO: Sube tu perfil de empresa para cotizaciones personalizadas', link: '/settings', cta: 'Configurar' },
    { text: '🚀 Tip PRO: Usa filtros en transacciones para análisis detallado', link: '/transactions', cta: 'Explorar' },
    { text: '📈 Tip PRO: Revisa tu Runway financiero en Inteligencia', link: '/intelligence', cta: 'Ver' },
];

// Mensajes para usuarios UNICORN - tips premium
const UNICORN_MESSAGES = [
    { text: '🦄 Tip UNICORN: Invita a tu equipo para colaborar en proyectos', link: '/settings', cta: 'Invitar' },
    { text: '💎 ¡Gracias por ser UNICORN! Tu apoyo hace posible FreelAissistPro', link: null, cta: null },
    { text: '🚀 Tip UNICORN: Exporta datos a tu CRM favorito con un clic', link: '/clients', cta: 'Exportar' },
    { text: '📊 Tip UNICORN: Los reportes avanzados te dan insights únicos', link: '/intelligence', cta: 'Ver' },
    { text: '⚡ Tip UNICORN: Automatiza recordatorios de cobro desde Calendario', link: '/calendar', cta: 'Configurar' },
    { text: '💡 ¿Sabías que puedes personalizar tu marca en las cotizaciones?', link: '/settings', cta: 'Personalizar' },
];

// Mensajes para usuarios LIFETIME
const LIFETIME_MESSAGES = [
    { text: '💎 ¡Eres LIFETIME! Acceso de por vida a todas las funciones', link: null, cta: null },
    { text: '🏆 Gracias por creer en FreelAissistPro desde el inicio', link: null, cta: null },
    { text: '⚡ Tip LIFETIME: Todas las nuevas funciones son tuyas automáticamente', link: null, cta: null },
    { text: '🚀 Tip: Explora las funciones de IA avanzada para maximizar tu tiempo', link: '/intelligence', cta: 'Explorar' },
    { text: '💡 Tip: Mantén tu perfil de empresa actualizado para mejores cotizaciones', link: '/settings', cta: 'Actualizar' },
    { text: '📈 Tip: El resumen financiero te ayuda a tomar mejores decisiones', link: '/health', cta: 'Ver' },
];

const PromoTicker: React.FC<PromoTickerProps> = ({ userPlan, userName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Seleccionar mensajes según el plan
    const getMessages = () => {
        switch (userPlan) {
            case 'pro':
                return PRO_MESSAGES;
            case 'unicorn':
                return UNICORN_MESSAGES;
            case 'lifetime':
                return LIFETIME_MESSAGES;
            default:
                return FREE_MESSAGES;
        }
    };

    const messages = getMessages();

    // Rotar mensajes cada 8 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [messages.length]);

    const currentMessage = messages[currentIndex];

    // Colores según el plan
    const getBgColor = () => {
        switch (userPlan) {
            case 'pro':
                return 'bg-gradient-to-r from-blue-600 to-blue-500';
            case 'unicorn':
                return 'bg-gradient-to-r from-purple-600 to-pink-500';
            case 'lifetime':
                return 'bg-gradient-to-r from-amber-500 to-yellow-400';
            default:
                return 'bg-gradient-to-r from-emerald-600 to-emerald-500';
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`${getBgColor()} text-white text-xs font-medium py-2 px-4 relative overflow-hidden no-print`}>
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
                {/* Animated text */}
                <div className="flex-1 text-center animate-pulse-subtle">
                    <span className="inline-flex items-center gap-2">
                        {currentMessage.text}
                        {currentMessage.link && currentMessage.cta && (
                            <Link
                                to={currentMessage.link}
                                className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full font-bold transition-all text-[11px] uppercase tracking-wide"
                            >
                                {currentMessage.cta} →
                            </Link>
                        )}
                    </span>
                </div>

                {/* Close button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-all opacity-50 hover:opacity-100"
                    title="Cerrar"
                >
                    <span className="material-icons-round text-sm">close</span>
                </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 w-full">
                <div
                    className="h-full bg-white/60 transition-all duration-[8000ms] ease-linear"
                    style={{
                        width: '100%',
                        animation: 'shrink 8s linear infinite'
                    }}
                />
            </div>

            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s ease-in-out infinite;
                }
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.85; }
                }
            `}</style>
        </div>
    );
};

export default PromoTicker;
