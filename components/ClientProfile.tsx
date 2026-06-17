
import React, { useState } from 'react';
import { Client, Transaction, Quotation, KanbanTask, CalendarEvent } from '../types';

interface ClientProfileProps {
    client: Client;
    transactions: Transaction[];
    quotations: Quotation[];
    tasks: KanbanTask[];
    events: CalendarEvent[];
    onClose: () => void;
    formatCurrency: (amount: number) => string;
}

const ClientProfile: React.FC<ClientProfileProps> = ({
    client,
    transactions,
    quotations,
    tasks,
    events,
    onClose,
    formatCurrency
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'quotations' | 'projects' | 'events'>('overview');

    // Filter data related to this client
    const clientQuotations = quotations.filter(q => q.clientId === client.id);
    const clientTasks = tasks.filter(t => t.client.toLowerCase().includes(client.company.toLowerCase()) || t.client.toLowerCase().includes(client.name.toLowerCase()));
    const clientEvents = events.filter(e => e.clientId === client.id);

    // Calculate client statistics
    const totalQuoted = clientQuotations.reduce((sum, q) => sum + q.total, 0);
    const acceptedQuotations = clientQuotations.filter(q => q.status === 'accepted');
    const totalRevenue = acceptedQuotations.reduce((sum, q) => sum + q.total, 0);
    const completedProjects = clientTasks.filter(t => t.status === 'done').length;
    const activeProjects = clientTasks.filter(t => t.status !== 'done').length;
    const conversionRate = clientQuotations.length > 0
        ? ((acceptedQuotations.length / clientQuotations.length) * 100).toFixed(1)
        : '0';

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: 'dashboard' },
        { id: 'transactions', label: 'Transacciones', icon: 'payments' },
        { id: 'quotations', label: 'Cotizaciones', icon: 'request_quote' },
        { id: 'projects', label: 'Proyectos', icon: 'work' },
        { id: 'events', label: 'Historial', icon: 'event' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-surface-dark w-full max-w-5xl h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white shadow-xl">
                            <span className="material-icons-round text-4xl">business</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{client.company}</h2>
                            <p className="text-sm text-gray-500 font-medium">{client.name} • {client.email}</p>
                            <p className="text-xs text-gray-400 mt-1">{client.phone} • {client.address}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-black hover:bg-slate-200 transition-all">
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-800 flex gap-2 shrink-0 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            <span className="material-icons-round text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Facturado</p>
                                    <p className="text-2xl font-black text-primary">{formatCurrency(totalRevenue)}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cotizaciones</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{clientQuotations.length}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversión</p>
                                    <p className="text-2xl font-black text-amber-500">{conversionRate}%</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Proyectos</p>
                                    <p className="text-2xl font-black text-blue-500">{completedProjects + activeProjects}</p>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Actividad Reciente</h3>
                                <div className="space-y-3">
                                    {clientQuotations.slice(0, 3).map(q => (
                                        <div key={q.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${q.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                                                    q.status === 'sent' ? 'bg-blue-100 text-blue-600' :
                                                        q.status === 'declined' ? 'bg-red-100 text-red-600' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    <span className="material-icons-round text-lg">description</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Cotización #{q.id.slice(-6)}</p>
                                                    <p className="text-xs text-gray-500">{q.date}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(q.total)}</p>
                                                <p className={`text-[10px] font-bold uppercase ${q.status === 'accepted' ? 'text-emerald-500' :
                                                    q.status === 'sent' ? 'text-blue-500' :
                                                        q.status === 'declined' ? 'text-red-500' :
                                                            'text-gray-400'
                                                    }`}>{q.status === 'accepted' ? 'Aceptada' : q.status === 'sent' ? 'Enviada' : q.status === 'declined' ? 'Rechazada' : 'Borrador'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {clientQuotations.length === 0 && (
                                        <div className="text-center py-12 text-gray-400">
                                            <span className="material-icons-round text-4xl mb-2">inbox</span>
                                            <p className="text-sm font-medium">Sin actividad registrada</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'quotations' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Historial de Cotizaciones</h3>
                                <p className="text-sm text-gray-500">Total cotizado: <span className="font-bold text-primary">{formatCurrency(totalQuoted)}</span></p>
                            </div>
                            {clientQuotations.map(q => (
                                <div key={q.id} className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">Cotización #{q.id.slice(-6)}</p>
                                            <p className="text-xs text-gray-500">{q.date} • Válida hasta {q.validUntil}</p>
                                        </div>
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${q.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                                            q.status === 'sent' ? 'bg-blue-100 text-blue-600' :
                                                q.status === 'declined' ? 'bg-red-100 text-red-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>{q.status === 'accepted' ? 'Aceptada' : q.status === 'sent' ? 'Enviada' : q.status === 'declined' ? 'Rechazada' : 'Borrador'}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {q.items.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-300">{item.description} x{item.quantity}</span>
                                                <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-500">TOTAL</span>
                                        <span className="text-xl font-black text-primary">{formatCurrency(q.total)}</span>
                                    </div>
                                </div>
                            ))}
                            {clientQuotations.length === 0 && (
                                <div className="text-center py-16 text-gray-400">
                                    <span className="material-icons-round text-5xl mb-3">request_quote</span>
                                    <p className="font-medium">No hay cotizaciones para este cliente</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Proyectos</h3>
                                <div className="flex gap-4 text-sm">
                                    <span className="text-emerald-500 font-bold">{completedProjects} Completados</span>
                                    <span className="text-blue-500 font-bold">{activeProjects} Activos</span>
                                </div>
                            </div>
                            {clientTasks.map(task => (
                                <div key={task.id} className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${task.status === 'done' ? 'bg-emerald-100 text-emerald-600' :
                                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            <span className="material-icons-round">{
                                                task.status === 'done' ? 'check_circle' :
                                                    task.status === 'in-progress' ? 'pending' : 'schedule'
                                            }</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                                            <p className="text-xs text-gray-500">{task.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-primary">{formatCurrency(task.amount)}</p>
                                        <p className={`text-[10px] font-bold uppercase ${task.status === 'done' ? 'text-emerald-500' : 'text-blue-500'
                                            }`}>{task.status === 'done' ? 'Completado' : task.status === 'in-progress' ? 'En progreso' : 'Pendiente'}</p>
                                    </div>
                                </div>
                            ))}
                            {clientTasks.length === 0 && (
                                <div className="text-center py-16 text-gray-400">
                                    <span className="material-icons-round text-5xl mb-3">work_outline</span>
                                    <p className="font-medium">No hay proyectos para este cliente</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Eventos e Historial</h3>
                            {clientEvents.map(event => (
                                <div key={event.id} className="bg-white dark:bg-slate-800 p-5 rounded-[20px] border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${event.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                                        event.type === 'deadline' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                        <span className="material-icons-round text-lg">{
                                            event.type === 'meeting' ? 'groups' :
                                                event.type === 'deadline' ? 'flag' : 'event'
                                        }</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 dark:text-white">{event.title}</p>
                                        <p className="text-xs text-gray-500">{event.date} • {event.start} - {event.end}</p>
                                    </div>
                                    {event.completed && <span className="material-icons-round text-emerald-500">check_circle</span>}
                                </div>
                            ))}
                            {clientEvents.length === 0 && (
                                <div className="text-center py-16 text-gray-400">
                                    <span className="material-icons-round text-5xl mb-3">event_busy</span>
                                    <p className="font-medium">No hay eventos registrados</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <div className="text-center py-16 text-gray-400">
                            <span className="material-icons-round text-5xl mb-3">account_balance_wallet</span>
                            <p className="font-medium">Las transacciones se vinculan automáticamente con las cotizaciones aceptadas</p>
                            <p className="text-sm mt-2">Total facturado: <span className="font-bold text-primary">{formatCurrency(totalRevenue)}</span></p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientProfile;
