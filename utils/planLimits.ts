import { SubscriptionPlan, PlanLimits } from '../types';

/**
 * Límites de funcionalidades por plan de suscripción
 */
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
    free: {
        maxClients: 3,
        maxQuotationsPerMonth: 5,
        fullAIAccess: false,
        maxCompanyDNAProfiles: 0,
        maxSignatures: 1,
        hasWatermark: true,
        advancedAI: false
    },
    pro: {
        maxClients: null, // Ilimitado
        maxQuotationsPerMonth: null,
        fullAIAccess: true,
        maxCompanyDNAProfiles: 1,
        maxSignatures: 1,
        hasWatermark: false,
        advancedAI: false
    },
    unicorn: {
        maxClients: null,
        maxQuotationsPerMonth: null,
        fullAIAccess: true,
        maxCompanyDNAProfiles: 999, // Efectivamente ilimitado
        maxSignatures: 3,
        hasWatermark: false,
        advancedAI: true
    },
    team: {
        // Mismo que Unicorn + gestión de equipo
        maxClients: null,
        maxQuotationsPerMonth: null,
        fullAIAccess: true,
        maxCompanyDNAProfiles: 999,
        maxSignatures: 5,
        hasWatermark: false,
        advancedAI: true
    }
};

/**
 * Verifica si el usuario puede realizar una acción según su plan
 * @param currentPlan - Plan actual del usuario
 * @param action - Acción que se quiere verificar
 * @param currentUsage - Uso actual (para comparar con límites numéricos)
 * @returns true si puede realizar la acción, false si está limitado
 */
export function canUserPerformAction(
    currentPlan: SubscriptionPlan,
    action: keyof PlanLimits,
    currentUsage?: number
): boolean {
    const limits = PLAN_LIMITS[currentPlan];
    const limit = limits[action];

    // Si es booleano, devolver directamente
    if (typeof limit === 'boolean') {
        return limit;
    }

    // Si es null, es ilimitado
    if (limit === null) {
        return true;
    }

    // Si hay límite numérico, comparar con uso actual
    if (typeof limit === 'number' && currentUsage !== undefined) {
        return currentUsage < limit;
    }

    return false;
}

/**
 * Obtiene el plan con feature checking
 * @param currentPlan - Plan actual
 * @returns Límites del plan
 */
export function getPlanLimits(currentPlan: SubscriptionPlan): PlanLimits {
    return PLAN_LIMITS[currentPlan];
}

/**
 * Verifica si un plan es superior a otro
 * @param planA - Primer plan
 * @param planB - Segundo plan
 * @returns true si planA es superior a planB
 */
export function isPlanUpgrade(planA: SubscriptionPlan, planB: SubscriptionPlan): boolean {
    const hierarchy: Record<SubscriptionPlan, number> = {
        free: 0,
        pro: 1,
        unicorn: 2,
        team: 3
    };

    return hierarchy[planA] > hierarchy[planB];
}
