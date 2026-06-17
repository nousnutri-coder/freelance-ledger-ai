
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Client, Transaction, Quotation, KanbanTask, CalendarEvent, SubscriptionPlan } from '../types';
import ClientProfile from '../components/ClientProfile';
import UpgradeModal from '../components/UpgradeModal';
import { canUserPerformAction, PLAN_LIMITS } from '../utils/planLimits';

interface ClientsProps {
  clients: Client[];
  transactions: Transaction[];
  quotations: Quotation[];
  tasks: KanbanTask[];
  events: CalendarEvent[];
  onAdd: (client: Omit<Client, 'id'>) => void;
  onUpdate: (client: Client) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
  currentPlan?: SubscriptionPlan;
}

const Clients: React.FC<ClientsProps> = ({
  clients,
  transactions,
  quotations,
  tasks,
  events,
  onAdd,
  onUpdate,
  onDelete,
  formatCurrency,
  currentPlan = 'free'
}) => {
  const { t } = useTranslation();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Client>({ id: '', name: '', company: '', email: '', phone: '', address: '' });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Feature gating states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const planLimits = PLAN_LIMITS[currentPlan];

  const resetForm = () => {
    setFormData({ id: '', name: '', company: '', email: '', phone: '', address: '' });
    setIsEditing(false);
    setShowModal(false);
  };

  const openAdd = () => {
    // Verificar si puede agregar más clientes según su plan
    // Aseguramos que currentPlan sea tratado como SubscriptionPlan válido
    if (!canUserPerformAction(currentPlan as SubscriptionPlan, 'maxClients', clients.length)) {
      setShowUpgradeModal(true);
      return;
    }

    resetForm();
    setShowModal(true);
  };

  const openEdit = (client: Client) => {
    setFormData(client);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      onUpdate(formData);
    } else {
      const { id, ...newClient } = formData;
      onAdd(newClient);
    }
    resetForm();
  };

  return (
    <div className="p-6 md:p-10 pb-20">
      <div className="flex justify-between items-center mb-10 no-print">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">{t('clients.title')}</h1>
          <p className="text-gray-500">{t('clients.subtitle')}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-slate-900 dark:bg-primary text-white px-6 py-3 rounded-2xl hover:scale-105 transition-transform font-bold text-sm shadow-xl shadow-slate-900/20"
        >
          <span className="material-icons-round text-lg">add</span>
          {t('clients.add_btn')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clients.map(client => (
          <div
            key={client.id}
            onClick={() => setSelectedClient(client)}
            className="group bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white mb-6 shadow-lg shadow-emerald-900/20 group-hover:scale-110 transition-transform">
                {client.name.charAt(0)}
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{client.name}</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">{client.company}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-icons-round text-base">email</span>
                  </span>
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <span className="material-icons-round text-base">phone</span>
                    </span>
                    {client.phone}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(client); }}
                  className="p-3 text-slate-400 hover:text-primary hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                  title="Editar cliente"
                >
                  <span className="material-icons-round text-lg">edit</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  title="Eliminar cliente"
                >
                  <span className="material-icons-round text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons-round text-slate-200 text-4xl">person_off</span>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t('clients.empty_state')}</p>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan as SubscriptionPlan}
        limitReached="clients"
        currentUsage={clients.length}
        limit={planLimits?.maxClients || 0}
      />

      {/* Edit/Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 no-print">
          <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white">
                {isEditing ? t('clients.edit_title') : t('clients.add_title')}
              </h2>
              <button onClick={resetForm} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-black">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('clients.form.name')}</label>
                  <input
                    required
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder={t('clients.placeholders.name')}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('clients.form.company')}</label>
                  <input
                    required
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder={t('clients.placeholders.company')}
                    value={formData.company}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('clients.form.email')}</label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder={t('clients.placeholders.email')}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('clients.form.phone')}</label>
                  <input
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary dark:text-white"
                    placeholder={t('clients.placeholders.phone')}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('clients.form.address')}</label>
                <textarea
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-3.5 focus:ring-2 focus:ring-primary dark:text-white"
                  placeholder={t('clients.placeholders.address')}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-2 py-4.5 bg-primary text-white font-black rounded-2xl hover:bg-emerald-800 shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-xs px-10"
                >
                  {isEditing ? t('clients.update_btn') : t('clients.register_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Profile Modal */}
      {selectedClient && (
        <ClientProfile
          client={selectedClient}
          transactions={transactions}
          quotations={quotations}
          tasks={tasks}
          events={events}
          onClose={() => setSelectedClient(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default Clients;
