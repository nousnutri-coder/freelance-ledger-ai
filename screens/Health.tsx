import React from 'react';
import { useTranslation } from 'react-i18next';
import { FinancialHealth, Transaction } from '../types';

interface HealthProps {
    health?: FinancialHealth;
    transactions: Transaction[];
}

const Health: React.FC<HealthProps> = ({ health, transactions }) => {
    const { t } = useTranslation();

    // Handle empty account state
    const hasData = transactions.length > 0;

    // Calculate real financial metrics from transactions
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = transactions
        .filter(t => {
            const d = new Date(t.date);
            const now = new Date();
            return t.type === 'income' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = transactions
        .filter(t => {
            const d = new Date(t.date);
            const now = new Date();
            return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0
        ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
        : 0;

    // Calculate health score based on real data (or 0 for new accounts)
    let healthScore = hasData ? 50 : 0; // Start at 0 for new accounts
    if (hasData) {
        if (savingsRate > 20) healthScore += 20;
        if (savingsRate > 40) healthScore += 10;
        if (monthlyIncome > monthlyExpense) healthScore += 15;
        if (transactions.length > 10) healthScore += 5;
    }
    healthScore = Math.min(100, Math.max(0, healthScore));

    const healthLevel = !hasData ? 'new' : healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : healthScore >= 40 ? 'fair' : 'poor';

    // Generate dynamic tips based on actual situation
    const dynamicTips: string[] = [];

    if (!hasData) {
        // Welcome tips for new accounts
        dynamicTips.push('¡Bienvenido! Registra tu primer ingreso para comenzar a analizar tu salud financiera.');
        dynamicTips.push('Tip: Conecta todas tus fuentes de ingreso para un análisis más preciso.');
        dynamicTips.push('Registra tus gastos regularmente para obtener recomendaciones personalizadas.');
    } else {
        if (savingsRate < 20) {
            dynamicTips.push(t('health.tips.emergency'));
        }
        if (monthlyExpense > monthlyIncome * 0.8) {
            dynamicTips.push(t('health.tips.subs'));
        }
        if (transactions.filter(t => t.type === 'income').length < 3) {
            dynamicTips.push(t('health.tips.income'));
        }
        if (dynamicTips.length === 0) {
            dynamicTips.push(t('health.tips.emergency'), t('health.tips.income'));
        }
    }

    const displayHealth = health || {
        score: healthScore,
        level: healthLevel,
        tips: dynamicTips.slice(0, 3),
        benchmarks: [
            {
                category: t('health.categories.income_vs_avg'),
                userValue: Math.round(monthlyIncome / 1000),
                averageValue: 4500,
                percentile: Math.min(99, Math.round((monthlyIncome / 4500000) * 100))
            },
            {
                category: t('health.categories.savings_rate'),
                userValue: savingsRate,
                averageValue: 20,
                percentile: Math.min(99, savingsRate + 50)
            },
            {
                category: t('health.categories.client_div'),
                userValue: new Set(transactions.filter(t => t.category).map(t => t.category)).size,
                averageValue: 2,
                percentile: Math.min(99, 70 + transactions.length)
            }
        ]
    };

    const ringColor = {
        poor: 'text-red-500',
        fair: 'text-orange-500',
        good: 'text-emerald-500',
        excellent: 'text-blue-500'
    }[displayHealth.level];

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('health.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{t('health.subtitle')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Health Score Card */}
                <div className="lg:col-span-1 bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
                    <h3 className="text-xl font-bold mb-8">{t('health.score_title')}</h3>

                    <div className="relative w-48 h-48 mb-8">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-gray-100 dark:text-gray-800"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={552.92}
                                strokeDashoffset={552.92 - (552.92 * displayHealth.score) / 100}
                                strokeLinecap="round"
                                className={`${ringColor} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-gray-900 dark:text-white">{displayHealth.score}</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{displayHealth.level}</span>
                        </div>
                    </div>

                    <div className="w-full space-y-3">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {t('health.score_improved')}
                        </p>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full inline-block">
                            {t('health.score_gain')}
                        </div>
                    </div>
                </div>

                {/* Benchmarks Card */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold">{t('health.benchmarks_title')}</h3>
                        <span className="text-xs font-bold text-gray-400 uppercase">{t('health.benchmarks_subtitle')}</span>
                    </div>

                    <div className="space-y-8">
                        {displayHealth.benchmarks.map((bench, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{bench.category}</span>
                                    <span className="text-xs font-medium text-emerald-600">Top {100 - bench.percentile}%</span>
                                </div>
                                <div className="relative h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000 delay-300"
                                        style={{ width: `${(bench.userValue / (bench.userValue + bench.averageValue)) * 100}%` }}
                                    ></div>
                                    <div
                                        className="absolute h-full w-1 bg-white/50 left-[50%] -translate-x-1/2"
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    <span>{t('health.user_value')} ${bench.userValue.toLocaleString()}</span>
                                    <span>{t('health.avg_value')} ${bench.averageValue.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-3">
                        <span className="material-icons-round text-blue-600">tips_and_updates</span>
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                            {t('health.insight', { percent: Math.round((displayHealth.benchmarks[0].userValue / displayHealth.benchmarks[0].averageValue - 1) * 100) })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actionable Tips */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold mb-6">{t('health.next_steps')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayHealth.tips.map((tip, i) => (
                        <div key={i} className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl group hover:shadow-md transition-all cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-icons-round text-primary">auto_awesome</span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                {tip}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Health;
