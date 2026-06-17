import React from 'react';
import { SubscriptionPlan } from '../types';
import { Link } from 'react-router-dom';

interface SubscriptionBadgeProps {
    plan: SubscriptionPlan;
    onClick?: () => void;
    showUpgradeHint?: boolean;
}

const planConfig: Record<SubscriptionPlan, {
    label: string;
    icon: string;
    colors: string;
    bgGradient: string;
    description: string;
}> = {
    free: {
        label: 'FREE',
        icon: '🌱',
        colors: 'text-gray-600 dark:text-gray-300',
        bgGradient: 'from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800',
        description: 'Plan gratuito'
    },
    pro: {
        label: 'PRO',
        icon: '⚡',
        colors: 'text-blue-600 dark:text-blue-400',
        bgGradient: 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
        description: 'Freelancer profesional'
    },
    unicorn: {
        label: 'UNICORN',
        icon: '🦄',
        colors: 'text-purple-600 dark:text-purple-400',
        bgGradient: 'from-purple-100 via-pink-100 to-purple-200 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-purple-800/30',
        description: 'Agencia & Equipos'
    },
    lifetime: {
        label: 'LIFETIME',
        icon: '💎',
        colors: 'text-emerald-600 dark:text-emerald-400',
        bgGradient: 'from-emerald-100 via-teal-100 to-emerald-200 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-emerald-800/30',
        description: 'Acceso de por vida'
    }
};

const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ plan, onClick, showUpgradeHint = true }) => {
    const config = planConfig[plan] || planConfig.free;
    const isFree = plan === 'free';

    return (
        <Link
            to="/settings"
            onClick={onClick}
            className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                bg-gradient-to-r ${config.bgGradient}
                border border-white/50 dark:border-white/10
                shadow-sm hover:shadow-md transition-all duration-300
                group cursor-pointer
            `}
            title={config.description}
        >
            <span className="text-sm">{config.icon}</span>
            <span className={`text-xs font-black tracking-wider ${config.colors}`}>
                {config.label}
            </span>
            {isFree && showUpgradeHint && (
                <span className="text-[10px] font-bold text-orange-500 animate-pulse hidden group-hover:inline">
                    Upgrade
                </span>
            )}
        </Link>
    );
};

export default SubscriptionBadge;
