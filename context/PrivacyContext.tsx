
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PrivacyContextType {
    isIncognito: boolean;
    toggleIncognito: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isIncognito, setIsIncognito] = useState(() => {
        const saved = localStorage.getItem('privacy_incognito');
        return saved === 'true';
    });

    const toggleIncognito = () => {
        setIsIncognito((prev) => {
            const newVal = !prev;
            localStorage.setItem('privacy_incognito', String(newVal));
            return newVal;
        });
    };

    return (
        <PrivacyContext.Provider value={{ isIncognito, toggleIncognito }}>
            {children}
        </PrivacyContext.Provider>
    );
};

export const usePrivacy = () => {
    const context = useContext(PrivacyContext);
    if (context === undefined) {
        throw new Error('usePrivacy must be used within a PrivacyProvider');
    }
    return context;
};
