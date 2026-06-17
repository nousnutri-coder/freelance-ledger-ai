
import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell, CartesianGrid, YAxis } from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Transaction, CalendarEvent, Client, Quotation, UserProfile } from '../types';
import { getFinancialInsights, chatWithAssistant } from '../services/geminiService';
import PrivacyAmount from '../components/PrivacyAmount';
import SmartReminders from '../components/SmartReminders';
import TrialButton from '../components/TrialButton';

interface DashboardProps {
  transactions: Transaction[];
  currency: string;
  onImport: (file: File) => void;
  events: CalendarEvent[];
  clients: Client[];
  quotations: Quotation[];
  onAddEvent: (e: Omit<CalendarEvent, 'id'>) => void;
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, currency, onImport, events, clients, quotations, onAddEvent, user }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [insights, setInsights] = useState<{ tip: string, category: string }[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showTaxSim, setShowTaxSim] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchInsights = async () => {
    if (transactions.length === 0) return;
    setLoadingInsights(true);
    try {
      const data = await getFinancialInsights(transactions.slice(0, 15));
      setInsights(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => { fetchInsights(); }, [transactions.length]);

  const totalIncome = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc, 0);
  const totalExpenses = transactions.reduce((acc, t) => t.type === 'expense' ? acc + t.amount : acc, 0);
  const pendingInvoices = transactions.filter(t => t.status === 'pending').length;

  const chartData = [
    { name: 'May', value: 4200000 },
    { name: 'Jun', value: 3800000 },
    { name: 'Jul', value: 5100000 },
    { name: 'Ago', value: 4800000 },
    { name: 'Sep', value: 6200000 },
    { name: 'Oct', value: totalIncome || 5500000 },
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-US', {
      style: 'currency', currency, maximumFractionDigits: 0
    }).format(val);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg = userInput.trim();
    setUserInput("");
    setChatHistory(prev => [...prev, { role: "user", parts: [{ text: userMsg }] }]);
    setIsTyping(true);

    // Build user context for personalized AI responses
    const userContext = {
      userName: user.name,
      companyName: user.companyName,
      currency: currency,
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      pendingInvoices: pendingInvoices,
      clientCount: clients.length,
      recentTransactions: transactions.slice(0, 5).map(t => ({
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: t.date
      })),
      activeQuotations: quotations.slice(0, 5).map(q => ({
        client: clients.find(c => c.id === q.clientId)?.company || 'Cliente',
        total: q.total,
        status: q.status
      })),
      companyDNA: user.companyDNA
    };

    const botResponse = await chatWithAssistant(chatHistory, userMsg, userContext);

    if (botResponse.startsWith("Error")) {
      alert(`⚠️ ${t('dashboard.ai_error')}: ${botResponse}\n\n${t('dashboard.ai_error_desc')}`);
    }

    setChatHistory(prev => [...prev, { role: "model", parts: [{ text: botResponse }] }]);
    setIsTyping(false);
  };

  return (
    <div className="p-6 md:p-10 pb-20">
      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} className="hidden" accept=".csv" />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-display tracking-tight uppercase">{t('dashboard.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('dashboard.subtitle')}</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
          <span className="material-icons-round text-primary text-sm">enhanced_encryption</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t('dashboard.security_badge')}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"><span className="material-icons-outlined text-sm">file_upload</span>{t('dashboard.import')}</button>
          <button onClick={() => navigate('/transactions')} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-2"><span className="material-icons-round text-sm">add</span>{t('dashboard.new')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
          <p className="text-sm font-medium text-emerald-100 mb-1 uppercase tracking-widest text-[10px]">{t('dashboard.income')}</p>
          <h3 className="text-2xl font-black">
            <PrivacyAmount amount={totalIncome} currency={currency} formatter={formatCurrency} />
          </h3>
          <span className="material-icons-round absolute -right-4 -bottom-4 text-white/10 text-9xl">trending_up</span>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-[32px] shadow-soft border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-widest text-[10px]">{t('dashboard.receivables')}</p>
          <h3 className="text-2xl font-black text-orange-500">{pendingInvoices}</h3>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-[32px] shadow-soft border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-widest text-[10px]">{t('dashboard.expenses')}</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">
            <PrivacyAmount amount={totalExpenses} currency={currency} formatter={formatCurrency} />
          </h3>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-[32px] shadow-soft border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-widest text-[10px]">{t('dashboard.profit')}</p>
          <h3 className="text-2xl font-black text-emerald-500">
            <PrivacyAmount amount={totalIncome - totalExpenses} currency={currency} formatter={formatCurrency} />
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[32px] shadow-soft border border-gray-100 dark:border-gray-700 flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">{t('dashboard.cash_flow')}</h3>
          {/* Contenedor con altura fija obligatoria para evitar error de Recharts */}
          <div className="w-full h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                <Tooltip cursor={{ fill: 'rgba(6, 78, 59, 0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }} />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                  {chartData.map((e, i) => <Cell key={i} fill={i === 5 ? '#10b981' : '#064E3B'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-dark p-8 rounded-[32px] shadow-soft border border-gray-100 dark:border-gray-700 flex flex-col h-full min-h-[400px]">
            <h4 className="font-black flex items-center gap-2 mb-6 uppercase tracking-widest text-xs">
              <span className="material-icons-round text-primary">auto_awesome</span>
              {t('dashboard.smart_guide')}
            </h4>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {loadingInsights ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>)}
                </div>
              ) : (
                (insights.length > 0 ? insights : [
                  { category: "ANÁLISIS DE MERCADO", tip: "Tus tarifas están un 15% por debajo del promedio en Latam. Considera un ajuste gradual." },
                  { category: "OPTIMIZACIÓN", tip: "Detectamos 3 suscripciones (Figma, Adobe) con poco uso este mes. ¿Pausar?" },
                  { category: "ALERTA TRIBUTARIA", tip: "Este mes superarás el tope de régimen simplificado. Prepara tu declaración." }
                ]).map((ins, i) => (
                  <div key={i} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <p className="text-[10px] font-black uppercase text-emerald-600 mb-1 tracking-widest">{ins.category}</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{ins.tip}</p>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowTaxSim(true)} className="mt-6 w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl">{t('dashboard.tax_simulator')}</button>
          </div>
        </div>
      </div>

      {/* Trial Button - Only shown for FREE users who haven't used their trial */}
      <div className="mb-8">
        <TrialButton />
      </div>

      {/* Smart Reminders Widget */}
      <div className="mb-8">
        <SmartReminders
          events={events}
          clients={clients}
          quotations={quotations}
          onAddReminder={onAddEvent}
          currency={currency}
        />
      </div>

      {/* Floating Chatbot Guide */}
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4">
        {showChat && (
          <div className="w-96 max-w-[calc(100vw-2rem)] h-[550px] bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
            <div className="p-6 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center"><span className="material-icons-round">psychology</span></div>
                <div>
                  <p className="font-black text-sm uppercase tracking-widest leading-none mb-1">{t('chat.title')}</p>
                  <p className="text-[10px] text-emerald-100">{t('chat.subtitle')}</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-white/50 hover:text-white"><span className="material-icons-round">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/50 dark:bg-transparent">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-[24px] text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'}`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {isTyping && <div className="flex justify-start"><div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-2xl text-xs animate-pulse font-bold text-slate-500 uppercase tracking-widest">{t('chat.analyzing')}</div></div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input value={userInput} onChange={e => setUserInput(e.target.value)} placeholder={t('chat.placeholder')} className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-5 text-sm font-medium focus:ring-2 focus:ring-primary dark:text-white" />
              <button type="submit" className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-emerald-800 transition-all shadow-lg"><span className="material-icons-round">send</span></button>
            </form>
          </div>
        )}
        <button onClick={() => setShowChat(!showChat)} className={`w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-110 ${showChat ? 'bg-slate-900 rotate-180' : 'bg-primary animate-bounce'}`}>
          <span className="material-icons-round text-4xl text-white">{showChat ? 'close' : 'chat'}</span>
        </button>
      </div>

      {/* Tax Simulator Modal */}
      {showTaxSim && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 text-center">
            <h2 className="text-2xl font-black mb-6 uppercase">{t('tax.title')}</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                <span className="text-xs font-black uppercase text-slate-400">{t('tax.retention')}</span>
                <span className="font-black">
                  <PrivacyAmount amount={totalIncome * 0.1} currency={currency} formatter={formatCurrency} />
                </span>
              </div>
              <div className="flex justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                <span className="text-xs font-black uppercase text-slate-400">{t('tax.ica')}</span>
                <span className="font-black">
                  <PrivacyAmount amount={totalIncome * 0.00966} currency={currency} formatter={formatCurrency} />
                </span>
              </div>
              <div className="flex justify-between p-8 bg-primary text-white rounded-[32px] shadow-2xl">
                <span className="font-black uppercase tracking-widest">{t('tax.reserve')}</span>
                <span className="text-3xl font-black">
                  <PrivacyAmount amount={totalIncome * 0.10966} currency={currency} formatter={formatCurrency} />
                </span>
              </div>
            </div>
            <button onClick={() => setShowTaxSim(false)} className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-2xl uppercase text-xs hover:bg-slate-200">{t('tax.close')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
