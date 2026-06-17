import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Quotation, Client, UserProfile, QuotationItem, SubscriptionPlan } from '../types';
import { generateProposalContent } from '../services/geminiService';
import UpgradeModal from '../components/UpgradeModal';
import { canUserPerformAction, PLAN_LIMITS } from '../utils/planLimits';

interface QuotationsProps {
  quotations: Quotation[];
  clients: Client[];
  onAdd: (q: Omit<Quotation, 'id'>) => void;
  onUpdateStatus: (id: string, status: Quotation['status']) => void;
  onDelete: (id: string) => void;
  currency: string;
  user: UserProfile;
  currentPlan?: SubscriptionPlan;
}

const Quotations: React.FC<QuotationsProps> = ({ quotations, clients, onAdd, onUpdateStatus, onDelete, currency, user, currentPlan = 'free' }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Feature gating states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const planLimits = PLAN_LIMITS[currentPlan];

  // Calculate quotations this month for limit check
  const quotationsThisMonth = quotations.filter(q => {
    const d = new Date(q.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const handleOpenAdd = () => {
    if (!canUserPerformAction(currentPlan as SubscriptionPlan, 'maxQuotationsPerMonth', quotationsThisMonth)) {
      setShowUpgradeModal(true);
      return;
    }
    setShowForm(true);
  };

  const [formData, setFormData] = useState({
    clientId: '',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [] as QuotationItem[]
  });

  const [newItem, setNewItem] = useState({ description: '', quantity: 1, price: 0 });
  const [priceInput, setPriceInput] = useState('');

  useEffect(() => {
    if (selectedQuote) {
      const updated = quotations.find(q => q.id === selectedQuote.id);
      if (updated) setSelectedQuote(updated);
    }
  }, [quotations]);

  const currentSubtotal = formData.items.reduce((acc, item) => acc + (item.price * (item.quantity || 0)), 0);

  const formatThousands = (val: number | string) => {
    if (val === '' || val === undefined || val === null) return '0';
    const num = typeof val === 'string' ? parseFloat(val.replace(/\./g, '').replace(/,/g, '')) : val;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('es-CO').format(num);
  };

  const formatCurrency = (val: number) => {
    return `${user.currency} ${formatThousands(val)}`;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const numValue = parseFloat(raw) || 0;
    setPriceInput(formatThousands(numValue));
    setNewItem(prev => ({ ...prev, price: numValue }));
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          if (field === 'price' && typeof value === 'string') {
            const num = parseFloat(value.replace(/\D/g, '')) || 0;
            return { ...item, [field]: num };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    if (!newItem.description.trim()) {
      alert("Por favor ingresa la descripción.");
      return;
    }
    if (newItem.price <= 0) {
      alert("El precio debe ser mayor a 0.");
      return;
    }
    const item: QuotationItem = {
      ...newItem,
      id: 'itm_' + Math.random().toString(36).substr(2, 5)
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
    setNewItem({ description: '', quantity: 1, price: 0 });
    setPriceInput('');
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return alert("Describe brevemente lo que vas a cotizar.");
    setIsGenerating(true);
    try {
      const result = await generateProposalContent(aiPrompt);
      if (result && result.items) {
        const itemsWithIds = result.items.map((it: any) => ({
          ...it,
          id: 'itm_' + Math.random().toString(36).substr(2, 5)
        }));
        setFormData(prev => ({
          ...prev,
          items: [...prev.items, ...itemsWithIds],
          notes: prev.notes ? prev.notes + "\n\n" + result.notes : result.notes
        }));
        setAiPrompt('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalSubmit = () => {
    if (!formData.clientId) return alert("Por favor selecciona un cliente.");
    if (formData.items.length === 0) return alert("Añade servicios.");

    onAdd({
      clientId: formData.clientId,
      validUntil: formData.validUntil,
      notes: formData.notes,
      items: [...formData.items],
      date: new Date().toISOString().split('T')[0],
      total: currentSubtotal * 1.19,
      status: 'draft'
    });

    setShowForm(false);
    setFormData({ clientId: '', validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], notes: '', items: [] });
    setNewItem({ description: '', quantity: 1, price: 0 });
    setPriceInput('');
  };

  // Import jsPDF (requires installation: npm install jspdf jspdf-autotable)
  // Dynamic import or check if available to avoid SSR issues if complex
  // For this environment we assume standard client side import is possible if installed,
  // but we'll use a dynamic import approach or just standard inside the handler to be safe.

  const handlePrint = async () => {
    if (!selectedQuote) return;

    // Import libraries dynamically
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // --- Header ---
    let logoBottomY = 15;
    if (user.companyLogo) {
      doc.addImage(user.companyLogo, 'PNG', margin, 15, 30, 30);
      logoBottomY = 45;
    }

    doc.setFontSize(22);
    doc.setTextColor(20, 83, 45); // Emerald 900
    doc.text("COTIZACIÓN", pageWidth - margin, 25, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`#${selectedQuote.id}`, pageWidth - margin, 32, { align: "right" });

    // Dates (aligned right)
    doc.setTextColor(0);
    doc.text(`Fecha: ${new Date(selectedQuote.date).toLocaleDateString()}`, pageWidth - margin, 42, { align: "right" });
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`Vence: ${new Date(selectedQuote.validUntil).toLocaleDateString()}`, pageWidth - margin, 47, { align: "right" });

    // --- Company Info (Below Logo) ---
    let yPos = logoBottomY + 5;

    doc.setFontSize(14);
    doc.setTextColor(20, 83, 45); // Emerald Color for Company Name
    doc.setFont("helvetica", "bold");
    doc.text(user.companyName || user.name, margin, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);

    if (user.jobTitle) {
      doc.text(user.jobTitle, margin, yPos);
      yPos += 4;
    }
    if (user.businessEmail || user.email) {
      doc.text(user.businessEmail || user.email, margin, yPos);
      yPos += 4;
    }
    if (user.phone) {
      doc.text(user.phone, margin, yPos);
      yPos += 4;
    }
    if (user.address) {
      const splitAddress = doc.splitTextToSize(user.address, 80);
      doc.text(splitAddress, margin, yPos);
      yPos += 4 * splitAddress.length;
    }
    if (user.website) {
      doc.setTextColor(20, 83, 45);
      doc.text(user.website, margin, yPos);
    }

    // --- Client Info (BELOW the dates on the right side) ---
    // Position client info clearly BELOW the "Vence" date line
    let clientY = 58; // Start well below the dates (47 + 11 for good spacing)
    const clientX = pageWidth - margin; // Align to right margin

    const client = clients.find(c => c.id === selectedQuote.clientId);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "bold");
    doc.text("PREPARADO PARA:", clientX, clientY, { align: "right" });

    clientY += 6;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(client?.company || "Cliente General", clientX, clientY, { align: "right" });

    clientY += 5;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.setFont("helvetica", "normal");
    doc.text(client?.name || "", clientX, clientY, { align: "right" });

    clientY += 5;
    doc.text(client?.email || "", clientX, clientY, { align: "right" });

    // --- Table ---
    // Start table below the lowest header info
    const startTableY = Math.max(yPos, clientY) + 15;

    // Calculate taxes
    const subtotal = selectedQuote.total / (1 + (user.taxRate || 0) / 100);
    const taxAmount = selectedQuote.total - subtotal;

    autoTable(doc, {
      startY: startTableY,
      head: [['Descripción', 'Cant.', 'Precio Unit.', 'Total']],
      body: selectedQuote.items.map(item => [
        item.description,
        item.quantity,
        formatThousands(item.price),
        formatThousands(item.price * item.quantity)
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [6, 78, 59], // Emerald 900
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 'auto', valign: 'middle' },
        1: { halign: 'center', valign: 'middle' },
        2: { halign: 'right', valign: 'middle' },
        3: { halign: 'right', fontStyle: 'bold', valign: 'middle' }
      },
      styles: {
        cellPadding: 3,
        overflow: 'linebreak'
      },
      // Remove default foot, we will draw a custom one for "better aesthetics"
    });

    // --- Custom Totals Section ---
    let finalY = (doc as any).lastAutoTable.finalY + 10;

    // Check for page break
    if (finalY + 50 > pageHeight) {
      doc.addPage();
      finalY = 20;
    }

    const totalsWidth = 70;
    const totalsX = pageWidth - margin - totalsWidth;

    // Subtotal
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text("Subtotal", totalsX, finalY);
    doc.setTextColor(0);
    doc.text(formatThousands(subtotal), pageWidth - margin, finalY, { align: "right" });

    finalY += 6;
    // Tax
    doc.setTextColor(80);
    doc.text(`Impuestos (${user.taxRate || 0}%)`, totalsX, finalY);
    doc.setTextColor(0);
    doc.text(formatThousands(taxAmount), pageWidth - margin, finalY, { align: "right" });

    finalY += 4;
    // Line
    doc.setDrawColor(200);
    doc.line(totalsX, finalY, pageWidth - margin, finalY);

    finalY += 8;
    // Total
    doc.setFillColor(6, 78, 59); // Background Emerald
    doc.rect(totalsX - 5, finalY - 6, totalsWidth + 5, 12, 'F');
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL", totalsX, finalY + 2);
    doc.text(`${user.currency} ${formatThousands(selectedQuote.total)}`, pageWidth - margin, finalY + 2, { align: "right" });
    doc.setTextColor(0); // Reset

    // --- Notes ---
    finalY += 20;
    if (selectedQuote.notes) {
      if (finalY + 30 > pageHeight) {
        doc.addPage();
        finalY = 20;
      }
      doc.setFontSize(10);
      doc.setTextColor(20, 83, 45);
      doc.setFont("helvetica", "bold");
      doc.text("NOTAS Y CONDICIONES:", margin, finalY);
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(selectedQuote.notes, pageWidth - (margin * 2));
      doc.text(splitNotes, margin, finalY + 7);

      finalY += splitNotes.length * 4 + 10;
    }

    // --- Signature (Centered at Bottom) ---
    // We try to place it at the button, but if content pushed it down, we append.
    // Ideally put it near bottom of page if space allows, otherwise just after content.

    let signatureY = Math.max(finalY + 20, pageHeight - 50);

    // If pushing to new page is needed just for signature
    if (signatureY + 40 > pageHeight) {
      doc.addPage();
      signatureY = pageHeight - 50;
    } else if (signatureY < finalY + 20) {
      // if content is long and pushes signature down, keep relative
      signatureY = finalY + 20;
    }

    const centerX = pageWidth / 2;

    if (user.digitalSignature) {
      const sigWidth = 40;
      const sigHeight = 20;
      doc.addImage(user.digitalSignature, 'PNG', centerX - (sigWidth / 2), signatureY - 25, sigWidth, sigHeight);
    }

    // Line
    doc.setDrawColor(0);
    doc.line(centerX - 40, signatureY, centerX + 40, signatureY);

    // Name & Title
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(user.name, centerX, signatureY + 6, { align: "center" });

    if (user.jobTitle) {
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(user.jobTitle, centerX, signatureY + 11, { align: "center" });
    }

    if (user.companyName) {
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(user.companyName, centerX, signatureY + 16, { align: "center" });
    }

    // --- WATERMARK (Marca de Agua) ---
    if (user.useWatermark && user.watermarkLogo) {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const watermarkSize = 80;
        const wmX = (pageWidth - watermarkSize) / 2;
        const wmY = (pageHeight - watermarkSize) / 2;
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
        doc.addImage(user.watermarkLogo, 'PNG', wmX, wmY, watermarkSize, watermarkSize);
        doc.restoreGraphicsState();
      }
    }

    doc.save(`Cotizacion_${selectedQuote.id}.pdf`);
  };

  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: Quotation['status']) => {
    switch (status) {
      case 'accepted': return t('quotations.status.accepted');
      case 'declined': return t('quotations.status.declined');
      case 'sent': return t('quotations.status.sent');
      default: return t('quotations.status.draft');
    }
  };

  const handlePrintReport = async () => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(20, 83, 45);
    doc.text("REPORTE DE GESTIÓN", pageWidth / 2, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(user.companyName || user.name, pageWidth / 2, 35, { align: "center" });
    doc.setFontSize(10);
    doc.text("Informe General de Cotizaciones", pageWidth / 2, 42, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, pageWidth / 2, 50, { align: "center" });

    // Table data
    const tableData = quotations.map(q => {
      const client = clients.find(c => c.id === q.clientId);
      return [
        q.id.slice(-8),
        client?.company || 'N/A',
        new Date(q.date).toLocaleDateString(),
        getStatusLabel(q.status),
        formatThousands(q.total)
      ];
    });

    autoTable(doc, {
      startY: 60,
      head: [['ID', 'Cliente', 'Fecha', 'Estado', `Total (${currency})`]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [20, 83, 45],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 60]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    const grandTotal = quotations.reduce((acc, q) => acc + q.total, 0);
    const acceptedTotal = quotations.filter(q => q.status === 'accepted').reduce((acc, q) => acc + q.total, 0);
    const pendingTotal = quotations.filter(q => q.status === 'sent' || q.status === 'draft').reduce((acc, q) => acc + q.total, 0);

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("RESUMEN:", margin, finalY + 15);

    doc.setFontSize(9);
    doc.text(`Total cotizado: ${currency} ${formatThousands(grandTotal)}`, margin, finalY + 25);
    doc.text(`Aceptadas: ${currency} ${formatThousands(acceptedTotal)}`, margin, finalY + 32);
    doc.text(`Pendientes: ${currency} ${formatThousands(pendingTotal)}`, margin, finalY + 39);
    doc.text(`Total cotizaciones: ${quotations.length}`, margin, finalY + 46);

    doc.save(`Reporte_Cotizaciones_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isReporting) {
    const grandTotal = quotations.reduce((acc, q) => acc + q.total, 0);
    return (
      <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen">
        <div className="flex justify-between items-center mb-8 no-print">
          <button onClick={() => setIsReporting(false)} className="flex items-center gap-2 text-gray-500 hover:text-black font-bold">
            <span className="material-icons-round">arrow_back</span> {t('quotations.back_btn')}
          </button>
          <button type="button" onClick={handlePrintReport} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg">
            <span className="material-icons-round">print</span> {t('quotations.print_report')}
          </button>
        </div>

        <div id="print-area" className="quotation-page p-12 border border-gray-200 rounded-xl bg-white text-slate-900">
          {/* Cabecera del reporte igual que en el diseño de Dashboard */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">L</div>
                <span className="text-xl font-black uppercase tracking-tighter">{t('quotations.report.title')}</span>
              </div>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-gray-500 text-xs">{t('quotations.report.subtitle')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('quotations.report.generated_on')}</p>
              <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <table className="w-full mb-10">
            <thead className="bg-slate-100">
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-4">ID</th>
                <th className="p-4">{t('quotations.form.client')}</th>
                <th className="p-4">{t('common.date')}</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">{t('quotations.report.total_amount')} ({user.currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map(q => {
                const client = clients.find(c => c.id === q.clientId);
                return (
                  <tr key={q.id}>
                    <td className="p-4 text-sm font-black">{q.id}</td>
                    <td className="p-4 text-sm font-medium">{client?.company || 'N/A'}</td>
                    <td className="p-4 text-sm text-slate-500">{new Date(q.date).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusColor(q.status)}`}>
                        {getStatusLabel(q.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-right font-bold">{formatThousands(q.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (selectedQuote) {
    const client = clients.find(c => c.id === selectedQuote.clientId);
    return (
      <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen">
        {/* Toolbar superior EXACTAMENTE como en el mockup */}
        <div className="flex justify-between items-center mb-10 no-print">
          <button onClick={() => setSelectedQuote(null)} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-bold transition-colors">
            <span className="material-icons-round">arrow_back</span> {t('quotations.back_btn')}
          </button>

          <div className="flex items-center gap-5">
            <div className="flex flex-col items-start bg-white dark:bg-slate-800 rounded-2xl px-5 py-2 border border-slate-100 dark:border-slate-700 shadow-sm min-w-[140px]">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Estado</span>
              <select
                className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest focus:ring-0 cursor-pointer p-0 pr-8 text-slate-900 dark:text-white"
                value={selectedQuote.status}
                onChange={(e) => onUpdateStatus(selectedQuote.id, e.target.value as Quotation['status'])}
              >
                <option value="draft" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t('quotations.status.draft')}</option>
                <option value="sent" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t('quotations.status.sent')}</option>
                <option value="accepted" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t('quotations.status.accepted')}</option>
                <option value="declined" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{t('quotations.status.declined')}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => { if (confirm('¿Eliminar cotización?')) { onDelete(selectedQuote.id); setSelectedQuote(null); } }}
              className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-all shadow-sm"
            >
              <span className="material-icons-round">delete</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-10 py-3.5 bg-emerald-900 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-emerald-800 transition-all border-2 border-white/10"
            >
              <span className="material-icons-round text-xl">print</span>
              <span>{t('quotations.print_quote')}</span>
            </button>
          </div>
        </div>

        {/* Hoja de Cotización estilo Profesional (Mockup) */}
        <div id="print-area" className="quotation-page p-12 md:p-16 border border-slate-200 rounded-[40px] bg-white text-slate-900 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-16">
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg">L</div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">COTIZACIÓN</h1>
                <h2 className="text-xl font-bold text-gray-900 mt-2">{user.name}</h2>
                <p className="text-gray-500 text-sm font-medium">{user.email}</p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="bg-emerald-900 text-white px-6 py-3 rounded-2xl mb-8 shadow-xl">
                <p className="text-2xl font-black tracking-tight">{selectedQuote.id}</p>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha:</span>
                  <span className="text-sm font-bold">{new Date(selectedQuote.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Vence:</span>
                  <span className="text-sm font-black text-red-500">{new Date(selectedQuote.validUntil).toLocaleDateString()}</span>
                </div>
              </div>

              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedQuote.status)}`}>
                {getStatusLabel(selectedQuote.status)}
              </div>
            </div>
          </div>

          <div className="mb-14 py-8 border-y border-slate-100">
            <h3 className="text-[11px] font-black text-emerald-900 uppercase tracking-[0.2em] mb-4">CLIENTE</h3>
            <p className="text-3xl font-black mb-1 text-slate-900">{client?.company || 'Cliente Registrado'}</p>
            <p className="text-slate-500 font-bold text-lg">{client?.name}</p>
          </div>

          <table className="w-full mb-12">
            <thead className="bg-slate-900 text-white">
              <tr className="text-left text-[11px] font-black uppercase tracking-widest">
                <th className="p-5 rounded-l-2xl">Descripción del Servicio</th>
                <th className="p-5 text-center">Cant.</th>
                <th className="p-5 text-right">Precio Unit.</th>
                <th className="p-5 text-right rounded-r-2xl">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedQuote.items.map(i => (
                <tr key={i.id}>
                  <td className="p-5 font-bold text-slate-800 text-lg">{i.description}</td>
                  <td className="p-5 text-center font-bold text-slate-500">{i.quantity}</td>
                  <td className="p-5 text-right font-bold text-slate-500">{formatThousands(i.price)}</td>
                  <td className="p-5 text-right font-black text-slate-900 text-lg">{formatThousands(i.price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col items-end gap-3 border-t border-slate-100 pt-8">
            <div className="flex gap-14 text-slate-400 font-black text-xs uppercase tracking-widest">
              <p>Subtotal</p>
              <p className="text-slate-900 font-bold">{formatThousands(selectedQuote.total / 1.19)}</p>
            </div>
            <div className="flex gap-14 text-slate-400 font-black text-xs uppercase tracking-widest">
              <p>IVA (19%)</p>
              <p className="text-slate-900 font-bold">{formatThousands(selectedQuote.total - (selectedQuote.total / 1.19))}</p>
            </div>
            <div className="mt-8 flex gap-14 bg-emerald-900 text-white p-10 rounded-[40px] shadow-2xl">
              <p className="font-black uppercase tracking-[0.2em] text-xs">TOTAL A PAGAR ({user.currency})</p>
              <p className="text-5xl font-black tracking-tighter">{formatThousands(selectedQuote.total)}</p>
            </div>
          </div>

          {selectedQuote.notes && (
            <div className="mt-20 p-10 bg-slate-50 rounded-[40px] border border-slate-100">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Condiciones de Servicio</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{selectedQuote.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">{t('quotations.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('quotations.subtitle')}</p>
        </div>
        {!showForm && (
          <div className="flex gap-3">
            <button onClick={() => setIsReporting(true)} className="px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
              <span className="material-icons-round">analytics</span> {t('quotations.report_btn')}
            </button>
            <button onClick={() => setShowForm(true)} className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-2">
              <span className="material-icons-round">add</span> {t('quotations.new_btn')}
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        <div className="bg-white dark:bg-surface-dark rounded-[40px] p-8 md:p-12 border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-4 shadow-2xl max-w-5xl mx-auto no-print">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tight">{t('quotations.form.title')}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-black p-2 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors"><span className="material-icons-round">close</span></button>
          </div>

          <div className="mb-12 bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-800 flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-white dark:bg-emerald-800 p-4 rounded-2xl text-emerald-600 dark:text-emerald-100">
              <span className="material-icons-round text-3xl">auto_awesome</span>
            </div>
            <div className="flex-1 w-full">
              <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-200 uppercase mb-2 tracking-widest">{t('quotations.form.ai_title')}</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-4 font-medium">{t('quotations.form.ai_desc')}</p>
              <div className="flex gap-2">
                <input
                  placeholder={t('quotations.form.ai_placeholder')}
                  className="flex-1 rounded-2xl border-none font-medium bg-white dark:bg-gray-800 py-4 px-6 text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAiAssist()}
                />
                <button onClick={handleAiAssist} disabled={isGenerating || !aiPrompt.trim()} className="px-8 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50">
                  {isGenerating ? t('quotations.form.ai_generating') : t('quotations.form.ai_btn')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('quotations.form.client')}</label>
              <select className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-4 font-bold dark:text-white focus:ring-2 focus:ring-primary" value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })}>
                <option value="">-- Seleccionar cliente --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t('quotations.form.valid_until')}</label>
              <input type="date" className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 py-4 font-bold dark:text-white focus:ring-2 focus:ring-primary" value={formData.validUntil} onChange={e => setFormData({ ...formData, validUntil: e.target.value })} />
            </div>
          </div>

          <div className="mb-12">
            <label className="block text-sm font-black text-slate-900 dark:text-white uppercase mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">{t('quotations.form.services_title')}</label>
            <div className="space-y-4 mb-8">
              {formData.items.map(item => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-gray-800 p-6 rounded-[24px] shadow-sm border border-gray-50 dark:border-gray-700 items-end animate-in fade-in">
                  <div className="md:col-span-6">
                    <label className="block text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">{t('quotations.form.description')}</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold dark:text-white px-4 py-2" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                  </div>
                  <div className="md:col-span-2 text-center">
                    <label className="block text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">{t('quotations.form.qty')}</label>
                    <input type="number" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold text-center dark:text-white px-2 py-2" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="md:col-span-3 text-right">
                    <label className="block text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">{t('quotations.form.price')}</label>
                    <input className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-bold text-right dark:text-white px-4 py-2" value={formatThousands(item.price)} onChange={e => updateItem(item.id, 'price', e.target.value)} />
                  </div>
                  <div className="md:col-span-1 text-center">
                    <button onClick={() => removeItem(item.id)} className="p-3 text-red-300 hover:text-red-500 transition-all"><span className="material-icons-round">delete_outline</span></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50/50 dark:bg-gray-900/10 p-10 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-6">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">{t('quotations.form.add_manual')}</label>
                  <input placeholder={t('quotations.form.ai_placeholder')} className="w-full rounded-2xl border-none font-bold bg-white dark:bg-gray-800 py-4.5 px-6 text-sm shadow-sm focus:ring-2 focus:ring-primary dark:text-white" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest text-center">{t('quotations.form.qty')}</label>
                  <input type="number" min="1" className="w-full rounded-2xl border-none font-bold bg-white dark:bg-gray-800 py-4.5 text-center text-sm shadow-sm focus:ring-2 focus:ring-primary dark:text-white" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest text-right">{t('quotations.form.price')} ({user.currency})</label>
                  <input type="text" placeholder="0" className="w-full rounded-2xl border-none font-bold bg-white dark:bg-gray-800 py-4.5 px-6 text-right text-sm shadow-sm focus:ring-2 focus:ring-primary dark:text-white" value={priceInput} onChange={handlePriceChange} />
                </div>
                <div className="md:col-span-1">
                  <button onClick={addItem} className="w-full h-[58px] bg-slate-900 dark:bg-slate-700 text-white rounded-2xl hover:bg-black transition-all flex items-center justify-center shadow-lg"><span className="material-icons-round text-3xl">add</span></button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-10 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="w-full md:max-w-lg">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Notas y Condiciones</label>
              <textarea className="w-full rounded-[32px] bg-slate-50 dark:bg-slate-800 border-none px-8 py-6 text-sm font-medium dark:text-white focus:ring-2 focus:ring-primary whitespace-pre-wrap leading-relaxed shadow-inner" rows={8} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Describe los alcances..." />
            </div>
            <div className="text-right w-full md:w-auto">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total con IVA ({user.currency})</p>
              <p className="text-6xl font-black text-primary mb-8 tracking-tighter">{formatThousands(currentSubtotal * 1.19)}</p>
              <div className="flex gap-4 justify-end">
                <button onClick={() => setShowForm(false)} className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest">Cancelar</button>
                <button onClick={handleFinalSubmit} className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest">
                  <span className="material-icons-round text-lg">check_circle</span> GUARDAR PROPUESTA
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {quotations.map(quote => {
            const client = clients.find(c => c.id === quote.clientId);
            return (
              <div key={quote.id} onClick={() => setSelectedQuote(quote)} className="bg-white dark:bg-surface-dark p-8 rounded-[40px] shadow-soft border border-gray-100 dark:border-gray-700 cursor-pointer group hover:shadow-2xl transition-all border-l-8 border-l-primary flex justify-between items-center relative overflow-hidden">
                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{quote.id}</div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${getStatusColor(quote.status)}`}>
                      {getStatusLabel(quote.status)}
                    </span>
                  </div>
                  <h3 className="font-black text-2xl text-slate-800 dark:text-white group-hover:text-primary transition-colors mb-2">{client?.company || 'Cliente'}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{quote.items.length} ítems • Emitida {new Date(quote.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(quote.total)}</p>
                  <p className="text-[10px] font-black text-primary uppercase mt-2 flex items-center justify-end gap-1">Ver Propuesta <span className="material-icons-round text-sm">arrow_forward</span></p>
                </div>
              </div>
            );
          })}
          {quotations.length === 0 && (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[60px] opacity-40">
              <span className="material-icons-round text-6xl mb-4 text-slate-200">description</span>
              <h3 className="text-xl font-black uppercase text-slate-300">Sin cotizaciones</h3>
              <p className="text-sm font-medium mt-2">Crea tu primera propuesta comercial.</p>
            </div>
          )}
        </div>
      )}
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={currentPlan as SubscriptionPlan}
        limitReached="quotations"
        currentUsage={quotationsThisMonth}
        limit={planLimits?.maxQuotationsPerMonth || 0}
      />
    </div>
  );
};

export default Quotations;
