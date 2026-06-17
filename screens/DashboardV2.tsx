
import React from 'react';
import { Transaction } from '../types';

interface DashboardV2Props {
  transactions: Transaction[];
}

const DashboardV2: React.FC<DashboardV2Props> = ({ transactions }) => {
  const totalIncome = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc, 0);
  const totalExpenses = transactions.reduce((acc, t) => t.type === 'expense' ? acc + t.amount : acc, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Overview Alternativo</h2>
          <p className="text-gray-500 dark:text-gray-400">Una perspectiva diferente de tus métricas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary dark:bg-emerald-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-emerald-500/20 group">
          <div className="absolute top-0 right-0 p-5 opacity-20">
            <span className="material-icons-round text-6xl transform rotate-12 group-hover:scale-110 transition-transform duration-500">account_balance</span>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-medium text-emerald-100 text-sm">Balance Total</h3>
            </div>
            <div className="mb-2">
              <span className="text-4xl font-bold">${totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-100 bg-emerald-800/30 w-fit px-2 py-1 rounded-lg">
              <span className="material-icons-round text-sm">trending_up</span>
              <span>+12% vs mes anterior</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border-t-4 border-blue-500 flex flex-col justify-between h-44">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-600 dark:text-gray-300">Gastos Op.</h4>
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-lg">40%</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Ejecutado este mes</p>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-2">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{width: "40%"}}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border-t-4 border-orange-500 flex flex-col justify-between h-44">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-600 dark:text-gray-300">Proyección</h4>
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded-lg">High</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">$8,500</p>
            <p className="text-xs text-gray-400">Estimado Noviembre</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="material-icons-round text-sm text-orange-500">insights</span>
            Basado en pipeline actual
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border-t-4 border-emerald-500 flex flex-col justify-between h-44">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-600 dark:text-gray-300">Tasa Ahorro</h4>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-1 rounded-lg">60%</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">60%</p>
            <p className="text-xs text-gray-400">Meta del mes</p>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: "60%"}}></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50">
        <h3 className="text-xl font-bold mb-6">Actividad Reciente</h3>
        <div className="space-y-6">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                  <span className="material-icons-round">{t.type === 'income' ? 'south_west' : 'north_east'}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{t.description}</h4>
                  <p className="text-xs text-gray-500">{t.date} • {t.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${t.type === 'income' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                  {t.type === 'income' ? '+' : '-'} ${t.amount.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardV2;
