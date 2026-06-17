
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Transaction } from '../types';
import { processInvoiceOCR } from '../services/geminiService';
import PrivacyAmount from '../components/PrivacyAmount';

interface TransactionsProps {
  transactions: Transaction[];
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  currency: string;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, onAdd, onDelete, onToggleStatus, currency }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description || !amount) return;
    onAdd({
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString().split('T')[0],
      category: 'General',
      status: 'paid'
    });
    setDescription('');
    setAmount('');
  };

  const handleOCRScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOCR(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const data = await processInvoiceOCR(base64);
        setDescription(data.description);
        setAmount(data.amount.toString());
        setType(data.type);
        alert(t('transactions.success_alert'));
      } catch (error) {
        alert(t('transactions.error_alert'));
      } finally {
        setIsProcessingOCR(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold font-display tracking-tight">{t('transactions.title')}</h2>
            <p className="text-gray-500 mt-1">{t('transactions.subtitle')}</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <span className="material-icons-round">{isProcessingOCR ? 'sync' : 'photo_camera'}</span>
            {isProcessingOCR ? t('transactions.processing') : t('transactions.scan_button')}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleOCRScan} />
        </div>

        <section className="bg-white dark:bg-surface-dark rounded-[32px] p-8 shadow-soft border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            {t('transactions.new_record')} {isProcessingOCR && <span className="text-xs font-bold text-primary animate-pulse ml-2">{t('transactions.extracting')}</span>}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{t('transactions.description')}</label>
              <input className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary text-sm py-4" placeholder="Ej: Pago de Hosting" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{t('transactions.amount')}</label>
              <input className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary text-sm py-4" placeholder="0" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{t('transactions.type')}</label>
              <select className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary text-sm py-4 font-bold" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="income">{t('transactions.income')}</option>
                <option value="expense">{t('transactions.expense')}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button className="w-full py-4 rounded-2xl bg-primary text-white hover:bg-emerald-800 transition-all shadow-lg font-black uppercase text-xs tracking-widest" type="submit">{t('transactions.confirm')}</button>
            </div>
          </form>
        </section>

        <section className="bg-white dark:bg-surface-dark rounded-[32px] shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="py-5 px-8">{t('transactions.date')}</th>
                <th className="py-5 px-6">{t('transactions.desc_col')}</th>
                <th className="py-5 px-6 text-right">{t('transactions.amount_col')}</th>
                <th className="py-5 px-8 text-center">{t('transactions.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map(t => (
                <tr key={t.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="py-5 px-8 text-sm text-gray-400 font-bold">{t.date}</td>
                  <td className="py-5 px-6 font-bold text-gray-900 dark:text-white">{t.description}</td>
                  <td className={`py-5 px-6 text-right font-black ${t.type === 'income' ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                    {t.type === 'income' ? '+' : '-'} <PrivacyAmount amount={t.amount} currency={currency} formatter={formatCurrency} />
                  </td>
                  <td className="py-5 px-8 text-center"><button onClick={() => onDelete(t.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><span className="material-icons-outlined">delete</span></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default Transactions;
