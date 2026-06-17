
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarEvent, KanbanTask, Transaction } from '../types';
import { Link } from 'react-router-dom';

interface PendingItemsProps {
    events: CalendarEvent[];
    tasks: KanbanTask[];
    transactions: Transaction[];
}

const PendingItems: React.FC<PendingItemsProps> = ({ events, tasks, transactions }) => {
    const { t } = useTranslation();
    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date(today);
    const weekFromNow = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Recordatorios pendientes
    const pendingReminders = events.filter(e => e.type === 'reminder' && !e.completed);
    const todayReminders = pendingReminders.filter(r => r.date === today);
    const weekReminders = pendingReminders.filter(r => r.date > today && r.date <= weekFromNow);
    const laterReminders = pendingReminders.filter(r => r.date > weekFromNow);

    // Tareas Kanban pendientes
    const pendingTasks = tasks.filter(t => t.status !== 'done');
    const urgentTasks = pendingTasks.filter(t => t.status === 'in-progress');
    const todoTasks = pendingTasks.filter(t => t.status === 'todo');

    // Transacciones pendientes de pago
    const pendingTransactions = transactions.filter(t => t.status === 'pending');

    const totalPending = pendingReminders.length + pendingTasks.length + pendingTransactions.length;

    const renderCategoryIcon = (category?: string) => {
        switch (category) {
            case 'payment-collection': return '💰';
            case 'subscription-cancel': return '❌';
            case 'follow-up': return '📞';
            case 'tax-deadline': return '📋';
            default: return '📌';
        }
    };

    return (
        <div className="p-6 md:p-10 pb-20 max-w-6xl mx-auto">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-3 mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-black text-2xl shadow-2xl ${totalPending > 0 ? 'animate-pulse' : ''}`}>
                        {totalPending}
                    </div>
                    <div className="text-left">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('pending.title')}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('pending.subtitle')}</p>
                    </div>
                </div>
            </div>

            {totalPending === 0 ? (
                <div className="text-center py-20">
                    <span className="material-icons-round text-slate-200 dark:text-slate-700 text-9xl mb-4">task_alt</span>
                    <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-2">{t('pending.all_clear_title')}</h3>
                    <p className="text-slate-400 dark:text-slate-600">{t('pending.all_clear_desc')}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* HOY - URGENTE */}
                    {(todayReminders.length > 0 || urgentTasks.length > 0) && (
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 p-8 rounded-[40px] border-2 border-red-200 dark:border-red-800/50 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-icons-round text-red-600 dark:text-red-400 text-3xl animate-pulse">priority_high</span>
                                <div>
                                    <h2 className="text-xl font-black text-red-900 dark:text-red-200 uppercase tracking-tight">{t('pending.today_urgent')}</h2>
                                    <p className="text-xs text-red-600 dark:text-red-400">{t('pending.action_required')}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {todayReminders.map(reminder => (
                                    <Link key={reminder.id} to="/calendar" className="block p-4 bg-white dark:bg-slate-900 rounded-2xl hover:shadow-lg transition-all border-l-4 border-red-500">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{renderCategoryIcon(reminder.reminderCategory)}</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{reminder.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{reminder.start} - {reminder.notes || t('pending.no_notes')}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {urgentTasks.map(task => (
                                    <Link key={task.id} to="/kanban" className="block p-4 bg-white dark:bg-slate-900 rounded-2xl hover:shadow-lg transition-all border-l-4 border-orange-500">
                                        <div className="flex items-center gap-3">
                                            <span className="material-icons-round text-orange-600">work</span>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{task.client} - ${task.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
                                            </div>
                                            <div className="text-xs font-black text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full uppercase">{t('pending.in_progress')}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ESTA SEMANA */}
                    {weekReminders.length > 0 && (
                        <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-icons-round text-amber-600 dark:text-amber-400 text-2xl">date_range</span>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('pending.this_week')}</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('pending.next_7_days')}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {weekReminders.map(reminder => (
                                    <Link key={reminder.id} to="/calendar" className="block p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-l-4 border-amber-500">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{renderCategoryIcon(reminder.reminderCategory)}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{reminder.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{reminder.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAREAS POR HACER */}
                    {todoTasks.length > 0 && (
                        <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-icons-round text-blue-600 dark:text-blue-400 text-2xl">checklist</span>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('pending.todo_tasks')}</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('pending.pending_projects')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {todoTasks.map(task => (
                                    <Link key={task.id} to="/kanban" className="block p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl hover:shadow-lg transition-all border-l-4 border-blue-500">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{task.title}</p>
                                        <p className="text-xs text-slate-500">{task.client}</p>
                                        <p className="text-xs font-black text-blue-600 dark:text-blue-400 mt-2">${task.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PAGOS PENDIENTES */}
                    {pendingTransactions.length > 0 && (
                        <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-icons-round text-emerald-600 dark:text-emerald-400 text-2xl">account_balance_wallet</span>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('pending.pending_payments')}</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('pending.receivables')}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {pendingTransactions.map(tx => (
                                    <Link key={tx.id} to="/transactions" className="block p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl hover:shadow-lg transition-all border-l-4 border-emerald-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.description}</p>
                                                <p className="text-xs text-slate-500 mt-1">{tx.date}</p>
                                            </div>
                                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">${tx.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OTROS RECORDATORIOS */}
                    {laterReminders.length > 0 && (
                        <div className="bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-icons-round text-slate-600 dark:text-slate-400 text-2xl">schedule</span>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('pending.later')}</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('pending.future_reminders')}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {laterReminders.map(reminder => (
                                    <Link key={reminder.id} to="/calendar" className="block p-3 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{renderCategoryIcon(reminder.reminderCategory)} {reminder.title}</span>
                                            <span className="text-xs text-slate-400">{reminder.date}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PendingItems;
