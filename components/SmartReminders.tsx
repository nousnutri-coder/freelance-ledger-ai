
import React from 'react';
import { CalendarEvent, Client, Quotation } from '../types';

interface SmartRemindersProps {
    events: CalendarEvent[];
    clients: Client[];
    quotations: Quotation[];
    onAddReminder: (e: Omit<CalendarEvent, 'id'>) => void;
    currency: string;
}

const SmartReminders: React.FC<SmartRemindersProps> = ({ events, clients, quotations, onAddReminder, currency }) => {
    const pendingReminders = events.filter(e => e.type === 'reminder' && !e.completed);

    // Agrupar por categoría
    const paymentReminders = pendingReminders.filter(r => r.reminderCategory === 'payment-collection');
    const subscriptionReminders = pendingReminders.filter(r => r.reminderCategory === 'subscription-cancel');
    const followUpReminders = pendingReminders.filter(r => r.reminderCategory === 'follow-up');
    const taxReminders = pendingReminders.filter(r => r.reminderCategory === 'tax-deadline');
    const otherReminders = pendingReminders.filter(r => !r.reminderCategory || r.reminderCategory === 'other');

    // Sugerir recordatorios basados en cotizaciones aceptadas
    const suggestedPaymentReminders = quotations
        .filter(q => q.status === 'accepted' && !events.some(e => e.clientId === q.clientId && e.reminderCategory === 'payment-collection'))
        .slice(0, 3);

    const categoryIcon = (category?: string) => {
        switch (category) {
            case 'payment-collection': return 'payments';
            case 'subscription-cancel': return 'cancel';
            case 'follow-up': return 'call';
            case 'tax-deadline': return 'receipt_long';
            case 'contract-renewal': return 'sync';
            default: return 'notifications';
        }
    };

    const categoryColor = (category?: string) => {
        switch (category) {
            case 'payment-collection': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
            case 'subscription-cancel': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
            case 'follow-up': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
            case 'tax-deadline': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
            default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const formatAmount = (amount: number) => {
        return `${currency} ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-[40px] shadow-soft border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recordatorios Inteligentes</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gestiona cobros, suscripciones y seguimientos</p>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <span className="material-icons-round text-primary text-lg">notifications_active</span>
                    <span className="text-sm font-black text-primary">{pendingReminders.length}</span>
                </div>
            </div>

            {/* Sugerencias de IA */}
            {suggestedPaymentReminders.length > 0 && (
                <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-3xl border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="material-icons-round text-purple-600 dark:text-purple-400">auto_awesome</span>
                        <div>
                            <p className="text-xs font-black text-purple-900 dark:text-purple-200 uppercase tracking-widest">Sugerencias de IA</p>
                            <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">Cotizaciones aceptadas sin recordatorio de cobro</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {suggestedPaymentReminders.map(q => {
                            const client = clients.find(c => c.id === q.clientId);
                            return (
                                <div key={q.id} className="flex items-center justify-between bg-white/60 dark:bg-slate-900/60 p-3 rounded-2xl">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{client?.company || 'Cliente'}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{formatAmount(q.total)}</p>
                                    </div>
                                    <button
                                        onClick={() => onAddReminder({
                                            title: `Cobrar a ${client?.company || 'Cliente'}`,
                                            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                            start: '09:00',
                                            end: '09:15',
                                            type: 'reminder',
                                            reminderCategory: 'payment-collection',
                                            clientId: q.clientId,
                                            relatedAmount: q.total,
                                            completed: false,
                                            notes: `Cotización ${q.id} aceptada el ${q.date}`
                                        })}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-purple-700 transition-all"
                                    >
                                        Crear Recordatorio
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recordatorios de Cobro */}
            {paymentReminders.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="material-icons-round text-sm">payments</span>
                        Cobros Pendientes
                    </h4>
                    <div className="space-y-2">
                        {paymentReminders.map(reminder => {
                            const client = clients.find(c => c.id === reminder.clientId);
                            return (
                                <div key={reminder.id} className={`p-4 rounded-2xl border-l-4 border-emerald-500 ${categoryColor(reminder.reminderCategory)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">{reminder.title}</p>
                                            <p className="text-[10px] font-medium mt-1">{client?.company || ''}</p>
                                            {reminder.relatedAmount && (
                                                <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 mt-2">{formatAmount(reminder.relatedAmount)}</p>
                                            )}
                                            <p className="text-[9px] text-slate-500 mt-1">{reminder.date}</p>
                                        </div>
                                        <span className="material-icons-round text-emerald-600 dark:text-emerald-400 cursor-pointer hover:scale-110 transition-transform">check_circle_outline</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Suscripciones a Cancelar */}
            {subscriptionReminders.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="material-icons-round text-sm">cancel</span>
                        Suscripciones a Cancelar
                    </h4>
                    <div className="space-y-2">
                        {subscriptionReminders.map(reminder => (
                            <div key={reminder.id} className={`p-4 rounded-2xl border-l-4 border-red-500 ${categoryColor(reminder.reminderCategory)}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">{reminder.title}</p>
                                        {reminder.notes && <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">{reminder.notes}</p>}
                                        <p className="text-[9px] text-slate-500 mt-1">{reminder.date}</p>
                                    </div>
                                    <span className="material-icons-round text-red-600 dark:text-red-400 cursor-pointer hover:scale-110 transition-transform">check_circle_outline</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Seguimientos */}
            {followUpReminders.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="material-icons-round text-sm">call</span>
                        Seguimientos
                    </h4>
                    <div className="space-y-2">
                        {followUpReminders.map(reminder => {
                            const client = clients.find(c => c.id === reminder.clientId);
                            return (
                                <div key={reminder.id} className={`p-4 rounded-2xl border-l-4 border-blue-500 ${categoryColor(reminder.reminderCategory)}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">{reminder.title}</p>
                                            <p className="text-[10px] font-medium mt-1">{client?.company || ''}</p>
                                            <p className="text-[9px] text-slate-500 mt-1">{reminder.date}</p>
                                        </div>
                                        <span className="material-icons-round text-blue-600 dark:text-blue-400 cursor-pointer hover:scale-110 transition-transform">check_circle_outline</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Vista vacía */}
            {pendingReminders.length === 0 && suggestedPaymentReminders.length === 0 && (
                <div className="text-center py-12">
                    <span className="material-icons-round text-slate-200 dark:text-slate-700 text-6xl mb-4">task_alt</span>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Todo al día</p>
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">No hay recordatorios pendientes</p>
                </div>
            )}
        </div>
    );
};

export default SmartReminders;
