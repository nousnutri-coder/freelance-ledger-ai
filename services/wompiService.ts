/**
 * =============================================================================
 * WOMPI PAYMENT SERVICE
 * =============================================================================
 * Servicio para integrar el gateway de pagos Wompi (Colombia).
 * Gestiona la creación de payment links y verificación de transacciones.
 * =============================================================================
 */

import { SubscriptionPlan } from '../types';

/**
 * Configuración de Wompi
 */
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = import.meta.env.VITE_WOMPI_PRIVATE_KEY;
const WOMPI_API_URL = 'https://production.wompi.co/v1';
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

/**
 * Precios por plan en centavos de COP
 * Basados en la estrategia de precios definida
 */
export const PLAN_PRICES = {
    pro: {
        monthly: 5000000, // $50,000 COP/mes
        quarterly: 14250000, // $142,500 (5% descuento)
        yearly: 51000000 // $510,000 (2 meses gratis / ~17% descuento)
    },
    unicorn: {
        monthly: 12000000, // $120,000 COP/mes
        quarterly: 34200000, // $342,000 (5% descuento)
        yearly: 122400000 // $1,224,000 (2 meses gratis)
    },
    team: {
        monthly: 20000000, // $200,000 COP/mes
        quarterly: 57000000, // $570,000 (5% descuento)
        yearly: 204000000 // $2,040,000 (2 meses gratis)
    }
};

/**
 * Calcula el precio según el plan y ciclo de facturación
 * @param plan - Plan de suscripción
 * @param cycle - Ciclo de facturación
 * @returns Precio en centavos de COP
 */
export function calculatePrice(
    plan: 'pro' | 'unicorn' | 'team',
    cycle: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
): number {
    return PLAN_PRICES[plan][cycle];
}

/**
 * Aplica descuento de cupón al precio
 * @param price - Precio base en centavos
 * @param couponType - Tipo de cupón
 * @param couponValue - Valor del cupón (porcentaje o meses)
 * @returns Precio con descuento aplicado
 */
export function applyDiscount(
    price: number,
    couponType: 'percentage' | 'free_time' | 'lifetime',
    couponValue: number
): number {
    if (couponType === 'percentage') {
        const discount = price * (couponValue / 100);
        return Math.max(0, price - discount);
    }

    if (couponType === 'lifetime') {
        return 0; // Acceso lifetime es gratis
    }

    // free_time no aplica descuento directo, solo extiende fecha
    return price;
}

/**
 * Genera un payment link de Wompi
 * @param amount - Monto en centavos de COP
 * @param reference - Referencia única del pago (user_id + timestamp)
 * @param description - Descripción del pago
 * @param customerEmail - Email del cliente
 * @returns URL del payment link
 */
export async function createWompiPaymentLink(
    amount: number,
    reference: string,
    description: string,
    customerEmail: string
): Promise<string> {
    try {
        const response = await fetch(`${WOMPI_API_URL}/payment_links`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: description,
                description,
                single_use: true,
                collect_shipping: false,
                amount_in_cents: amount,
                currency: 'COP',
                redirect_url: `${APP_URL}/payment-success`,
                expires_at: addDays(new Date(), 7).toISOString(), // Expira en 7 días
                customer_data: {
                    email: customerEmail,
                    full_name: '',
                    phone_number: ''
                },
                reference
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Wompi error: ${error.error?.type || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.data.permalink;
    } catch (error) {
        console.error('Error creating Wompi payment link:', error);
        throw error;
    }
}

/**
 * Verifica el estado de una transacción en Wompi
 * @param transactionId - ID de la transacción
 * @returns Estado de la transacción
 */
export async function verifyWompiTransaction(
    transactionId: string
): Promise<'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR'> {
    try {
        const response = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
            }
        });

        if (!response.ok) {
            return 'ERROR';
        }

        const data = await response.json();
        return data.data.status;
    } catch (error) {
        console.error('Error verifying Wompi transaction:', error);
        return 'ERROR';
    }
}

/**
 * Obtiene detalles completos de una transacción
 * @param transactionId - ID de la transacción
 * @returns Detalles de la transacción o null si falla
 */
export async function getTransactionDetails(transactionId: string): Promise<any | null> {
    try {
        const response = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${WOMPI_PUBLIC_KEY}`
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        return null;
    }
}

/**
 * Helper: Agrega días a una fecha
 */
function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Genera referencia única para pago
 * @param userId - ID del usuario
 * @param plan - Plan seleccionado
 * @returns Referencia única
 */
export function generatePaymentReference(userId: string, plan: SubscriptionPlan): string {
    const timestamp = Date.now();
    return `${userId}_${plan}_${timestamp}`;
}
