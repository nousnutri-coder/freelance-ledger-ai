/**
 * =============================================================================
 * SUBSCRIPTION MANAGEMENT SERVICE
 * =============================================================================
 * Servicio para gestionar las suscripciones de usuarios en Supabase.
 * Incluye creación, actualización, verificación y downgrade automático.
 * =============================================================================
 */

import { supabase } from './supabaseClient';
import { UserSubscription, SubscriptionPlan, SubscriptionStatus } from '../types';

/**
 * Obtiene la suscripción actual del usuario desde Supabase
 * @param userId - ID del usuario autenticado
 * @returns Suscripción del usuario o null si no existe
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`
        *,
        applied_coupons (*),
        plan_history (*)
      `)
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            console.warn('No subscription found for user:', userId);
            return null;
        }

        // Convertir formato de Supabase a UserSubscription
        return {
            id: data.id,
            currentPlan: data.current_plan,
            status: data.status,
            startDate: data.start_date,
            renewalDate: data.renewal_date,
            lastBillingDate: data.last_billing_date,
            billingCycle: data.billing_cycle,
            wompiTransactionId: data.wompi_transaction_id,
            appliedCoupon: data.applied_coupons?.[0] ? {
                code: data.applied_coupons[0].coupon_code,
                type: data.applied_coupons[0].type,
                value: data.applied_coupons[0].value,
                appliedDate: data.applied_coupons[0].applied_date,
                expiryDate: data.applied_coupons[0].expiry_date
            } : undefined,
            planHistory: data.plan_history?.map((h: any) => ({
                fromPlan: h.from_plan,
                toPlan: h.to_plan,
                changeDate: h.change_date,
                reason: h.reason
            })) || []
        };
    } catch (error) {
        console.error('Error fetching user subscription:', error);
        return null;
    }
}

/**
 * Crea suscripción Free por defecto para nuevos usuarios
 * @param userId - ID del usuario
 */
export async function createFreeSubscription(userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                current_plan: 'free',
                status: 'active',
                start_date: new Date().toISOString(),
                renewal_date: null // Free nunca expira
            });

        if (error) {
            throw error;
        }

        console.log('✅ Free subscription created for user:', userId);
    } catch (error) {
        console.error('Error creating free subscription:', error);
        throw error;
    }
}

/**
 * Actualiza el plan de suscripción del usuario
 * @param userId - ID del usuario
 * @param newPlan - Nuevo plan
 * @param billingCycle - Ciclo de facturación
 * @param wompiTransactionId - ID de transacción de Wompi
 */
export async function updateUserPlan(
    userId: string,
    newPlan: SubscriptionPlan,
    billingCycle?: 'monthly' | 'quarterly' | 'yearly',
    wompiTransactionId?: string
): Promise<void> {
    try {
        // Obtener suscripción actual
        let currentSub = await getUserSubscription(userId);

        // Si no existe suscripción, crear una FREE primero
        if (!currentSub) {
            console.log('No subscription found, creating FREE subscription first...');
            await createFreeSubscription(userId);
            currentSub = await getUserSubscription(userId);

            if (!currentSub) {
                throw new Error('Failed to create subscription for user');
            }
        }

        // Calcular fecha de renovación
        const renewalDate = newPlan === 'lifetime' || newPlan === 'free'
            ? null
            : calculateRenewalDate(billingCycle || 'monthly');

        // Actualizar suscripción
        console.log('[updateUserPlan] Updating subscription for user:', userId, 'to plan:', newPlan);
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                current_plan: newPlan,
                status: 'active',
                renewal_date: renewalDate,
                billing_cycle: billingCycle,
                wompi_transaction_id: wompiTransactionId,
                last_billing_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (updateError) {
            console.error('[updateUserPlan] ERROR updating subscription:', updateError);
            throw updateError;
        }

        console.log('[updateUserPlan] ✅ Successfully updated subscription to:', newPlan);

        // Registrar en historial
        await supabase
            .from('plan_history')
            .insert({
                subscription_id: currentSub.id,
                from_plan: currentSub.currentPlan,
                to_plan: newPlan,
                change_date: new Date().toISOString(),
                reason: isPlanUpgrade(newPlan, currentSub.currentPlan) ? 'upgrade' : 'downgrade'
            });

        console.log(`✅ Plan updated: ${currentSub.currentPlan} → ${newPlan}`);
    } catch (error) {
        console.error('Error updating user plan:', error);
        throw error;
    }
}

/**
 * Calcula fecha de renovación según ciclo de facturación
 * @param cycle - Ciclo de facturación
 * @returns Fecha ISO de renovación
 */
function calculateRenewalDate(cycle: 'monthly' | 'quarterly' | 'yearly'): string {
    const today = new Date();

    switch (cycle) {
        case 'monthly':
            today.setMonth(today.getMonth() + 1);
            break;
        case 'quarterly':
            today.setMonth(today.getMonth() + 3);
            break;
        case 'yearly':
            today.setFullYear(today.getFullYear() + 1);
            break;
    }

    return today.toISOString();
}

/**
 * Verifica si un plan es superior a otro
 */
function isPlanUpgrade(newPlan: SubscriptionPlan, oldPlan: SubscriptionPlan): boolean {
    const hierarchy: Record<SubscriptionPlan, number> = {
        free: 0,
        pro: 1,
        unicorn: 2,
        lifetime: 3
    };

    return hierarchy[newPlan] > hierarchy[oldPlan];
}

/**
 * Marca suscripción como en período de gracia (pago fallido)
 * @param userId - ID del usuario
 */
export async function setGracePeriod(userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('subscriptions')
            .update({
                status: 'grace_period',
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) {
            throw error;
        }

        console.log(`⚠️ User ${userId} entered grace period`);
    } catch (error) {
        console.error('Error setting grace period:', error);
        throw error;
    }
}

/**
 * Ejecuta downgrade a Free si la suscripción expiró
 * @param userId - ID del usuario
 */
export async function downgradeExpiredSubscription(userId: string): Promise<void> {
    try {
        const subscription = await getUserSubscription(userId);

        if (!subscription) return;

        // No downgrade si es Free o Lifetime
        if (subscription.currentPlan === 'free' || subscription.currentPlan === 'lifetime') {
            return;
        }

        const now = new Date();
        const renewalDate = subscription.renewalDate ? new Date(subscription.renewalDate) : null;

        // Si pasó la fecha de renovación y está en estado expirado
        if (renewalDate && now > renewalDate && subscription.status === 'expired') {
            await updateUserPlan(userId, 'free');

            // Registrar razón de downgrade
            await supabase
                .from('plan_history')
                .insert({
                    subscription_id: subscription.id,
                    from_plan: subscription.currentPlan,
                    to_plan: 'free',
                    change_date: new Date().toISOString(),
                    reason: 'expired'
                });

            console.log(`📉 User ${userId} downgraded to Free due to expiration`);
        }
    } catch (error) {
        console.error('Error downgrading expired subscription:', error);
        throw error;
    }
}

/**
 * Verifica y actualiza suscripciones expiradas (para ejecutar en cron job)
 */
export async function checkAllExpiredSubscriptions(): Promise<void> {
    try {
        const { data: expiredSubs, error } = await supabase
            .from('subscriptions')
            .select('user_id, renewal_date')
            .eq('status', 'expired')
            .not('renewal_date', 'is', null)
            .lt('renewal_date', new Date().toISOString());

        if (error) {
            throw error;
        }

        if (expiredSubs && expiredSubs.length > 0) {
            console.log(`🔍 Found ${expiredSubs.length} expired subscriptions to downgrade`);

            for (const sub of expiredSubs) {
                await downgradeExpiredSubscription(sub.user_id);
            }
        }
    } catch (error) {
        console.error('Error checking expired subscriptions:', error);
    }
}

/**
 * Valida un cupón sin requerir suscripción (para uso en checkout)
 * @param couponCode - Código del cupón
 * @returns Objeto con resultado de la validación
 */
export async function validateCoupon(couponCode: string, userId?: string): Promise<{
    valid: boolean;
    discount?: number;
    type?: 'percentage' | 'fixed' | 'free_time' | 'lifetime';
    message: string;
}> {
    try {
        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('is_active', true)
            .single();

        if (couponError || !coupon) {
            return { valid: false, message: 'Cupón inválido o no encontrado' };
        }

        // Verificar si no ha expirado
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return { valid: false, message: 'Este cupón ha expirado' };
        }


        // Verificar usos restantes
        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return { valid: false, message: 'Este cupón ya alcanzó su límite de usos' };
        }

        // Verificar si el usuario ya usó este cupón
        if (userId) {
            const subscription = await getUserSubscription(userId);
            if (subscription) {
                const { data: usedCoupon } = await supabase
                    .from('applied_coupons')
                    .select('id')
                    .eq('subscription_id', subscription.id)
                    .eq('coupon_code', couponCode.toUpperCase())
                    .maybeSingle();

                if (usedCoupon) {
                    return { valid: false, message: 'Ya has usado este cupón anteriormente' };
                }
            }
        }

        return {
            valid: true,
            discount: coupon.value,
            type: coupon.type,
            message: coupon.type === 'percentage'
                ? `¡${coupon.value}% de descuento aplicado!`
                : coupon.type === 'lifetime'
                    ? '¡Acceso Lifetime desbloqueado!'
                    : coupon.type === 'free_time'
                        ? `¡${coupon.value} mes(es) gratis aplicado!`
                        : `¡Descuento de $${coupon.value.toLocaleString()} aplicado!`
        };
    } catch (error) {
        console.error('Error validating coupon:', error);
        return { valid: false, message: 'Error al validar el cupón' };
    }
}

/**
 * Aplica cupón a una suscripción
 * @param userId - ID del usuario
 * @param couponCode - Código del cupón
 * @returns Objeto con resultado de la aplicación del cupón
 */
export async function applyCoupon(userId: string, couponCode: string): Promise<{
    success: boolean;
    discount?: number;
    type?: 'percentage' | 'fixed' | 'free_time' | 'lifetime';
    message: string;
}> {
    try {
        // Verificar que el cupón existe y es válido
        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('is_active', true)
            .single();

        if (couponError || !coupon) {
            return { success: false, message: 'Cupón inválido o no encontrado' };
        }

        // Verificar si no ha expirado
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return { success: false, message: 'Este cupón ha expirado' };
        }

        // Verificar usos restantes
        if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
            return { success: false, message: 'Este cupón ya alcanzó su límite de usos' };
        }

        const subscription = await getUserSubscription(userId);
        if (!subscription) {
            return { success: false, message: 'No tienes una suscripción activa' };
        }

        // Registrar cupón aplicado
        await supabase
            .from('applied_coupons')
            .insert({
                subscription_id: subscription.id,
                coupon_code: couponCode.toUpperCase(),
                type: coupon.type,
                value: coupon.value,
                applied_date: new Date().toISOString(),
                expiry_date: coupon.expiry_date
            });

        // Incrementar contador de usos
        await supabase
            .from('coupons')
            .update({ used_count: coupon.used_count + 1 })
            .eq('code', couponCode.toUpperCase());

        console.log(`✅ Coupon ${couponCode} applied to user ${userId}`);

        // Retornar información del descuento
        return {
            success: true,
            discount: coupon.value,
            type: coupon.type,
            message: coupon.type === 'percentage'
                ? `¡${coupon.value}% de descuento aplicado!`
                : coupon.type === 'lifetime'
                    ? '¡Acceso Lifetime desbloqueado!'
                    : coupon.type === 'free_time'
                        ? `¡${coupon.value} mes(es) gratis aplicado!`
                        : `¡Descuento de $${coupon.value.toLocaleString()} aplicado!`
        };
    } catch (error) {
        console.error('Error applying coupon:', error);
        return { success: false, message: 'Error al aplicar el cupón' };
    }
}

/**
 * Registra un cupón aplicado en la BD para evitar reuso
 * @param subscriptionId - ID de la suscripción
 * @param couponCode - Código del cupón
 * @param couponType - Tipo de cupón
 * @param value - Valor del cupón
 */
export async function recordAppliedCoupon(
    subscriptionId: string,
    couponCode: string,
    couponType: string,
    value: number
): Promise<void> {
    try {
        const { error } = await supabase
            .from('applied_coupons')
            .insert({
                subscription_id: subscriptionId,
                coupon_code: couponCode.toUpperCase(),
                type: couponType,
                value: value
            });

        if (error) {
            console.error('Error recording applied coupon:', error);
            throw error;
        }

        console.log('✅ Coupon recorded:', couponCode);
    } catch (error) {
        console.error('Error in recordAppliedCoupon:', error);
        throw error;
    }
}

/**
 * Activa el trial de 7 días PRO para un usuario
 * @param userId - ID del usuario
 * @throws Error si el usuario ya usó su trial
 */
export async function activateTrial(userId: string): Promise<void> {
    try {
        // 1. Verificar que el usuario no haya usado su trial
        const { data: profile } = await supabase
            .from('profiles')
            .select('has_used_trial')
            .eq('id', userId)
            .single();

        if (profile?.has_used_trial) {
            throw new Error('Ya has usado tu trial gratuito de 7 días');
        }

        // 2. Obtener o crear suscripción
        let subscription = await getUserSubscription(userId);
        if (!subscription) {
            await createFreeSubscription(userId);
            subscription = await getUserSubscription(userId);
            if (!subscription) {
                throw new Error('No se pudo crear la suscripción');
            }
        }

        // 3. Calcular fecha de expiración del trial (7 días)
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);

        // 4. Actualizar suscripción a PRO con estado 'trial'
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
                current_plan: 'pro',
                status: 'trial',
                renewal_date: trialEnd.toISOString(),
                billing_cycle: null,
                wompi_transaction_id: 'TRIAL_7_DAYS',
                last_billing_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (updateError) {
            console.error('Error updating subscription for trial:', updateError);
            throw updateError;
        }

        // 5. Marcar trial como usado en el perfil
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ has_used_trial: true })
            .eq('id', userId);

        if (profileError) {
            console.error('Error marking trial as used:', profileError);
            throw profileError;
        }

        // 6. Registrar en historial
        await supabase
            .from('plan_history')
            .insert({
                subscription_id: subscription.id,
                from_plan: 'free',
                to_plan: 'pro',
                reason: 'upgrade'
            });

        console.log('✅ Trial activado exitosamente para usuario:', userId);
        console.log('   Expira:', trialEnd.toISOString());
    } catch (error) {
        console.error('Error activating trial:', error);
        throw error;
    }
}

/**
 * Verifica y procesa trials expirados
 * Llama esto al cargar el perfil del usuario
 * @param userId - ID del usuario
 * @param userProfile - Perfil del usuario
 */
export async function checkExpiredTrial(userId: string, currentPlan: string, subscriptionStatus: string, renewalDate: string | null): Promise<boolean> {
    try {
        // Solo procesar si está en trial
        if (currentPlan !== 'pro' || subscriptionStatus !== 'trial') {
            return false;
        }

        // Verificar si el trial expiró
        if (!renewalDate || new Date(renewalDate) > new Date()) {
            return false; // Trial aún vigente
        }

        // Trial expirado, downgrade a FREE
        console.log('[checkExpiredTrial] Trial expirado, downgrading a FREE...');
        await updateUserPlan(userId, 'free');

        return true; // Se hizo downgrade
    } catch (error) {
        console.error('Error checking expired trial:', error);
        return false;
    }
}

