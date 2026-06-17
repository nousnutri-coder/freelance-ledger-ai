import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Transaction, SimulationResult } from '../types';
import { detectVampireSubscriptions, runScenarioSimulation } from '../services/geminiService';

interface IntelligenceProps {
    transactions: Transaction[];
    currentBalance: number;
}

const Intelligence: React.FC<IntelligenceProps> = ({ transactions, currentBalance }) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [simulation, setSimulation] = useState<SimulationResult | null>(null);
    const [vampireSubs, setVampireSubs] = useState<any[]>([]);

    const [scenario, setScenario] = useState({
        description: 'MacBook Pro M3',
        amount: 8500000,
        installments: 12
    });

    const handleSimulate = async () => {
        setLoading(true);
        const monthlyExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0) / 12; // Average monthly

        const result = await runScenarioSimulation(currentBalance, monthlyExpenses, scenario);
        setSimulation(result);
        setLoading(false);
    };

    const handleDetectVampires = async () => {
        setLoading(true);
        const result = await detectVampireSubscriptions(transactions);
        setVampireSubs(result);
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('intelligence.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400">{t('intelligence.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Scenario Simulator */}
                <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                            <span className="material-icons-round">model_training</span>
                        </div>
                        <h3 className="text-xl font-bold">{t('intelligence.simulator_title')}</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('intelligence.item_label')}</label>
                            <input
                                type="text"
                                placeholder={t('intelligence.item_placeholder')}
                                className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                value={scenario.description}
                                onChange={e => setScenario({ ...scenario, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('intelligence.price_label')}</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                    value={scenario.amount}
                                    onChange={e => setScenario({ ...scenario, amount: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('intelligence.installments_label')}</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                    value={scenario.installments}
                                    onChange={e => setScenario({ ...scenario, installments: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSimulate}
                            disabled={loading || !scenario.description}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {t('intelligence.simulate_btn')}
                        </button>
                    </div>

                    {simulation && (
                        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{t('intelligence.runway_updated')}</p>
                                    <p className="text-4xl font-black text-blue-900 dark:text-blue-100">{simulation.runwayMonths} <span className="text-lg font-medium">{t('intelligence.months')}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-blue-500 font-medium">{t('intelligence.monthly_impact')}</p>
                                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">-${simulation.monthlyImpact.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="h-24 flex items-end gap-1 mt-6">
                                {simulation.projectedBalance.map((p, i) => {
                                    const max = Math.max(...simulation.projectedBalance.map(b => b.balance));
                                    const height = (p.balance / max) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                            <div
                                                className="w-full bg-blue-500/30 group-hover:bg-blue-500 rounded-t-md transition-all duration-500"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{p.month}</span>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                ${p.balance.toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Vampire Subs */}
                <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                            <span className="material-icons-round">savings</span>
                        </div>
                        <h3 className="text-xl font-bold">{t('intelligence.vampire_title')}</h3>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {t('intelligence.vampire_subtitle')}
                    </p>

                    {!vampireSubs.length && (
                        <button
                            onClick={handleDetectVampires}
                            disabled={loading}
                            className="w-full border-2 border-orange-200 dark:border-orange-900/30 border-dashed text-orange-600 dark:text-orange-400 font-bold py-6 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all flex flex-col items-center gap-2"
                        >
                            <span className="material-icons-round text-3xl">psychology</span>
                            {t('intelligence.analyze_btn')}
                        </button>
                    )}

                    <div className="space-y-4">
                        {vampireSubs.map((sub, i) => (
                            <div key={i} className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-800/50 flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center flex-shrink-0">
                                    <span className="material-icons-round text-orange-700 dark:text-orange-100">info</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{sub.suggestion}</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{sub.reasoning}</p>
                                    <p className="text-sm font-bold text-orange-600">{t('intelligence.saving_potential')} ${sub.potentialSaving.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Intelligence;
