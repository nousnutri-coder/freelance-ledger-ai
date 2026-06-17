import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type LegalTab = 'privacy' | 'terms' | 'cookies';

const Legal: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<LegalTab>('privacy');

    return (
        <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">{t('legal.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    {t('legal.subtitle')}
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('privacy')}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'privacy' ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                    {t('legal.tabs.privacy')}
                </button>
                <button
                    onClick={() => setActiveTab('terms')}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'terms' ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                    {t('legal.tabs.terms')}
                </button>
                <button
                    onClick={() => setActiveTab('cookies')}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'cookies' ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                    {t('legal.tabs.cookies')}
                </button>
            </div>

            <div className="bg-white dark:bg-surface-dark p-8 md:p-12 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">

                {activeTab === 'privacy' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-icons-round text-3xl text-primary">security</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.title')}</h2>
                        </div>

                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200 text-sm font-medium">
                            <strong>{t('legal.privacy.summary')}</strong>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4">{t('legal.privacy.controller')}</h3>
                        <p>{t('legal.privacy.controller_text')}</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('legal.privacy.data_collected')}</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>{t('legal.privacy.data_list.id')}</strong></li>
                            <li><strong>{t('legal.privacy.data_list.financial')}</strong></li>
                            <li><strong>{t('legal.privacy.data_list.usage')}</strong></li>
                        </ul>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Finalidad del Tratamiento</h3>
                        <p>Sus datos serán utilizados exclusivamente para:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Proveer, operar y mantener nuestros servicios de gestión financiera.</li>
                            <li>Mejorar, personalizar y expandir nuestros servicios (IA Predictiva).</li>
                            <li>Enviar correos electrónicos relacionados con el servicio, facturas y actualizaciones importantes.</li>
                            <li>Detectar y prevenir fraudes.</li>
                        </ul>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">4. Sus Derechos (Habeas Data)</h3>
                        <p>Usted tiene derecho a conocer, actualizar y rectificar sus datos personales. Puede solicitar la supresión de sus datos en cualquier momento a través de nuestro canal de soporte o eliminando su cuenta desde la configuración.</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">5. Seguridad de los Datos</h3>
                        <p>Implementamos medidas técnicas, administrativas y humanas para proteger sus datos. Utilizamos encriptación SSL/TLS para el tránsito de datos y algoritmos de hash para contraseñas. Sin embargo, ningún método de transmisión por Internet es 100% seguro.</p>
                    </div>
                )}

                {activeTab === 'terms' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-icons-round text-3xl text-primary">gavel</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.title')}</h2>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('legal.terms.acceptance')}</h3>
                        <p>{t('legal.terms.acceptance_text')}</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('legal.terms.service')}</h3>
                        <p>{t('legal.terms.service_text')}</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Responsabilidad del Usuario</h3>
                        <p>Usted es responsable de mantener la confidencialidad de su cuenta y contraseña. Acepta notificar inmediatamente cualquier uso no autorizado. Usted es el único responsable de la precisión de los datos financieros ingresados.</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">4. Limitación de Responsabilidad</h3>
                        <p className="uppercase text-xs font-black tracking-widest text-gray-500 mb-2">CLÁUSULA DE EXONERACIÓN IMPLICITA</p>
                        <p>En la máxima medida permitida por la ley, FreelAissistPro y sus desarrolladores NO SERÁN RESPONSABLES por daños indirectos, incidentales, especiales, consecuentes o punitivos, ni por pérdida de beneficios o ingresos, ya sea incurrida directa o indirectamente, o cualquier pérdida de datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de (i) su acceso o uso o incapacidad para acceder o usar el servicio; (ii) cualquier conducta o contenido de terceros en el servicio.</p>
                        <p>La IA "Gemini" integrada puede cometer errores. El usuario debe verificar toda la información generada (cotizaciones, cálculos, proyecciones) antes de tomar decisiones financieras basadas en ellas.</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">5. Modificaciones</h3>
                        <p>Nos reservamos el derecho de modificar o reemplazar estos términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso con al menos 30 días de antelación.</p>
                    </div>
                )}

                {activeTab === 'cookies' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-icons-round text-3xl text-primary">cookie</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('legal.cookies.title')}</h2>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('legal.cookies.what_are')}</h3>
                        <p>{t('legal.cookies.what_are_text')}</p>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">2. ¿Cómo usamos las Cookies?</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento técnico de la plataforma (ej. mantener su sesión activa, seguridad).</li>
                            <li><strong>Cookies de Preferencias:</strong> Permiten recordar sus ajustes (ej. modo oscuro/claro, idioma, moneda preferida).</li>
                            <li><strong>Cookies Analíticas:</strong> Nos ayudan a entender cómo los usuarios interactúan con la plataforma de forma anónima.</li>
                        </ul>

                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">3. Control de Cookies</h3>
                        <p>Usted puede controlar y/o eliminar las cookies según desee. Puede eliminar todas las cookies que ya están en su computadora y puede configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite un sitio y que algunos servicios y funcionalidades no funcionen.</p>

                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-400 text-center">Última actualización: 06 de Enero de 2026</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center mt-12">
                <p className="text-xs text-gray-400 max-w-xl mx-auto italic">
                    {t('legal.disclaimer')}
                </p>
            </div>
        </div>
    );
};

export default Legal;
