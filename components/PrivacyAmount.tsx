
import React from 'react';
import { usePrivacy } from '../context/PrivacyContext';

interface PrivacyAmountProps {
    amount: number | string;
    currency?: string;
    className?: string;
    formatter?: (val: any) => string;
}

const PrivacyAmount: React.FC<PrivacyAmountProps> = ({ amount, currency, className, formatter }) => {
    const { isIncognito } = usePrivacy();

    const formatValue = (val: any) => {
        if (formatter) return formatter(val);

        // Default simple formatter if none provided
        if (typeof val === 'number') {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: currency || 'COP',
                maximumFractionDigits: 0
            }).format(val);
        }
        return val;
    };

    if (isIncognito) {
        return (
            <span className={`${className} blur-md transition-all duration-300 select-none`} title="Modo Incógnito Activado">
                {formatValue(amount)}
            </span>
        );
    }

    return <span className={className}>{formatValue(amount)}</span>;
};

export default PrivacyAmount;
