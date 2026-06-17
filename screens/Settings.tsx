
import React, { useState, useRef } from 'react';
import { UserProfile, CompanyDNA, DocumentUploadHistory } from '../types';
import CompanyProfileUpload from '../components/CompanyProfileUpload';
import CompanyDNAViewer from '../components/CompanyDNAViewer';
import { extractCompanyDNA } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile,
  saveCompanyDNA,
  deactivateAllCompanyDNA,
  addTransaction,
  addTask,
  addClient,
  addQuotation,
  addEvent
} from '../services/dbService';
import { useTranslation } from 'react-i18next';
import SubscriptionManager from '../components/SubscriptionManager';

interface SettingsProps {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, setUser }) => {
  const { t, i18n } = useTranslation();
  const { user: authUser, refreshProfile } = useAuth();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState(user.currency);
  const [profileImage, setProfileImage] = useState(user.profileImage);

  // New Fields State
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [companyDescription, setCompanyDescription] = useState(user.companyDescription || '');
  const [companyLogo, setCompanyLogo] = useState(user.companyLogo || '');
  const [digitalSignature, setDigitalSignature] = useState(user.digitalSignature || '');
  const [country, setCountry] = useState(user.country || 'Colombia');
  const [taxRate, setTaxRate] = useState(user.taxRate || 0);
  // Letterhead Fields
  const [address, setAddress] = useState(user.address || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [website, setWebsite] = useState(user.website || '');
  const [businessEmail, setBusinessEmail] = useState(user.businessEmail || '');
  // Watermark & Template
  const [watermarkLogo, setWatermarkLogo] = useState(user.watermarkLogo || '');
  const [useWatermark, setUseWatermark] = useState(user.useWatermark || false);

  const [success, setSuccess] = useState(false);
  const [isProcessingDNA, setIsProcessingDNA] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    try {
      await updateProfile(authUser.id, {
        name, email, currency, profileImage,
        companyName, companyDescription, companyLogo, digitalSignature,
        country, taxRate,
        address, phone, website, businessEmail,
        watermarkLogo, useWatermark
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error guardando el perfil.");
    }
  };

  const countryDefaults: Record<string, { currency: string; taxRate: number }> = {
    'Colombia': { currency: 'COP', taxRate: 19 },
    'Mexico': { currency: 'MXN', taxRate: 16 },
    'USA': { currency: 'USD', taxRate: 0 },
    'Spain': { currency: 'EUR', taxRate: 21 },
    'Argentina': { currency: 'ARS', taxRate: 21 },
    'Chile': { currency: 'CLP', taxRate: 19 },
    'Peru': { currency: 'PEN', taxRate: 18 },
    'Uruguay': { currency: 'UYU', taxRate: 22 },
    'Dominican Republic': { currency: 'DOP', taxRate: 18 },
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    const defaults = countryDefaults[newCountry];
    if (defaults) {
      setCurrency(defaults.currency);
      setTaxRate(defaults.taxRate);
    }
  };

  const handleImageUpload = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportData = () => {
    const data = {
      user: JSON.parse(localStorage.getItem('user_profile') || '{}'),
      transactions: JSON.parse(localStorage.getItem('ledger_transactions') || '[]'),
      tasks: JSON.parse(localStorage.getItem('ledger_tasks') || '[]'),
      clients: JSON.parse(localStorage.getItem('ledger_clients') || '[]'),
      quotations: JSON.parse(localStorage.getItem('ledger_quotations') || '[]'),
      events: JSON.parse(localStorage.getItem('ledger_events') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleUploadCompanyDNA = async (file: File) => {
    if (!authUser) return;
    setIsProcessingDNA(true);
    try {
      const base64 = await fileToBase64(file);
      const extractedDNA = await extractCompanyDNA(base64, file.name);

      if (extractedDNA) {
        // Save to Supabase
        await saveCompanyDNA(authUser.id, extractedDNA);
        await refreshProfile();
        alert('✅ ADN de empresa extraído exitosamente. Ahora todas las propuestas se adaptarán a tu metodología.');
      } else {
        throw new Error('No se pudo extraer información del PDF');
      }
    } catch (error: any) {
      console.error('Error uploading DNA:', error);
      // Ideally log error to DB or show UI error
      alert('❌ Error al procesar el PDF: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsProcessingDNA(false);
    }
  };

  const handleRemoveCompanyDNA = async () => {
    if (!authUser) return;
    if (confirm('¿Estás seguro de que quieres eliminar el ADN de empresa? Las propuestas volverán a usar el estilo genérico.')) {
      try {
        await deactivateAllCompanyDNA(authUser.id);
        await refreshProfile();
      } catch (error) {
        console.error("Error removing DNA:", error);
        alert("Error eliminando ADN.");
      }
    }
  };

  const handleMigrateData = async () => {
    if (!authUser) return;
    if (!confirm('¿Deseas migrar tus datos locales a la nube? Esto copiará tus transacciones, clientes y configuraciones a Supabase.')) return;

    setSuccess(false); // Reset success state
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce';
    loadingToast.textContent = '🚀 Migrando datos a la nube... Por favor espera.';
    document.body.appendChild(loadingToast);

    try {
      // 1. Load Local Data
      const localClients = JSON.parse(localStorage.getItem('ledger_clients') || '[]');
      const localTrans = JSON.parse(localStorage.getItem('ledger_transactions') || '[]');
      const localTasks = JSON.parse(localStorage.getItem('ledger_tasks') || '[]');
      const localQuotes = JSON.parse(localStorage.getItem('ledger_quotations') || '[]');
      const localEvents = JSON.parse(localStorage.getItem('ledger_events') || '[]');

      const clientMapping = new Map<string, string>();
      let stats = { clients: 0, transactions: 0, tasks: 0, quotations: 0, events: 0 };

      // 2. Migrate Clients (First to get new IDs)
      for (const c of localClients) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = c;
          const newClient = await addClient(authUser.id, rest); // returns Client with new ID
          clientMapping.set(id, newClient.id); // Map Old ID -> New ID
          stats.clients++;
        } catch (e) { console.error('Error migrating client', c, e); }
      }

      // 3. Migrate Quotations (Update Client IDs)
      for (const q of localQuotes) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, clientId, ...rest } = q;
          const newClientId = clientMapping.get(clientId) || clientId; // Use new ID if mapped

          await addQuotation(authUser.id, { ...rest, clientId: newClientId });
          stats.quotations++;
        } catch (e) { console.error('Error migrating quote', q, e); }
      }

      // 4. Migrate Events (Update Client IDs)
      for (const e of localEvents) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, clientId, ...rest } = e;
          const newClientId = clientId ? (clientMapping.get(clientId) || clientId) : undefined;

          await addEvent(authUser.id, { ...rest, clientId: newClientId });
          stats.events++;
        } catch (err) { console.error('Error migrating event', e, err); }
      }

      // 5. Migrate Transactions
      for (const t of localTrans) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = t;
          await addTransaction(authUser.id, rest);
          stats.transactions++;
        } catch (e) { console.error('Error migrating transaction', t, e); }
      }

      // 6. Migrate Tasks
      for (const t of localTasks) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, projectNotes, ...rest } = t;
          // Tasks might have 'projectNotes' in older versions? dbService handles it.
          await addTask(authUser.id, { ...rest, projectNotes: projectNotes || [] });
          stats.tasks++;
        } catch (e) { console.error('Error migrating task', t, e); }
      }

      document.body.removeChild(loadingToast);
      alert(`✅ Migración Completada:\n\n- ${stats.clients} Clientes\n- ${stats.quotations} Cotizaciones\n- ${stats.events} Eventos\n- ${stats.transactions} Transacciones\n- ${stats.tasks} Proyectos\n\nTus datos ahora están seguros en la nube.`);
      await refreshProfile();

    } catch (error) {
      console.error("Migration fatal error:", error);
      if (document.body.contains(loadingToast)) document.body.removeChild(loadingToast);
      alert("❌ Error durante la migración. Revisa la consola para más detalles.");
    }
  };

  return (
    <div className="p-6 md:p-10 pb-20 max-w-4xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-display tracking-tight">{t('settings.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t('settings.profile')}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-12">

        {/* Sección: Idioma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-2">{t('settings.language')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.select_language')}</p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => i18n.changeLanguage('es')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${i18n.language === 'es' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-700 hover:border-primary/50'}`}
              >
                <span className="text-3xl">🇪🇸</span>
                <span className="font-bold text-sm">{t('settings.spanish')}</span>
              </button>
              <button
                type="button"
                onClick={() => i18n.changeLanguage('en')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${i18n.language === 'en' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-700 hover:border-primary/50'}`}
              >
                <span className="text-3xl">🇺🇸</span>
                <span className="font-bold text-sm">{t('settings.english')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sección: Mi Suscripción */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-2">Mi Suscripción</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestiona tu plan y cupones</p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700">
            <SubscriptionManager user={user} />
          </div>
        </div>

        {/* Sección 1: Perfil Personal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-2">{t('settings.personal_profile')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.profile')}</p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center sm:flex-row gap-8 pb-8">
              <div className="relative group">
                <img
                  src={profileImage || (() => { const letter = (name || 'U')[0].toUpperCase(); return `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#10b981"/><text x="50" y="58" font-size="40" font-family="Arial" fill="white" text-anchor="middle" dominant-baseline="middle">' + letter + '</text></svg>')}`; })()}
                  alt="Perfil"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all border-2 border-white dark:border-slate-800"
                >
                  <span className="material-icons-round text-xs">edit</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload(setProfileImage)} />
              </div>
              <div className="flex-1 w-full grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.full_name')}</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.email')}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.job_title')}</label>
                  <input type="text" value={user.jobTitle || ''} onChange={(e) => setUser({ ...user, jobTitle: e.target.value })} placeholder="Ej. Gerente General" className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Identidad Corporativa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-2">{t('settings.corp_identity')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.corp_desc')}</p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-start gap-6">
              <div
                onClick={() => logoInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-emerald-50/50 transition-all overflow-hidden relative group"
              >
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <span className="material-icons-round text-gray-300 text-3xl mb-1">business</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{t('settings.logo')}</span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-icons-round text-white">edit</span>
                </div>
              </div>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleImageUpload(setCompanyLogo)} />

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.company_name')}</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ej. Soluciones Digitales SAS" className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.company_desc')}</label>
                  <textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} placeholder="Agencia de desarrollo y diseño..." rows={2} className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium resize-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.pricing_pdf')}</label>
                  <div
                    onClick={() => document.getElementById('pdfInput')?.click()}
                    className="w-full h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group relative overflow-hidden"
                  >
                    {user.pricingStrategy ? (
                      <div className="text-center">
                        <span className="material-icons-round text-emerald-600 text-3xl mb-1">picture_as_pdf</span>
                        <p className="text-xs font-bold text-emerald-600">PDF Cargado</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="material-icons-round text-gray-300 text-3xl mb-1">upload_file</span>
                        <p className="text-xs font-bold text-gray-400 uppercase">Subir PDF Tarifario</p>
                      </div>
                    )}
                    <input
                      id="pdfInput"
                      type="file"
                      className="hidden"
                      accept="application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const base64 = reader.result as string;
                            try {
                              const { processDocumentPDF } = await import('../services/geminiService');
                              const extractedText = await processDocumentPDF(base64);
                              setUser({ ...user, pricingStrategy: extractedText });
                            } catch (error) {
                              console.error('Error processing PDF:', error);
                              alert('Error al procesar el PDF. Intenta de nuevo.');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-1">La IA extraerá la información para generar cotizaciones precisas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2.3: ADN de Empresa (Company DNA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-2">{t('settings.dna_title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('settings.dna_desc')}
            </p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700">
            <CompanyProfileUpload
              currentDNA={user.companyDNA}
              uploadHistory={user.dnaHistory}
              onUpload={handleUploadCompanyDNA}
              onRemove={handleRemoveCompanyDNA}
              isProcessing={isProcessingDNA}
            />

            {user.companyDNA && (
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <CompanyDNAViewer dna={user.companyDNA} />
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
              <span className="material-icons-round text-blue-600 text-sm">lightbulb</span>
              <div>
                <p className="text-xs font-bold text-blue-800 dark:text-blue-200 mb-1">¿Qué información extraemos?</p>
                <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  La IA analiza tu documento y extrae: metodología de trabajo, estilo de propuestas, voz de marca,
                  servicios principales, mercado objetivo, filosofía de precios, stack técnico preferido, proceso de
                  entrega, estándares de calidad y más. Todo esto se usa para personalizar automáticamente las cotizaciones.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2.5: Membrete Corporativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-2">{t('settings.letterhead')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.letterhead_desc')}</p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.address')}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej. Calle 123 #45-67, Bogotá"
                    className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.phone')}</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +57 300 123 4567"
                    className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.website')}</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Ej. www.tuempresa.com"
                    className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.biz_email')}</label>
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="Ej. contacto@tuempresa.com"
                    className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium"
                  />
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
                <span className="material-icons-round text-blue-600 text-sm">info</span>
                <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">Esta información se mostrará automáticamente en el encabezado de todas tus cotizaciones PDF.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2.6: Marca de Agua (Watermark) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-2">{t('settings.watermark')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.watermark_desc')}</p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{t('settings.activate_watermark')}</p>
                  <p className="text-xs text-gray-500 mt-1">El logo aparecerá transparente en el centro del PDF</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useWatermark}
                    onChange={(e) => setUseWatermark(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.logo')}</label>
                <div
                  onClick={() => watermarkInputRef.current?.click()}
                  className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group relative overflow-hidden"
                >
                  {watermarkLogo ? (
                    <div className="relative w-full h-full p-4">
                      <img src={watermarkLogo} alt="Watermark Preview" className="w-full h-full object-contain opacity-30" />
                      <p className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-emerald-600">Vista Previa (Transparente)</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="material-icons-round text-gray-300 text-4xl mb-2">water_drop</span>
                      <p className="text-xs font-bold text-gray-400 uppercase">Click para subir logo</p>
                      <p className="text-[10px] text-gray-400 mt-1">Recomendado: PNG con fondo transparente</p>
                    </div>
                  )}
                  <input
                    ref={watermarkInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload(setWatermarkLogo)}
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50 flex items-start gap-3">
                <span className="material-icons-round text-amber-600 text-sm">tips_and_updates</span>
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-200 mb-1">Consejo Profesional</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">Usa un logo PNG con fondo transparente para mejores resultados. La marca de agua se mostrará en el centro del documento con 10% de opacidad.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Datos Fiscales y Firma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-2">{t('settings.fiscal_signature')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.fiscal_desc')}</p>
          </div>
          <div className="md:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.country')}</label>
                <select value={country} onChange={handleCountryChange} className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-bold">
                  <option value="Colombia">Colombia</option>
                  <option value="Mexico">México</option>
                  <option value="USA">Estados Unidos</option>
                  <option value="Spain">España</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Peru">Perú</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Dominican Republic">República Dominicana</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.currency')}</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-bold">
                  <optgroup label="América Latina">
                    <option value="COP">COP - Peso Colombiano</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="ARS">ARS - Peso Argentino</option>
                    <option value="CLP">CLP - Peso Chileno</option>
                    <option value="PEN">PEN - Sol Peruano</option>
                    <option value="BRL">BRL - Real Brasileño</option>
                    <option value="UYU">UYU - Peso Uruguayo</option>
                    <option value="DOP">DOP - Peso Dominicano</option>
                    <option value="CRC">CRC - Colón Costarricense</option>
                    <option value="GTQ">GTQ - Quetzal Guatemalteco</option>
                    <option value="HNL">HNL - Lempira Hondureño</option>
                    <option value="NIO">NIO - Córdoba Nicaragüense</option>
                    <option value="PYG">PYG - Guaraní Paraguayo</option>
                    <option value="BOB">BOB - Boliviano</option>
                  </optgroup>
                  <optgroup label="Otras Regiones">
                    <option value="JPY">JPY - Yen Japonés</option>
                    <option value="AUD">AUD - Dólar Australiano</option>
                    <option value="CNY">CNY - Yuan Chino</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.language_label')}</label>
                <select
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-bold"
                >
                  <option value="es">Español 🇪🇸</option>
                  <option value="en">English 🇺🇸</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.tax')}</label>
                <div className="relative">
                  <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full rounded-2xl bg-gray-50 dark:bg-gray-800 border-none px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-bold pl-10" />
                  <span className="absolute left-4 top-3 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-[0.2em]">{t('settings.signature')}</label>
              <div
                onClick={() => signatureInputRef.current?.click()}
                className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-emerald-50/50 transition-all group relative overflow-hidden"
              >
                {digitalSignature ? (
                  <img src={digitalSignature} alt="Firma" className="h-full object-contain" />
                ) : (
                  <div className="text-center">
                    <span className="material-icons-round text-gray-300 text-4xl mb-2">draw</span>
                    <p className="text-xs font-bold text-gray-400 uppercase">Subir imagen de firma</p>
                  </div>
                )}
                <input type="file" ref={signatureInputRef} className="hidden" accept="image/*" onChange={handleImageUpload(setDigitalSignature)} />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">Sube una imagen (PNG transparente idealmente) de tu firma.</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <button
            type="submit"
            className="px-12 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center gap-3"
          >
            <span>{t('settings.save_btn')}</span>
            {success && <span className="material-icons-round animate-bounce">check_circle</span>}
          </button>
        </div>
      </form>

      {/* Sección 4: Datos y Privacidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12 border-t border-gray-100 dark:border-gray-800 pt-10">
        <div className="md:col-span-1">
          <h3 className="text-lg font-bold mb-2">{t('settings.data_privacy')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.data_desc')}</p>
        </div>
        <div className="md:col-span-2 bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700 space-y-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Gestión de Datos</p>
              <p className="text-xs text-gray-500">Opciones avanzadas para tus datos.</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleMigrateData}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
              >
                <span className="material-icons-round text-sm">cloud_upload</span>
                {t('settings.migrate_btn')}
              </button>
              <button
                type="button"
                onClick={handleExportData}
                className="px-6 py-3 bg-gray-900 dark:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
              >
                {t('settings.export_btn')}
              </button>
            </div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50 flex gap-4">
            <span className="material-icons-round text-amber-500">security</span>
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-tighter mb-1">Privacidad Extrema</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed font-medium">Tus datos están encriptados localmente en este navegador. Nadie fuera de tu sesión puede acceder a los montos o nombres de clientes.</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Mensaje Motivacional Diario</p>
              <p className="text-xs text-gray-500 mt-1">Muestra una frase inspiradora al iniciar la aplicación.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.showMotivationalMessage !== false}
                onChange={(e) => setUser({ ...user, showMotivationalMessage: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Sección 5: Integraciones y Ecosistema (Oculta temporamente por solicitud del usuario) */}
      {/* 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12 border-t border-gray-100 dark:border-gray-800 pt-10">
        <div className="md:col-span-1">
          <h3 className="text-lg font-bold mb-2">Integraciones & API</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Conecta Ledger IA con tu flujo de trabajo.</p>
        </div>
        ... (Contenido oculto) ...
      </div>
      */}
    </div>
  );
};

export default Settings;
