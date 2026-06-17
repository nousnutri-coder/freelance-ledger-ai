import React from 'react';

interface UserAvatarProps {
    name: string;
    imageUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

/**
 * Genera iniciales del nombre del usuario.
 * Toma la primera letra de las primeras dos palabras.
 * Ej: "Juan Pérez" -> "JP", "María" -> "M"
 */
const getInitials = (name: string): string => {
    if (!name || name.trim() === '') return '?';

    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
};

/**
 * Genera un color de fondo consistente basado en el nombre
 */
const getBackgroundColor = (name: string): string => {
    const colors = [
        'bg-emerald-600',
        'bg-blue-600',
        'bg-purple-600',
        'bg-pink-600',
        'bg-orange-600',
        'bg-teal-600',
        'bg-indigo-600',
        'bg-rose-600',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name, imageUrl, size = 'md', className = '' }) => {
    const sizeClass = sizeClasses[size];
    const initials = getInitials(name);
    const bgColor = getBackgroundColor(name);

    // Si hay imagen válida (no es placeholder ni /vite.svg)
    const hasValidImage = imageUrl &&
        !imageUrl.includes('ui-avatars.com') &&
        !imageUrl.includes('vite.svg') &&
        imageUrl.trim() !== '';

    if (hasValidImage) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`${sizeClass} rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${className}`}
            />
        );
    }

    // Mostrar iniciales con fondo de color
    return (
        <div
            className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white dark:ring-slate-800 ${className}`}
            title={name}
        >
            {initials}
        </div>
    );
};

export default UserAvatar;
