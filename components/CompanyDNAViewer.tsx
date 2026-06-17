import React, { useState } from 'react';
import { CompanyDNA } from '../types';

interface Props {
    dna: CompanyDNA;
}

const CompanyDNAViewer: React.FC<Props> = ({ dna }) => {
    const [expanded, setExpanded] = useState(false);

    const InfoCard = ({ icon, title, content }: { icon: string; title: string; content: string | string[] | null | undefined }) => {
        if (!content || (Array.isArray(content) && content.length === 0)) return null;

        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="material-icons-round text-primary">{icon}</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h4>
                </div>

                {Array.isArray(content) ? (
                    <ul className="space-y-2">
                        {content.map((item, idx) => (
                            <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {content}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">ADN de la Empresa</h3>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                    {expanded ? 'Ver menos' : 'Ver más'}
                    <span className="material-icons-round text-sm">
                        {expanded ? 'expand_less' : 'expand_more'}
                    </span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard
                    icon="psychology"
                    title="Metodología de Trabajo"
                    content={dna.extractedData.methodology}
                />

                <InfoCard
                    icon="campaign"
                    title="Voz de Marca"
                    content={dna.extractedData.brandVoice}
                />

                <InfoCard
                    icon="description"
                    title="Estilo de Propuestas"
                    content={dna.extractedData.proposalStyle}
                />

                <InfoCard
                    icon="workspace_premium"
                    title="Propuesta de Valor"
                    content={dna.extractedData.valueProposition}
                />
            </div>

            {expanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4">
                    <InfoCard
                        icon="business_center"
                        title="Servicios Principales"
                        content={dna.extractedData.coreServices}
                    />

                    <InfoCard
                        icon="groups"
                        title="Mercado Objetivo"
                        content={dna.extractedData.targetMarket}
                    />

                    <InfoCard
                        icon="payments"
                        title="Filosofía de Precios"
                        content={dna.extractedData.pricingPhilosophy}
                    />

                    <InfoCard
                        icon="rocket_launch"
                        title="Diferenciadores"
                        content={dna.extractedData.competitiveDifferentiators}
                    />

                    <InfoCard
                        icon="code"
                        title="Stack Técnico"
                        content={dna.extractedData.technicalStack}
                    />

                    <InfoCard
                        icon="local_shipping"
                        title="Proceso de Entrega"
                        content={dna.extractedData.deliveryProcess}
                    />

                    <InfoCard
                        icon="verified"
                        title="Estándares de Calidad"
                        content={dna.extractedData.qualityStandards}
                    />

                    <InfoCard
                        icon="info"
                        title="Pautas Adicionales"
                        content={dna.extractedData.customGuidelines}
                    />
                </div>
            )}
        </div>
    );
};

export default CompanyDNAViewer;
